/**
 * @file use-layerzero-v2.ts
 * @description Custom hook for LayerZero V2 cross-chain operations
 * This hook provides methods for querying data across chains and checking message status
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { MessageType, MessageStatus } from '../lib/layerzero/v2-config';
import { MessageResponse } from '../lib/layerzero/message';
import { SupportedChain } from '../lib/utils/layer-zero';
import { useToast } from './use-toast';

/**
 * Interface for message tracking
 */
interface TrackedMessage {
  messageId: string;
  lastChecked: number;
  status: string;
  data?: any;
}

/**
 * Hook for LayerZero V2 operations
 * @returns Methods for interacting with LayerZero V2
 */
export function useLayerZero() {
  const wallet = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedMessages, setTrackedMessages] = useState<Record<string, TrackedMessage>>({});

  /**
   * Query NFT data across chains
   * @param nftAddress NFT address
   * @param targetChain Target chain
   * @returns Message ID for tracking
   */
  const queryNFTData = async (nftAddress: string, targetChain: SupportedChain): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/cross-chain/query-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftAddress,
          targetChain,
          walletAddress: wallet.publicKey.toString(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const messageId = result.data.messageId;

      // Track the message
      setTrackedMessages(prev => ({
        ...prev,
        [messageId]: {
          messageId,
          lastChecked: Date.now(),
          status: MessageStatus.PENDING,
        }
      }));

      // Show a toast notification
      toast({
        title: 'Query Submitted',
        description: `Your NFT data query has been submitted. Message ID: ${messageId.slice(0, 8)}...`,
      });

      return messageId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Show error toast
      toast({
        title: 'Query Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Query wallet history across chains
   * @param walletAddress Wallet address
   * @param targetChain Target chain
   * @returns Message ID for tracking
   */
  const queryWalletHistory = async (walletAddress: string, targetChain: SupportedChain): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/cross-chain/query-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          chain: targetChain,
          userWallet: wallet.publicKey.toString(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const messageId = result.data.messageId;

      // Track the message
      setTrackedMessages(prev => ({
        ...prev,
        [messageId]: {
          messageId,
          lastChecked: Date.now(),
          status: MessageStatus.PENDING,
        }
      }));

      // Show a toast notification
      toast({
        title: 'Query Submitted',
        description: `Your wallet history query has been submitted. Message ID: ${messageId.slice(0, 8)}...`,
      });

      return messageId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Show error toast
      toast({
        title: 'Query Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Query market activity across chains
   * @param marketAddress Market address
   * @param targetChain Target chain
   * @returns Message ID for tracking
   */
  const queryMarketActivity = async (marketAddress: string, targetChain: SupportedChain): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/cross-chain/query-market', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketAddress,
          targetChain,
          walletAddress: wallet.publicKey.toString(),
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const messageId = result.data.messageId;

      // Track the message
      setTrackedMessages(prev => ({
        ...prev,
        [messageId]: {
          messageId,
          lastChecked: Date.now(),
          status: MessageStatus.PENDING,
        }
      }));

      // Show a toast notification
      toast({
        title: 'Query Submitted',
        description: `Your market activity query has been submitted. Message ID: ${messageId.slice(0, 8)}...`,
      });

      return messageId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Show error toast
      toast({
        title: 'Query Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check message status
   * @param messageId Message ID
   * @returns Message status
   */
  const checkMessageStatus = async (messageId: string): Promise<MessageResponse | null> => {
    try {
      const response = await fetch('/api/cross-chain/message-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const messageStatus = result.data;

      // Update tracked message
      setTrackedMessages(prev => {
        if (prev[messageId]) {
          return {
            ...prev,
            [messageId]: {
              ...prev[messageId],
              lastChecked: Date.now(),
              status: messageStatus.status,
              data: messageStatus.data,
            }
          };
        }
        return prev;
      });

      // Show toast for state transitions
      if (
        trackedMessages[messageId] &&
        trackedMessages[messageId].status !== messageStatus.status &&
        messageStatus.status === MessageStatus.COMPLETED
      ) {
        toast({
          title: 'Query Completed',
          description: 'Your cross-chain query has been completed successfully.',
          variant: 'default',
        });
      } else if (
        trackedMessages[messageId] &&
        trackedMessages[messageId].status !== messageStatus.status &&
        messageStatus.status === MessageStatus.FAILED
      ) {
        toast({
          title: 'Query Failed',
          description: messageStatus.error || 'Your cross-chain query has failed.',
          variant: 'destructive',
        });
      }

      return messageStatus;
    } catch (err) {
      console.error('Error checking message status:', err);
      return null;
    }
  };

  /**
   * Get the type name of a message
   * @param type Message type
   * @returns Human-readable message type
   */
  const getMessageTypeName = (type: MessageType): string => {
    switch (type) {
      case MessageType.NFT_DATA:
        return 'NFT Data Query';
      case MessageType.TOKEN_TRANSFER:
        return 'Token Transfer';
      case MessageType.MARKET_ACTIVITY:
        return 'Market Activity Query';
      case MessageType.WALLET_HISTORY:
        return 'Wallet History Query';
      default:
        return 'Unknown Query';
    }
  };

  /**
   * Auto-refresh active messages
   */
  useEffect(() => {
    // Don't poll if there are no messages to track
    if (Object.keys(trackedMessages).length === 0) return;

    const pollInterval = setInterval(async () => {
      // Get current timestamp
      const now = Date.now();

      // Check each tracked message
      for (const messageId in trackedMessages) {
        const message = trackedMessages[messageId];

        // Skip if message was checked in the last 5 seconds
        if (now - message.lastChecked < 5000) continue;

        // Skip if message is already completed or failed
        if (
          message.status === MessageStatus.COMPLETED ||
          message.status === MessageStatus.FAILED
        ) continue;

        // Check message status
        await checkMessageStatus(messageId);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [trackedMessages]);

  return {
    queryNFTData,
    queryWalletHistory,
    queryMarketActivity,
    checkMessageStatus,
    getMessageTypeName,
    trackedMessages,
    isLoading,
    error,
  };
}
