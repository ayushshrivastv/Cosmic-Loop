#[derive(Clone, PartialEq, ::prost::Message)]
pub struct NFTEvents {
    #[prost(message, repeated, tag = "1")]
    pub mint_events: ::prost::alloc::vec::Vec<NFTMintEvent>,
    #[prost(message, repeated, tag = "2")]
    pub transfer_events: ::prost::alloc::vec::Vec<NFTTransferEvent>,
    #[prost(message, repeated, tag = "3")]
    pub burn_events: ::prost::alloc::vec::Vec<NFTBurnEvent>,
    #[prost(message, repeated, tag = "4")]
    pub compressed_events: ::prost::alloc::vec::Vec<CompressedTokenEvent>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct NFTMintEvent {
    #[prost(string, tag = "1")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub to_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "4")]
    pub block_number: u64,
    #[prost(uint64, tag = "5")]
    pub timestamp: u64,
    #[prost(string, optional, tag = "6")]
    pub token_name: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "7")]
    pub token_symbol: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "8")]
    pub token_uri: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "9")]
    pub attributes_json: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "10")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct NFTTransferEvent {
    #[prost(string, tag = "1")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub from_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub to_address: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "5")]
    pub block_number: u64,
    #[prost(uint64, tag = "6")]
    pub timestamp: u64,
    #[prost(string, optional, tag = "7")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct NFTBurnEvent {
    #[prost(string, tag = "1")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub from_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "4")]
    pub block_number: u64,
    #[prost(uint64, tag = "5")]
    pub timestamp: u64,
    #[prost(string, optional, tag = "6")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct CompressedTokenEvent {
    #[prost(string, tag = "1")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub owner_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "4")]
    pub block_number: u64,
    #[prost(uint64, tag = "5")]
    pub timestamp: u64,
    #[prost(string, tag = "6")]
    pub event_type: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "7")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "8")]
    pub metadata_uri: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct NFTActivity {
    #[prost(string, tag = "1")]
    pub id: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub activity_type: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "4")]
    pub from_address: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "5")]
    pub to_address: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, tag = "6")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "7")]
    pub block_number: u64,
    #[prost(uint64, tag = "8")]
    pub timestamp: u64,
    #[prost(bool, tag = "9")]
    pub is_compressed: bool,
    #[prost(string, optional, tag = "10")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "11")]
    pub token_name: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "12")]
    pub token_symbol: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "13")]
    pub token_uri: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "14")]
    pub attributes_json: ::core::option::Option<::prost::alloc::string::String>,
}
