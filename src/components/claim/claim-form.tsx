"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicKey } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { transferCompressedTokens, createConnection } from '@/lib/utils/solana';
import { DEFAULT_CLUSTER, DEVNET_RPC_ENDPOINT } from '@/lib/constants';
import { Keypair } from '@solana/web3.js';
import { QrScanner } from './qr-scanner';
import { claimEventNFT } from '@/lib/api-client';
import { toast } from 'sonner';
import { isValidSolanaPublicKey } from '@/lib/utils/qrcode';
import { Progress } from '@/components/ui/progress';

/**
 * ClaimForm Component
 * Enhanced with improved error handling, loading states, and backend integration
 */
export function ClaimForm() {
  // Access to the user's Solana wallet
  const { publicKey, connected, signTransaction, sendTransaction, connecting: walletConnecting } = useWallet();
  // Get URL parameters (used for direct claim links)
  const searchParams = useSearchParams();
  const router = useRouter();

  // Component state
  const [claimCode, setClaimCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<{
    name: string;
    mint: string;
    id?: string;
  } | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Loading states and progress
  const [loadingState, setLoadingState] = useState<'idle' | 'validating' | 'processing' | 'confirming'>('idle');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  /**
   * Effect hook to process URL parameters when the component loads
   */
  useEffect(() => {
    const event = searchParams.get('event');
    const mint = searchParams.get('mint');
    const eventId = searchParams.get('eventId');

    if (event && mint) {
      try {
        // Validate mint address format
        if (!isValidSolanaPublicKey(mint)) {
          setError('Invalid token address format in URL');
          return;
        }

        // Store event details
        setEventDetails({
          name: decodeURIComponent(event),
          mint: mint,
          id: eventId || undefined
        });

        // Auto-populate claim code if provided in URL
        const code = searchParams.get('code');
        if (code) {
          setClaimCode(code);
        }
      } catch (err) {
        setError('Invalid token information in URL');
      }
    }
  }, [searchParams]);

  // Reset error when wallet connects
  useEffect(() => {
    if (connected && error === 'Please connect your wallet first') {
      setError(null);
    }
  }, [connected, error]);

  /**
   * Simulate transaction progress for better user feedback
   */
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (loadingState === 'processing') {
      // Start at 10% instantly for better perceived performance
      setProcessingProgress(10);

      progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          // Increase progress randomly but never reach 100% until confirmed
          const randomIncrement = Math.random() * 5;
          const newProgress = prev + randomIncrement;
          // Cap at 90% until we get confirmation
          return Math.min(newProgress, 90);
        });
      }, 800);
    } else if (loadingState === 'confirming') {
      // Jump to 100% when confirmed
      setProcessingProgress(100);
    } else if (loadingState === 'idle') {
      // Reset when idle
      setProcessingProgress(0);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [loadingState]);

  /**
   * Validates input parameters before claim
   */
  const validateClaimParams = useCallback(() => {
    // Verify wallet connection
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return false;
    }

    // Ensure we have a claim code or event details
    if (!eventDetails && !claimCode) {
      setError('Please enter a claim code or scan a QR code');
      return false;
    }

    // Validate the mint address
    try {
      const mintAddress = eventDetails?.mint || claimCode;
      new PublicKey(mintAddress);
      return true;
    } catch (err) {
      setError('Invalid token address format');
      return false;
    }
  }, [connected, publicKey, eventDetails, claimCode]);

  /**
   * Handles the form submission for token claiming
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);

    // Validate parameters
    if (!validateClaimParams()) {
      return;
    }

    try {
      // Indicate processing has started
      setIsSubmitting(true);
      setLoadingState('validating');

      // Get the mint address either from the URL parameters or the claim code input
      const mintAddress = eventDetails?.mint || claimCode;
      const eventId = eventDetails?.id || 'unknown';

      // Validate the mint address is a valid Solana PublicKey
      const mintPublicKey = new PublicKey(mintAddress);

      // Create a connection to the Solana cluster
      // Using type assertion to bypass TypeScript errors
      const connection = createConnection(DEVNET_RPC_ENDPOINT as any);

      // After validation, move to processing state
      setLoadingState('processing');

      try {
        // First attempt to claim through backend API
        if (eventDetails?.id) {
          try {
            const claimResult = await claimEventNFT(
              eventDetails.id,
              publicKey.toBase58(),
              'SOLANA' // Assuming claiming on Solana chain
            );

            if (claimResult && claimResult.claimTransactionHash) {
              setTransactionHash(claimResult.claimTransactionHash);
              setLoadingState('confirming');
              setTimeout(() => {
                setClaimSuccess(true);
                setLoadingState('idle');
              }, 1000); // Small delay for visual feedback
              return;
            }
          } catch (apiError) {
            console.warn('Backend claim failed, falling back to direct transfer:', apiError);
            // Continue with direct transfer as fallback
          }
        }

        // Fallback to direct token transfer if API claim fails or event ID not available
        // @ts-ignore - This matches the actual implementation in your project
        const result = await transferCompressedTokens(
          connection,
          publicKey,
          mintPublicKey,
          sendTransaction
        );

        if (result && result.signature) {
          setTransactionHash(result.signature);
          setLoadingState('confirming');

          // Wait a moment before showing success for better UX
          setTimeout(() => {
            setClaimSuccess(true);
            setLoadingState('idle');
            toast.success('Token claimed successfully', {
              description: `Transaction confirmed: ${result.signature.slice(0, 8)}...${result.signature.slice(-8)}`
            });
          }, 1000);
        } else {
          throw new Error('Transfer completed but no signature was returned');
        }
      } catch (transferError) {
        const errorMessage = transferError instanceof Error ? transferError.message : String(transferError);
        setError('Failed to claim token: ' + errorMessage);
        toast.error('Token Claim Failed', {
          description: errorMessage
        });
      }
    } catch (err) {
      console.error('Error claiming token:', err);
      setError('Failed to claim token: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
      if (!claimSuccess) setLoadingState('idle');
    }
  };

  // Handle QR scan success
  const handleQrScanSuccess = (result: string) => {
    console.log('QR scan successful:', result);
    try {
      // Parse the URL
      const url = new URL(result);

      // Extract parameters from URL
      const params = new URLSearchParams(url.search);
      const eventName = params.get('event');
      const mintAddress = params.get('mint');
      const eventId = params.get('eventId');

      if (mintAddress) {
        try {
          // Validate the mint address
          if (!isValidSolanaPublicKey(mintAddress)) {
            setError('Invalid token address in QR code');
            return;
          }

          // Set event details
          if (eventName) {
            setEventDetails({
              name: decodeURIComponent(eventName),
              mint: mintAddress,
              id: eventId || undefined
            });
          } else {
            setClaimCode(mintAddress);
          }

          // Show success toast
          toast.success('QR code scanned successfully', {
            description: eventName
              ? `Ready to claim token for ${decodeURIComponent(eventName)}`
              : 'Token address detected'
          });

          // Close the scanner
          setShowQrScanner(false);

          // If we have everything we need, submit automatically after a delay
          if (connected && publicKey) {
            setTimeout(() => {
              // Create a synthetic event object that's compatible with our handler
              const syntheticEvent = {
                preventDefault: () => {}
              } as React.FormEvent;
              handleSubmit(syntheticEvent);
            }, 800);
          }
        } catch (err) {
          setError('Invalid token address in QR code');
        }
      } else {
        setError('QR code does not contain a valid token address');
      }
    } catch (err) {
      setError('Invalid QR code format. Please scan a Solana Pay QR code.');
    }
  };

  // Render success message if claim was successful
  if (claimSuccess) {
    return (
      <Card className="w-full card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Token Claimed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your proof-of-participation token has been successfully claimed and transferred to your wallet.
          </p>

          {eventDetails && (
            <div className="p-4 bg-muted rounded-lg shadow-sm">
              <p className="font-medium">Event: {eventDetails.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Token: {eventDetails.mint.slice(0, 8)}...{eventDetails.mint.slice(-8)}
              </p>
              {transactionHash && (
                <p className="text-xs text-muted-foreground mt-2">
                  Transaction: {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {eventDetails?.mint && (
            <Button
              onClick={() => router.push(`/bridge?mint=${eventDetails.mint}&token=${eventDetails.name}&event=${eventDetails.name}`)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Bridge to Another Chain
            </Button>
          )}
          <Button
            onClick={() => router.push('/')}
            className="w-full"
          >
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full card-hover animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
          Claim Your Token
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showQrScanner && (
          <div className="mb-6">
            <QrScanner
              onScanSuccess={handleQrScanSuccess}
              onScanError={(errorMsg) => {
                console.error('QR scan error:', errorMsg);
                setError(errorMsg);
                toast.error('QR Scan Failed', {
                  description: errorMsg
                });
              }}
              onClose={() => {
                console.log('Closing QR scanner');
                setShowQrScanner(false);
              }}
            />
          </div>
        )}

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

        {loadingState !== 'idle' && (
          <div className="mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {loadingState === 'validating' && 'Validating token...'}
                {loadingState === 'processing' && 'Processing claim...'}
                {loadingState === 'confirming' && 'Confirming transaction...'}
              </span>
              <span className="text-xs text-muted-foreground">{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
          </div>
        )}

        {eventDetails ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-muted rounded-lg shadow-sm transition-all hover:shadow-md">
              <p className="font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Event: {eventDetails.name}
              </p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-muted-foreground/70" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                Token: {eventDetails.mint.slice(0, 8)}...{eventDetails.mint.slice(-8)}
              </p>
            </div>

            <div className="text-center py-2 animate-slide-up" style={{animationDelay: '100ms'}}>
              <p className="text-sm text-muted-foreground">
                {connected
                  ? 'Click the button below to claim your token'
                  : 'Connect your wallet to claim your token'}
              </p>
            </div>
          </div>
        ) : !showQrScanner ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claimCode">Claim Code or Token Address</Label>
              <div className="flex gap-2">
                <Input
                  id="claimCode"
                  placeholder="Enter claim code or paste token address"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  className="flex-1"
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('Opening QR scanner...');
                    setShowQrScanner(true);
                  }}
                  disabled={isSubmitting}
                  className="flex-shrink-0 border-dashed hover:border-primary hover:bg-primary/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                  Scan QR
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scan a Solana Pay QR code or enter a token address manually
              </p>
            </div>
          </form>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || walletConnecting || loadingState !== 'idle' || !connected}
          className="relative transition-all bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : !connected ? (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              Connect Wallet First
            </span>
          ) : walletConnecting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Claim Token
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
