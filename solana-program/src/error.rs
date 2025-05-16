/**
 * @file error.rs
 * @description Error types for the Solana OpenAPI LayerZero V2 integration
 */

use solana_program::program_error::ProgramError;
use thiserror::Error;
use num_traits::FromPrimitive;

/// Custom error types for the Solana OpenAPI program
#[derive(Error, Debug, Copy, Clone)]
pub enum SolanaOpenApiError {
    /// Invalid instruction data
    #[error("Invalid instruction data")]
    InvalidInstructionData,

    /// Invalid account data
    #[error("Invalid account data")]
    InvalidAccountData,

    /// Account not initialized
    #[error("Account not initialized")]
    AccountNotInitialized,

    /// Insufficient funds for transaction
    #[error("Insufficient funds for transaction")]
    InsufficientFunds,

    /// Invalid LayerZero endpoint
    #[error("Invalid LayerZero endpoint")]
    InvalidEndpoint,

    /// Unauthorized access
    #[error("Unauthorized access")]
    Unauthorized,

    /// Message already processed
    #[error("Message already processed")]
    MessageAlreadyProcessed,

    /// Invalid message status
    #[error("Invalid message status")]
    InvalidMessageStatus,

    /// Invalid destination chain
    #[error("Invalid destination chain")]
    InvalidDestinationChain,

    /// Message not found
    #[error("Message not found")]
    MessageNotFound,

    /// Payload too large
    #[error("Payload too large")]
    PayloadTooLarge,
    
    /// Invalid message options
    #[error("Invalid message options")]
    InvalidMessageOptions,
}

impl From<SolanaOpenApiError> for ProgramError {
    fn from(e: SolanaOpenApiError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl FromPrimitive for SolanaOpenApiError {
    fn from_i64(n: i64) -> Option<Self> {
        Self::from_u64(n as u64)
    }

    fn from_u64(n: u64) -> Option<Self> {
        match n {
            1 => Some(SolanaOpenApiError::InvalidInstructionData),
            2 => Some(SolanaOpenApiError::InvalidAccountData),
            3 => Some(SolanaOpenApiError::AccountNotInitialized),
            4 => Some(SolanaOpenApiError::InsufficientFunds),
            5 => Some(SolanaOpenApiError::InvalidEndpoint),
            6 => Some(SolanaOpenApiError::Unauthorized),
            7 => Some(SolanaOpenApiError::MessageAlreadyProcessed),
            8 => Some(SolanaOpenApiError::InvalidMessageStatus),
            9 => Some(SolanaOpenApiError::InvalidDestinationChain),
            10 => Some(SolanaOpenApiError::MessageNotFound),
            _ => None,
        }
    }
}
