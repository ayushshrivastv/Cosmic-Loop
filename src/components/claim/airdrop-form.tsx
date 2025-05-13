"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createConnection } from '@/lib/utils/solana';
import { DEVNET_RPC_ENDPOINT } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AirdropForm() {
  const { publicKey, connected } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);

  // For bulk airdrop
  const [recipientList, setRecipientList] = useState('');
  const [bulkAmount, setBulkAmount] = useState('1');

  const handleSingleAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    setTxSignature(null);
    
    if (!recipientAddress && !publicKey) {
      setError('Please enter a recipient address or connect your wallet');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Use connected wallet as recipient if no address provided
      const targetAddress = recipientAddress || publicKey?.toBase58();
      
      // Validate address
      try {
        new PublicKey(targetAddress as string);
      } catch (err) {
        setError('Invalid Solana address');
        setIsSubmitting(false);
        return;
      }
      
      // Create a connection to Solana
      const connection = createConnection(DEVNET_RPC_ENDPOINT as any);
      
      // Simulate successful airdrop for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your token airdrop function here
      // For example:
      // const result = await airdropCompressedToken(connection, new PublicKey(targetAddress), Number(tokenAmount));
      
      const mockTxSignature = '5zYcGpic5ys4hqxxDoogMpYGZfKfVNCdiGHZEYGQkrq85Vz6mLnFP7NeF8Q2xNgfLPDvt3d2hsVsXZXLsHRKV3YU';
      
      setSuccess(true);
      setTxSignature(mockTxSignature);
      
    } catch (err) {
      console.error('Airdrop failed:', err);
      setError('Failed to process airdrop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAirdrop = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setSuccess(false);
    setTxSignature(null);
    
    if (!recipientList.trim()) {
      setError('Please enter at least one recipient address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Parse addresses from textarea (one per line)
      const addresses = recipientList
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);
      
      if (addresses.length === 0) {
        setError('No valid addresses found');
        setIsSubmitting(false);
        return;
      }
      
      // Validate addresses
      for (const addr of addresses) {
        try {
          new PublicKey(addr);
        } catch (err) {
          setError(`Invalid Solana address: ${addr}`);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Simulate longer processing time for bulk operation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // In a real implementation, you would:
      // 1. Create a merkle tree for compressed NFTs
      // 2. Add recipients to the tree
      // 3. Execute the bulk airdrop transaction
      
      setSuccess(true);
      setTxSignature(`Airdropped to ${addresses.length} recipients`);
      
    } catch (err) {
      console.error('Bulk airdrop failed:', err);
      setError('Failed to process bulk airdrop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="bg-green-500/10 text-green-500 p-4 rounded-lg mb-4">
            <div className="flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium">Airdrop Successful!</h3>
            </div>
            <p>The tokens have been successfully airdropped.</p>
          </div>
          
          {txSignature && (
            <div className="mt-2 text-sm">
              <p className="text-muted-foreground mb-1">Transaction:</p>
              <div className="bg-muted p-2 rounded-md break-all font-mono text-xs">
                {txSignature}
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => {
              setSuccess(false);
              setTxSignature(null);
              setRecipientAddress('');
              setRecipientList('');
            }}
            className="w-full mt-4"
            variant="outline"
          >
            Start New Airdrop
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a3 3 0 100-6 3 3 0 000 6zM9.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            <path d="M17 10a3 3 0 100-6 3 3 0 000 6zM15.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            <path d="M5 14a3 3 0 100-6 3 3 0 000 6zM3.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            <path d="M8 16H7a4 4 0 01-4-4v-1a2 2 0 00-1-1.73V8a2 2 0 001-1.73V6a4 4 0 014-4h7a4 4 0 014 4v.27a2 2 0 001 1.73v1.27a2 2 0 00-1 1.73V12a4 4 0 01-4 4h-3.1M13 16v2H9v-2h4z" />
          </svg>
          Airdrop Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="single">Single Recipient</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Airdrop</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <form onSubmit={handleSingleAirdrop} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="recipientAddress">Recipient Address</Label>
                  {connected && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 text-xs text-primary"
                      onClick={() => setRecipientAddress('')}
                    >
                      Use My Wallet
                    </Button>
                  )}
                </div>
                <Input
                  id="recipientAddress"
                  placeholder={connected ? publicKey?.toBase58() || "Enter Solana address" : "Enter Solana address"}
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="font-mono text-sm"
                />
                {!connected && !recipientAddress && (
                  <p className="text-xs text-muted-foreground">
                    Connect your wallet or enter a recipient address
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tokenAmount">Token Amount</Label>
                <div className="flex">
                  <Input
                    id="tokenAmount"
                    type="number"
                    min="1"
                    step="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit"
                    disabled={isSubmitting || (!connected && !recipientAddress)}
                    className="ml-2 bg-white text-black hover:bg-slate-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                        </svg>
                        Airdrop
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk">
            <form onSubmit={handleBulkAirdrop} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="recipientList">Recipient Addresses (one per line)</Label>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-input">For Organizers</span>
                </div>
                <textarea
                  id="recipientList"
                  placeholder="Enter Solana addresses, one per line"
                  value={recipientList}
                  onChange={(e) => setRecipientList(e.target.value)}
                  className="w-full min-h-[120px] font-mono text-sm p-2 rounded-md border border-input bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bulkAmount">Token Amount per Recipient</Label>
                <div className="flex">
                  <Input
                    id="bulkAmount"
                    type="number"
                    min="1"
                    step="1"
                    value={bulkAmount}
                    onChange={(e) => setBulkAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="submit"
                    disabled={isSubmitting || !recipientList.trim()}
                    className="ml-2 bg-white text-black hover:bg-slate-100"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" />
                          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                        </svg>
                        Bulk Airdrop
                      </span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Compressed tokens will be distributed efficiently to all recipients
                </p>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
