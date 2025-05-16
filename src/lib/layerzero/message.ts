/**
 * @file message.ts
 * @description Message serialization/deserialization for LayerZero V2 cross-chain operations
 * This file provides utilities for creating, serializing, and deserializing cross-chain messages
 */

import { MessageType } from './v2-config';

/**
 * CrossChainMessage class for LayerZero V2 message handling
 * Represents a message that can be sent across chains using LayerZero V2
 */
export class CrossChainMessage {
  sourceChainId: number;
  destinationChainId: number;
  messageType: number;
  payload: Uint8Array;
  nonce: bigint;

  /**
   * Create a new CrossChainMessage instance
   * @param params Parameters for the cross-chain message
   */
  constructor(params: {
    sourceChainId: number;
    destinationChainId: number;
    messageType: number;
    payload: Uint8Array;
    nonce: bigint;
  }) {
    this.sourceChainId = params.sourceChainId;
    this.destinationChainId = params.destinationChainId;
    this.messageType = params.messageType;
    this.payload = params.payload;
    this.nonce = params.nonce;
  }

  /**
   * Serialize the message to a Uint8Array for transmission
   * @returns Serialized message as Uint8Array
   */
  serialize(): Uint8Array {
    // Calculate the total length of the serialized message
    const totalLength =
      4 + // sourceChainId (u32)
      4 + // destinationChainId (u32)
      1 + // messageType (u8)
      4 + // payload length (u32)
      this.payload.length +
      8; // nonce (u64)

    const buffer = new Uint8Array(totalLength);
    let offset = 0;

    // Write sourceChainId (u32)
    new DataView(buffer.buffer).setUint32(offset, this.sourceChainId, true);
    offset += 4;

    // Write destinationChainId (u32)
    new DataView(buffer.buffer).setUint32(offset, this.destinationChainId, true);
    offset += 4;

    // Write messageType (u8)
    buffer[offset] = this.messageType;
    offset += 1;

    // Write payload length (u32)
    new DataView(buffer.buffer).setUint32(offset, this.payload.length, true);
    offset += 4;

    // Write payload
    buffer.set(this.payload, offset);
    offset += this.payload.length;

    // Write nonce (u64)
    // Split BigInt into two 32-bit parts for compatibility
    const nonceLow = Number(this.nonce & BigInt(0xFFFFFFFF));
    const nonceHigh = Number(this.nonce >> BigInt(32));

    new DataView(buffer.buffer).setUint32(offset, nonceLow, true);
    offset += 4;
    new DataView(buffer.buffer).setUint32(offset, nonceHigh, true);

    return buffer;
  }

  /**
   * Deserialize a Uint8Array into a CrossChainMessage
   * @param data Serialized message data
   * @returns Deserialized CrossChainMessage instance
   */
  static deserialize(data: Uint8Array): CrossChainMessage {
    const dataView = new DataView(data.buffer);
    let offset = 0;

    // Read sourceChainId (u32)
    const sourceChainId = dataView.getUint32(offset, true);
    offset += 4;

    // Read destinationChainId (u32)
    const destinationChainId = dataView.getUint32(offset, true);
    offset += 4;

    // Read messageType (u8)
    const messageType = data[offset];
    offset += 1;

    // Read payload length (u32)
    const payloadLength = dataView.getUint32(offset, true);
    offset += 4;

    // Read payload
    const payload = data.slice(offset, offset + payloadLength);
    offset += payloadLength;

    // Read nonce (u64)
    const nonceLow = dataView.getUint32(offset, true);
    offset += 4;
    const nonceHigh = dataView.getUint32(offset, true);

    // Combine the two 32-bit parts into a single BigInt
    const nonce = (BigInt(nonceHigh) << BigInt(32)) | BigInt(nonceLow);

    return new CrossChainMessage({
      sourceChainId,
      destinationChainId,
      messageType,
      payload,
      nonce,
    });
  }

  /**
   * Create a message for querying NFT data across chains
   * @param sourceChainId Source chain ID
   * @param destinationChainId Destination chain ID
   * @param nftAddress NFT contract address
   * @returns CrossChainMessage instance for NFT data query
   */
  static createNFTDataQuery(
    sourceChainId: number,
    destinationChainId: number,
    nftAddress: string
  ): CrossChainMessage {
    const payload = new TextEncoder().encode(nftAddress);
    const nonce = BigInt(Date.now());

    return new CrossChainMessage({
      sourceChainId,
      destinationChainId,
      messageType: MessageType.NFT_DATA,
      payload,
      nonce,
    });
  }

  /**
   * Create a message for querying wallet history across chains
   * @param sourceChainId Source chain ID
   * @param destinationChainId Destination chain ID
   * @param walletAddress Wallet address to query
   * @returns CrossChainMessage instance for wallet history query
   */
  static createWalletHistoryQuery(
    sourceChainId: number,
    destinationChainId: number,
    walletAddress: string
  ): CrossChainMessage {
    const payload = new TextEncoder().encode(walletAddress);
    const nonce = BigInt(Date.now());

    return new CrossChainMessage({
      sourceChainId,
      destinationChainId,
      messageType: MessageType.WALLET_HISTORY,
      payload,
      nonce,
    });
  }

  /**
   * Create a message for querying market activity across chains
   * @param sourceChainId Source chain ID
   * @param destinationChainId Destination chain ID
   * @param marketAddress Market contract address
   * @returns CrossChainMessage instance for market activity query
   */
  static createMarketActivityQuery(
    sourceChainId: number,
    destinationChainId: number,
    marketAddress: string
  ): CrossChainMessage {
    const payload = new TextEncoder().encode(marketAddress);
    const nonce = BigInt(Date.now());

    return new CrossChainMessage({
      sourceChainId,
      destinationChainId,
      messageType: MessageType.MARKET_ACTIVITY,
      payload,
      nonce,
    });
  }

  /**
   * Parse the payload of an NFT data message
   * @returns Parsed NFT address
   */
  parseNFTDataPayload(): string {
    if (this.messageType !== MessageType.NFT_DATA) {
      throw new Error('Not an NFT data message');
    }

    return new TextDecoder().decode(this.payload);
  }

  /**
   * Parse the payload of a wallet history message
   * @returns Parsed wallet address
   */
  parseWalletHistoryPayload(): string {
    if (this.messageType !== MessageType.WALLET_HISTORY) {
      throw new Error('Not a wallet history message');
    }

    return new TextDecoder().decode(this.payload);
  }
}

/**
 * Message response interface for cross-chain query responses
 */
export interface MessageResponse {
  messageId: string;
  sourceChainId: number;
  destinationChainId: number;
  messageType: MessageType;
  status: string;
  data?: any;
  error?: string;
  timestamp: number;
}

/**
 * Generate a unique message ID based on nonce and chain IDs
 * @param nonce Message nonce
 * @param sourceChainId Source chain ID
 * @param destinationChainId Destination chain ID
 * @returns Unique message ID string
 */
export function generateMessageId(
  nonce: bigint,
  sourceChainId: number,
  destinationChainId: number
): string {
  const nonceStr = nonce.toString(16).padStart(16, '0');
  const sourceStr = sourceChainId.toString(16).padStart(4, '0');
  const destStr = destinationChainId.toString(16).padStart(4, '0');

  return `${nonceStr}-${sourceStr}-${destStr}`;
}
