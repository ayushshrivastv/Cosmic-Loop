/**
 * @file mint-form.tsx
 * @description MintForm component for creating and minting compressed tokens for events
 * This component handles the entire token creation process including collecting event details,
 * minting tokens, and generating QR codes for claiming the tokens.
 */

"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, Control } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { DEFAULT_TOKEN_DECIMALS } from '@/lib/constants';
import type { MintFormData } from '@/lib/types';
import { createCompressedTokenMint, mintCompressedTokens, createConnection } from '@/lib/utils/solana';
import { Keypair, PublicKey } from '@solana/web3.js';
import { createClaimUrl, createSolanaPayUrl, createSolanaPayClaimUrl, generateQrCodeDataUrl } from '@/lib/utils/qrcode';
import { SupportedChain } from '@/lib/utils/layer-zero';
import { useMemo } from 'react';
import { CHAIN_CONFIGS } from '@/lib/layer-zero-config';

// Helper function to format chain names for display
const formatChainName = (chainId: SupportedChain): string => {
  // Direct mapping for numeric enum values
  const numericChainMap: Record<number, string> = {
    1: 'Ethereum',      // ETHEREUM = 1
    10: 'Optimism',     // OPTIMISM = 10
    56: 'Binance Smart Chain', // BSC = 56
    42161: 'Arbitrum',  // ARBITRUM = 42161
    43114: 'Avalanche', // AVALANCHE = 43114
    109: 'Polygon',     // POLYGON = 109
    168: 'Solana'       // SOLANA = 168
  };
  
  // If chainId is a number, use the numeric map
  if (typeof chainId === 'number') {
    return numericChainMap[chainId] || `Unknown Chain (${chainId})`;
  }
  
  // Map string enum values to readable names
  const stringChainMap: Record<string, string> = {
    'ETHEREUM': 'Ethereum',
    'POLYGON': 'Polygon',
    'ARBITRUM': 'Arbitrum',
    'OPTIMISM': 'Optimism',
    'AVALANCHE': 'Avalanche',
    'BSC': 'Binance Smart Chain',
    'SOLANA': 'Solana'
  };
  
  // Convert to string and try the string map
  const enumValue = String(chainId);
  if (enumValue in stringChainMap) {
    return stringChainMap[enumValue];
  }
  
  // Fallback to CHAIN_CONFIGS if available
  const chainConfig = CHAIN_CONFIGS[chainId as unknown as keyof typeof CHAIN_CONFIGS];
  if (chainConfig?.name) {
    return chainConfig.name;
  }
  
  // Last resort: format the enum value itself
  return enumValue.charAt(0).toUpperCase() + enumValue.slice(1).toLowerCase();
};

// Helper function to safely convert a chain to string, handling undefined and different enum formats
const safeChainToString = (chain: SupportedChain | undefined | null): string => {
  if (chain === undefined || chain === null) {
    return "";
  }
  // Handle both string and number enum values
  return typeof chain === 'number' ? chain.toString() : String(chain);
};

// Function to generate a crosschain key to ensure uniqueness
// Generate a unique key for each chain checkbox
const generateCrossChainKey = (chain: SupportedChain | undefined | null) => {
  if (chain === undefined || chain === null) {
    return `chain-checkbox-unknown-${Math.random().toString(36).substring(2, 9)}`;
  }
  // Use the safe conversion helper
  return `chain-checkbox-${safeChainToString(chain)}`;
};

// Infer FormValues from the Zod schema to ensure type consistency
type FormValues = z.infer<typeof formSchema>;

// Type definition for cross-chain settings
interface CrossChainSettings {
  enabled: boolean;
  supportedChains: string[]; // Use strings to avoid path resolution issues
}

// Type for the token creation payload
interface TokenCreationPayload {
  eventDetails: {
    name: string;
    description: string;
    date: string;
    location?: string;
    organizerName: string;
    maxAttendees?: number;
    enableCrossChain: boolean;
    supportedChains: SupportedChain[];
  };
  tokenMetadata: {
    name: string;
    symbol: string;
    description: string;
    image?: string;
    originChain: SupportedChain;
    crossChainEnabled: boolean;
    attributes: Array<{trait_type: string; value: string | number}>;
  };
  supply: number;
  decimals: number;
  crossChainSettings?: {
    enabled: boolean;
    supportedChains: SupportedChain[];
  };
}

// Form validation schema
// Defines the structure and validation rules for the form data
const formSchema = z.object({
  // Event Details
  eventName: z.string().min(1, { message: "Event name is required" }),
  eventDescription: z.string().min(1, { message: "Event description is required" }),
  eventDate: z.string().min(1, { message: "Event date is required" }),
  eventLocation: z.string().optional(),
  organizerName: z.string().min(1, { message: "Organizer name is required" }),
  maxAttendees: z.number().min(1, { message: "Supply must be at least 1" }).optional().nullable(), // Allow null

  // Token Metadata
  tokenName: z.string().min(1, { message: "Token name is required" }),
  tokenSymbol: z.string().min(1, { message: "Token symbol is required" }),
  tokenDescription: z.string().min(1, { message: "Token description is required" }),
  tokenImage: z.string().url({ message: "Please enter a valid URL for the token image" }).optional(),
  tokenSupply: z.coerce.number().min(1, { message: "Token supply must be at least 1" }),

  // Cross-chain settings
  enableCrossChain: z.boolean().optional(), // Use .optional(), default handled by useForm
  supportedChains: z.array(z.string()).optional(), // Use .optional(), default handled by useForm
});

// Type for the form's resolver
type FormSchemaType = z.infer<typeof formSchema>;

// Type guard to check if a value is a valid SupportedChain
function isSupportedChain(value: unknown): value is SupportedChain {
  if (typeof value !== 'string') {
    return false;
  }
  return (Object.values(SupportedChain) as string[]).includes(value);
}

// Convert string to SupportedChain enum
function stringToSupportedChain(value: string): SupportedChain | undefined {
  // Check if the value exists as a key in the enum
  if (Object.keys(SupportedChain).includes(value)) {
    return SupportedChain[value as keyof typeof SupportedChain];
  }
  // Check if the value exists as a value in the enum
  const enumValues = Object.values(SupportedChain) as string[];
  if (enumValues.includes(value)) { // value is string here.
    return value as unknown as SupportedChain;
  }
  return undefined;
}

/**
 * MintForm Component
 * Handles the token creation process with a multi-step form interface
 * Includes form validation, on-chain token creation, and QR code generation
 */
export function MintForm() {
  // Always call hooks unconditionally at the top level
  const wallet = useWallet();
  const router = useRouter();
  
  // Component state
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState("event");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  
  // Cross-chain state management
  const [crossChainSettings, setCrossChainSettings] = useState<CrossChainSettings | undefined>();
  const [supportedChains, setSupportedChains] = useState<SupportedChain[]>([]);

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract wallet properties safely - only use them when client-side
  // This prevents errors during server-side rendering
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;
  const signTransaction = isClient ? wallet.signTransaction : null;
  const sendTransaction = isClient ? wallet.sendTransaction : null;

  // Available chains for cross-chain support
  // Using explicit numeric values from the enum definition in layerzero.d.ts
  const availableChains = [
    1,     // ETHEREUM = 1
    109,   // POLYGON = 109
    42161, // ARBITRUM = 42161
    10,    // OPTIMISM = 10
    43114, // AVALANCHE = 43114
    56,    // BSC = 56
  ] as SupportedChain[];

  // Initialize form
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema), 
    defaultValues: {
      eventName: "",
      eventDescription: "",
      eventDate: new Date().toISOString().split('T')[0], // Default to today
      eventLocation: "", // Empty string instead of undefined for controlled inputs
      organizerName: "",
      maxAttendees: null, // Use null for initial empty state
      tokenName: "",
      tokenSymbol: "",
      tokenDescription: "",
      tokenImage: "", // Empty string instead of undefined for controlled inputs
      tokenSupply: 1, // Default to 1 to satisfy min(1)
      enableCrossChain: false,
      supportedChains: [],
    },
  });

  // Show Solana as default
  const defaultChainSelectState = useMemo(() => {
    return new Set([SupportedChain.SOLANA]);
  }, []);

  // Update form state when cross-chain settings change
  useEffect(() => {
    if (crossChainSettings?.enabled) {
      form.setValue('supportedChains', crossChainSettings.supportedChains);
    } else {
      form.setValue('supportedChains', []);
    }
  }, [crossChainSettings, form]);

  if (!isClient) {
    return null; // Or a loading spinner, e.g., <p>Loading form...</p>
  }

  // Handler for cross-chain toggle
  const handleCrossChainToggle = (enabled: boolean) => {
    form.setValue('enableCrossChain', enabled);
    if (enabled) {
      // Get only the string enum values (not numeric indices)
      const enumValues = Object.keys(SupportedChain)
        .filter(key => isNaN(Number(key)))
        .filter(key => SupportedChain[key as keyof typeof SupportedChain] !== SupportedChain.SOLANA)
        .map(key => SupportedChain[key as keyof typeof SupportedChain].toString()); // Convert to strings for form compatibility
      
      setCrossChainSettings({
        enabled: true,
        supportedChains: enumValues,
      });
      
      // Update form value with string array
      form.setValue('supportedChains', enumValues);
    } else {
      setCrossChainSettings(undefined);
      form.setValue('supportedChains', []);
    }
  };

  /**
   * Form submission handler
   * Executes a mock token creation process using the form data
   *
   * @param values - Form values collected from the user input
   */
  // Define the submit handler with explicit type
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    // Type assertion function to convert string chains to SupportedChain enum
    const convertToSupportedChains = (chains?: string[]): SupportedChain[] => {
      if (!chains || chains.length === 0) return [];
      
      return chains
        .map(chainStr => { // Renamed chain to chainStr for clarity
          // Try to match by enum value
          const enumValues = Object.values(SupportedChain) as string[];
          if (enumValues.includes(chainStr)) {
            return chainStr as unknown as SupportedChain;
          }
          // Try to match by enum key (case-insensitive)
          const enumKeys = Object.keys(SupportedChain)
            .filter(k => isNaN(Number(k)));
          
          const matchingKey = enumKeys.find(k => 
            k.toLowerCase() === chainStr.toLowerCase());
          
          if (matchingKey) {
            return SupportedChain[matchingKey as keyof typeof SupportedChain];
          }
          
          return null;
        })
        .filter((chain): chain is SupportedChain => chain !== null);
    };
    if (!connected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert string chains to SupportedChain enum values
      const supportedChainsEnum = convertToSupportedChains(values.supportedChains);
      
      // Create the token creation payload
      const payload: TokenCreationPayload = {
        eventDetails: {
          name: values.eventName,
          description: values.eventDescription,
          date: values.eventDate,
          location: values.eventLocation,
          organizerName: values.organizerName,
          // Convert null to undefined for payload compatibility
          maxAttendees: values.maxAttendees === null ? undefined : values.maxAttendees,
          enableCrossChain: values.enableCrossChain ?? false, // Coalesce undefined to false
          supportedChains: convertToSupportedChains(values.supportedChains ?? []), // Coalesce undefined to []
        },
        tokenMetadata: {
          name: values.tokenName,
          symbol: values.tokenSymbol,
          description: values.tokenDescription,
          image: values.tokenImage,
          // Using as const to ensure TypeScript knows this is a valid SupportedChain value
          originChain: SupportedChain.SOLANA as const,
          crossChainEnabled: values.enableCrossChain ?? false, // Coalesce undefined to false
          attributes: [
            { trait_type: "Event", value: values.eventName },
            { trait_type: "Organizer", value: values.organizerName },
            { trait_type: "Date", value: values.eventDate },
            { trait_type: "Supply", value: values.tokenSupply.toString() },
          ],
        },
        supply: values.tokenSupply,
        decimals: DEFAULT_TOKEN_DECIMALS,
        crossChainSettings: values.enableCrossChain ? {
          enabled: true,
          supportedChains: supportedChainsEnum,
        } : undefined,
      };

      console.log("Creating mock token mint with data:", payload);

      // Simulate a delay to mimic the backend processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a mock mint address (random PublicKey)
      const mockMint = Keypair.generate().publicKey;
      const mockCreateSignature = "mock_create_signature_" + Date.now().toString();
      const mockMintSignature = "mock_mint_signature_" + Date.now().toString();

      console.log("Mock token mint created with address:", mockMint.toBase58());
      console.log("Mock creation signature:", mockCreateSignature);
      console.log("Mock mint signature:", mockMintSignature);

      // 3. Generate both standard claim URL and Solana Pay URL
      const baseUrl = window.location.origin;

      // Standard claim URL for direct web access
      const standardClaimUrl = createClaimUrl(
        baseUrl,
        values.eventName, // Use event name as the eventId
        mockMint // Pass the PublicKey directly, not as a string
      );

      // Solana Pay URL for wallet interaction
      const solanaPayUrl = createSolanaPayClaimUrl(
        publicKey, // The organizer's wallet as recipient
        mockMint, // The token mint
        values.eventName, // Event name as label
        `Claim your ${values.tokenName} token for ${values.eventName}` // Memo message
      );

      console.log('Generated Standard Claim URL:', standardClaimUrl);
      console.log('Generated Solana Pay URL:', solanaPayUrl);

      // Store the standard URL for display and copy purposes
      setClaimUrl(standardClaimUrl);

      // Create QR code with the Solana Pay URL for direct wallet interaction
      if (!solanaPayUrl) {
        console.error('Invalid Solana Pay URL generated');
        alert('Could not generate a valid Solana Pay URL for the QR code.');
        return;
      }
      
      console.log('Generating QR code for URL:', solanaPayUrl);
      
      try {
        // Create QR code with a more direct approach
        const qrResult = await generateQrCodeDataUrl(solanaPayUrl, {
          size: 300, // Increase size for better visibility
          errorCorrectionLevel: 'H', // Higher error correction
          includeMargin: true,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        
        console.log('QR code generation result:', qrResult.success);
        
        if (qrResult.success && qrResult.dataUrl) {
          console.log('QR code data URL generated, length:', qrResult.dataUrl.length);
          // Ensure the URL is properly formatted
          if (qrResult.dataUrl.startsWith('data:image/')) {
            setQrCodeUrl(qrResult.dataUrl);
          } else {
            console.error('Generated QR code has invalid format');
            // Force a basic QR code format
            setQrCodeUrl(`data:image/png;base64,${btoa('QR code generation error')}`);
          }
        } else {
          console.error('Failed to generate QR code:', qrResult.message);
          alert(`Error generating QR code: ${qrResult.message}`);
          // Set a placeholder
          setQrCodeUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCIgZHk9Ii4xZW0iPkZhaWxlZCB0byBsb2FkIFFSIGNvZGU8L3RleHQ+PC9zdmc+');
        }
      } catch (error) {
        console.error('Exception during QR code generation:', error);
        alert(`Exception during QR code generation: ${error instanceof Error ? error.message : String(error)}`);
        // Set a fallback QR code
        setQrCodeUrl('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCIgZHk9Ii4xZW0iPkZhaWxlZCB0byBsb2FkIFFSIGNvZGU8L3RleHQ+PC9zdmc+');
      }

      setMintSuccess(true);
    } catch (error) {
      console.error("Error minting token:", error);
      alert(`Error minting token: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Handle next button in event details tab
  const handleNextTab = () => {
    const eventFields = ["eventName", "eventDescription", "eventDate", "organizerName"] as const;
    const isValid = eventFields.every(field => {
      // Use proper type assertion - field is already a valid key of FormValues
      const result = form.trigger(field);
      return result;
    });

    if (isValid) {
      setActiveTab("token");
    }
  };

  // Handler for chain selection in the form
  const handleChainSelection = (chain: SupportedChain | undefined | null, isSelected: boolean) => {
    if (chain === undefined || chain === null) return; // Skip if chain is invalid
    
    const currentChains = form.getValues('supportedChains') || [];
    const chainStr = safeChainToString(chain);
    
    let updatedChains: string[];
    if (isSelected) {
      // Add the chain if it's not already in the array
      if (!currentChains.includes(chainStr)) {
        updatedChains = [...currentChains, chainStr];
      } else {
        updatedChains = [...currentChains];
      }
    } else {
      // Remove the chain from the array
      updatedChains = currentChains.filter(c => c !== chainStr);
    }
    
    form.setValue('supportedChains', updatedChains);
    
    // Update the cross-chain settings state
    setCrossChainSettings(prev => {
      if (!prev) return undefined;
      return {
        ...prev,
        supportedChains: updatedChains,
      };
    });
  };


  if (mintSuccess && qrCodeUrl) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 animate-slide-up">
          <h3 className="font-semibold text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Token Created Successfully!
          </h3>
          <p className="mt-1">Your event tokens have been minted and are ready to be claimed.</p>
        </div>

        <Card className="p-6 card-hover animate-slide-up" style={{animationDelay: '100ms'}}>
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Claim QR Code
            </h3>
            <p className="text-muted-foreground">Attendees can scan this QR code with any Solana Pay compatible wallet</p>

            <div className="flex justify-center my-6">
              <div className="border border-border p-4 rounded-lg inline-block bg-white shadow-lg transition-all hover:shadow-xl">
                {qrCodeUrl ? (
                  <>
                    {/* Hidden preloaded fallback image */}
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCIgZHk9Ii4xZW0iPkZhbGxiYWNrIFFSIENvZGU8L3RleHQ+PC9zdmc+" 
                      style={{ display: 'none' }} 
                      alt="Hidden Fallback" 
                    />
                    
                    {/* Actual QR code image with robust error handling */}
                    <img 
                      src={qrCodeUrl} 
                      alt="Solana Pay QR Code" 
                      width={250} 
                      height={250} 
                      className="animate-fade-in" 
                      onLoad={() => console.log('QR code image loaded successfully')} 
                      onError={(e) => {
                        console.error('QR code image failed to load');
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; // Prevent infinite error loop
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTRweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCIgZHk9Ii4xZW0iPkZhaWxlZCB0byBsb2FkIFFSIGNvZGU8L3RleHQ+PC9zdmc+'; // Fallback to base64 SVG
                        
                        // Also display error message below the image
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'text-red-500 text-xs mt-2';
                        errorDiv.textContent = 'QR code failed to load - please try downloading it';
                        
                        const parent = target.parentNode;
                        if (parent) {
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="w-[250px] h-[250px] flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <svg className="animate-spin h-8 w-8 mx-auto mb-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-500 text-sm">Generating QR code...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 text-blue-800">
              <h4 className="font-medium flex items-center text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Bridge Fees Information
              </h4>
              <p className="mt-1 text-sm">
                When attendees bridge their tokens to other chains, they will need to pay a small network fee to cover the
                LayerZero messaging costs. These fees vary by destination chain.
              </p>
            </div>

            {claimUrl && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Claim URL:</p>
                <div className="bg-muted p-2 rounded text-sm overflow-x-auto">
                  <code>{claimUrl}</code>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-6">
              <Button variant="outline" className="transition-all hover:bg-secondary" onClick={() => {
                if (qrCodeUrl) {
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = 'claim-qr-code.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download QR Code
              </Button>
              <Button onClick={() => router.push('/')} className="transition-all hover:bg-primary/90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="event">Event Details</TabsTrigger>
            <TabsTrigger value="token">Token Configuration</TabsTrigger>
            <TabsTrigger value="crosschain">Cross-Chain Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="event" className="space-y-4">
            <FormField
              control={form.control as Control<FormValues>}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Solana Hackathon 2025" {...field} />
                  </FormControl>
                  <FormDescription>The name of your event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as Control<FormValues>}
              name="eventDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Join us for an exciting hackathon..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Describe your event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as Control<FormValues>}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as Control<FormValues>}
                name="eventLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as Control<FormValues>}
                name="organizerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Solana Foundation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as Control<FormValues>}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attendees (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 1000"
                        {...field} // Spread field props first
                        onChange={(e) => {
                          const value = e.target.value;
                          // If input is cleared, set form value to null, otherwise parse to int
                          field.onChange(value === "" ? null : parseInt(value, 10));
                        }}
                        // Ensure input value is an empty string if field.value is null (or undefined)
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of attendees for the event. This can also represent the token supply if not set separately.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-white text-black hover:bg-slate-100 transition-all"
              >
                Next: Token Configuration
              </Button>
            </div>
          </TabsContent>

          {/* Token Configuration Tab */}
          <TabsContent value="token" className="space-y-4">
            <FormField
              control={form.control as Control<FormValues>}
              name="tokenName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Solana Hackathon Token" {...field} />
                  </FormControl>
                  <FormDescription>The name of your token</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control as Control<FormValues>}
                name="tokenSymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="POP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as Control<FormValues>}
                name="tokenSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token Supply</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Number of tokens to mint</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as Control<FormValues>}
              name="tokenDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="This token verifies attendance at the Solana Hackathon 2025"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as Control<FormValues>}
              name="tokenImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.png" {...field} />
                  </FormControl>
                  <FormDescription>URL to an image for your token</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as Control<FormValues>}
              name="enableCrossChain"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => {
                        field.onChange(value);
                        handleCrossChainToggle(value === true);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Enable Cross-Chain Functionality
                    </FormLabel>
                    <FormDescription>
                      Allow attendees to bridge their tokens to other blockchains using LayerZero
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setActiveTab("event")}>
                Back to Event Details
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("crosschain")}
                className="bg-white text-black hover:bg-slate-100 transition-all"
              >
                Next: Cross-Chain Settings
              </Button>
            </div>
          </TabsContent>

          {/* Cross-Chain Settings Tab */}
          <TabsContent value="crosschain" className="space-y-4">
            <div className="bg-muted rounded-lg p-4 mb-4">
              <h3 className="font-medium text-lg mb-2">Cross-Chain Settings</h3>
              <p className="text-muted-foreground text-sm">
                Configure which blockchains your event token can be bridged to. Attendees will be able to transfer their tokens
                to these chains after claiming them on Solana.
              </p>
            </div>

            {form.watch('enableCrossChain') ? (
              <div className="space-y-4">
                <FormField
                  control={form.control as Control<FormValues>}
                  name="supportedChains"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Supported Blockchains</FormLabel>
                        <FormDescription>
                          Select which blockchains attendees can bridge their tokens to
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableChains.map((chain) => (
                          <div key={generateCrossChainKey(chain)} className="flex items-center space-x-2">
                            <FormField
                              key={`chain-checkbox-${chain}`}
                              control={form.control as Control<FormValues>}
                              name="supportedChains"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        id={generateCrossChainKey(chain)}
                                        checked={field.value?.includes(safeChainToString(chain))}
                                        onCheckedChange={(checked) => {
                                          handleChainSelection(chain, checked === true);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {formatChainName(chain)}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                            <FormDescription>
                              Allow attendees to bridge their tokens to other blockchains using LayerZero
                            </FormDescription>
                          </div>
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 text-blue-800">
                  <h4 className="font-medium flex items-center text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Bridge Fees Information
                  </h4>
                  <p className="mt-1 text-sm">
                    When attendees bridge their tokens to other chains, they will need to pay a small network fee to cover the
                    LayerZero messaging costs. These fees vary by destination chain.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Cross-Chain Functionality Disabled</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  To configure cross-chain settings, please enable cross-chain functionality in the Token Configuration tab.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue('enableCrossChain', true);
                    setActiveTab("token");
                  }}
                >
                  Enable Cross-Chain Functionality
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setActiveTab("token")}>
                Back to Token Configuration
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("review")}
                className="bg-white text-black hover:bg-slate-100 transition-all"
              >
                Next: Review & Submit
              </Button>
            </div>
          </TabsContent>

          {/* Review & Submit Tab */}
          <TabsContent value="review" className="space-y-4">
            <div className="bg-muted rounded-lg p-4 mb-4">
              <h3 className="font-medium text-lg mb-2">Review & Submit</h3>
              <p className="text-muted-foreground text-sm">
                Review your event and token details before creating your token.
              </p>
            </div>

            {form.watch('enableCrossChain') ? (
              <div className="space-y-4">
                <FormField
                  control={form.control as Control<FormValues>}
                  name="supportedChains"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Supported Blockchains</FormLabel>
                        <FormDescription>
                          Select which blockchains attendees can bridge their tokens to
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableChains.map((chain) => chain !== SupportedChain.SOLANA && (
                          <div key={generateCrossChainKey(chain)} className="flex items-center space-x-2">
                            <FormField
                              key={`chain-checkbox-${chain}`}
                              control={form.control as Control<FormValues>}
                              name="supportedChains"
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        id={generateCrossChainKey(chain)}
                                        checked={field.value?.includes(safeChainToString(chain))}
                                        onCheckedChange={(checked) => {
                                          handleChainSelection(chain, checked === true);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {formatChainName(chain)}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 text-blue-800">
                  <h4 className="font-medium flex items-center text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Bridge Fees Information
                  </h4>
                  <p className="mt-1 text-sm">
                    When attendees bridge their tokens to other chains, they will need to pay a small network fee to cover the
                    LayerZero messaging costs. These fees vary by destination chain.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Cross-Chain Functionality Disabled</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  To configure cross-chain settings, please enable cross-chain functionality in the Token Configuration tab.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.setValue('enableCrossChain', true);
                    setActiveTab("token");
                  }}
                >
                  Enable Cross-Chain Functionality
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button type="button" variant="outline" onClick={() => setActiveTab("token")}>
                Back to Token Configuration
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="relative transition-all bg-white text-black hover:bg-slate-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Token...
                    </span>
                  </>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 001.414-1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Create Token
                  </span>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
