use crate::pb::nft::v1::{NFTEvents, NFTMintEvent, NFTTransferEvent, NFTBurnEvent, CompressedTokenEvent, NFTActivity};
use crate::utils::extract_timestamp;
use substreams::store::{StoreNew, StoreGet, StoreSet};
use substreams_entity_change::tables::Tables;
use substreams_solana::pb::sf::solana::r#type::v1::Block;

use std::collections::HashMap;

// SPL Token program ID
const TOKEN_PROGRAM_ID: &str = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
// Metaplex Token Metadata program ID
const METADATA_PROGRAM_ID: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
// Light Protocol Compressed NFT program ID
const COMPRESSED_NFT_PROGRAM_ID: &str = "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK";

pub fn extract_nft_events(block: &Block) -> Result<NFTEvents, substreams::errors::Error> {
    let mut events = NFTEvents {
        mint_events: vec![],
        transfer_events: vec![],
        burn_events: vec![],
        compressed_events: vec![],
    };

    for trx in &block.transactions {
        if let Some(meta) = &trx.meta {
            // Skip failed transactions
            if meta.err.is_some() {
                continue;
            }

            let transaction_hash = hex::encode(&trx.transaction.signatures[0]);
            let block_hash = hex::encode(&block.blockhash);
            let block_number = block.slot;
            let block_timestamp = extract_timestamp(block);

            for (ix_index, instruction) in trx.transaction.message.instructions.iter().enumerate() {
                let program_id = &trx.transaction.message.account_keys[instruction.program_id_index as usize];

                // Convert program ID to string
                let program_id_str = hex::encode(program_id);

                match program_id_str.as_str() {
                    // Handle SPL Token program instructions
                    TOKEN_PROGRAM_ID => {
                        // Decode instruction data
                        if instruction.data.is_empty() {
                            continue;
                        }

                        // First byte is the instruction type
                        let ix_type = instruction.data[0];

                        // Handle different token instruction types
                        match ix_type {
                            // MintTo instruction
                            7 => {
                                // Extract mint token instruction details...
                                if instruction.accounts.len() < 3 {
                                    continue;
                                }

                                let mint_index = instruction.accounts[0] as usize;
                                let to_index = instruction.accounts[1] as usize;
                                let authority_index = instruction.accounts[2] as usize;

                                if mint_index >= trx.transaction.message.account_keys.len() ||
                                   to_index >= trx.transaction.message.account_keys.len() ||
                                   authority_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let mint = hex::encode(&trx.transaction.message.account_keys[mint_index]);
                                let to = hex::encode(&trx.transaction.message.account_keys[to_index]);
                                let authority = hex::encode(&trx.transaction.message.account_keys[authority_index]);

                                // Try to extract amount from instruction data
                                let amount = if instruction.data.len() >= 9 {
                                    let amount_bytes = &instruction.data[1..9];
                                    u64::from_le_bytes([
                                        amount_bytes[0], amount_bytes[1], amount_bytes[2], amount_bytes[3],
                                        amount_bytes[4], amount_bytes[5], amount_bytes[6], amount_bytes[7],
                                    ])
                                } else {
                                    0
                                };

                                // Create mint event
                                let mint_event = NFTMintEvent {
                                    token_address: mint,
                                    to_address: to,
                                    transaction_hash: transaction_hash.clone(),
                                    block_number,
                                    timestamp: extract_timestamp(&block),
                                    token_name: Some(String::new()), // These would be filled from metadata if available
                                    token_symbol: Some(String::new()),
                                    token_uri: Some(String::new()),
                                    attributes_json: Some(String::new()),
                                    collection: None,
                                };

                                events.mint_events.push(mint_event);
                            },
                            // Transfer instruction
                            3 => {
                                // Extract transfer instruction details...
                                if instruction.accounts.len() < 3 {
                                    continue;
                                }

                                let from_index = instruction.accounts[0] as usize;
                                let to_index = instruction.accounts[1] as usize;
                                let token_index = instruction.accounts[2] as usize;

                                if from_index >= trx.transaction.message.account_keys.len() ||
                                   to_index >= trx.transaction.message.account_keys.len() ||
                                   token_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let from = hex::encode(&trx.transaction.message.account_keys[from_index]);
                                let to = hex::encode(&trx.transaction.message.account_keys[to_index]);
                                let token = hex::encode(&trx.transaction.message.account_keys[token_index]);

                                // Try to extract amount from instruction data
                                let amount = if instruction.data.len() >= 9 {
                                    let amount_bytes = &instruction.data[1..9];
                                    u64::from_le_bytes([
                                        amount_bytes[0], amount_bytes[1], amount_bytes[2], amount_bytes[3],
                                        amount_bytes[4], amount_bytes[5], amount_bytes[6], amount_bytes[7],
                                    ])
                                } else {
                                    0
                                };

                                // Create transfer event
                                let transfer_event = NFTTransferEvent {
                                    token_address: token,
                                    from_address: from,
                                    to_address: to,
                                    transaction_hash: transaction_hash.clone(),
                                    block_number,
                                    timestamp: extract_timestamp(&block),
                                    collection: None,
                                };

                                events.transfer_events.push(transfer_event);
                            },
                            // Burn instruction
                            8 => {
                                // Extract burn instruction details...
                                if instruction.accounts.len() < 2 {
                                    continue;
                                }

                                let token_index = instruction.accounts[0] as usize;
                                let owner_index = instruction.accounts[1] as usize;

                                if token_index >= trx.transaction.message.account_keys.len() ||
                                   owner_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let token = hex::encode(&trx.transaction.message.account_keys[token_index]);
                                let owner = hex::encode(&trx.transaction.message.account_keys[owner_index]);

                                // Try to extract amount from instruction data
                                let amount = if instruction.data.len() >= 9 {
                                    let amount_bytes = &instruction.data[1..9];
                                    u64::from_le_bytes([
                                        amount_bytes[0], amount_bytes[1], amount_bytes[2], amount_bytes[3],
                                        amount_bytes[4], amount_bytes[5], amount_bytes[6], amount_bytes[7],
                                    ])
                                } else {
                                    0
                                };

                                // Create burn event
                                let burn_event = NFTBurnEvent {
                                    token_address: token,
                                    from_address: owner,
                                    transaction_hash: transaction_hash.clone(),
                                    block_number,
                                    timestamp: extract_timestamp(&block),
                                    collection: None,
                                };

                                events.burn_events.push(burn_event);
                            },
                            _ => {} // Other token instructions
                        }
                    },
                    // Handle Compressed NFT program instructions
                    COMPRESSED_NFT_PROGRAM_ID => {
                        // Basic tracking of compressed token operations
                        // In a real implementation, we would decode specific instructions
                        // based on Light Protocol's specific instruction format

                        // For this example, we'll create a generic compressed token event
                        if !instruction.data.is_empty() {
                            let operation = match instruction.data[0] {
                                0 => "create",
                                1 => "mint",
                                2 => "transfer",
                                3 => "burn",
                                _ => "unknown",
                            };

                            // Extract account information based on operation type
                            // This is a simplified example - real implementation would need
                            // to decode based on Light Protocol's specific data layout
                            let token_address = if !instruction.accounts.is_empty() {
                                let account_index = instruction.accounts[0] as usize;
                                if account_index < trx.transaction.message.account_keys.len() {
                                    hex::encode(&trx.transaction.message.account_keys[account_index])
                                } else {
                                    String::new()
                                }
                            } else {
                                String::new()
                            };

                            // We'd need to decode from and to addresses based on the specific
                            // instruction layout of the compressed token program

                            // Create compressed token event
                            let compressed_event = CompressedTokenEvent {
                                token_address,
                                owner_address: String::new(), // Would need to be extracted from instruction data
                                transaction_hash: transaction_hash.clone(),
                                block_number,
                                timestamp: extract_timestamp(&block),
                                event_type: operation.to_string(),
                                collection: None,
                                metadata_uri: None,
                            };

                            events.compressed_events.push(compressed_event);
                        }
                    },
                    _ => {} // Other programs
                }
            }
        }
    }

    Ok(events)
}

pub fn store_nft_activities(events: NFTEvents, store: StoreNew) {
    // Store mint events
    for event in events.mint_events {
        let id = format!("{}{}", event.token_address, event.transaction_hash);

        let activity = NFTActivity {
            id: id.clone(),
            token_address: event.token_address.clone(),
            activity_type: "mint".to_string(),
            from_address: None,
            to_address: Some(event.to_address.clone()),
            transaction_hash: event.transaction_hash.clone(),
            block_number: event.block_number,
            timestamp: event.timestamp,
            is_compressed: false,
            collection: event.collection.clone(),
            token_name: event.token_name.clone(),
            token_symbol: event.token_symbol.clone(),
            token_uri: event.token_uri.clone(),
            attributes_json: event.attributes_json.clone(),
        };

        store.set(id, &activity);
    }

    // Store transfer events
    for event in events.transfer_events {
        let id = format!("{}{}", event.token_address, event.transaction_hash);

        let activity = NFTActivity {
            id: id.clone(),
            token_address: event.token_address.clone(),
            activity_type: "transfer".to_string(),
            from_address: Some(event.from_address.clone()),
            to_address: Some(event.to_address.clone()),
            transaction_hash: event.transaction_hash.clone(),
            block_number: event.block_number,
            timestamp: event.timestamp,
            is_compressed: false,
            collection: event.collection.clone(),
            token_name: None,
            token_symbol: None,
            token_uri: None,
            attributes_json: None,
        };

        store.set(id, &activity);
    }

    // Store burn events
    for event in events.burn_events {
        let id = format!("{}{}", event.token_address, event.transaction_hash);

        let activity = NFTActivity {
            id: id.clone(),
            token_address: event.token_address.clone(),
            activity_type: "burn".to_string(),
            from_address: Some(event.from_address.clone()),
            to_address: None,
            transaction_hash: event.transaction_hash.clone(),
            block_number: event.block_number,
            timestamp: event.timestamp,
            is_compressed: false,
            collection: event.collection.clone(),
            token_name: None,
            token_symbol: None,
            token_uri: None,
            attributes_json: None,
        };

        store.set(id, &activity);
    }

    // Store compressed token events
    for event in events.compressed_events {
        let id = format!("{}{}", event.token_address, event.transaction_hash);

        let activity = NFTActivity {
            id: id.clone(),
            token_address: event.token_address.clone(),
            activity_type: format!("compressed_{}", event.event_type),
            from_address: None, // Compressed NFTs might not have this info
            to_address: None,
            transaction_hash: event.transaction_hash.clone(),
            block_number: event.block_number,
            timestamp: event.timestamp,
            is_compressed: true,
            collection: event.collection.clone(),
            token_name: None,
            token_symbol: None,
            token_uri: event.metadata_uri.clone(),
            attributes_json: None,
        };

        store.set(id, &activity);
    }
}

pub fn graph_out(store: &StoreGet, tables: &mut Tables) -> Result<(), substreams::errors::Error> {
    let nft_activities_prefix = "";

    store.scan_all(nft_activities_prefix, |key, activity: &NFTActivity| {
        let entity_type = "NFTActivity";

        tables
            .create_row(entity_type, &activity.id)
            .set("activityType", &activity.activity_type)
            .set("transactionHash", &activity.transaction_hash)
            .set("blockNumber", activity.block_number)
            .set("blockTimestamp", &activity.block_timestamp)
            .set("tokenAddress", &activity.token_address)
            .set("isCompressed", activity.is_compressed);

        if let Some(from) = &activity.from_address {
            tables.update_row(entity_type, &activity.id).set("fromAddress", from);
        }

        if let Some(to) = &activity.to_address {
            tables.update_row(entity_type, &activity.id).set("toAddress", to);
        }

        if let Some(amount) = activity.amount {
            tables.update_row(entity_type, &activity.id).set("amount", amount);
        }

        if let Some(collection) = &activity.collection {
            tables.update_row(entity_type, &activity.id).set("collection", collection);
        }

        if let Some(name) = &activity.token_name {
            tables.update_row(entity_type, &activity.id).set("tokenName", name);
        }

        if let Some(symbol) = &activity.token_symbol {
            tables.update_row(entity_type, &activity.id).set("tokenSymbol", symbol);
        }

        if let Some(uri) = &activity.token_uri {
            tables.update_row(entity_type, &activity.id).set("tokenUri", uri);
        }

        // Attributes are serialized as a JSON string
        if !activity.attributes.is_empty() {
            if let Ok(json) = serde_json::to_string(&activity.attributes) {
                tables.update_row(entity_type, &activity.id).set("attributesJson", &json);
            }
        }
    });

    Ok(())
}
