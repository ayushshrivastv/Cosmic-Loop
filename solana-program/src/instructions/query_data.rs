/**
 * @file instructions/query_data.rs
 * @description Instruction handler for querying cross-chain data via LayerZero V2
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
use crate::state::{MessageRecord, ProgramConfig, QueryParams};

/// Query data instruction parameters
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct QueryDataParams {
    pub destination_chain_id: u32,
    pub destination_address: Vec<u8>,
    pub query_params: QueryParams,
    pub gas_limit: u64,
}

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
    let query_data = QueryDataParams::try_from_slice(instruction_data)
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

    // Verify destination chain ID is valid
    if query_data.destination_chain_id == 0 {
        return Err(SolanaOpenApiError::InvalidDestinationChain.into());
    }

    // Get current timestamp for nonce
    let clock = Clock::from_account_info(clock_sysvar)?;
    let timestamp = clock.unix_timestamp as u64;

    // Create message options
    let options = MessageOptions {
        gas_limit: query_data.gas_limit,
        refund_address: *sender_account.key,
        executor_options: Vec::new(), // Default options
        receiver_options: Vec::new(), // Default options
    };

    // Serialize the query parameters as the payload
    let mut payload = Vec::new();
    query_data.query_params.serialize(&mut payload)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Create cross-chain message
    let message = CrossChainMessage::new(
        config.solana_chain_id,
        query_data.destination_chain_id,
        query_data.query_params.query_type,
        payload,
        timestamp, // Use timestamp as nonce
        Some(options.clone()),
    );

    // Generate message ID
    let message_id = message.generate_id();

    // Create message record
    let message_record = MessageRecord::new(
        message_id,
        config.solana_chain_id,
        query_data.destination_chain_id,
        query_data.query_params.query_type,
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
        query_data.destination_chain_id,
        payload.len(),
        &options,
    )?;

    msg!("Estimated fee for cross-chain query: {} lamports", fee);

    // Send message to LayerZero endpoint
    send_to_endpoint(
        program_id,
        layerzero_endpoint,
        fee_account,
        sender_account,
        &message,
        query_data.destination_address,
    )?;

    msg!("Cross-chain query sent successfully via LayerZero V2");
    msg!("Message ID: {:?}", message_id);
    msg!("Query Type: {}", query_data.query_params.query_type);
    msg!("Destination Chain: {}", query_data.destination_chain_id);
    msg!("Target Address: {:?}", query_data.query_params.target_address);

    Ok(())
}
