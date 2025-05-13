"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppleLayout } from '@/components/layouts/apple-layout';
import { BridgeForm } from '@/components/bridge/bridge-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SupportedChain } from '@/lib/utils/layer-zero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHAIN_CONFIGS } from '@/lib/layer-zero-config';

export default function BridgePage() {
  const searchParams = useSearchParams();
  const [tokenMint, setTokenMint] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string | null>(null);
  const [supportedChains, setSupportedChains] = useState<SupportedChain[] | null>(null);

  useEffect(() => {
    // Extract parameters from URL
    const mint = searchParams.get('mint');
    const token = searchParams.get('token');
    const event = searchParams.get('event');
    const chains = searchParams.get('chains')?.split(',') as SupportedChain[] | undefined;

    if (mint) setTokenMint(mint);
    if (token) setTokenName(token);
    if (event) setEventName(event);
    if (chains && chains.length > 0) setSupportedChains(chains);
  }, [searchParams]);

  return (
    <AppleLayout>
      <div className="container mx-auto pt-32 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Bridge Your Tokens</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">About Cross-Chain Bridging</h2>
                <p className="text-muted-foreground mb-4">
                  Bridge your Solana event tokens to other blockchains using LayerZero's secure cross-chain messaging protocol.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-lg">Supported Chains</h3>
                <div className="space-y-2">
                  {supportedChains ? (
                    supportedChains.map((chain) => (
                      <div key={chain} className="flex items-center space-x-2 p-2 bg-muted rounded">
                        <img
                          src={CHAIN_CONFIGS[chain].logo}
                          alt={CHAIN_CONFIGS[chain].name}
                          className="w-5 h-5"
                        />
                        <span>{CHAIN_CONFIGS[chain].name}</span>
                      </div>
                    ))
                  ) : (
                    Object.values(SupportedChain)
                      .filter(chain => chain !== SupportedChain.Solana)
                      .map((chain) => (
                        <div key={chain} className="flex items-center space-x-2 p-2 bg-muted rounded">
                          <img
                            src={CHAIN_CONFIGS[chain].logo}
                            alt={CHAIN_CONFIGS[chain].name}
                            className="w-5 h-5"
                          />
                          <span>{CHAIN_CONFIGS[chain].name}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                <AlertTitle className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Important
                </AlertTitle>
                <AlertDescription>
                  Bridging tokens requires a small fee paid in SOL to cover the cost of cross-chain messaging. Make sure you have sufficient SOL in your wallet.
                </AlertDescription>
              </Alert>

              <div className="pt-6 border-t border-border">
                <h3 className="font-medium mb-2">How it works</h3>
                <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Enter or confirm your token mint address</li>
                  <li>Select a destination blockchain</li>
                  <li>Enter your wallet address on the destination chain</li>
                  <li>Pay a small network fee in SOL</li>
                  <li>Wait for the token to appear in your destination wallet</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Right column - Bridge Form */}
          <div className="lg:col-span-2">
            <BridgeForm
              tokenMint={tokenMint || undefined}
              tokenName={tokenName || undefined}
              eventName={eventName || undefined}
              supportedChains={supportedChains || undefined}
            />

            <Card className="mt-8 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">About LayerZero</CardTitle>
                <CardDescription>
                  The cross-chain infrastructure powering our bridging solution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  LayerZero is a secure cross-chain messaging protocol that enables seamless token transfers between different blockchains.
                  It uses a decentralized network of validators to ensure messages are delivered accurately and securely across chains.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded">
                    <h4 className="font-medium text-sm">Security</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      LayerZero uses a decentralized Oracle and Relayer network to ensure message delivery with configurable security.
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <h4 className="font-medium text-sm">Speed</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Transfers typically complete in 10-15 minutes, depending on blockchain congestion and confirmation times.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
