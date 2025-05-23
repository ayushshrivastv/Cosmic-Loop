/**
 * @file instructions/send_message.rs
 * @description Instruction handler for sending cross-chain messages via LayerZero V2
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
use crate::layerzero::{CrossChainMessage, MessageOptions, send_to_endpoint, get_fee_quote};
use crate::state::{MessageRecord, ProgramConfig};

/// Send message instruction data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct SendMessageData {
    pub destination_chain_id: u32,
    pub destination_address: Vec<u8>,
    pub message_type: u8,
    pub payload: Vec<u8>,
    pub gas_limit: u64,
}

/// Process a send message instruction
pub fn process<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Get required accounts
    let sender_account = next_account_info(accounts_iter)?;
    let message_account = next_account_info(accounts_iter)?;
    let config_account = next_account_info(accounts_iter)?;
    let layerzero_endpoint = next_account_info(accounts_iter)?;
    let fee_account = next_account_info(accounts_iter)?;
    let clock_sysvar = next_account_info(accounts_iter)?;

    // Verify sender is signer
    if !sender_account.is_signer {
        return Err(SolanaOpenApiError::Unauthorized.into());
    }

    // Deserialize the instruction data
    let send_data = SendMessageData::try_from_slice(instruction_data)
        .map_err(|_| SolanaOpenApiError::InvalidInstructionData)?;

    // Verify payload size
    if send_data.payload.len() > 10000 {
        return Err(SolanaOpenApiError::PayloadTooLarge.into());
    }

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

    // Get current timestamp and nonce
    let clock = Clock::from_account_info(clock_sysvar)?;
    let timestamp = clock.unix_timestamp as u64;
    let nonce = timestamp; // Using timestamp as nonce for simplicity

    // Create message options
    let options = MessageOptions {
        gas_limit: send_data.gas_limit,
        refund_address: *sender_account.key,
        executor_options: Vec::new(), // Default options
        receiver_options: Vec::new(), // Default options
    };

    // Create the cross-chain message
    let message = CrossChainMessage::new(
        config.solana_chain_id,
        send_data.destination_chain_id,
        send_data.message_type,
        send_data.payload.clone(),
        nonce,
        Some(options.clone()),
    );

    // Generate message ID
    let message_id = message.generate_id();

    // Create message record
    let message_record = MessageRecord::new(
        message_id,
        config.solana_chain_id,
        send_data.destination_chain_id,
        send_data.message_type,
        *sender_account.key,
        timestamp,
    );

    // Serialize message record to the message account
    message_record.serialize(&mut *message_account.data.borrow_mut())
        .map_err(|_| ProgramError::AccountDataTooSmall)?;

    // Get fee quote
    let fee = get_fee_quote(
        program_id,
        layerzero_endpoint,
        send_data.destination_chain_id,
        send_data.payload.len(),
        &options,
    )?;

    msg!("Estimated fee: {} lamports", fee);

    // Send message to LayerZero endpoint
    send_to_endpoint(
        program_id,
        layerzero_endpoint,
        fee_account,
        sender_account,
        &message,
        send_data.destination_address,
    )?;

    msg!("Cross-chain message sent successfully via LayerZero V2");
    msg!("Message ID: {:?}", message_id);
    msg!("Destination Chain: {}", send_data.destination_chain_id);

    Ok(())
}
