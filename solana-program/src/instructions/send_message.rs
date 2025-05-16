/**
 * @file instructions/send_message.rs
 * @description Instruction handler for sending cross-chain messages
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
use crate::layerzero::{CrossChainMessage, send_to_endpoint};
use crate::state::{MessageRecord, ProgramConfig};

/// Process a send message instruction
pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
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

    // Deserialize the message from instruction data
    let message = CrossChainMessage::try_from_slice(instruction_data)
        .map_err(|_| SolanaOpenApiError::InvalidInstructionData)?;

    // Verify payload size
    if message.payload.len() > 10000 {
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

    // Generate message ID
    let message_id = message.generate_id();

    // Get current timestamp
    let clock = Clock::from_account_info(clock_sysvar)?;
    let timestamp = clock.unix_timestamp as u64;

    // Create message record
    let message_record = MessageRecord::new(
        message_id,
        config.solana_chain_id,
        message.destination_chain_id,
        message.message_type,
        *sender_account.key,
        timestamp,
    );

    // Serialize message record to the message account
    message_record.serialize(&mut *message_account.data.borrow_mut())
        .map_err(|_| ProgramError::AccountDataTooSmall)?;

    // Send message to LayerZero endpoint
    send_to_endpoint(
        program_id,
        layerzero_endpoint,
        fee_account,
        sender_account,
        &message,
    )?;

    msg!("Cross-chain message sent successfully");
    msg!("Message ID: {:?}", message_id);

    Ok(())
}
