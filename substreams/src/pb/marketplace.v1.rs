#[derive(Clone, PartialEq, ::prost::Message)]
pub struct MarketplaceEvents {
    #[prost(message, repeated, tag = "1")]
    pub listing_events: ::prost::alloc::vec::Vec<ListingEvent>,
    #[prost(message, repeated, tag = "2")]
    pub sale_events: ::prost::alloc::vec::Vec<SaleEvent>,
    #[prost(message, repeated, tag = "3")]
    pub bid_events: ::prost::alloc::vec::Vec<BidEvent>,
    #[prost(message, repeated, tag = "4")]
    pub cancel_events: ::prost::alloc::vec::Vec<CancelEvent>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct ListingEvent {
    #[prost(string, tag = "1")]
    pub marketplace: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub seller: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "5")]
    pub block_number: u64,
    #[prost(uint64, tag = "6")]
    pub timestamp: u64,
    #[prost(uint64, tag = "7")]
    pub price: u64,
    #[prost(string, tag = "8")]
    pub price_token: ::prost::alloc::string::String,
    #[prost(string, tag = "9")]
    pub listing_id: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "10")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "11")]
    pub auction_house: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "12")]
    pub marketplace_fee: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "13")]
    pub royalty_fee: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "14")]
    pub expiry_time: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "15")]
    pub extra_data: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct SaleEvent {
    #[prost(string, tag = "1")]
    pub marketplace: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub seller: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub buyer: ::prost::alloc::string::String,
    #[prost(string, tag = "5")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "6")]
    pub block_number: u64,
    #[prost(uint64, tag = "7")]
    pub timestamp: u64,
    #[prost(uint64, tag = "8")]
    pub price: u64,
    #[prost(string, tag = "9")]
    pub price_token: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "10")]
    pub listing_id: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "11")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "12")]
    pub auction_house: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "13")]
    pub marketplace_fee: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "14")]
    pub royalty_fee: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "15")]
    pub extra_data: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct BidEvent {
    #[prost(string, tag = "1")]
    pub marketplace: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub bidder: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "5")]
    pub block_number: u64,
    #[prost(uint64, tag = "6")]
    pub timestamp: u64,
    #[prost(uint64, tag = "7")]
    pub bid_amount: u64,
    #[prost(string, tag = "8")]
    pub price_token: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "9")]
    pub listing_id: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "10")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "11")]
    pub auction_house: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "12")]
    pub expiry_time: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "13")]
    pub extra_data: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct CancelEvent {
    #[prost(string, tag = "1")]
    pub marketplace: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub initiator: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "5")]
    pub block_number: u64,
    #[prost(uint64, tag = "6")]
    pub timestamp: u64,
    #[prost(string, tag = "7")]
    pub action: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "8")]
    pub listing_id: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "9")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "10")]
    pub auction_house: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "11")]
    pub extra_data: ::core::option::Option<::prost::alloc::string::String>,
}

#[derive(Clone, PartialEq, ::prost::Message)]
pub struct MarketplaceActivity {
    #[prost(string, tag = "1")]
    pub id: ::prost::alloc::string::String,
    #[prost(string, tag = "2")]
    pub marketplace: ::prost::alloc::string::String,
    #[prost(string, tag = "3")]
    pub activity_type: ::prost::alloc::string::String,
    #[prost(string, tag = "4")]
    pub token_address: ::prost::alloc::string::String,
    #[prost(string, optional, tag = "5")]
    pub seller: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "6")]
    pub buyer: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "7")]
    pub bidder: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "8")]
    pub initiator: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "9")]
    pub price: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "10")]
    pub price_token: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "11")]
    pub listing_id: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, tag = "12")]
    pub transaction_hash: ::prost::alloc::string::String,
    #[prost(uint64, tag = "13")]
    pub block_number: u64,
    #[prost(uint64, tag = "14")]
    pub timestamp: u64,
    #[prost(string, optional, tag = "15")]
    pub collection: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "16")]
    pub auction_house: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(uint64, optional, tag = "17")]
    pub marketplace_fee: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "18")]
    pub royalty_fee: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "19")]
    pub bid_amount: ::core::option::Option<u64>,
    #[prost(uint64, optional, tag = "20")]
    pub expiry_time: ::core::option::Option<u64>,
    #[prost(string, optional, tag = "21")]
    pub action: ::core::option::Option<::prost::alloc::string::String>,
    #[prost(string, optional, tag = "22")]
    pub extra_data_json: ::core::option::Option<::prost::alloc::string::String>,
}
