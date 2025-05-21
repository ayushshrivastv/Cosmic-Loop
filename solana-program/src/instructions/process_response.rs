/**
 * @file instructions/process_response.rs
 * @description Instruction handler for processing cross-chain query responses via LayerZero V2
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

/// Response data instruction parameters
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ResponseData {
    pub source_chain_id: u32,
    pub source_address: Vec<u8>,
    pub response_payload: Vec<u8>,
    pub original_message_id: [u8; 32],
}

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

    // Deserialize the response data from instruction data
    let response_data = ResponseData::try_from_slice(instruction_data)
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

    // Create a cross-chain message for verification
    let nonce = 0; // Nonce is not relevant for received responses
    let message = CrossChainMessage::new(
        response_data.source_chain_id,
        config.solana_chain_id, // destination is this chain
        0, // Message type is not relevant for verification
        response_data.response_payload.clone(),
        nonce,
        None, // No options needed for verification
    );

    // Verify message from LayerZero endpoint
    verify_from_endpoint(
        program_id,
        layerzero_endpoint,
        &message,
    )?;

    // Get current timestamp
    let clock = Clock::from_account_info(clock_sysvar)?;
    let timestamp = clock.unix_timestamp as u64;

    // Get message record
    let mut message_record = MessageRecord::try_from_slice(&message_account.data.borrow())
        .map_err(|_| SolanaOpenApiError::InvalidAccountData)?;

    // Verify message record exists and matches the original message ID
    if message_record.message_id != response_data.original_message_id {
        msg!("Message ID mismatch: expected {:?}, got {:?}", 
             response_data.original_message_id, message_record.message_id);
        return Err(SolanaOpenApiError::MessageNotFound.into());
    }

    // Verify message is not already completed
    if message_record.status == MessageStatus::Completed as u8 {
        return Err(SolanaOpenApiError::MessageAlreadyProcessed.into());
    }

    // Update message record with response data
    message_record.set_response(response_data.response_payload.clone());
    message_record.update_status(MessageStatus::Completed);

    // Serialize updated record back to the account
    message_record.serialize(&mut *message_account.data.borrow_mut())
        .map_err(|_| ProgramError::AccountDataTooSmall)?;

    msg!("Cross-chain response processed successfully via LayerZero V2");
    msg!("Original Message ID: {:?}", response_data.original_message_id);
    msg!("Source Chain: {}", response_data.source_chain_id);
    msg!("Source Address: {:?}", response_data.source_address);
    msg!("Response Size: {} bytes", response_data.response_payload.len());
    msg!("Response received at: {} (unix timestamp)", timestamp);

    Ok(())
}
