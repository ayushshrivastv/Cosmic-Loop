"use client";

import { useEffect, useState, useRef, type FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { formatPublicKey } from '@/lib/utils/solana';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { toast } from 'sonner';
import { useWalletPreference } from '@/components/providers/wallet-adapter-provider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Dynamically import the WalletMultiButton to ensure it only loads client-side
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

// Modern wallet button style with improved visibility
const walletButtonStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  color: 'white',
  padding: '10px 18px',
  height: 'auto',
  lineHeight: '1.25rem',
  fontSize: '14px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '9999px',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const walletButtonHoverStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
};

// Styles for different connection states
const walletConnectingStyle = {
  ...walletButtonStyle,
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  cursor: 'progress',
};

const walletErrorStyle = {
  ...walletButtonStyle,
  backgroundColor: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid rgba(239, 68, 68, 0.3)',
};

// Connection state for managing UI feedback
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WalletConnectButtonProps {
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showAddress?: boolean;
  fullWidth?: boolean;
  showNetworkBadge?: boolean;
}

/**
 * Enhanced wallet connection button with improved UI feedback and error handling
 * Supports multiple wallet types and provides visual feedback for different connection states
 */
export const WalletConnectButton: FC<WalletConnectButtonProps> = ({
  buttonVariant = 'default',
  buttonSize = 'default',
  showAddress = true,
  fullWidth = false,
  showNetworkBadge = false
}) => {
  // Use client-side only rendering to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Access wallet state and functions from the wallet adapter
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    select,
    wallet,
    wallets,
    adapter,
    connecting: isConnecting
  } = useWallet();

  const { setVisible } = useWalletModal();
  const [isHovered, setIsHovered] = useState(false);
  const [preferredWallet, setPreferredWallet] = useWalletPreference();
  const walletCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // Ensure wallet adapter is fully initialized
  useEffect(() => {
    setIsMounted(true);

    // Staggered approach to wallet initialization
    walletCheckTimeout.current = setTimeout(() => {
      setIsWalletReady(true);
      console.debug('[WalletButton] Ready for interaction');
    }, 1000);

    return () => {
      if (walletCheckTimeout.current) {
        clearTimeout(walletCheckTimeout.current);
      }
    };
  }, []);

  // Update connection state based on wallet state
  useEffect(() => {
    if (connecting || isConnecting) {
      setConnectionState('connecting');
    } else if (connected && wallet) {
      setConnectionState('connected');
      setConnectionError(null);
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection

      // Save wallet preference when successfully connected
      if (wallet && wallet.adapter.name) {
        setPreferredWallet(wallet.adapter.name);
      }
    } else {
      if (connectionState === 'connecting') {
        // If we were previously connecting but now we're not connected,
        // it might indicate a connection failure
        if (!connectionError) {
          setConnectionState('error');
          setConnectionError('Connection failed. Please try again.');

          // Auto-hide error after 3 seconds
          setTimeout(() => {
            setConnectionState('disconnected');
            setConnectionError(null);
          }, 3000);
        }
      } else if (connectionState !== 'error') {
        setConnectionState('disconnected');
      }
    }
  }, [connected, connecting, isConnecting, wallet, connectionState, connectionError, setPreferredWallet]);

  // Attempt to force reconnect when wallet is available but not connected
  useEffect(() => {
    if (isWalletReady && !connected && !connecting && wallet && preferredWallet) {
      // Only try to reconnect if we haven't exceeded the maximum attempts
      if (reconnectAttempts.current < 2) {
        // Wait a moment before trying to reconnect
        const reconnectTimeout = setTimeout(() => {
          try {
            console.debug('[WalletButton] Attempting auto-reconnect, attempt:', reconnectAttempts.current + 1);
            select(wallet.adapter.name);
            reconnectAttempts.current += 1;
          } catch (e) {
            console.debug('[WalletButton] Auto-reconnect failed:', e);
            setConnectionState('error');
            setConnectionError('Failed to reconnect. Please connect manually.');
          }
        }, 2000);

        return () => clearTimeout(reconnectTimeout);
      }
    }
  }, [isWalletReady, connected, connecting, wallet, select, preferredWallet]);

  // Handle direct wallet connection
  const handleConnectClick = () => {
    if (connectionState === 'error') {
      // Reset error state and allow retry
      setConnectionState('disconnected');
      setConnectionError(null);
      return;
    }

    if (connectionState !== 'connected' && connectionState !== 'connecting') {
      setConnectionState('connecting');
      setVisible(true); // Open the wallet modal

      // If connection doesn't complete within 15 seconds, show timeout error
      const timeoutId = setTimeout(() => {
        if (!connected) {
          setConnectionState('error');
          setConnectionError('Connection timed out. Please try again.');
        }
      }, 15000);

      return () => clearTimeout(timeoutId);
    }
  };

  // Handle wallet disconnect with confirmation
  const handleDisconnect = () => {
    try {
      disconnect();
      setConnectionState('disconnected');
      toast.info('Wallet disconnected');
    } catch (error) {
      console.error('[WalletButton] Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  // Get appropriate button style based on connection state
  const getButtonStyle = () => {
    if (isHovered) {
      return { ...walletButtonStyle, ...walletButtonHoverStyle };
    }

    switch (connectionState) {
      case 'connecting':
        return walletConnectingStyle;
      case 'error':
        return walletErrorStyle;
      default:
        return walletButtonStyle;
    }
  };

  // Get wallet available installed wallets
  const getAvailableWallets = () => {
    return wallets.filter(
      wallet => wallet.readyState === WalletReadyState.Installed ||
                wallet.readyState === WalletReadyState.Loadable
    );
  };

  // Detect if user has any supported wallets installed
  const hasInstalledWallets = getAvailableWallets().length > 0;

  // During SSR or initial render, show a placeholder
  if (!isMounted) {
    return (
      <motion.button
        className="wallet-adapter-button-trigger"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        style={{
          ...walletButtonStyle,
          width: fullWidth ? '100%' : '160px',
        }}
      >
        Connect Wallet
      </motion.button>
    );
  }

  // When in error state, show error button
  if (connectionState === 'error') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="wallet-adapter-button-error"
              style={{
                ...walletErrorStyle,
                width: fullWidth ? '100%' : 'auto',
              }}
              onClick={handleConnectClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Retry Connection
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{connectionError || 'Connection error. Click to retry.'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // When wallet is ready but not connected
  if (isWalletReady && !connected) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: fullWidth ? '100%' : 'auto' }}
      >
        {connecting ? (
          <Button
            className="wallet-adapter-button-loading"
            style={{
              ...walletConnectingStyle,
              width: fullWidth ? '100%' : 'auto',
            }}
            disabled
          >
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          </Button>
        ) : (
          <WalletMultiButton
            className="wallet-adapter-button-trigger"
            style={{
              ...getButtonStyle(),
              width: fullWidth ? '100%' : 'auto',
            }}
            onClick={handleConnectClick}
          />
        )}
      </motion.div>
    );
  }

  // When connected, show address and the wallet button
  return (
    <div className={`flex items-center ${fullWidth ? 'w-full justify-between' : 'gap-2'}`}>
      {showAddress && publicKey && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-zinc-200 flex items-center"
        >
          {showNetworkBadge && (
            <span className="inline-flex h-2 w-2 rounded-full bg-green-400 mr-2" />
          )}
          {formatPublicKey(publicKey)}
        </motion.span>
      )}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="wallet-adapter-button-disconnect"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm9 2.414L15.586 9H12V5.414z" clipRule="evenodd" />
            <path d="M3 8h.01M3 12h.01M3 16h.01M8 3v.01M12 3v.01M16 7v.01M16 11v.01M16 15v.01" />
          </svg>
          Disconnect
        </Button>
      </motion.div>
    </div>
  );
};
