"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { transferCompressedTokens, createConnection } from '@/lib/utils/solana';
import { DEFAULT_CLUSTER, DEVNET_RPC_ENDPOINT, ROUTES } from '@/lib/constants';
import { QrScanner } from './qr-scanner';

/**
 * ClaimForm Component
 * Handles the token claiming process, supporting both direct input and URL-based claiming
 */
export function ClaimForm() {
  // Client-side safety flag
  const [isClient, setIsClient] = useState(false);
  
  // Access to the user's Solana wallet
  const wallet = useWallet();
  const { publicKey, connected, sendTransaction } = wallet;
  
  // Track actual wallet connection status with our own state
  const [isWalletReady, setIsWalletReady] = useState(false);
  
  // Initialize client-side detection
  useEffect(() => {
    console.log('ClaimForm mounted, setting isClient = true');
    setIsClient(true);
  }, []);
  
  // Monitor wallet connection status
  useEffect(() => {
    if (!isClient) return;
    
    console.log('Wallet state changed:');
    console.log('- Connected:', connected);
    console.log('- PublicKey:', publicKey?.toBase58());
    
    // Only consider wallet ready when both connected is true AND publicKey exists
    const walletIsReady = !!connected && !!publicKey;
    console.log('- Wallet is ready:', walletIsReady);
    setIsWalletReady(walletIsReady);
  }, [connected, publicKey, isClient]);
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
  } | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);

  /**
   * Effect hook to process URL parameters when the component loads
   */
  useEffect(() => {
    if (!searchParams) return;
    
    const event = searchParams.get('event');
    const mint = searchParams.get('mint');
    
    if (event && mint) {
      try {
        // Validate mint address format
        new PublicKey(mint);
        
        // Store event details
        setEventDetails({
          name: decodeURIComponent(event),
          mint: mint
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

  /**
   * Handles the form submission for token claiming
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verify wallet connection
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }
    
    // Ensure we have a claim code or event details
    if (!eventDetails && !claimCode) {
      setError('Please enter a claim code');
      return;
    }
    
    try {
      // Reset previous errors and indicate processing has started
      setError(null);
      setIsSubmitting(true);
      
      // Get the mint address either from the URL parameters or the claim code input
      let mintAddress = eventDetails?.mint || claimCode || '';
      
      // Check if the input might be a URL containing a token address
      if (mintAddress.includes('http') || mintAddress.includes('solana:')) {
        try {
          // Try parsing as Solana Pay URL
          if (mintAddress.startsWith('solana:')) {
            const solanaPayUrl = mintAddress.split('?');
            if (solanaPayUrl.length > 1) {
              const queryParams = new URLSearchParams('?' + solanaPayUrl[1]);
              const tokenParam = queryParams.get('spl-token');
              if (tokenParam) {
                mintAddress = tokenParam;
              }
            }
          } else {
            // Try parsing as regular URL
            const url = new URL(mintAddress);
            const params = new URLSearchParams(url.search);
            
            // Check various parameters that might contain the token address
            const possibleParams = [
              params.get('mint'),
              params.get('token'),
              params.get('address'),
              params.get('spl-token'),
              params.get('tokenAddress')
            ].filter(Boolean) as string[];
            
            // Find first valid address
            for (const param of possibleParams) {
              try {
                new PublicKey(param);
                mintAddress = param;
                break;
              } catch {}
            }
            
            // If no parameter found, check if the path itself contains a token address
            if (mintAddress.includes('http')) {
              const pathSegments = url.pathname.split('/');
              const lastSegment = pathSegments[pathSegments.length - 1];
              
              if (lastSegment && lastSegment.length >= 32) {
                try {
                  new PublicKey(lastSegment);
                  mintAddress = lastSegment;
                } catch {}
              }
            }
          }
        } catch (urlError) {
          console.error('Error parsing URL in claim code:', urlError);
          // Continue with original input if URL parsing fails
        }
      }
      
      console.log('Using mint address:', mintAddress);
      
      // Validate the mint address is a valid Solana PublicKey
      const mintPublicKey = new PublicKey(mintAddress);
      
      // Create a connection to the Solana cluster
      // Create a proper AppConfig object from the endpoint string
      const connectionConfig = {
        cluster: DEFAULT_CLUSTER,
        rpcEndpoint: DEVNET_RPC_ENDPOINT
      };
      const connection = createConnection(connectionConfig);
      
      // Simplified token claiming process to match the project's implementation
      try {
        // Create a mock keypair for demonstration since we don't have the real keypair from wallet
        // Define a proper type for our mock keypair that matches the expected structure
        interface MockKeypair {
          publicKey: PublicKey;
          secretKey: Uint8Array;
          toString(): string;
        }
        
        const mockUserKeypair: MockKeypair = {
          publicKey: publicKey,
          secretKey: new Uint8Array(64), // Mock secret key
          toString: () => 'mockKeypair',
        };

        // Call transferCompressedTokens with all the expected parameters
        const result = await transferCompressedTokens(
          connection,
          mockUserKeypair as unknown as Keypair, // Explicitly cast to expected Keypair type
          mintPublicKey,                         // mint
          1,                                     // amount (default to 1 token)
          mockUserKeypair as unknown as Keypair, // owner (same as payer in this case)
          publicKey                              // destination (sending to self for demonstration)
        );
        
        setClaimSuccess(true);
        console.log('Token claimed successfully:', result.signature);
      } catch (transferError) {
        const errorMessage = transferError instanceof Error ? transferError.message : String(transferError);
        setError('Failed to claim token: ' + errorMessage);
      }
    } catch (err) {
      console.error('Error claiming token:', err);
      setError('Failed to claim token. Please check the address and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful claim screen
  if (claimSuccess) {
    return (
      <Card className="w-full card-hover animate-fade-in">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-green-500/10 text-green-500 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium">Token Claim Successful!</h3>
              </div>
              <p>Your compressed NFT has been successfully transferred to your wallet.</p>
            </div>
            
            <Button
              onClick={() => router.push(ROUTES.HOME)}
              className="w-full relative transition-all bg-white text-black hover:bg-slate-100"
            >
              <span className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Return to Home
              </span>
            </Button>
          </div>
        </CardContent>
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
        {/* QR Scanner Component - Only shown when showQrScanner is true */}
        {showQrScanner && (
          <div className="mb-6">
            <QrScanner
              onScanSuccess={(result) => {
                console.log('QR scan successful:', result);
                try {
                  // Check if it's a Solana Pay URL (starts with solana:)
                  if (result.startsWith('solana:')) {
                    console.log('Detected Solana Pay URL format');
                    // Extract the recipient address (everything after solana: and before ?)
                    const solanaPayUrl = result.split('?');
                    const recipient = solanaPayUrl[0].replace('solana:', '');
                    
                    // Extract token address from spl-token parameter
                    let mintAddress = '';
                    if (solanaPayUrl.length > 1) {
                      const queryParams = new URLSearchParams('?' + solanaPayUrl[1]);
                      mintAddress = queryParams.get('spl-token') || '';
                      console.log('Found token in Solana Pay URL:', mintAddress);
                    }
                    
                    if (mintAddress) {
                      try {
                        // Validate the mint address
                        new PublicKey(mintAddress);
                        
                        // Set claim code to the mint address
                        setClaimCode(mintAddress);
                        setEventDetails({
                          name: 'Token Claim',
                          mint: mintAddress
                        });
                        
                        // Close the scanner
                        setShowQrScanner(false);
                        
                        // If we have everything we need, submit automatically
                        if (connected && publicKey) {
                          setTimeout(() => {
                            const syntheticEvent = {
                              preventDefault: () => {}
                            } as React.FormEvent;
                            handleSubmit(syntheticEvent);
                          }, 500);
                        }
                      } catch (err) {
                        console.error('Invalid token address in Solana Pay URL:', err);
                        setError('Invalid token address in QR code');
                      }
                    } else {
                      console.error('No spl-token parameter found in Solana Pay URL');
                      setError('QR code missing token information. Make sure it contains spl-token parameter.');
                    }
                  } else {
                    // Try parsing as a regular URL
                    console.log('Attempting to parse as regular URL');
                    const url = new URL(result);
                    
                    // Extract parameters from URL
                    const params = new URLSearchParams(url.search);
                    const eventName = params.get('event');
                    const mintAddress = params.get('mint');
                    
                    // Also check for direct token address in path or query
                    // This helps support various QR code formats
                    const pathSegments = url.pathname.split('/');
                    const possibleTokenAddress = pathSegments[pathSegments.length - 1];
                    
                    // Try to find a valid token address from any source
                    const candidateAddresses = [
                      mintAddress,
                      possibleTokenAddress,
                      params.get('token'),
                      params.get('address'),
                      params.get('spl-token')
                    ].filter(Boolean) as string[];
                    
                    console.log('Candidate addresses found:', candidateAddresses);
                    
                    // Find first valid address
                    let validMintAddress = '';
                    for (const address of candidateAddresses) {
                      try {
                        new PublicKey(address);
                        validMintAddress = address;
                        console.log('Found valid address:', validMintAddress);
                        break;
                      } catch {}
                    }
                    
                    if (validMintAddress) {
                      try {
                        // Set event details
                        if (eventName) {
                          setEventDetails({
                            name: decodeURIComponent(eventName),
                            mint: validMintAddress
                          });
                        } else {
                          setClaimCode(validMintAddress);
                        }
                        
                        // Close the scanner
                        setShowQrScanner(false);
                        
                        // If we have everything we need, submit automatically
                        if (connected && publicKey) {
                          setTimeout(() => {
                            const syntheticEvent = {
                              preventDefault: () => {}
                            } as React.FormEvent;
                            handleSubmit(syntheticEvent);
                          }, 500);
                        }
                      } catch (err) {
                        console.error('Error processing valid address:', err);
                        setError('Error processing token address. Please try again.');
                      }
                    } else {
                      console.error('No valid token address found in QR code');
                      setError('QR code does not contain a valid token address. Try scanning again or enter it manually.');
                    }
                  }
                } catch (err) {
                  console.error('QR parsing error:', err);
                  
                  // Last resort: check if the scanned text is directly a valid public key
                  try {
                    new PublicKey(result);
                    console.log('Scanned text is directly a valid public key');
                    setClaimCode(result);
                    setShowQrScanner(false);
                  } catch {
                    setError('Invalid QR code format. Please scan a Solana Pay QR code or token address.');
                  }
                }
              }}
              onScanError={(errorMsg) => {
                console.error('QR scan error:', errorMsg);
                setError(errorMsg);
              }}
              onClose={() => {
                console.log('Closing QR scanner');
                setShowQrScanner(false);
              }}
            />
          </div>
        )}
        
        {/* Error Alert */}
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
        
        {/* Event Details Display */}
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
            
            <div className="space-y-4 animate-slide-up" style={{animationDelay: '100ms'}}>
              {/* Wallet connection message */}
              <p className="text-sm text-center text-muted-foreground">
                {!isWalletReady ? (
                  <>
                    <span className="font-medium">Please connect your wallet</span> using the button in the top-right corner of the page to claim your token
                    <div className="mt-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-primary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <>Your wallet is connected. Click the button below to claim your token</>
                )}
              </p>
              
              {/* Debug information removed */}
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
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    console.log('Opening QR scanner...');
                    setShowQrScanner(true);
                    // Force re-render
                    setTimeout(() => {
                      console.log('QR scanner state:', showQrScanner);
                    }, 100);
                  }}                     
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
                Scan a Solana Pay QR code or enter a token address manually. <br/>
                <span className="text-xs text-primary/80">Supports token addresses, Solana Pay URLs, and direct URLs from mint</span>
              </p>
            </div>
          </form>
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isWalletReady}
          className="relative transition-all bg-white text-black hover:bg-slate-100"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Claiming...
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
