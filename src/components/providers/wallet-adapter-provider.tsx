"use client";

import React, { FC, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { WalletAdapterNetwork, WalletError, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { DEVNET_RPC_ENDPOINT, MAINNET_RPC_ENDPOINT } from '@/lib/constants';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface WalletAdapterProviderProps {
  children: ReactNode;
  cluster?: 'devnet' | 'mainnet-beta' | 'testnet';
  endpoint?: string;
}

// Wallet preference storage key
const WALLET_PREFERENCE_KEY = 'cosmic-loop-wallet-preference';

/**
 * Component that safely wraps Solana's wallet adapter functionality with proper client-side detection
 * This enhanced version includes:
 * - Support for multiple wallet types (Phantom, Backpack, Solflare, etc.)
 * - Auto-reconnection logic with retry mechanism
 * - Proper error handling with user feedback via toast notifications
 * - Remembering the last used wallet for better UX
 */
export const WalletAdapterProvider: FC<WalletAdapterProviderProps> = ({
  children,
  cluster = 'devnet',
  endpoint
}) => {
  // Used to safely ensure we only render wallet components on client
  const [mounted, setMounted] = useState(false);

  // Track if we've properly waited to initialize wallet
  const [walletInitialized, setWalletInitialized] = useState(false);

  // Remember user's wallet preference
  const [walletPreference, setWalletPreference] = useLocalStorage<string | null>(
    WALLET_PREFERENCE_KEY,
    null
  );

  // Track connection attempts to prevent infinite loops
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Delay wallet initialization to ensure DOM is stable
    const timeoutId = setTimeout(() => {
      setWalletInitialized(true);
      console.debug('[Wallet] Initialization complete');
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      setMounted(false);
    };
  }, []);

  // Get the correct network for the cluster
  const network = useMemo(() => {
    switch (cluster) {
      case 'mainnet-beta':
        return WalletAdapterNetwork.Mainnet;
      case 'testnet':
        return WalletAdapterNetwork.Testnet;
      default:
        return WalletAdapterNetwork.Devnet;
    }
  }, [cluster]);

  // Get the correct endpoint
  const rpcEndpoint = useMemo(() => {
    if (endpoint) return endpoint;

    return cluster === 'mainnet-beta'
      ? MAINNET_RPC_ENDPOINT
      : DEVNET_RPC_ENDPOINT;
  }, [cluster, endpoint]);

  // Configure supported wallets with all major Solana wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
    new GlowWalletAdapter(),
    new TorusWalletAdapter()
  ], []);

  // Handle wallet errors with detailed feedback
  const onError = useCallback((error: WalletError) => {
    console.error('[Wallet] Error:', error);

    let message = 'An error occurred with your wallet';

    // Provide specific error messages based on error type
    if (error instanceof WalletNotConnectedError) {
      message = 'Please connect your wallet to continue';
    } else if (error.name === 'WalletDisconnectedError') {
      message = 'Your wallet was disconnected. Please reconnect';
      // Attempt to reconnect automatically after a short delay
      setTimeout(() => {
        if (connectionAttempts < 3) {
          setConnectionAttempts(prev => prev + 1);
          console.debug('[Wallet] Attempting to reconnect, attempt:', connectionAttempts + 1);
        }
      }, 2000);
    } else if (error.name === 'WalletWindowClosedError') {
      message = 'You closed the wallet connection window';
    } else if (error.name.includes('WalletTimeoutError')) {
      message = 'Wallet connection timed out. Please try again';
    } else if (error.message) {
      message = error.message;
    }

    toast.error(message, {
      description: 'Please try again or use a different wallet',
      duration: 5000,
    });
  }, [connectionAttempts]);

  // Save wallet preference when connected
  const onWalletConnected = (walletName: string) => {
    setWalletPreference(walletName);
    setConnectionAttempts(0); // Reset connection attempts on successful connection
    console.debug('[Wallet] Connected to:', walletName);

    toast.success('Wallet connected', {
      description: `Successfully connected to ${walletName}`,
    });
  };

  // Render fallback during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect={walletInitialized}
        onError={onError}
      >
        <WalletEventListener onWalletConnected={onWalletConnected} preferredWallet={walletPreference} />
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Helper component to listen for wallet events
type WalletEventListenerProps = {
  onWalletConnected: (walletName: string) => void;
  preferredWallet: string | null;
};

const WalletEventListener: FC<WalletEventListenerProps> = ({
  onWalletConnected,
  preferredWallet
}) => {
  const { wallet, connected, connecting, disconnect, select, wallets } = useWallet();

  // Track connection state
  useEffect(() => {
    if (connected && wallet) {
      onWalletConnected(wallet.adapter.name);
    }
  }, [connected, wallet, onWalletConnected]);

  // Try to select preferred wallet on mount
  useEffect(() => {
    if (preferredWallet && !connected && !connecting) {
      const matchingWallet = wallets.find(w => w.adapter.name === preferredWallet);
      if (matchingWallet) {
        try {
          console.debug('[Wallet] Auto-selecting preferred wallet:', preferredWallet);
          select(matchingWallet.adapter.name);
        } catch (error) {
          console.error('[Wallet] Error selecting preferred wallet:', error);
        }
      }
    }
  }, [preferredWallet, wallets, connected, connecting, select]);

  // Return null as this is just a listener component
  return null;
};

/**
 * Hook for accessing and persisting the user's preferred wallet
 */
export const useWalletPreference = () => {
  return useLocalStorage<string | null>(WALLET_PREFERENCE_KEY, null);
};

/**
 * Wrapper component that prevents wallet connection errors
 * by only rendering children when wallet is safe to use
 */
export const SafeWalletComponentWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const { wallet } = useWallet();
  const [isSafe, setIsSafe] = useState(false);

  useEffect(() => {
    // Only render wallet components after a delay
    const timer = setTimeout(() => {
      setIsSafe(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [wallet]);

  if (!isSafe) {
    return null;
  }

  return <>{children}</>;
};

// Create a custom hook for easier access to local storage
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
