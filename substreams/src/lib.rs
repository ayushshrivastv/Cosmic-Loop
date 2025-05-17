mod nft;
mod marketplace;
mod bridge;

use substreams::errors::Error;
use substreams_solana::pb::sf::solana::r#type::v1::Block;

#[substreams::handlers::map]
pub fn map_nft_events(block: Block) -> Result<nft::NFTEvents, Error> {
    nft::extract_nft_events(block)
}

#[substreams::handlers::map]
pub fn map_marketplace_events(block: Block) -> Result<marketplace::MarketplaceEvents, Error> {
    marketplace::extract_marketplace_events(block)
}

#[substreams::handlers::map]
pub fn map_bridge_events(block: Block) -> Result<bridge::BridgeEvents, Error> {
    bridge::extract_bridge_events(block)
}

#[substreams::handlers::store]
pub fn store_nft_events(events: nft::NFTEvents) -> Result<(), Error> {
    for event in events.events {
        substreams::store::set(format!("nft:{}", event.id), &event);
    }
    Ok(())
}

#[substreams::handlers::store]
pub fn store_marketplace_events(events: marketplace::MarketplaceEvents) -> Result<(), Error> {
    for event in events.events {
        substreams::store::set(format!("marketplace:{}", event.id), &event);
    }
    Ok(())
}

#[substreams::handlers::store]
pub fn store_bridge_events(events: bridge::BridgeEvents) -> Result<(), Error> {
    for event in events.events {
        substreams::store::set(format!("bridge:{}", event.id), &event);
    }
    Ok(())
}

#[substreams::handlers::map]
pub fn nft_events(deltas: substreams::store::Deltas) -> Result<nft::NFTEvents, Error> {
    let mut events = nft::NFTEvents { events: vec![] };
    for delta in deltas.deltas {
        if delta.operation == substreams::pb::substreams::store_delta::Operation::Create as i32 {
            if let Some(event) = substreams::store::decode::<nft::NFTEvent>(&delta.new_value) {
                events.events.push(event);
            }
        }
    }
    Ok(events)
}

#[substreams::handlers::map]
pub fn marketplace_events(deltas: substreams::store::Deltas) -> Result<marketplace::MarketplaceEvents, Error> {
    let mut events = marketplace::MarketplaceEvents { events: vec![] };
    for delta in deltas.deltas {
        if delta.operation == substreams::pb::substreams::store_delta::Operation::Create as i32 {
            if let Some(event) = substreams::store::decode::<marketplace::MarketplaceEvent>(&delta.new_value) {
                events.events.push(event);
            }
        }
    }
    Ok(events)
}

#[substreams::handlers::map]
pub fn bridge_events(deltas: substreams::store::Deltas) -> Result<bridge::BridgeEvents, Error> {
    let mut events = bridge::BridgeEvents { events: vec![] };
    for delta in deltas.deltas {
        if delta.operation == substreams::pb::substreams::store_delta::Operation::Create as i32 {
            if let Some(event) = substreams::store::decode::<bridge::BridgeEvent>(&delta.new_value) {
                events.events.push(event);
            }
        }
    }
    Ok(events)
}
