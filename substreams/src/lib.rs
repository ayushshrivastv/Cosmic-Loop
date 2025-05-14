mod pb;
mod utils;
mod nft;
mod bridge;
mod marketplace;

use substreams_solana::pb::sf::solana::r#type::v1::Block;
use substreams_entity_change::pb::entity::EntityChanges;
use substreams_entity_change::tables::Tables;
use substreams::store::{StoreGet, StoreNew, StoreSet};

// Import generated protobuf types
use crate::pb::nft::v1::NFTEvents;
use crate::pb::bridge::v1::BridgeEvents;
use crate::pb::marketplace::v1::MarketplaceEvents;

#[substreams::handlers::map]
fn map_nft_events(block: Block) -> Result<NFTEvents, substreams::errors::Error> {
    nft::extract_nft_events(&block)
}

#[substreams::handlers::map]
fn map_bridge_events(block: Block) -> Result<BridgeEvents, substreams::errors::Error> {
    bridge::extract_bridge_events(&block)
}

#[substreams::handlers::map]
fn map_marketplace_events(block: Block) -> Result<MarketplaceEvents, substreams::errors::Error> {
    marketplace::extract_marketplace_events(&block)
}

#[substreams::handlers::store]
fn store_nft_activities(events: NFTEvents, store: StoreNew) {
    nft::store_nft_activities(events, store);
}

#[substreams::handlers::store]
fn store_bridge_activities(events: BridgeEvents, store: StoreNew) {
    bridge::store_bridge_activities(events, store);
}

#[substreams::handlers::store]
fn store_marketplace_activities(events: MarketplaceEvents, store: StoreNew) {
    marketplace::store_marketplace_activities(events, store);
}

#[substreams::handlers::map]
fn graph_out(
    nft_store: StoreGet,
    bridge_store: StoreGet,
    marketplace_store: StoreGet,
) -> Result<EntityChanges, substreams::errors::Error> {
    let mut tables = Tables::new();

    // Process NFT activities for The Graph
    nft::graph_out(&nft_store, &mut tables)?;

    // Process bridge activities for The Graph
    bridge::graph_out(&bridge_store, &mut tables)?;

    // Process marketplace activities for The Graph
    marketplace::graph_out(&marketplace_store, &mut tables)?;

    Ok(tables.to_entity_changes())
}
