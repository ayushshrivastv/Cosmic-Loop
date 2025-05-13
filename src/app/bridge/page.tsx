"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppleLayout } from '@/components/layouts/apple-layout';
import BridgeForm from '@/components/bridge/bridge-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SupportedChain } from '@/lib/utils/layer-zero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHAIN_CONFIGS } from '@/lib/layer-zero-config';

// Create a separate component that uses useSearchParams
function BridgePageContent() {
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
                      <div key={chain} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-background">
                          <img 
                            src={CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS]?.logo || '/chains/unknown.svg'} 
                            alt={CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS]?.name || chain} 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <span>{CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS]?.name || chain}</span>
                      </div>
                    ))
                  ) : (
                    Object.entries(CHAIN_CONFIGS).map(([chain, config]) => (
                      <div key={chain} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-background">
                          <img 
                            src={config.logo || '/chains/unknown.svg'} 
                            alt={config.name} 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <span>{config.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {tokenMint && (
                <Alert>
                  <AlertTitle>Selected Token</AlertTitle>
                  <AlertDescription className="mt-2">
                    {tokenName || 'Event Token'}
                    {eventName && <div className="text-sm text-muted-foreground mt-1">Event: {eventName}</div>}
                    <div className="text-xs text-muted-foreground mt-1 font-mono truncate">{tokenMint}</div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Right column - Bridge Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bridge Your Token</CardTitle>
                <CardDescription>
                  Move your event token between Solana and other supported blockchains
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BridgeForm 
                  tokenMint={tokenMint || undefined}
                  tokenName={tokenName || undefined}
                  eventName={eventName || undefined}
                  supportedChains={supportedChains || undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}

// Main component that wraps the content in a Suspense boundary
export default function BridgePage() {
  return (
    <Suspense fallback={
      <AppleLayout>
        <div className="container mx-auto pt-32 pb-16 flex-1">
          <h1 className="text-3xl font-bold mb-8">Bridge Your Tokens</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppleLayout>
    }>
      <BridgePageContent />
    </Suspense>
  );
}
