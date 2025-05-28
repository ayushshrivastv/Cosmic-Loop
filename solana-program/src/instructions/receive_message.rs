/**
 * @file instructions/receive_message.rs
 * @description Instruction handler for receiving cross-chain messages via LayerZero V2
 */

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
    sysvar::{clock::Clock, Sysvar},
    msg,
};
use borsh::{BorshDeserialize, BorshSerialize};

use crate::error::SolanaOpenApiError;
use crate::layerzero::{CrossChainMessage, verify_from_endpoint};
use crate::state::{MessageRecord, ProgramConfig, MessageStatus};

// Unused imports have been removed

/// Receive message instruction data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ReceiveMessageData {
    pub source_chain_id: u32,
    pub source_address: Vec<u8>,
    pub payload: Vec<u8>,
    pub message_type: u8,
}

/// Process a receive message instruction
pub fn process<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Get required accounts
    let relayer_account = next_account_info(accounts_iter)?;
    let message_account = next_account_info(accounts_iter)?;
    let config_account = next_account_info(accounts_iter)?;
    let layerzero_endpoint = next_account_info(accounts_iter)?;
    let clock_sysvar = next_account_info(accounts_iter)?;

    // Verify relayer is signer
    if !relayer_account.is_signer {
        return Err(SolanaOpenApiError::Unauthorized.into());
    }

    // Deserialize the instruction data
    let receive_data = ReceiveMessageData::try_from_slice(instruction_data)
        .map_err(|_| SolanaOpenApiError::InvalidInstructionData)?;

    // Get program config
    let config = ProgramConfig::try_from_slice(&config_account.data.borrow())
        .map_err(|_| SolanaOpenApiError::InvalidAccountData)?;

    // Verify config is initialized
    if !config.is_initialized {
        return Err(SolanaOpenApiError::AccountNotInitialized.into());
    }

    // Verify the LayerZero endpoint
    if config.layerzero_endpoint != *layerzero_endpoint.key {
        return Err(SolanaOpenApiError::InvalidEndpoint.into());
    }

    // Create a cross-chain message from the received data
    let nonce = 0; // Nonce is not relevant for received messages
    let message = CrossChainMessage::new(
        receive_data.source_chain_id,
        config.solana_chain_id, // destination is this chain
        receive_data.message_type,
        receive_data.payload.clone(),
        nonce,
        None, // No options needed for received messages
    );

    // Verify message from LayerZero endpoint
    verify_from_endpoint(
        program_id,
        layerzero_endpoint,
        &message,
    )?;

    // Generate message ID
    let message_id = message.generate_id();

    // Get current timestamp
    let clock = Clock::from_account_info(clock_sysvar)?;
    let timestamp = clock.unix_timestamp as u64;

    // Check if message account is already initialized
    if message_account.data_is_empty() {
        // Create new message record
        let message_record = MessageRecord::new(
            message_id,
            receive_data.source_chain_id,
            config.solana_chain_id, // destination is this chain
            receive_data.message_type,
            *relayer_account.key,
            timestamp,
        );

        // Update status to delivered
        let mut updated_record = message_record;
        updated_record.update_status(MessageStatus::Delivered);

        // Serialize message record to the message account
        updated_record.serialize(&mut *message_account.data.borrow_mut())
            .map_err(|_| ProgramError::AccountDataTooSmall)?;
    } else {
        // Message already exists, check if it's already processed
        let mut message_record = MessageRecord::try_from_slice(&message_account.data.borrow())
            .map_err(|_| SolanaOpenApiError::InvalidAccountData)?;

        // Verify message ID matches
        if message_record.message_id != message_id {
            return Err(SolanaOpenApiError::InvalidAccountData.into());
        }

        // Check if message is already processed
        if message_record.status == MessageStatus::Completed as u8 {
            return Err(SolanaOpenApiError::MessageAlreadyProcessed.into());
        }

        // Update status to delivered
        message_record.update_status(MessageStatus::Delivered);

        // Serialize updated record back to the account
        message_record.serialize(&mut *message_account.data.borrow_mut())
            .map_err(|_| ProgramError::AccountDataTooSmall)?;
    }

    msg!("Cross-chain message received successfully via LayerZero V2");
    msg!("Message ID: {:?}", message_id);
    msg!("Source Chain: {}", receive_data.source_chain_id);
    msg!("Source Address: {:?}", receive_data.source_address);
    msg!("Message Type: {}", receive_data.message_type);
    msg!("Payload Size: {} bytes", receive_data.payload.len());

    Ok(())
}
