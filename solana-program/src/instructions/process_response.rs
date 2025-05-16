/**
 * @file instructions/process_response.rs
 * @description Instruction handler for processing cross-chain query responses
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

/// Process a cross-chain response instruction
pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
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

    // Deserialize the message from instruction data
    let message = CrossChainMessage::try_from_slice(instruction_data)
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
    let _timestamp = clock.unix_timestamp as u64;

    // Get message record
    let mut message_record = MessageRecord::try_from_slice(&message_account.data.borrow())
        .map_err(|_| SolanaOpenApiError::InvalidAccountData)?;

    // Verify message record is for the same query
    if message_record.source_chain_id != message.destination_chain_id ||
       message_record.destination_chain_id != message.source_chain_id ||
       message_record.message_type != message.message_type {
        return Err(SolanaOpenApiError::InvalidAccountData.into());
    }

    // Update message record with response data
    message_record.set_response(message.payload.clone());
    message_record.update_status(MessageStatus::Completed);

    // Serialize updated record back to the account
    message_record.serialize(&mut *message_account.data.borrow_mut())
        .map_err(|_| ProgramError::AccountDataTooSmall)?;

    msg!("Cross-chain response processed successfully");
    msg!("Message ID: {:?}", message_id);
    msg!("Source Chain: {}", message.source_chain_id);
    msg!("Response Size: {}", message.payload.len());

    Ok(())
}
