"use client";

import React, { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
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
  BraveWalletAdapter,
  CoinbaseWalletAdapter,
  CloverWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { DEVNET_RPC_ENDPOINT, MAINNET_RPC_ENDPOINT } from '@/lib/constants';
import { toast } from 'sonner';

interface WalletAdapterProviderProps {
  children: ReactNode;
  cluster?: 'devnet' | 'mainnet-beta' | 'testnet';
  endpoint?: string;
}

/**
 * Component that safely wraps Solana's wallet adapter functionality with proper client-side detection
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

  useEffect(() => {
    setMounted(true);

    // Delay wallet initialization to ensure DOM is stable
    const timeoutId = setTimeout(() => {
      setWalletInitialized(true);
      console.log('Wallet adapter initialization complete');
    }, 1500); // Increased timeout to ensure DOM is fully loaded

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

    const finalEndpoint = cluster === 'mainnet-beta'
      ? MAINNET_RPC_ENDPOINT
      : DEVNET_RPC_ENDPOINT;

    console.log(`Using RPC endpoint: ${finalEndpoint} (${cluster})`);
    return finalEndpoint;
  }, [cluster, endpoint]);

  // Configure supported wallets with improved options
  const wallets = useMemo(() => {
    try {
      console.log('Configuring wallets for network:', network);
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new BackpackWalletAdapter(),
        new BraveWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new CloverWalletAdapter(),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
      ];
    } catch (error) {
      console.error('Error initializing wallet adapters:', error);
      // Return minimum set of wallets if there's an error
      return [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
      ];
    }
  }, [network]);

  // Wallet connection error handler
  const onError = (error: Error) => {
    console.error('Wallet connection error:', error);
    toast.error(`Wallet connection error: ${error.message}`);
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
        localStorageKey="walletAdapter"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
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
