"use client";

import { type FC, type ReactNode, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type Cluster, DEVNET_RPC_ENDPOINT, MAINNET_RPC_ENDPOINT } from '@/lib/constants';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
  cluster?: Cluster;
  endpoint?: string;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({
  children,
  cluster = 'devnet',
  endpoint
}) => {
  // Set up network
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

  // Set up endpoint
  const rpcEndpoint = useMemo(() => {
    if (endpoint) return endpoint;

    return cluster === 'mainnet-beta'
      ? MAINNET_RPC_ENDPOINT
      : DEVNET_RPC_ENDPOINT;
  }, [cluster, endpoint]);

  // Set up supported wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  // State to determine if the component has been mounted client-side
  const [mounted, setMounted] = useState(false);

  // Only enable wallet features after component is mounted client-side
  useEffect(() => {
    setMounted(true);
    // This will run after hydration/mounting
    return () => setMounted(false);
  }, []);

  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect={mounted}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
