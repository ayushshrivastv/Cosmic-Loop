use substreams::log;
use substreams_solana::pb::sf::solana::r#type::v1::Block;
use serde_json::Value;
use std::collections::HashMap;
use chrono::NaiveDateTime;

/// Extract timestamp from a Solana block
pub fn extract_timestamp(block: &Block) -> u64 {
    // Get timestamp in milliseconds
    block.block_time.as_ref().map(|t| t.timestamp_ms).unwrap_or(0) as u64
}

/// Log decoded instruction for debugging purposes
pub fn log_decoded_instruction(program_id: &str, ix_type: u8, instruction_data: &[u8]) {
    log::debug!("Program: {}, Instruction type: {}, Data length: {}",
        program_id, ix_type, instruction_data.len());

    if instruction_data.len() > 1 {
        let hex_data = hex::encode(&instruction_data[1..std::cmp::min(instruction_data.len(), 17)]);
        log::debug!("Instruction data (partial): 0x{}", hex_data);
    }
}

/// Extract metadata from a JSON string
pub fn extract_metadata_from_json(json_str: &str) -> (String, String, String, Option<String>, HashMap<String, String>) {
    let mut name = String::new();
    let mut symbol = String::new();
    let mut uri = String::new();
    let mut collection = None;
    let mut attributes = HashMap::new();

    if let Ok(json) = serde_json::from_str::<Value>(json_str) {
        if let Some(name_value) = json.get("name") {
            if let Some(n) = name_value.as_str() {
                name = n.to_string();
            }
        }

        if let Some(symbol_value) = json.get("symbol") {
            if let Some(s) = symbol_value.as_str() {
                symbol = s.to_string();
            }
        }

        if let Some(uri_value) = json.get("uri") {
            if let Some(u) = uri_value.as_str() {
                uri = u.to_string();
            }
        }

        if let Some(collection_obj) = json.get("collection") {
            if let Some(name_value) = collection_obj.get("name") {
                if let Some(c) = name_value.as_str() {
                    collection = Some(c.to_string());
                }
            }
        }

        if let Some(attrs_array) = json.get("attributes") {
            if let Some(attrs) = attrs_array.as_array() {
                for attr in attrs {
                    if let (Some(trait_type), Some(value)) = (attr.get("trait_type"), attr.get("value")) {
                        if let (Some(t), Some(v)) = (trait_type.as_str(), value.as_str()) {
                            attributes.insert(t.to_string(), v.to_string());
                        }
                    }
                }
            }
        }
    }

    (name, symbol, uri, collection, attributes)
}
