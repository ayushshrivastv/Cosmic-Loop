#[derive(Clone, PartialEq, ::prost::Message)]
pub struct BridgeEvents {
    #[prost(message, repeated, tag = "1")]
    pub bridge_out_events: ::prost::alloc::vec::Vec<BridgeOutEvent>,
    #[prost(message, repeated, tag = "2")]
    pub bridge_in_events: ::prost::alloc::vec::Vec<BridgeInEvent>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct BridgeOutEvent {
    #[prost(string, tag = "1")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub sender: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub recipient: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "5")]
    pub block_number: u64,
    #[prost(uint64, tag = "6")]
    pub timestamp: u64,
    #[prost(string, tag = "7")]
    pub bridge_provider: ::prost::alloc::string::String,
    #[prost(uint32, tag = "8")]
    pub destination_chain_id: u32,
    #[prost(string, optional, tag = "9")]
    pub destination_address: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, tag = "10")]
    pub amount: u64,
    #[prost(string, optional, tag = "11")]
    pub fee_token: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "12")]
    pub fees_paid: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "13")]
    pub nonce: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "14")]
    pub extra_data: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct BridgeInEvent {
    #[prost(string, tag = "1")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub recipient: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "4")]
    pub block_number: u64,
    #[prost(uint64, tag = "5")]
    pub timestamp: u64,
    #[prost(string, tag = "6")]
    pub bridge_provider: ::prost::alloc::string::String,
    #[prost(uint32, tag = "7")]
    pub source_chain_id: u32,
    #[prost(string, optional, tag = "8")]
    pub source_address: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, tag = "9")]
    pub amount: u64,
    #[prost(string, optional, tag = "10")]
    pub source_transaction_hash: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "11")]
    pub nonce: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "12")]
    pub extra_data: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct BridgeActivity {
    #[prost(string, tag = "1")]
    pub id: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub activity_type: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(uint64, tag = "4")]
    pub amount: u64,
    #[prost(string, optional, tag = "5")]
    pub sender: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, tag = "6")]
    pub recipient: ::prost::alloc::string::String,
    #[prost(string, tag = "7")]
    pub bridge_provider: ::prost::alloc::string::String,
    #[prost(string, tag = "8")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "9")]
    pub block_number: u64,
    #[prost(uint64, tag = "10")]
    pub timestamp: u64,
    #[prost(uint32, optional, tag = "11")]
    pub source_chain_id: ::core::option::Option<u32>,
    #[prost(uint32, optional, tag = "12")]
    pub destination_chain_id: ::core::option::Option<u32>,
    #[prost(string, optional, tag = "13")]
    pub source_address: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "14")]
    pub destination_address: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, tag = "15")]
    pub status: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "16")]
    pub fee_token: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "17")]
    pub fees_paid: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "18")]
    pub nonce: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "19")]
    pub source_transaction_hash: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "20")]
    pub extra_data_json: ::core::option::Option<::prost::alloc::string::String>,
}
