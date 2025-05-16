/**
 * @file query-form.tsx
 * @description Form for cross-chain data queries using LayerZero V2
 */

import { useState } from 'react';
import { useLayerZero } from '../../hooks/use-layerzero-v2';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { SupportedChain } from '../../lib/utils/layer-zero';
import { Coins, Image, BarChart, Wallet } from 'lucide-react';
import { MessageType } from '../../lib/layerzero/v2-config';
import { CHAIN_CONFIG } from '../../lib/utils/layer-zero';

// Styling variables
const tabButtonClasses = {
  active: 'bg-zinc-800 border-blue-500 text-white border',
  inactive: 'bg-black/30 text-gray-300 hover:bg-black/50 border border-border',
};

interface CrossChainQueryFormProps {
  onQuerySubmit?: (messageId: string) => void;
}

/**
 * Cross-chain query form component
 */
export function CrossChainQueryForm({ onQuerySubmit }: CrossChainQueryFormProps) {
  const [queryType, setQueryType] = useState<MessageType>(MessageType.NFT_DATA);
  const [address, setAddress] = useState('');
  const [targetChain, setTargetChain] = useState<SupportedChain>(SupportedChain.Ethereum);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    queryNFTData,
    queryWalletHistory,
    queryMarketActivity,
    isLoading
  } = useLayerZero();

  // Get supported chains excluding Solana (which is the source chain)
  const supportedChains = Object.values(SupportedChain)
    .filter(chain => chain !== SupportedChain.Solana)
    .map(chain => ({
      chainId: chain,
      ...CHAIN_CONFIG[chain]
    }));

  /**
   * Handle form submission
   * @param e Form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || isLoading || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Generate a unique message ID
    const messageId = `query-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Track this message with the WebSocket service
      const { WebSocketService } = await import('@/services/websocket-service');
      WebSocketService.trackMessage(messageId);
      
      // Process the query based on type
      let result;
      switch (queryType) {
        case MessageType.NFT_DATA:
          result = await queryNFTData(address, targetChain);
          break;
        case MessageType.WALLET_HISTORY:
          result = await queryWalletHistory(address, targetChain);
          break;
        case MessageType.MARKET_ACTIVITY:
          result = await queryMarketActivity(address, targetChain);
          break;
      }
      
      // Show success message
      setIsSuccess(true);
      
      // Notify parent component if callback provided
      if (onQuerySubmit) {
        onQuerySubmit(messageId);
      }
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get label text based on query type
   */
  const getAddressLabel = () => {
    switch (queryType) {
      case MessageType.NFT_DATA:
        return 'NFT Address';
      case MessageType.WALLET_HISTORY:
        return 'Wallet Address';
      case MessageType.MARKET_ACTIVITY:
        return 'Market Address';
      default:
        return 'Address';
    }
  };

  /**
   * Get placeholder text based on query type
   */
  const getPlaceholder = () => {
    switch (queryType) {
      case MessageType.NFT_DATA:
        return 'Enter NFT contract address...';
      case MessageType.WALLET_HISTORY:
        return 'Enter wallet address...';
      case MessageType.MARKET_ACTIVITY:
        return 'Enter market contract address...';
      default:
        return 'Enter address...';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-border rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-white mb-4">Cross-Chain Data Query</h2>

      <div className="mb-6">
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 rounded flex items-center space-x-2 ${
              queryType === MessageType.NFT_DATA ? tabButtonClasses.active : tabButtonClasses.inactive
            }`}
            onClick={() => setQueryType(MessageType.NFT_DATA)}
            type="button"
          >
            <Image className="h-4 w-4" />
            <span className="text-xs">NFT Data</span>
          </button>
          <button
            className={`px-4 py-2 rounded flex items-center space-x-2 ${
              queryType === MessageType.WALLET_HISTORY ? tabButtonClasses.active : tabButtonClasses.inactive
            }`}
            onClick={() => setQueryType(MessageType.WALLET_HISTORY)}
            type="button"
          >
            <Wallet className="h-4 w-4" />
            <span className="text-xs">Wallet History</span>
          </button>
          <button
            className={`px-4 py-2 rounded flex items-center space-x-2 ${
              queryType === MessageType.MARKET_ACTIVITY ? tabButtonClasses.active : tabButtonClasses.inactive
            }`}
            onClick={() => setQueryType(MessageType.MARKET_ACTIVITY)}
            type="button"
          >
            <BarChart className="h-4 w-4" />
            <span className="text-xs">Market Activity</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              {getAddressLabel()}
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full bg-black/50 text-white border-border"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Target Chain</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {supportedChains.map((chain) => (
                <button
                  key={chain.chainId}
                  type="button"
                  onClick={() => setTargetChain(chain.chainId)}
                  className={`py-2 px-3 rounded border flex items-center space-x-2 ${
                    targetChain === chain.chainId
                      ? 'bg-zinc-800 border-blue-500 text-white'
                      : 'bg-black/30 border-border text-gray-300 hover:bg-black/50'
                  }`}
                >
                  <img
                    src={chain.logo}
                    alt={chain.name}
                    className="w-4 h-4 rounded-full"
                  />
                  <span className="text-xs">{chain.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting || !address}
              className={`w-full py-2 rounded text-xs font-medium ${isSuccess 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-white text-black hover:bg-slate-100'}`}
            >
              {isSubmitting ? 'Submitting Query...' : isSuccess ? 'Query Submitted!' : 'Submit Query'}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-4 p-4 bg-black/20 border border-border rounded text-gray-300 text-xs">
        <h3 className="font-medium mb-2 text-white text-sm">About Cross-Chain Queries</h3>
        <p>
          This feature allows you to query data across different blockchains using LayerZero V2's omnichain
          infrastructure. The query is initiated from Solana and retrieves data from the selected target chain.
        </p>
        <p className="mt-2">
          Results will appear below once processed. Processing time varies by chain and network conditions.
        </p>
      </div>
    </div>
  );
}
