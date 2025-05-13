"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PageLayout } from '@/components/layouts/page-layout';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock tokens for now
  useEffect(() => {
    if (connected && publicKey) {
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
  }, [connected, publicKey]);

  return (
    <PageLayout activePage={ROUTES.PROFILE}>
      {/* Content */}
      <div className="container mx-auto py-8 flex-1">
        <h1 className="text-3xl font-bold mb-8">Your Tokens</h1>

        {!connected ? (
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
            <Button asChild>
              <a href={ROUTES.CLAIM}>Claim Your First Token</a>
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
      </div>
    </PageLayout>
  );
}
