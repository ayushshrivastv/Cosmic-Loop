use crate::pb::bridge::v1::{BridgeEvents, BridgeOutEvent, BridgeInEvent, BridgeActivity};
use crate::utils::extract_timestamp;
use substreams::store::{StoreNew, StoreGet, StoreSet};
use substreams_entity_change::tables::Tables;
use substreams_solana::pb::sf::solana::r#type::v1::Block;
use substreams::log;

use std::collections::HashMap;

// LayerZero Endpoint program ID on Solana
const LAYERZERO_ENDPOINT_PROGRAM_ID: &str = "2Pbh1HS9XMZ9woT423xy7ve6c4fulYhEoUdoMvzWDL8i";
// Wormhole program ID
const WORMHOLE_PROGRAM_ID: &str = "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb";

pub fn extract_bridge_events(block: &Block) -> Result<BridgeEvents, substreams::errors::Error> {
    let mut events = BridgeEvents {
        bridge_out_events: vec![],
        bridge_in_events: vec![],
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

                // Check if this is a LayerZero or Wormhole bridge transaction
                match program_id_str.as_str() {
                    // LayerZero transactions
                    LAYERZERO_ENDPOINT_PROGRAM_ID => {
                        // In a real implementation, we'd check the instruction type and data
                        // to determine if this is a send or receive transaction

                        // For simplicity, let's check if the first byte indicates a send (1) or receive (2)
                        if instruction.data.is_empty() {
                            continue;
                        }

                        let ix_type = instruction.data[0];

                        match ix_type {
                            // LayerZero Send
                            1 => {
                                // Extract sender information
                                let sender_index = if instruction.accounts.len() > 1 {
                                    instruction.accounts[1] as usize
                                } else {
                                    continue;
                                };

                                if sender_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let sender = hex::encode(&trx.transaction.message.account_keys[sender_index]);

                                // For a real implementation, we'd extract all these details from
                                // the instruction data and accounts according to LayerZero's specific format

                                // Create a bridge out event with placeholder/mock data
                                let bridge_out = BridgeOutEvent {
                                    transaction_hash: transaction_hash.clone(),
                                    block_hash: block_hash.clone(),
                                    block_number,
                                    block_timestamp: block_timestamp.clone(),
                                    sender,
                                    token_address: "mocked_token_address".to_string(), // Would be extracted from instruction
                                    amount: 0, // Would be extracted from instruction data
                                    destination_chain_id: 0, // Would be extracted from instruction data
                                    destination_address: "mocked_destination".to_string(), // Would be extracted from instruction data
                                    bridge_provider: "layerzero".to_string(),
                                    fees_paid: 0, // Would be calculated from transaction fee details
                                    fee_token: "SOL".to_string(),
                                    nonce: 0, // Would be extracted from instruction data
                                    status: "initiated".to_string(),
                                    extra_data: HashMap::new(),
                                };

                                events.bridge_out_events.push(bridge_out);
                            },
                            // LayerZero Receive
                            2 => {
                                // Extract recipient information
                                let recipient_index = if instruction.accounts.len() > 1 {
                                    instruction.accounts[1] as usize
                                } else {
                                    continue;
                                };

                                if recipient_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let recipient = hex::encode(&trx.transaction.message.account_keys[recipient_index]);

                                // Create a bridge in event with placeholder/mock data
                                let bridge_in = BridgeInEvent {
                                    transaction_hash: transaction_hash.clone(),
                                    block_hash: block_hash.clone(),
                                    block_number,
                                    block_timestamp: block_timestamp.clone(),
                                    recipient,
                                    token_address: "mocked_token_address".to_string(), // Would be extracted from instruction
                                    amount: 0, // Would be extracted from instruction data
                                    source_chain_id: 0, // Would be extracted from instruction data
                                    source_address: "mocked_source".to_string(), // Would be extracted from instruction data
                                    bridge_provider: "layerzero".to_string(),
                                    nonce: 0, // Would be extracted from instruction data
                                    status: "completed".to_string(),
                                    source_transaction_hash: "mocked_source_tx".to_string(), // Would be extracted from instruction data
                                    extra_data: HashMap::new(),
                                };

                                events.bridge_in_events.push(bridge_in);
                            },
                            _ => {} // Other LayerZero instruction types
                        }
                    },
                    // Wormhole transactions
                    WORMHOLE_PROGRAM_ID => {
                        // Similar to the LayerZero case, we'd decode the Wormhole-specific
                        // instruction format to detect bridge in/out events

                        // For simplicity, we're not implementing the full Wormhole protocol decoding
                        // In a real implementation, this would be based on Wormhole's instruction format
                    },
                    _ => {} // Other programs
                }
            }
        }
    }

    Ok(events)
}

pub fn store_bridge_activities(events: BridgeEvents, store: StoreNew) {
    // Store bridge out events
    for event in events.bridge_out_events {
        let id = format!("bridge_out:{}:{}", event.transaction_hash, event.destination_chain_id);

        let activity = BridgeActivity {
            id: id.clone(),
            activity_type: "bridge_out".to_string(),
            transaction_hash: event.transaction_hash,
            block_number: event.block_number,
            block_timestamp: event.block_timestamp,
            token_address: event.token_address,
            amount: event.amount,
            sender: Some(event.sender),
            recipient: None,
            bridge_provider: event.bridge_provider,
            source_chain_id: 0, // 0 for Solana in this case
            destination_chain_id: event.destination_chain_id,
            source_address: None,
            destination_address: Some(event.destination_address),
            status: event.status,
            fees_paid: Some(event.fees_paid),
            fee_token: Some(event.fee_token),
            nonce: Some(event.nonce),
            source_transaction_hash: None,
            extra_data: event.extra_data,
        };

        store.set(id, &activity);
    }

    // Store bridge in events
    for event in events.bridge_in_events {
        let id = format!("bridge_in:{}:{}", event.transaction_hash, event.source_chain_id);

        let activity = BridgeActivity {
            id: id.clone(),
            activity_type: "bridge_in".to_string(),
            transaction_hash: event.transaction_hash,
            block_number: event.block_number,
            block_timestamp: event.block_timestamp,
            token_address: event.token_address,
            amount: event.amount,
            sender: None,
            recipient: Some(event.recipient),
            bridge_provider: event.bridge_provider,
            source_chain_id: event.source_chain_id,
            destination_chain_id: 0, // 0 for Solana in this case
            source_address: Some(event.source_address),
            destination_address: None,
            status: event.status,
            fees_paid: None,
            fee_token: None,
            nonce: Some(event.nonce),
            source_transaction_hash: Some(event.source_transaction_hash),
            extra_data: event.extra_data,
        };

        store.set(id, &activity);
    }
}

pub fn graph_out(store: &StoreGet, tables: &mut Tables) -> Result<(), substreams::errors::Error> {
    let bridge_activities_prefix = "";

    store.scan_all(bridge_activities_prefix, |key, activity: &BridgeActivity| {
        let entity_type = "BridgeActivity";

        tables
            .create_row(entity_type, &activity.id)
            .set("activityType", &activity.activity_type)
            .set("transactionHash", &activity.transaction_hash)
            .set("blockNumber", activity.block_number)
            .set("blockTimestamp", &activity.block_timestamp)
            .set("tokenAddress", &activity.token_address)
            .set("amount", activity.amount)
            .set("bridgeProvider", &activity.bridge_provider)
            .set("sourceChainId", activity.source_chain_id)
            .set("destinationChainId", activity.destination_chain_id)
            .set("status", &activity.status);

        if let Some(sender) = &activity.sender {
            tables.update_row(entity_type, &activity.id).set("sender", sender);
        }

        if let Some(recipient) = &activity.recipient {
            tables.update_row(entity_type, &activity.id).set("recipient", recipient);
        }

        if let Some(source_address) = &activity.source_address {
            tables.update_row(entity_type, &activity.id).set("sourceAddress", source_address);
        }

        if let Some(destination_address) = &activity.destination_address {
            tables.update_row(entity_type, &activity.id).set("destinationAddress", destination_address);
        }

        if let Some(fees_paid) = activity.fees_paid {
            tables.update_row(entity_type, &activity.id).set("feesPaid", fees_paid);
        }

        if let Some(fee_token) = &activity.fee_token {
            tables.update_row(entity_type, &activity.id).set("feeToken", fee_token);
        }

        if let Some(nonce) = activity.nonce {
            tables.update_row(entity_type, &activity.id).set("nonce", nonce);
        }

        if let Some(source_tx) = &activity.source_transaction_hash {
            tables.update_row(entity_type, &activity.id).set("sourceTransactionHash", source_tx);
        }

        // Extra data is serialized as a JSON string
        if !activity.extra_data.is_empty() {
            if let Ok(json) = serde_json::to_string(&activity.extra_data) {
                tables.update_row(entity_type, &activity.id).set("extraDataJson", &json);
            }
        }
    });

    Ok(())
}
