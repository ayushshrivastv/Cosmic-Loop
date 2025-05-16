/**
 * @file state.rs
 * @description State management for the Solana OpenAPI LayerZero V2 integration
 * This module defines the state structures and account management for the program
 */

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    pubkey::Pubkey,
    program_pack::IsInitialized,
    // Remove unused imports
    // program_pack::{Pack, Sealed},
    // program_error::ProgramError,
};

/// Message types for cross-chain communication
#[allow(dead_code)]
pub enum MessageType {
    NFTData = 1,
    TokenTransfer = 2,
    MarketActivity = 3,
    WalletHistory = 4,
}

/// Status of cross-chain messages
#[allow(dead_code)]
pub enum MessageStatus {
    Pending = 1,
    InFlight = 2,
    Delivered = 3,
    Failed = 4,
    Completed = 5,
}

/// Program configuration account data
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ProgramConfig {
    pub is_initialized: bool,
    pub admin: Pubkey,
    pub layerzero_endpoint: Pubkey,
    pub fee_account: Pubkey,
    pub solana_chain_id: u32,
}

impl IsInitialized for ProgramConfig {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

/// Cross-chain message record
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct MessageRecord {
    pub is_initialized: bool,
    pub message_id: [u8; 32],
    pub source_chain_id: u32,
    pub destination_chain_id: u32,
    pub message_type: u8,
    pub sender: Pubkey,
    pub status: u8,
    pub timestamp: u64,
    pub response_data: Option<Vec<u8>>,
}

impl IsInitialized for MessageRecord {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl MessageRecord {
    /// Create a new message record
    pub fn new(
        message_id: [u8; 32],
        source_chain_id: u32,
        destination_chain_id: u32,
        message_type: u8,
        sender: Pubkey,
        timestamp: u64,
    ) -> Self {
        Self {
            is_initialized: true,
            message_id,
            source_chain_id,
            destination_chain_id,
            message_type,
            sender,
            status: MessageStatus::Pending as u8,
            timestamp,
            response_data: None,
        }
    }

    /// Update the status of a message
    pub fn update_status(&mut self, status: MessageStatus) {
        self.status = status as u8;
    }

    /// Set the response data for a message
    pub fn set_response(&mut self, response_data: Vec<u8>) {
        self.response_data = Some(response_data);
        self.status = MessageStatus::Completed as u8;
    }

    /// Set the message as failed
    #[allow(dead_code)]
    pub fn set_failed(&mut self) {
        self.status = MessageStatus::Failed as u8;
    }
}

/// Cross-chain query parameters
#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct QueryParams {
    pub query_type: u8,
    pub target_address: Vec<u8>,
    pub extra_params: Option<Vec<u8>>,
}

impl QueryParams {
    /// Create a new NFT data query
    #[allow(dead_code)]
    pub fn new_nft_query(nft_address: Vec<u8>) -> Self {
        Self {
            query_type: MessageType::NFTData as u8,
            target_address: nft_address,
            extra_params: None,
        }
    }

    /// Create a new wallet history query
    #[allow(dead_code)]
    pub fn new_wallet_query(wallet_address: Vec<u8>) -> Self {
        Self {
            query_type: MessageType::WalletHistory as u8,
            target_address: wallet_address,
            extra_params: None,
        }
    }

    /// Create a new market activity query
    #[allow(dead_code)]
    pub fn new_market_query(market_address: Vec<u8>, extra_params: Option<Vec<u8>>) -> Self {
        Self {
            query_type: MessageType::MarketActivity as u8,
            target_address: market_address,
            extra_params,
        }
    }
}
