use crate::pb::marketplace::v1::{MarketplaceEvents, ListingEvent, SaleEvent, BidEvent, CancelEvent, MarketplaceActivity};
use crate::utils::extract_timestamp;
use substreams::store::{StoreNew, StoreGet, StoreSet};
use substreams_entity_change::tables::Tables;
use substreams_solana::pb::sf::solana::r#type::v1::Block;
use substreams::log;

use std::collections::HashMap;

// Magic Eden program ID
const MAGIC_EDEN_PROGRAM_ID: &str = "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K";
// Tensor program ID
const TENSOR_PROGRAM_ID: &str = "TSWAPaqyCSx2KABk68Shrq7iPLTRqVoSuA5f5qQihMs";
// Metaplex Auction House program ID
const AUCTION_HOUSE_PROGRAM_ID: &str = "hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk";

pub fn extract_marketplace_events(block: &Block) -> Result<MarketplaceEvents, substreams::errors::Error> {
    let mut events = MarketplaceEvents {
        listing_events: vec![],
        sale_events: vec![],
        bid_events: vec![],
        cancel_events: vec![],
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

                // Check if this is a marketplace transaction
                match program_id_str.as_str() {
                    // Magic Eden marketplace
                    MAGIC_EDEN_PROGRAM_ID => {
                        // In a real implementation, we'd check the instruction type and data
                        // to determine what kind of marketplace action is being performed

                        if instruction.data.is_empty() {
                            continue;
                        }

                        let ix_type = instruction.data[0];

                        // For Magic Eden, we'd need to know their specific instruction format
                        // This is a simplified placeholder implementation
                        match ix_type {
                            // Listing (example instruction code, not accurate)
                            1 => {
                                // Extract seller information
                                let seller_index = if instruction.accounts.len() > 0 {
                                    instruction.accounts[0] as usize
                                } else {
                                    continue;
                                };

                                // Extract token information
                                let token_index = if instruction.accounts.len() > 1 {
                                    instruction.accounts[1] as usize
                                } else {
                                    continue;
                                };

                                if seller_index >= trx.transaction.message.account_keys.len() ||
                                   token_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let seller = hex::encode(&trx.transaction.message.account_keys[seller_index]);
                                let token_address = hex::encode(&trx.transaction.message.account_keys[token_index]);

                                // Create a listing event with placeholder/mock data
                                let listing = ListingEvent {
                                    transaction_hash: transaction_hash.clone(),
                                    block_hash: block_hash.clone(),
                                    block_number,
                                    block_timestamp: block_timestamp.clone(),
                                    marketplace: "magiceden".to_string(),
                                    seller,
                                    token_address,
                                    price: 0, // Would be extracted from instruction data
                                    price_token: "SOL".to_string(),
                                    listing_id: format!("me_listing_{}", transaction_hash),
                                    collection: None, // Would be derived from token metadata
                                    auction_house: None,
                                    end_time: 0, // No end time for fixed price listings
                                    extra_data: HashMap::new(),
                                };

                                events.listing_events.push(listing);
                            },
                            // Sale (example instruction code, not accurate)
                            2 => {
                                // Extract seller information
                                let seller_index = if instruction.accounts.len() > 0 {
                                    instruction.accounts[0] as usize
                                } else {
                                    continue;
                                };

                                // Extract buyer information
                                let buyer_index = if instruction.accounts.len() > 1 {
                                    instruction.accounts[1] as usize
                                } else {
                                    continue;
                                };

                                // Extract token information
                                let token_index = if instruction.accounts.len() > 2 {
                                    instruction.accounts[2] as usize
                                } else {
                                    continue;
                                };

                                if seller_index >= trx.transaction.message.account_keys.len() ||
                                   buyer_index >= trx.transaction.message.account_keys.len() ||
                                   token_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let seller = hex::encode(&trx.transaction.message.account_keys[seller_index]);
                                let buyer = hex::encode(&trx.transaction.message.account_keys[buyer_index]);
                                let token_address = hex::encode(&trx.transaction.message.account_keys[token_index]);

                                // Create a sale event with placeholder/mock data
                                let sale = SaleEvent {
                                    transaction_hash: transaction_hash.clone(),
                                    block_hash: block_hash.clone(),
                                    block_number,
                                    block_timestamp: block_timestamp.clone(),
                                    marketplace: "magiceden".to_string(),
                                    seller,
                                    buyer,
                                    token_address,
                                    price: 0, // Would be extracted from instruction data
                                    price_token: "SOL".to_string(),
                                    listing_id: format!("me_listing_sold_{}", transaction_hash),
                                    collection: None, // Would be derived from token metadata
                                    auction_house: None,
                                    marketplace_fee: 0, // Would be calculated based on the transaction
                                    royalty_fee: 0, // Would be calculated based on the transaction
                                    extra_data: HashMap::new(),
                                };

                                events.sale_events.push(sale);
                            },
                            _ => {} // Other Magic Eden instruction types
                        }
                    },
                    // Tensor marketplace
                    TENSOR_PROGRAM_ID => {
                        // Similar to Magic Eden, but with Tensor-specific instruction format
                    },
                    // Metaplex Auction House
                    AUCTION_HOUSE_PROGRAM_ID => {
                        // Decode Metaplex Auction House instructions
                        if instruction.data.is_empty() {
                            continue;
                        }

                        let ix_type = instruction.data[0];

                        // For Auction House, we'd need to know their specific instruction format
                        // This is a simplified placeholder implementation
                        match ix_type {
                            // Create bid (example instruction code, not accurate)
                            4 => {
                                // Extract bidder information
                                let bidder_index = if instruction.accounts.len() > 0 {
                                    instruction.accounts[0] as usize
                                } else {
                                    continue;
                                };

                                // Extract token information
                                let token_index = if instruction.accounts.len() > 1 {
                                    instruction.accounts[1] as usize
                                } else {
                                    continue;
                                };

                                if bidder_index >= trx.transaction.message.account_keys.len() ||
                                   token_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let bidder = hex::encode(&trx.transaction.message.account_keys[bidder_index]);
                                let token_address = hex::encode(&trx.transaction.message.account_keys[token_index]);

                                // Create a bid event with placeholder/mock data
                                let bid = BidEvent {
                                    transaction_hash: transaction_hash.clone(),
                                    block_hash: block_hash.clone(),
                                    block_number,
                                    block_timestamp: block_timestamp.clone(),
                                    marketplace: "auction_house".to_string(),
                                    bidder,
                                    token_address,
                                    bid_amount: 0, // Would be extracted from instruction data
                                    price_token: "SOL".to_string(),
                                    listing_id: format!("ah_bid_{}", transaction_hash),
                                    collection: None, // Would be derived from token metadata
                                    auction_house: Some(program_id_str.clone()),
                                    expiry_time: 0, // Would be extracted from instruction data if available
                                    extra_data: HashMap::new(),
                                };

                                events.bid_events.push(bid);
                            },
                            // Cancel listing or bid (example instruction code, not accurate)
                            5 => {
                                // Extract initiator information
                                let initiator_index = if instruction.accounts.len() > 0 {
                                    instruction.accounts[0] as usize
                                } else {
                                    continue;
                                };

                                // Extract token information
                                let token_index = if instruction.accounts.len() > 1 {
                                    instruction.accounts[1] as usize
                                } else {
                                    continue;
                                };

                                if initiator_index >= trx.transaction.message.account_keys.len() ||
                                   token_index >= trx.transaction.message.account_keys.len() {
                                    continue;
                                }

                                let initiator = hex::encode(&trx.transaction.message.account_keys[initiator_index]);
                                let token_address = hex::encode(&trx.transaction.message.account_keys[token_index]);

                                // Determine if this is canceling a listing or a bid
                                // In a real implementation, this would be extracted from the instruction
                                let action = "cancel_listing"; // Or "cancel_bid"

                                // Create a cancel event with placeholder/mock data
                                let cancel = CancelEvent {
                                    transaction_hash: transaction_hash.clone(),
                                    block_hash: block_hash.clone(),
                                    block_number,
                                    block_timestamp: block_timestamp.clone(),
                                    marketplace: "auction_house".to_string(),
                                    initiator,
                                    token_address,
                                    action: action.to_string(),
                                    listing_id: format!("ah_cancel_{}", transaction_hash),
                                    collection: None, // Would be derived from token metadata
                                    auction_house: Some(program_id_str.clone()),
                                    extra_data: HashMap::new(),
                                };

                                events.cancel_events.push(cancel);
                            },
                            _ => {} // Other Auction House instruction types
                        }
                    },
                    _ => {} // Other programs
                }
            }
        }
    }

    Ok(events)
}

pub fn store_marketplace_activities(events: MarketplaceEvents, store: StoreNew) {
    // Store listing events
    for event in events.listing_events {
        let id = format!("listing:{}:{}", event.marketplace, event.listing_id);

        let activity = MarketplaceActivity {
            id: id.clone(),
            activity_type: "listing".to_string(),
            transaction_hash: event.transaction_hash,
            block_number: event.block_number,
            block_timestamp: event.block_timestamp,
            marketplace: event.marketplace,
            token_address: event.token_address,
            seller: Some(event.seller),
            buyer: None,
            bidder: None,
            initiator: None,
            price: Some(event.price),
            price_token: Some(event.price_token),
            listing_id: event.listing_id,
            collection: event.collection,
            auction_house: event.auction_house,
            marketplace_fee: None,
            royalty_fee: None,
            bid_amount: None,
            expiry_time: Some(event.end_time),
            action: None,
            extra_data: event.extra_data,
        };

        store.set(id, &activity);
    }

    // Store sale events
    for event in events.sale_events {
        let id = format!("sale:{}:{}", event.marketplace, event.listing_id);

        let activity = MarketplaceActivity {
            id: id.clone(),
            activity_type: "sale".to_string(),
            transaction_hash: event.transaction_hash,
            block_number: event.block_number,
            block_timestamp: event.block_timestamp,
            marketplace: event.marketplace,
            token_address: event.token_address,
            seller: Some(event.seller),
            buyer: Some(event.buyer),
            bidder: None,
            initiator: None,
            price: Some(event.price),
            price_token: Some(event.price_token),
            listing_id: event.listing_id,
            collection: event.collection,
            auction_house: event.auction_house,
            marketplace_fee: Some(event.marketplace_fee),
            royalty_fee: Some(event.royalty_fee),
            bid_amount: None,
            expiry_time: None,
            action: None,
            extra_data: event.extra_data,
        };

        store.set(id, &activity);
    }

    // Store bid events
    for event in events.bid_events {
        let id = format!("bid:{}:{}", event.marketplace, event.listing_id);

        let activity = MarketplaceActivity {
            id: id.clone(),
            activity_type: "bid".to_string(),
            transaction_hash: event.transaction_hash,
            block_number: event.block_number,
            block_timestamp: event.block_timestamp,
            marketplace: event.marketplace,
            token_address: event.token_address,
            seller: None,
            buyer: None,
            bidder: Some(event.bidder),
            initiator: None,
            price: None,
            price_token: Some(event.price_token),
            listing_id: event.listing_id,
            collection: event.collection,
            auction_house: event.auction_house,
            marketplace_fee: None,
            royalty_fee: None,
            bid_amount: Some(event.bid_amount),
            expiry_time: Some(event.expiry_time),
            action: None,
            extra_data: event.extra_data,
        };

        store.set(id, &activity);
    }

    // Store cancel events
    for event in events.cancel_events {
        let id = format!("cancel:{}:{}", event.marketplace, event.listing_id);

        let activity = MarketplaceActivity {
            id: id.clone(),
            activity_type: "cancel".to_string(),
            transaction_hash: event.transaction_hash,
            block_number: event.block_number,
            block_timestamp: event.block_timestamp,
            marketplace: event.marketplace,
            token_address: event.token_address,
            seller: None,
            buyer: None,
            bidder: None,
            initiator: Some(event.initiator),
            price: None,
            price_token: None,
            listing_id: event.listing_id,
            collection: event.collection,
            auction_house: event.auction_house,
            marketplace_fee: None,
            royalty_fee: None,
            bid_amount: None,
            expiry_time: None,
            action: Some(event.action),
            extra_data: event.extra_data,
        };

        store.set(id, &activity);
    }
}

pub fn graph_out(store: &StoreGet, tables: &mut Tables) -> Result<(), substreams::errors::Error> {
    let marketplace_activities_prefix = "";

    store.scan_all(marketplace_activities_prefix, |key, activity: &MarketplaceActivity| {
        let entity_type = "MarketplaceActivity";

        tables
            .create_row(entity_type, &activity.id)
            .set("activityType", &activity.activity_type)
            .set("transactionHash", &activity.transaction_hash)
            .set("blockNumber", activity.block_number)
            .set("blockTimestamp", &activity.block_timestamp)
            .set("marketplace", &activity.marketplace)
            .set("tokenAddress", &activity.token_address)
            .set("listingId", &activity.listing_id);

        if let Some(seller) = &activity.seller {
            tables.update_row(entity_type, &activity.id).set("seller", seller);
        }

        if let Some(buyer) = &activity.buyer {
            tables.update_row(entity_type, &activity.id).set("buyer", buyer);
        }

        if let Some(bidder) = &activity.bidder {
            tables.update_row(entity_type, &activity.id).set("bidder", bidder);
        }

        if let Some(initiator) = &activity.initiator {
            tables.update_row(entity_type, &activity.id).set("initiator", initiator);
        }

        if let Some(price) = activity.price {
            tables.update_row(entity_type, &activity.id).set("price", price);
        }

        if let Some(price_token) = &activity.price_token {
            tables.update_row(entity_type, &activity.id).set("priceToken", price_token);
        }

        if let Some(collection) = &activity.collection {
            tables.update_row(entity_type, &activity.id).set("collection", collection);
        }

        if let Some(auction_house) = &activity.auction_house {
            tables.update_row(entity_type, &activity.id).set("auctionHouse", auction_house);
        }

        if let Some(marketplace_fee) = activity.marketplace_fee {
            tables.update_row(entity_type, &activity.id).set("marketplaceFee", marketplace_fee);
        }

        if let Some(royalty_fee) = activity.royalty_fee {
            tables.update_row(entity_type, &activity.id).set("royaltyFee", royalty_fee);
        }

        if let Some(bid_amount) = activity.bid_amount {
            tables.update_row(entity_type, &activity.id).set("bidAmount", bid_amount);
        }

        if let Some(expiry_time) = activity.expiry_time {
            tables.update_row(entity_type, &activity.id).set("expiryTime", expiry_time);
        }

        if let Some(action) = &activity.action {
            tables.update_row(entity_type, &activity.id).set("action", action);
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
