use substreams::errors::Error;
use substreams_solana::pb::sf::solana::r#type::v1::Block;
use substreams_solana::pb::sf::solana::r#type::v1::ConfirmedTransaction;

// Re-export the protobuf types
pub use crate::pb::bridge::v1::*;

// Known bridge program IDs on Solana
const WORMHOLE_PROGRAM_ID: &str = "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth";
const LAYERZERO_PROGRAM_ID: &str = "lzTVa7cYDdt7R5bLsQrp4HgQCy5eRt7Mdu5PK4WsP8Q";

pub fn extract_bridge_events(block: Block) -> Result<BridgeEvents, Error> {
    let mut events = BridgeEvents { events: vec![] };
    let block_number = block.slot;
    let block_hash = block.blockhash.clone();
    let timestamp = block.block_time.as_ref().map(|t| t.timestamp).unwrap_or(0) as u64;

    for transaction in block.transactions {
        if let Some(bridge_event) = process_transaction(transaction, block_number, &block_hash, timestamp) {
            events.events.push(bridge_event);
        }
    }

    Ok(events)
}

fn process_transaction(
    transaction: ConfirmedTransaction,
    block_number: u64,
    block_hash: &str,
    timestamp: u64,
) -> Option<BridgeEvent> {
    // Skip failed transactions
    if !transaction.meta.as_ref()?.status.unwrap_or_default().err.is_none() {
        return None;
    }

    let transaction_hash = bs58::encode(&transaction.transaction.as_ref()?.signatures[0]).into_string();
    
    // Look for bridge program invocations
    for account_key in &transaction.transaction.as_ref()?.message.as_ref()?.account_keys {
        if account_key == WORMHOLE_PROGRAM_ID || account_key == LAYERZERO_PROGRAM_ID {
            // This is a transaction involving a bridge
            // In a real implementation, we would parse the instruction data and logs
            // to determine the exact event type and extract relevant information
            
            // For this example, we'll create a simplified bridge event
            let bridge_protocol = determine_bridge_protocol(account_key);
            let event_type = determine_bridge_event_type(&transaction);
            let (source_chain, destination_chain) = extract_chain_info(&transaction);
            let (sender_address, receiver_address) = extract_sender_receiver_addresses(&transaction);
            let (token_address, token_id, amount) = extract_token_info(&transaction);
            let (fee, nonce, message_hash) = extract_bridge_details(&transaction);
            
            return Some(BridgeEvent {
                id: format!("{}-{}", transaction_hash, 0),
                transaction_hash,
                block_number,
                block_hash: block_hash.to_string(),
                timestamp,
                bridge_protocol,
                event_type,
                source_chain,
                destination_chain,
                sender_address,
                receiver_address,
                token_address,
                token_id,
                amount,
                fee,
                nonce,
                message_hash,
            });
        }
    }
    
    None
}

fn determine_bridge_protocol(program_id: &str) -> String {
    match program_id {
        WORMHOLE_PROGRAM_ID => "wormhole".to_string(),
        LAYERZERO_PROGRAM_ID => "layerzero".to_string(),
        _ => "unknown".to_string(),
    }
}

fn determine_bridge_event_type(transaction: &ConfirmedTransaction) -> String {
    // In a real implementation, we would analyze the transaction logs and instruction data
    // to determine if this is a send or receive
    // For this example, we'll default to "send"
    "send".to_string()
}

fn extract_chain_info(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the source and destination chains
    // For this example, we'll use placeholder values
    ("solana".to_string(), "ethereum".to_string())
}

fn extract_sender_receiver_addresses(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the sender and receiver addresses
    // For this example, we'll use placeholder values
    ("sender_address_placeholder".to_string(), "receiver_address_placeholder".to_string())
}

fn extract_token_info(transaction: &ConfirmedTransaction) -> (String, String, String) {
    // In a real implementation, we would extract the token address, token ID, and amount
    // For this example, we'll use placeholder values
    ("token_address_placeholder".to_string(), "token_id_placeholder".to_string(), "1000000000".to_string())
}

fn extract_bridge_details(transaction: &ConfirmedTransaction) -> (String, u64, String) {
    // In a real implementation, we would extract the fee, nonce, and message hash
    // For this example, we'll use placeholder values
    ("10000000".to_string(), 12345, "message_hash_placeholder".to_string())
}

// This module is auto-generated from the protobuf definitions
mod pb {
    pub mod bridge {
        pub mod v1 {
            include!(concat!(env!("OUT_DIR"), "/bridge.v1.rs"));
        }
    }
}
