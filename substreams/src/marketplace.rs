use substreams::errors::Error;
use substreams_solana::pb::sf::solana::r#type::v1::Block;
use substreams_solana::pb::sf::solana::r#type::v1::ConfirmedTransaction;

// Re-export the protobuf types
pub use crate::pb::marketplace::v1::*;

// Known marketplace program IDs on Solana
const MAGIC_EDEN_PROGRAM_ID: &str = "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K";
const TENSOR_PROGRAM_ID: &str = "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN";

pub fn extract_marketplace_events(block: Block) -> Result<MarketplaceEvents, Error> {
    let mut events = MarketplaceEvents { events: vec![] };
    let block_number = block.slot;
    let block_hash = block.blockhash.clone();
    let timestamp = block.block_time.as_ref().map(|t| t.timestamp).unwrap_or(0) as u64;

    for transaction in block.transactions {
        if let Some(marketplace_event) = process_transaction(transaction, block_number, &block_hash, timestamp) {
            events.events.push(marketplace_event);
        }
    }

    Ok(events)
}

fn process_transaction(
    transaction: ConfirmedTransaction,
    block_number: u64,
    block_hash: &str,
    timestamp: u64,
) -> Option<MarketplaceEvent> {
    // Skip failed transactions
    if !transaction.meta.as_ref()?.status.unwrap_or_default().err.is_none() {
        return None;
    }

    let transaction_hash = bs58::encode(&transaction.transaction.as_ref()?.signatures[0]).into_string();
    
    // Look for marketplace program invocations
    for account_key in &transaction.transaction.as_ref()?.message.as_ref()?.account_keys {
        if account_key == MAGIC_EDEN_PROGRAM_ID || account_key == TENSOR_PROGRAM_ID {
            // This is a transaction involving a marketplace
            // In a real implementation, we would parse the instruction data and logs
            // to determine the exact event type and extract relevant information
            
            // For this example, we'll create a simplified marketplace event
            let marketplace = determine_marketplace(account_key);
            let event_type = determine_marketplace_event_type(&transaction);
            let (token_address, token_id) = extract_token_info(&transaction);
            let collection_address = extract_collection_address(&transaction);
            let (seller_address, buyer_address) = extract_seller_buyer_addresses(&transaction);
            let (currency_address, price) = extract_price_info(&transaction);
            let (marketplace_fee, creator_fee) = extract_fee_info(&transaction);
            
            return Some(MarketplaceEvent {
                id: format!("{}-{}", transaction_hash, 0),
                transaction_hash,
                block_number,
                block_hash: block_hash.to_string(),
                timestamp,
                marketplace,
                event_type,
                token_address,
                token_id,
                collection_address,
                seller_address,
                buyer_address,
                currency_address,
                price,
                quantity: 1,
                marketplace_fee,
                creator_fee,
            });
        }
    }
    
    None
}

fn determine_marketplace(program_id: &str) -> String {
    match program_id {
        MAGIC_EDEN_PROGRAM_ID => "magic_eden".to_string(),
        TENSOR_PROGRAM_ID => "tensor".to_string(),
        _ => "unknown".to_string(),
    }
}

fn determine_marketplace_event_type(transaction: &ConfirmedTransaction) -> String {
    // In a real implementation, we would analyze the transaction logs and instruction data
    // to determine if this is a listing, sale, offer, or cancel
    // For this example, we'll default to "sale"
    "sale".to_string()
}

fn extract_token_info(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the token address and ID
    // For this example, we'll use placeholder values
    ("token_address_placeholder".to_string(), "token_id_placeholder".to_string())
}

fn extract_collection_address(transaction: &ConfirmedTransaction) -> String {
    // In a real implementation, we would extract the collection address
    // For this example, we'll use a placeholder value
    "collection_address_placeholder".to_string()
}

fn extract_seller_buyer_addresses(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the seller and buyer addresses
    // For this example, we'll use placeholder values
    ("seller_address_placeholder".to_string(), "buyer_address_placeholder".to_string())
}

fn extract_price_info(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the currency address and price
    // For this example, we'll use placeholder values
    ("So11111111111111111111111111111111111111112".to_string(), "1000000000".to_string())
}

fn extract_fee_info(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the marketplace and creator fees
    // For this example, we'll use placeholder values
    ("20000000".to_string(), "50000000".to_string())
}

// This module is auto-generated from the protobuf definitions
mod pb {
    pub mod marketplace {
        pub mod v1 {
            include!(concat!(env!("OUT_DIR"), "/marketplace.v1.rs"));
        }
    }
}
