import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupportedChain, formatChainName, getChainLogoUrl } from '@/lib/utils/layer-zero';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  bridgeNFT,
  estimateBridgeFee,
  getNFTsByOwner,
  getSupportedChains,
  subscribeToBridgeUpdates,
  type BridgeOperation,
  type NFT,
  type ChainInfo,
  type BridgeFeeEstimate
} from '@/lib/api-client';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useConnect, useDisconnect, useBalance, useAccount, useNetwork } from 'wagmi';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Enhanced bridge form with better loading states and error handling
 * Properly handles LayerZero cross-chain transactions with real-time updates
 */
export default function BridgeForm() {
  // State variables
  const [sourceChain, setSourceChain] = useState<SupportedChain>(SupportedChain.Solana);
  const [destinationChain, setDestinationChain] = useState<SupportedChain>(SupportedChain.Ethereum);
  const [nftId, setNftId] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [bridgeFee, setBridgeFee] = useState<BridgeFeeEstimate | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingNfts, setLoadingNfts] = useState<boolean>(false);
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(false);
  const [bridgeStatus, setBridgeStatus] = useState<BridgeOperation | null>(null);
  const [supportedChains, setSupportedChains] = useState<ChainInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bridgeProgress, setBridgeProgress] = useState<number>(0);

  // Progress animation interval
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Wallet connections
  const solanaWallet = useSolanaWallet();
  const { address: evmAddress } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();

  // Function to update bridge progress
  const startBridgeProgressAnimation = useCallback(() => {
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // Reset progress
    setBridgeProgress(5);

    // Start at 5% and increase randomly
    progressInterval.current = setInterval(() => {
      setBridgeProgress((prev) => {
        // Increment randomly between 1-3% but never exceed 95%
        const increment = 1 + Math.random() * 2;
        const newProgress = prev + increment;
        return Math.min(newProgress, 95);
      });
    }, 1500);

    // Return a function to stop the animation
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  // Get supported chains on component mount
  useEffect(() => {
    async function fetchSupportedChains() {
      try {
        setLoading(true);
        setError(null);
        const chains = await getSupportedChains();
        setSupportedChains(chains);
      } catch (error) {
        console.error('Error fetching supported chains:', error);
        setError('Failed to fetch supported chains. Please try again later.');
        toast.error('Failed to fetch supported chains');
      } finally {
        setLoading(false);
      }
    }

    fetchSupportedChains();
  }, []);

  // Get owned NFTs when wallet or chain changes
  useEffect(() => {
    async function fetchOwnedNFTs() {
      if ((sourceChain === SupportedChain.Solana && !solanaWallet.connected) ||
          (sourceChain !== SupportedChain.Solana && !evmAddress)) {
        setOwnedNFTs([]);
        return;
      }

      try {
        setLoadingNfts(true);
        setError(null);
        const walletAddress = sourceChain === SupportedChain.Solana
          ? solanaWallet.publicKey?.toBase58()
          : evmAddress;

        if (!walletAddress) return;

        const nfts = await getNFTsByOwner(walletAddress, sourceChain);
        setOwnedNFTs(nfts);

        // Auto-select first NFT if available
        if (nfts.length > 0 && !selectedNFT) {
          setSelectedNFT(nfts[0]);
          setNftId(nfts[0].id);
        }
      } catch (error) {
        console.error('Error fetching owned NFTs:', error);
        setError('Failed to fetch your NFTs. Please try again or check your wallet connection.');
        toast.error('Failed to fetch your NFTs');
      } finally {
        setLoadingNfts(false);
      }
    }

    fetchOwnedNFTs();
  }, [sourceChain, solanaWallet.connected, solanaWallet.publicKey, evmAddress, chain, selectedNFT]);

  // Update fee estimate when NFT or destination chain changes
  useEffect(() => {
    async function updateFeeEstimate() {
      if (!selectedNFT || !sourceChain || !destinationChain) {
        setBridgeFee(null);
        return;
      }

      try {
        setLoadingEstimate(true);
        const estimate = await estimateBridgeFee(sourceChain, destinationChain, selectedNFT.id);
        setBridgeFee(estimate);
      } catch (error) {
        console.error('Error estimating bridge fee:', error);
        toast.error('Failed to estimate bridge fee');
        setBridgeFee(null);
      } finally {
        setLoadingEstimate(false);
      }
    }

    updateFeeEstimate();
  }, [selectedNFT, sourceChain, destinationChain]);

  // Listen for bridge operation updates
  useEffect(() => {
    if (!bridgeStatus) return;

    // Show initial progress toast
    if (bridgeStatus.status === 'pending' || bridgeStatus.status === 'in_progress') {
      toast.success('Bridge operation initiated', {
        description: 'Your NFT is being transferred across chains. This may take a few minutes.',
        duration: 5000,
      });

      // Start progress animation
      const stopProgressAnimation = startBridgeProgressAnimation();

      // We'll clean this up if component unmounts or bridge completes
      return stopProgressAnimation;
    }

    // Set up subscription
    const { unsubscribe } = subscribeToBridgeUpdates(bridgeStatus.id, (updatedOperation) => {
      setBridgeStatus(updatedOperation);

      if (updatedOperation.status === 'completed') {
        // Set progress to 100% when completed
        setBridgeProgress(100);

        // Clear progress animation
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }

        toast.success('Bridge operation completed!', {
          description: 'Your NFT has been successfully transferred to the destination chain.',
          duration: 10000,
        });
      } else if (updatedOperation.status === 'failed') {
        // Reset progress on failure
        setBridgeProgress(0);

        // Clear progress animation
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }

        toast.error('Bridge operation failed', {
          description: updatedOperation.errorMessage || 'Unknown error occurred during the bridge operation.',
          duration: 10000,
        });
      }
    });

    return () => {
      unsubscribe();

      // Also clear progress animation if component unmounts
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [bridgeStatus, startBridgeProgressAnimation]);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, []);

  // Handle NFT selection
  const handleNFTSelect = (nftId: string) => {
    const nft = ownedNFTs.find(n => n.id === nftId);
    setSelectedNFT(nft || null);
    setNftId(nftId);
  };

  // Handle source chain change
  const handleSourceChainChange = (chain: string) => {
    setSourceChain(chain as SupportedChain);
    setSelectedNFT(null);
    setNftId('');

    // Don't allow same source and destination
    if (chain === destinationChain) {
      setDestinationChain(chain === SupportedChain.Solana ? SupportedChain.Ethereum : SupportedChain.Solana);
    }
  };

  // Handle destination chain change
  const handleDestinationChainChange = (chain: string) => {
    setDestinationChain(chain as SupportedChain);

    // Set default destination address if wallet is connected
    if (chain === SupportedChain.Solana && solanaWallet.connected) {
      setDestinationAddress(solanaWallet.publicKey?.toBase58() || '');
    } else if (chain !== SupportedChain.Solana && evmAddress) {
      setDestinationAddress(evmAddress);
    }
  };

  // Connect wallet based on selected chain
  const connectWallet = () => {
    if (sourceChain === SupportedChain.Solana) {
      // This will trigger the Solana wallet modal
      (document.querySelector('[data-wallet-adapter-button-trigger]') as HTMLElement)?.click();
    } else {
      // This will trigger the EVM wallet modal
      connect();
    }
  };

  // Validate input before bridging
  const validateBridgeInputs = (): boolean => {
    // Reset error
    setError(null);

    // Check if NFT is selected
    if (!selectedNFT) {
      setError('Please select an NFT to bridge');
      toast.error('Please select an NFT to bridge');
      return false;
    }

    // Check if destination address is provided
    if (!destinationAddress) {
      setError('Please enter a destination address');
      toast.error('Please enter a destination address');
      return false;
    }

    // Validate address format based on chain
    if (destinationChain === SupportedChain.Solana) {
      // Validate Solana address
      try {
        // Basic validation - should be 32-44 characters and start with a number or letter
        if (!/^[0-9a-zA-Z]{32,44}$/.test(destinationAddress)) {
          throw new Error('Invalid Solana address format');
        }
      } catch (error) {
        setError('Invalid Solana wallet address format');
        toast.error('Invalid destination address', {
          description: 'Please enter a valid Solana wallet address'
        });
        return false;
      }
    } else {
      // Validate EVM address
      if (!/^0x[a-fA-F0-9]{40}$/.test(destinationAddress)) {
        setError('Invalid EVM wallet address format. Should start with 0x followed by 40 hex characters.');
        toast.error('Invalid destination address', {
          description: 'Please enter a valid EVM wallet address starting with 0x'
        });
        return false;
      }
    }

    return true;
  };

  // Handle bridge submission
  const handleBridge = async () => {
    // Validate inputs
    if (!validateBridgeInputs()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const sourceWalletAddress = sourceChain === SupportedChain.Solana
        ? solanaWallet.publicKey?.toBase58()
        : evmAddress;

      if (!sourceWalletAddress) {
        setError('No source wallet connected');
        toast.error('No source wallet connected');
        return;
      }

      // Start bridge progress animation
      startBridgeProgressAnimation();

      // Initiate bridge operation
      const result = await bridgeNFT(
        selectedNFT.id,
        sourceChain,
        sourceWalletAddress,
        destinationChain,
        destinationAddress
      );

      setBridgeStatus(result);

      // Toast notification handled in the useEffect that watches bridgeStatus
    } catch (error) {
      console.error('Error bridging NFT:', error);
      setError('Failed to initiate bridge operation. Please try again later.');
      toast.error('Failed to initiate bridge operation', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });

      // Stop progress animation on error
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      setBridgeProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Get connected wallet address for current chain
  const getConnectedWalletAddress = () => {
    if (sourceChain === SupportedChain.Solana) {
      return solanaWallet.connected ? solanaWallet.publicKey?.toBase58() : null;
    } else {
      return evmAddress || null;
    }
  };

  // Check if wallet is connected for current chain
  const isWalletConnected = () => {
    return sourceChain === SupportedChain.Solana ? solanaWallet.connected : !!evmAddress;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Bridge NFT</CardTitle>
        <CardDescription>Move your NFT between different blockchains</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bridgeStatus && bridgeStatus.status !== 'completed' && bridgeStatus.status !== 'failed' && (
          <div className="mb-6 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {bridgeStatus.status === 'pending' ? 'Preparing bridge...' : 'Transferring across chains...'}
              </span>
              <span className="text-xs text-muted-foreground">{Math.round(bridgeProgress)}%</span>
            </div>
            <Progress value={bridgeProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              This process may take several minutes to complete. Please do not close this page.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Source Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="source-chain">Source Chain</Label>
            <Select
              value={sourceChain}
              onValueChange={handleSourceChainChange}
              disabled={loading || bridgeStatus?.status === 'in_progress'}
            >
              <SelectTrigger id="source-chain">
                <SelectValue placeholder="Select source chain" />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((chain) => (
                  <SelectItem
                    key={chain.chain}
                    value={chain.chain}
                    disabled={chain.chain === destinationChain || !chain.isSupported ||
                             bridgeStatus?.status === 'in_progress'}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        <Image
                          src={chain.logo}
                          alt={chain.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                      {chain.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-2">
            {isWalletConnected() ? (
              <div className="bg-primary-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Connected Wallet</p>
                    <p className="text-xs text-gray-500 truncate w-60">{getConnectedWalletAddress()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sourceChain === SupportedChain.Solana ? solanaWallet.disconnect() : disconnect()}
                    disabled={loading || bridgeStatus?.status === 'in_progress'}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                className="w-full"
                disabled={loading || bridgeStatus?.status === 'in_progress'}
              >
                Connect {formatChainName(sourceChain)} Wallet
              </Button>
            )}
          </div>

          {/* NFT Selection (Only shown if wallet is connected) */}
          {isWalletConnected() && (
            <div className="space-y-2">
              <Label htmlFor="nft-select">Select NFT</Label>
              {loadingNfts ? (
                <div className="w-full space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : ownedNFTs.length > 0 ? (
                <Select
                  value={nftId}
                  onValueChange={handleNFTSelect}
                  disabled={loading || bridgeStatus?.status === 'in_progress'}
                >
                  <SelectTrigger id="nft-select">
                    <SelectValue placeholder="Select an NFT to bridge" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownedNFTs.map((nft) => (
                      <SelectItem
                        key={nft.id}
                        value={nft.id}
                        disabled={bridgeStatus?.status === 'in_progress'}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 mr-2 bg-gray-100 rounded overflow-hidden">
                            {nft.metadata?.image && (
                              <Image
                                src={nft.metadata.image}
                                alt={nft.metadata?.name || 'NFT'}
                                width={32}
                                height={32}
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{nft.metadata?.name || `NFT #${nft.tokenId}`}</p>
                            <p className="text-xs text-gray-500">{nft.collection.name}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="bg-muted p-3 rounded-md text-center">
                  <p className="text-sm">No NFTs found on {formatChainName(sourceChain)}</p>
                </div>
              )}
            </div>
          )}

          {/* Destination Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="destination-chain">Destination Chain</Label>
            <Select
              value={destinationChain}
              onValueChange={handleDestinationChainChange}
              disabled={loading || bridgeStatus?.status === 'in_progress'}
            >
              <SelectTrigger id="destination-chain">
                <SelectValue placeholder="Select destination chain" />
              </SelectTrigger>
              <SelectContent>
                {supportedChains.map((chain) => (
                  <SelectItem
                    key={chain.chain}
                    value={chain.chain}
                    disabled={chain.chain === sourceChain || !chain.isSupported ||
                             bridgeStatus?.status === 'in_progress'}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        <Image
                          src={chain.logo}
                          alt={chain.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                      {chain.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destination Address */}
          <div className="space-y-2">
            <Label htmlFor="destination-address">Destination Address</Label>
            <Input
              id="destination-address"
              placeholder={`Enter ${formatChainName(destinationChain)} address`}
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              disabled={loading || bridgeStatus?.status === 'in_progress'}
            />
            <p className="text-xs text-muted-foreground">
              This address must be a valid wallet on the {formatChainName(destinationChain)} network
            </p>
          </div>

          {/* Fee Information (Only shown if NFT is selected) */}
          {selectedNFT && (
            <div className="bg-muted p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Bridge Fee Estimate</h4>
              {loadingEstimate ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : bridgeFee ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Fee:</span>
                    <span>{bridgeFee.estimatedFee} {bridgeFee.feeToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Time:</span>
                    <span>{Math.round(bridgeFee.estimatedTimeSeconds / 60)} minutes</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Unable to estimate fees at this time. You can still proceed with the bridge.
                </p>
              )}
            </div>
          )}

          {/* Bridge Status (Only shown if a bridge operation is in progress) */}
          {bridgeStatus && (
            <div className={`p-4 rounded-md ${
              bridgeStatus.status === 'completed' ? 'bg-green-50 border border-green-200' :
              bridgeStatus.status === 'failed' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <h4 className="text-sm font-medium mb-2">
                Bridge Status: {bridgeStatus.status.charAt(0).toUpperCase() + bridgeStatus.status.slice(1)}
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Operation ID:</span>
                  <span className="truncate max-w-[200px]">{bridgeStatus.id}</span>
                </div>
                {bridgeStatus.sourceTransactionHash && (
                  <div className="flex justify-between">
                    <span>Source TX:</span>
                    <span className="truncate max-w-[200px]">{bridgeStatus.sourceTransactionHash}</span>
                  </div>
                )}
                {bridgeStatus.destinationTransactionHash && (
                  <div className="flex justify-between">
                    <span>Destination TX:</span>
                    <span className="truncate max-w-[200px]">{bridgeStatus.destinationTransactionHash}</span>
                  </div>
                )}
                {bridgeStatus.errorMessage && (
                  <div className="mt-2 text-red-600">{bridgeStatus.errorMessage}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!selectedNFT || !destinationAddress || loading || (bridgeStatus?.status === 'in_progress')}
          onClick={handleBridge}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : bridgeStatus?.status === 'in_progress' ? (
            'Bridge In Progress...'
          ) : bridgeStatus?.status === 'completed' ? (
            'Bridge Completed'
          ) : (
            'Bridge NFT'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
