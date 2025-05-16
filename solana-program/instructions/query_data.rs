/**
 * @file instructions/query_data.rs
 * @description Instruction handler for querying cross-chain data
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
use crate::state::{MessageRecord, ProgramConfig, QueryParams};

/// Process a cross-chain data query instruction
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

    // Deserialize the query parameters from instruction data
    let query_params = QueryParams::try_from_slice(instruction_data)
        .map_err(|_| SolanaOpenApiError::InvalidInstructionData)?;

    // Get destination chain ID (must be passed as the next u32 after the query params)
    let params_size = instruction_data.len();
    if params_size < 4 {
        return Err(SolanaOpenApiError::InvalidInstructionData.into());
    }
    
    let destination_chain_id = u32::from_le_bytes([
        instruction_data[params_size - 4],
        instruction_data[params_size - 3],
        instruction_data[params_size - 2],
        instruction_data[params_size - 1],
    ]);

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

    // Get current timestamp for nonce
    let clock = Clock::from_account_info(clock_sysvar)?;
    let timestamp = clock.unix_timestamp as u64;

    // Create cross-chain message
    let message = CrossChainMessage::new(
        config.solana_chain_id,
        destination_chain_id,
        query_params.query_type,
        query_params.target_address.clone(),
        timestamp, // Use timestamp as nonce
    );

    // Generate message ID
    let message_id = message.generate_id();

    // Create message record
    let message_record = MessageRecord::new(
        message_id,
        config.solana_chain_id,
        destination_chain_id,
        query_params.query_type,
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

    msg!("Cross-chain query sent successfully");
    msg!("Message ID: {:?}", message_id);
    msg!("Query Type: {}", query_params.query_type);
    msg!("Destination Chain: {}", destination_chain_id);

    Ok(())
}
