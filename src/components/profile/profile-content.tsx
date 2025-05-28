"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants';

// Define a proper type for tokens
interface EventToken {
  id: string;
  name: string;
  eventDate: string;
  organizer: string;
  location: string;
  image: string;
}

// Token card component
function TokenCard({ token }: { token: EventToken }) {
  return (
    <Card className="overflow-hidden">
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
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Organizer:</span> {token.organizer}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Location:</span> {token.location}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

// Component that safely uses wallet context on client-side only
export default function ProfileContent() {
  const [tokens, setTokens] = useState<EventToken[]>([]);
  const [loading, setLoading] = useState(false);
  
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  
  useEffect(() => {    
    if (connected && publicKey) {
      setLoading(true);
      setTimeout(() => {
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

  if (!connected) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Connect your wallet to view your tokens
        </p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your tokens...</p>
      </div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          You don't have any event tokens yet
        </p>
        <Button onClick={() => window.location.href = ROUTES.CLAIM}>
          Claim Your First Token
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
