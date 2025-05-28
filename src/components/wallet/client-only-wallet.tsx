"use client";

import { ReactNode, useEffect, useState } from 'react';
import { WalletContext, WalletContextState } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionSignature, Connection, VersionedTransaction } from '@solana/web3.js';
import { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';

// Minimal inline types for mock, if official imports fail or cause issues
interface MockSolanaSignInInput {
  domain?: string;
  address?: string;
  statement?: string;
  uri?: string;
  version?: string;
  chainId?: string;
  nonce?: string;
  issuedAt?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}

interface MockWalletAccount {
  address: string;
  publicKey: Uint8Array;
  chains: `${string}:${string}`[];
  features: `${string}:${string}`[];
  label?: string;
  icon?: `data:image/svg+xml;base64,${string}` | `data:image/webp;base64,${string}` | `data:image/png;base64,${string}` | `data:image/gif;base64,${string}`;
}

interface MockSolanaSignInOutput {
  signedMessage: Uint8Array;
  signature: Uint8Array;
  signatureType?: 'ed25519';
  account: MockWalletAccount;
}

// Create a mock wallet context for server-side rendering
const mockWalletContext: WalletContextState = {
  // WalletAdapterProps
  connected: false,
  connecting: false,
  disconnecting: false,
  connect: async () => { console.warn('Mock connect called during SSR/pre-mount'); },
  disconnect: async () => { console.warn('Mock disconnect called during SSR/pre-mount'); },
  sendTransaction: async (
    _transaction: Transaction,
    _connection: Connection,
    _options?: SendTransactionOptions
  ): Promise<TransactionSignature> => {
    console.warn('Mock sendTransaction called during SSR/pre-mount');
    throw new Error('Mock sendTransaction not implemented for SSR/pre-mount');
  },
  signTransaction: async <T extends Transaction | VersionedTransaction>(
    _transaction: T
  ): Promise<T> => {
    console.warn('Mock signTransaction called during SSR/pre-mount');
    throw new Error('Mock signTransaction not implemented for SSR/pre-mount');
  },
  signAllTransactions: async <T extends Transaction | VersionedTransaction>(
    _transactions: T[]
  ): Promise<T[]> => {
    console.warn('Mock signAllTransactions called during SSR/pre-mount');
    throw new Error('Mock signAllTransactions not implemented for SSR/pre-mount');
  },
  signMessage: async (_message: Uint8Array): Promise<Uint8Array> => {
    console.warn('Mock signMessage called during SSR/pre-mount');
    throw new Error('Mock signMessage not implemented for SSR/pre-mount');
  },
  signIn: async <AdditionalSignInInput extends MockSolanaSignInInput = MockSolanaSignInInput>(
    _input?: AdditionalSignInInput
  ): Promise<MockSolanaSignInOutput> => {
    console.warn('Mock signIn called during SSR/pre-mount');
    throw new Error('Mock signIn not implemented for SSR/pre-mount. Returning a mock structure would require a valid MockWalletAccount.');
    // Example of returning a mock structure if not throwing:
    // const mockAccount: MockWalletAccount = {
    //   address: new PublicKey(0).toBase58(), // Placeholder, invalid for real use
    //   publicKey: new PublicKey(0).toBytes(), // Placeholder
    //   chains: ['solana:devnet'],
    //   features: ['solana:signIn'],
    // };
    // return {
    //   signedMessage: new Uint8Array(),
    //   signature: new Uint8Array(),
    //   account: mockAccount,
    // };
  },

  // WalletContextState specific
  wallets: [],
  autoConnect: false,
  select: (_walletName: WalletName | null) => { console.warn('Mock select called during SSR/pre-mount'); },
  wallet: null,
  publicKey: null,
};

/**
 * ClientOnlyWallet Component
 * 
 * This component ensures wallet-dependent children are only rendered on the client-side
 * after the component has mounted. This prevents issues with wallet context during SSR.
 * 
 * @param children - React components that depend on wallet context
 * @returns The children components if mounted, otherwise null.
 */
export function ClientOnlyWallet({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Set mounted to true on client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // During server-side rendering or before hydration, render nothing.
  // Children that depend on wallet context will only render on the client.
  if (!mounted) {
    return null;
  }

  // On client-side, render the children. They should now have access to the
  // actual wallet context provided by a higher-level provider.
  return <>{children}</>;
}
