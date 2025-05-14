// Re-exports from Substreams
pub use substreams_entity_change::pb::entity;

// Generated protobuf modules from proto directory
pub mod nft {
    pub mod v1 {
        include!("nft.v1.rs");
    }
}

pub mod bridge {
    pub mod v1 {
        include!("bridge.v1.rs");
    }
}

pub mod marketplace {
    pub mod v1 {
        include!("marketplace.v1.rs");
    }
}
