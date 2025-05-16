#![allow(unexpected_cfgs)]

/**
 * @file lib.rs
 * @description Main entry point for the Solana OpenAPI LayerZero V2 integration
 * This program handles cross-chain messaging and data access via LayerZero V2
 */



use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,
    program_error::ProgramError,
};

mod layerzero;
mod state;
mod instructions;
mod error;

// Commenting out unused imports
// use instructions::*;
// use error::SolanaOpenApiError;

#[cfg(not(feature = "no-entrypoint"))]
entrypoint!(process_instruction);

/// Main instruction processor
/// Handles all incoming instructions to the program
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Verify instruction data is not empty
    if instruction_data.is_empty() {
        return Err(ProgramError::InvalidInstructionData);
    }

    // Instruction processing logic
    match instruction_data[0] {
        0 => send_cross_chain_message(program_id, accounts, &instruction_data[1..]),
        1 => receive_cross_chain_message(program_id, accounts, &instruction_data[1..]),
        2 => query_cross_chain_data(program_id, accounts, &instruction_data[1..]),
        3 => process_cross_chain_response(program_id, accounts, &instruction_data[1..]),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

/// Send a message to another chain via LayerZero
fn send_cross_chain_message(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    instructions::send_message::process(program_id, accounts, instruction_data)
}

/// Receive a message from another chain via LayerZero
fn receive_cross_chain_message(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    instructions::receive_message::process(program_id, accounts, instruction_data)
}

/// Query data across chains via LayerZero
fn query_cross_chain_data(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    instructions::query_data::process(program_id, accounts, instruction_data)
}

/// Process a response from a cross-chain query
fn process_cross_chain_response(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    instructions::process_response::process(program_id, accounts, instruction_data)
}
