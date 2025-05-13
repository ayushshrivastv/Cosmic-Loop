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
import { useForm } from 'react-hook-form';
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
import { SupportedChain, formatChainName } from '@/lib/utils/layer-zero';
import { CHAIN_CONFIGS } from '@/lib/layer-zero-config';

// Type definition for form values inferred from the Zod schema
type FormValues = z.infer<typeof formSchema>;

// Form validation schema
// Defines the structure and validation rules for the form data
const formSchema = z.object({
  // Event Details
  eventName: z.string().min(3, { message: "Event name must be at least 3 characters" }),
  eventDescription: z.string().min(10, { message: "Description must be at least 10 characters" }),
  eventDate: z.string().min(1, { message: "Event date is required" }),
  eventLocation: z.string().optional(),
  organizerName: z.string().min(2, { message: "Organizer name is required" }),
  maxAttendees: z.coerce.number().int().positive().optional(),

  // Token Metadata
  tokenName: z.string().min(3, { message: "Token name must be at least 3 characters" }),
  tokenSymbol: z.string().min(2, { message: "Token symbol must be at least 2 characters" }),
  tokenDescription: z.string().min(10, { message: "Token description must be at least 10 characters" }),
  tokenImage: z.string().url({ message: "Please enter a valid URL" }).optional(),
  tokenSupply: z.coerce.number().int().positive({ message: "Supply must be a positive number" }),

  // Cross-chain settings
  enableCrossChain: z.boolean().default(false),
  supportedChains: z.array(z.string()).optional(),
});

/**
 * MintForm Component
 * Handles the token creation process with a multi-step form interface
 * Includes form validation, on-chain token creation, and QR code generation
 */
export function MintForm() {
  // Always call hooks unconditionally in the same order
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("event");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extract wallet properties safely - only use them when client-side
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;
  const signTransaction = isClient ? wallet.signTransaction : null;
  const sendTransaction = isClient ? wallet.sendTransaction : null;

  // Available chains for cross-chain support
  const availableChains = [
    SupportedChain.Ethereum,
    SupportedChain.Polygon,
    SupportedChain.Arbitrum,
    SupportedChain.Optimism,
    SupportedChain.Avalanche,
    SupportedChain.BinanceSmartChain,
  ];

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      eventDescription: "",
      eventDate: new Date().toISOString().split('T')[0],
      eventLocation: "",
      organizerName: "",
      maxAttendees: 100,
      tokenName: "",
      tokenSymbol: "POP",
      tokenDescription: "",
      tokenImage: "https://picsum.photos/300/300", // Placeholder image
      tokenSupply: 100,
      enableCrossChain: false,
      supportedChains: [],
    },
  });

  if (!isClient) {
    return null; // Or a loading spinner, e.g., <p>Loading form...</p>
  }

  /**
   * Form submission handler
   * Executes a mock token creation process using the form data
   *
   * @param values - Form values collected from the user input
   */
  const onSubmit = async (values: FormValues) => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format data for token minting
      const mintData: MintFormData = {
        eventDetails: {
          name: values.eventName,
          description: values.eventDescription,
          date: values.eventDate,
          location: values.eventLocation,
          organizerName: values.organizerName,
          maxAttendees: values.maxAttendees,
          enableCrossChain: values.enableCrossChain,
          supportedChains: values.supportedChains?.map(chain => chain as SupportedChain),
        },
        tokenMetadata: {
          name: values.tokenName,
          symbol: values.tokenSymbol,
          description: values.tokenDescription,
          image: values.tokenImage,
          originChain: SupportedChain.Solana,
          crossChainEnabled: values.enableCrossChain,
          attributes: [
            { trait_type: "Event", value: values.eventName },
            { trait_type: "Date", value: values.eventDate },
            { trait_type: "Organizer", value: values.organizerName },
            { trait_type: "Cross-Chain Enabled", value: values.enableCrossChain ? "Yes" : "No" },
            ...(values.enableCrossChain ? [{ trait_type: "Origin Chain", value: "Solana" }] : []),
          ],
        },
        supply: values.tokenSupply,
        decimals: DEFAULT_TOKEN_DECIMALS,
        crossChainSettings: values.enableCrossChain ? {
          enabled: true,
          supportedChains: values.supportedChains?.map(chain => chain as SupportedChain) || [],
        } : undefined,
      };

      console.log("Creating mock token mint with data:", mintData);

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
      const qrCodeDataUrl = await generateQrCodeDataUrl(solanaPayUrl);
      setQrCodeUrl(qrCodeDataUrl);

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
    const eventFields = ["eventName", "eventDescription", "eventDate", "organizerName"];
    const isValid = eventFields.every(field => {
      const result = form.trigger(field as keyof FormValues);
      return result;
    });

    if (isValid) {
      setActiveTab("token");
    }
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
                <img src={qrCodeUrl} alt="Solana Pay QR Code" width={250} height={250} className="animate-fade-in" />
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="font-medium mb-1">💡 How It Works</p>
              <p className="text-muted-foreground text-xs">This QR code contains a Solana Pay URL that will trigger a token claim transaction when scanned with a compatible wallet app like Phantom or Solflare.</p>
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

          {/* Event Details Tab */}
          <TabsContent value="event" className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attendees (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
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
              control={form.control}
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
                control={form.control}
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
                control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="enableCrossChain"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
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
                  control={form.control}
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
                          <FormField
                            key={chain}
                            control={form.control}
                            name="supportedChains"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  className="flex flex-row items-start space-x-3 space-y-0 border rounded-md p-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(chain)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValue, chain])
                                          : field.onChange(currentValue.filter((value) => value !== chain));
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex items-center space-x-2">
                                    <img
                                      src={CHAIN_CONFIGS[chain].logo}
                                      alt={CHAIN_CONFIGS[chain].name}
                                      className="w-6 h-6"
                                    />
                                    <FormLabel className="font-normal">
                                      {CHAIN_CONFIGS[chain].name}
                                    </FormLabel>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
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
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
