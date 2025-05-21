"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PageLayout } from '@/components/layouts/page-layout';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  // Define a proper type for tokens instead of any
  interface EventToken {
    id: string;
    name: string;
    eventDate: string;
    organizer: string;
    location: string;
    image: string;
  }
  
  // Initialize state
  const [isClient, setIsClient] = useState(false);
  const [tokens, setTokens] = useState<EventToken[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Always call hooks at the top level, regardless of rendering conditions
  const wallet = useWallet();
  // Track if we can use wallet values safely
  const canUseWallet = isClient && wallet;

  // Set up client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Mock tokens for now - only runs on client side
  useEffect(() => {
    if (!isClient) return; // Skip if not client side yet
    
    if (canUseWallet && wallet.connected && wallet.publicKey) {
      setLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        // Mock data for demonstration
        setTokens([
          {
            id: '1',
            name: 'Solana Breakpoint 2025',
            eventDate: 'May 25, 2025',
            organizer: 'Solana Foundation',
            location: 'San Francisco, CA',
            image: 'https://picsum.photos/300/200',
          },
        ]);
        setLoading(false);
      }, 1000);
    } else {
      setTokens([]);
    }
  }, [isClient, canUseWallet, wallet.connected, wallet.publicKey]);

  return (
    <PageLayout activePage={ROUTES.PROFILE}>
      {/* Content */}
      <div className="container mx-auto py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Your Tokens</h1>

        {!isClient ? (
          // Show a loading state while we wait for client-side hydration
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !wallet.connected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view your tokens
            </p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your tokens...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You don't have any event tokens yet
            </p>
            <Button onClick={() => window.location.href = ROUTES.CLAIM}>
              Claim Your First Token
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token) => (
              <Card key={token.id} className="overflow-hidden">
                <div className="h-48 overflow-hidden">
                  <img
                    src={token.image}
                    alt={token.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{token.name}</CardTitle>
                  <CardDescription>{token.eventDate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Organizer:</span> {token.organizer}</p>
                    <p><span className="font-medium">Location:</span> {token.location}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Referral Section */}
        {isClient && wallet.connected && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Referral Program</h2>
            <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/30">
              <div className="text-center py-8">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Coming Soon</h3>
                <p className="text-blue-200/80 mb-6">I'm still reading docs and building</p>
                <Button variant="outline" className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20" disabled>
                  Stay Tuned
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
