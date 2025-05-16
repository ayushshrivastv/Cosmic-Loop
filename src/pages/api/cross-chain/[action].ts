import { NextApiRequest, NextApiResponse } from 'next';
import { Connection } from '@solana/web3.js';
import { CrossChainService } from '../../../services/cross-chain-service';
import { SupportedChain } from '../../../lib/utils/layer-zero';

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');
const crossChainService = new CrossChainService(connection);

/**
 * API handler for cross-chain operations
 * @param req API request
 * @param res API response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { action } = req.query;

  try {
    switch (action) {
      case 'query-nft':
        // Handle NFT data query
        const { nftAddress, targetChain, walletAddress } = req.body;

        // Validate inputs
        if (!nftAddress || !targetChain || !walletAddress) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters: nftAddress, targetChain, walletAddress'
          });
        }

        // Validate target chain
        if (!Object.values(SupportedChain).includes(targetChain)) {
          return res.status(400).json({
            success: false,
            error: `Invalid target chain: ${targetChain}. Supported chains: ${Object.values(SupportedChain).join(', ')}`
          });
        }

        // Mock wallet for demo purposes
        // In production, this would use the actual wallet from authentication
        const mockWallet = {
          publicKey: { toBuffer: () => Buffer.from(walletAddress) },
          sendTransaction: async () => 'mock-signature'
        };

        const nftResult = await crossChainService.queryNFTData(
          nftAddress,
          targetChain as SupportedChain,
          mockWallet
        );

        return res.status(200).json({ success: true, data: { messageId: nftResult } });

      case 'query-wallet':
        // Handle wallet history query
        const { walletAddress: address, chain, userWallet } = req.body;

        // Validate inputs
        if (!address || !chain || !userWallet) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters: walletAddress, chain, userWallet'
          });
        }

        // Validate chain
        if (!Object.values(SupportedChain).includes(chain)) {
          return res.status(400).json({
            success: false,
            error: `Invalid chain: ${chain}. Supported chains: ${Object.values(SupportedChain).join(', ')}`
          });
        }

        // Mock wallet for demo purposes
        const mockWalletForHistory = {
          publicKey: { toBuffer: () => Buffer.from(userWallet) },
          sendTransaction: async () => 'mock-signature'
        };

        const walletResult = await crossChainService.queryWalletHistory(
          address,
          chain as SupportedChain,
          mockWalletForHistory
        );

        return res.status(200).json({ success: true, data: { messageId: walletResult } });

      case 'query-market':
        // Handle market activity query
        const { marketAddress, targetChain: market_chain, walletAddress: market_wallet } = req.body;

        // Validate inputs
        if (!marketAddress || !market_chain || !market_wallet) {
          return res.status(400).json({
            success: false,
            error: 'Missing required parameters: marketAddress, targetChain, walletAddress'
          });
        }

        // Validate target chain
        if (!Object.values(SupportedChain).includes(market_chain)) {
          return res.status(400).json({
            success: false,
            error: `Invalid target chain: ${market_chain}. Supported chains: ${Object.values(SupportedChain).join(', ')}`
          });
        }

        // Mock wallet for demo purposes
        const mockWalletForMarket = {
          publicKey: { toBuffer: () => Buffer.from(market_wallet) },
          sendTransaction: async () => 'mock-signature'
        };

        const marketResult = await crossChainService.queryMarketActivity(
          marketAddress,
          market_chain as SupportedChain,
          mockWalletForMarket
        );

        return res.status(200).json({ success: true, data: { messageId: marketResult } });

      case 'message-status':
        // Handle message status query
        const { messageId } = req.body;

        // Validate message ID
        if (!messageId) {
          return res.status(400).json({ success: false, error: 'Missing required parameter: messageId' });
        }

        const status = await crossChainService.getMessageStatus(messageId);

        if (!status) {
          return res.status(404).json({ success: false, error: 'Message not found' });
        }

        return res.status(200).json({ success: true, data: status });

      default:
        return res.status(400).json({ success: false, error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
