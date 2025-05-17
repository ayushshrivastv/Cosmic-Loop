use substreams::errors::Error;
use substreams_solana::pb::sf::solana::r#type::v1::Block;
use substreams_solana::pb::sf::solana::r#type::v1::ConfirmedTransaction;

// Re-export the protobuf types
pub use crate::pb::nft::v1::*;

// Known NFT program IDs on Solana
const METAPLEX_PROGRAM_ID: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const CANDY_MACHINE_PROGRAM_ID: &str = "cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ";

pub fn extract_nft_events(block: Block) -> Result<NFTEvents, Error> {
    let mut events = NFTEvents { events: vec![] };
    let block_number = block.slot;
    let block_hash = block.blockhash.clone();
    let timestamp = block.block_time.as_ref().map(|t| t.timestamp).unwrap_or(0) as u64;

    for transaction in block.transactions {
        if let Some(nft_event) = process_transaction(transaction, block_number, &block_hash, timestamp) {
            events.events.push(nft_event);
        }
    }

    Ok(events)
}

fn process_transaction(
    transaction: ConfirmedTransaction,
    block_number: u64,
    block_hash: &str,
    timestamp: u64,
) -> Option<NFTEvent> {
    // Skip failed transactions
    if !transaction.meta.as_ref()?.status.unwrap_or_default().err.is_none() {
        return None;
    }

    let transaction_hash = bs58::encode(&transaction.transaction.as_ref()?.signatures[0]).into_string();
    
    // Look for Metaplex program invocations
    for account_key in &transaction.transaction.as_ref()?.message.as_ref()?.account_keys {
        if account_key == METAPLEX_PROGRAM_ID || account_key == CANDY_MACHINE_PROGRAM_ID {
            // This is a transaction involving NFTs
            // In a real implementation, we would parse the instruction data and logs
            // to determine the exact event type and extract relevant information
            
            // For this example, we'll create a simplified NFT event
            let event_type = determine_nft_event_type(&transaction);
            let (token_address, token_id) = extract_token_info(&transaction);
            let (from_address, to_address) = extract_transfer_addresses(&transaction);
            let collection_address = extract_collection_address(&transaction);
            let metadata = extract_metadata(&transaction);
            
            return Some(NFTEvent {
                id: format!("{}-{}", transaction_hash, 0),
                transaction_hash,
                block_number,
                block_hash: block_hash.to_string(),
                timestamp,
                event_type,
                token_address,
                token_id,
                collection_address,
                from_address,
                to_address,
                metadata: Some(metadata),
            });
        }
    }
    
    None
}

fn determine_nft_event_type(transaction: &ConfirmedTransaction) -> String {
    // In a real implementation, we would analyze the transaction logs and instruction data
    // to determine if this is a mint, transfer, burn, or metadata update
    // For this example, we'll default to "mint"
    "mint".to_string()
}

fn extract_token_info(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the token address and ID
    // For this example, we'll use placeholder values
    ("token_address_placeholder".to_string(), "token_id_placeholder".to_string())
}

fn extract_transfer_addresses(transaction: &ConfirmedTransaction) -> (String, String) {
    // In a real implementation, we would extract the from and to addresses
    // For this example, we'll use placeholder values
    ("from_address_placeholder".to_string(), "to_address_placeholder".to_string())
}

fn extract_collection_address(transaction: &ConfirmedTransaction) -> String {
    // In a real implementation, we would extract the collection address
    // For this example, we'll use a placeholder value
    "collection_address_placeholder".to_string()
}

fn extract_metadata(transaction: &ConfirmedTransaction) -> NFTMetadata {
    // In a real implementation, we would extract the metadata from the transaction
    // or fetch it from an external source
    // For this example, we'll use placeholder values
    NFTMetadata {
        name: "Example NFT".to_string(),
        symbol: "ENFT".to_string(),
        uri: "https://example.com/metadata.json".to_string(),
        description: "An example NFT for the Solana OpenAPI project".to_string(),
        image: "https://example.com/image.png".to_string(),
        attributes: vec![
            Attribute {
                trait_type: "Background".to_string(),
                value: "Blue".to_string(),
            },
            Attribute {
                trait_type: "Rarity".to_string(),
                value: "Common".to_string(),
            },
        ],
    }
}

// This module is auto-generated from the protobuf definitions
mod pb {
    pub mod nft {
        pub mod v1 {
            include!(concat!(env!("OUT_DIR"), "/nft.v1.rs"));
        }
    }
}
