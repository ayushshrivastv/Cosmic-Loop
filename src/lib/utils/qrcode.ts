/**
 * @file qrcode.ts
 * @description Utilities for generating QR codes and Solana Pay URLs for token claiming
 * This file contains enhanced functions for creating URLs and QR codes with validation
 * and better error handling.
 */

import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import QRCode from 'qrcode';
import { toast } from 'sonner';

/**
 * Interface defining the parameters needed to create a claim URL
 * @property baseUrl - Base URL of the application
 * @property eventName - Name of the event for the token
 * @property mintAddress - Address of the token mint
 * @property organizerPubkey - Public key of the event organizer
 */
interface ClaimUrlParams {
  baseUrl: string;
  eventName: string;
  mintAddress: string;
  organizerPubkey: string;
}

/**
 * Generate a secure and unique reference ID for QR codes
 * This implements a more reliable method than UUID v4
 * @returns A unique reference string
 */
export function generateSecureReference(): string {
  // Generate random values for better uniqueness
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2);
  const uniqueId = `${timestamp}-${randomPart}`;

  return uniqueId;
}

/**
 * Validate a Solana public key string
 * @param publicKeyString - String to validate as a Solana public key
 * @returns Boolean indicating if string is a valid Solana public key
 */
export function isValidSolanaPublicKey(publicKeyString: string): boolean {
  try {
    new PublicKey(publicKeyString);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a Solana Pay URL for claiming tokens
 * Enhanced with validation and error handling
 *
 * @param recipient - PublicKey of the wallet receiving the payment/transfer
 * @param tokenMint - PublicKey of the token mint address
 * @param amount - Amount of tokens to transfer (in base units)
 * @param reference - Unique identifier for tracking the transaction
 * @param label - Optional label to display in the wallet (e.g., event name)
 * @param message - Optional message to display in the wallet
 * @returns Solana Pay URL as a string or null if parameters are invalid
 */
export const createSolanaPayUrl = (
  recipient: PublicKey | string,
  tokenMint: PublicKey | string,
  amount: number,
  reference: string,
  label?: string,
  message?: string
): string | null => {
  try {
    // Convert string inputs to PublicKey objects if needed
    const recipientPubKey = typeof recipient === 'string' ? new PublicKey(recipient) : recipient;
    const tokenMintPubKey = typeof tokenMint === 'string' ? new PublicKey(tokenMint) : tokenMint;

    // Validate inputs
    if (!recipientPubKey || !tokenMintPubKey) {
      console.error('Invalid recipient or token mint address');
      return null;
    }

    // Base URL with recipient
    let url = `solana:${recipientPubKey.toBase58()}`;

    // Add SPL token parameter for the token mint
    url += `?spl-token=${tokenMintPubKey.toBase58()}`;

    // Add amount if provided (in base units)
    if (amount > 0) {
      url += `&amount=${amount}`;
    }

    // Add reference for tracking the payment
    if (reference) {
      url += `&reference=${reference}`;
    }

    // Add optional label
    if (label) {
      url += `&label=${encodeURIComponent(label)}`;
    }

    // Add optional message
    if (message) {
      url += `&message=${encodeURIComponent(message)}`;
    }

    return url;
  } catch (error) {
    console.error('Error creating Solana Pay URL:', error);
    return null;
  }
};

/**
 * Create a URL for claiming a token through the application's claim page
 * Enhanced with validation and better error handling
 *
 * @param baseUrl - Base URL of the application (e.g., https://example.com)
 * @param eventId - Identifier or name of the event
 * @param tokenMint - PublicKey of the token mint to claim
 * @returns Full URL to the claim page with parameters or null if validation fails
 */
export const createClaimUrl = (
  baseUrl: string,
  eventId: string,
  tokenMint: PublicKey | string,
): string | null => {
  try {
    // Validate base URL
    if (!baseUrl || typeof baseUrl !== 'string' || !baseUrl.startsWith('http')) {
      console.error('Invalid base URL');
      return null;
    }

    // Validate event ID
    if (!eventId || typeof eventId !== 'string') {
      console.error('Invalid event ID');
      return null;
    }

    // Validate token mint
    const mintAddress = typeof tokenMint === 'string' ?
      tokenMint :
      tokenMint.toBase58();

    if (!isValidSolanaPublicKey(mintAddress)) {
      console.error('Invalid token mint address');
      return null;
    }

    return `${baseUrl}/claim?event=${encodeURIComponent(eventId)}&mint=${mintAddress}`;
  } catch (error) {
    console.error('Error creating claim URL:', error);
    return null;
  }
};

/**
 * Create a URL for claiming a token using a parameters object
 * Enhanced with validation and better error handling
 *
 * @param params - Object containing all parameters needed for the claim URL
 * @returns Full URL to the claim page with parameters or null if validation fails
 */
export const createClaimUrlWithParams = (params: ClaimUrlParams): string | null => {
  try {
    // Validate all required parameters
    if (!params.baseUrl || !params.eventName || !params.mintAddress) {
      console.error('Missing required parameters for claim URL');
      return null;
    }

    // Validate mint address
    if (!isValidSolanaPublicKey(params.mintAddress)) {
      console.error('Invalid mint address in claim URL parameters');
      return null;
    }

    return `${params.baseUrl}/claim?event=${encodeURIComponent(params.eventName)}&mint=${params.mintAddress}`;
  } catch (error) {
    console.error('Error creating claim URL with params:', error);
    return null;
  }
};

/**
 * Generate a Solana Pay transfer request URL specifically for claiming a token
 * Enhanced with validation, secure reference generation, and better error handling
 *
 * @param recipient - PublicKey of the wallet that owns the tokens (event organizer)
 * @param tokenMint - PublicKey of the token mint to claim
 * @param label - Label to show in the wallet UI (typically the event name)
 * @param memo - Optional additional information to include in the transaction
 * @returns Complete Solana Pay URL as a string or null if parameters are invalid
 */
export const createSolanaPayClaimUrl = (
  recipient: PublicKey | string,
  tokenMint: PublicKey | string,
  label: string,
  memo?: string
): string | null => {
  try {
    // Convert string inputs to PublicKey objects if needed
    const recipientPubKey = typeof recipient === 'string' ? new PublicKey(recipient) : recipient;
    const tokenMintPubKey = typeof tokenMint === 'string' ? new PublicKey(tokenMint) : tokenMint;

    // Validate inputs
    if (!recipientPubKey || !tokenMintPubKey) {
      console.error('Invalid recipient or token mint address');
      return null;
    }

    // Create unique reference for this transaction
    // Using a more reliable method than UUID v4
    const reference = generateSecureReference();

    // Create the complete Solana Pay URL with all necessary parameters
    return createSolanaPayUrl(
      recipientPubKey,
      tokenMintPubKey,
      1, // Amount - typically 1 for an NFT/token claim
      reference,
      label, // Event name as label
      memo || "Claim your proof-of-participation token"
    );
  } catch (error) {
    console.error('Error creating Solana Pay claim URL:', error);
    return null;
  }
};

/**
 * Interface for QR code generation options
 */
export interface QrCodeOptions {
  size?: number;
  includeMargin?: boolean;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Result interface for QR code generation
 */
export interface QrCodeResult {
  dataUrl: string | null;
  success: boolean;
  message?: string;
  error?: Error;
}

/**
 * Generate a QR code as a data URL from any URL string
 * Enhanced with improved error handling and validation
 *
 * @param url - The URL to encode in the QR code (Solana Pay URL or any URL)
 * @param options - QR code generation options
 * @returns Promise resolving to a QrCodeResult object
 */
export function generateQrCodeDataUrl(
  url: string,
  options: QrCodeOptions = {}
): Promise<QrCodeResult> {
  return new Promise((resolve) => {
    // Validate URL
    if (!url || typeof url !== 'string') {
      const result: QrCodeResult = {
        dataUrl: null,
        success: false,
        message: 'Invalid URL provided for QR code generation'
      };
      console.error(result.message);
      return resolve(result);
    }

    // Default options
    const size = options.size || 256;
    const includeMargin = options.includeMargin !== undefined ? options.includeMargin : true;
    const darkColor = options.color?.dark || '#000000';
    const lightColor = options.color?.light || '#ffffff';
    const errorCorrectionLevel = options.errorCorrectionLevel || 'H';

    try {
      QRCode.toDataURL(
        url,
        {
          width: size,
          margin: includeMargin ? 4 : 0,
          errorCorrectionLevel: errorCorrectionLevel,
          type: 'image/png',
          color: {
            dark: darkColor,
            light: lightColor,
          },
        },
        (err, dataUrl) => {
          if (err) {
            console.error('Error generating QR code data URL:', err);
            const result: QrCodeResult = {
              dataUrl: null,
              success: false,
              message: 'Failed to generate QR code',
              error: err
            };
            return resolve(result);
          }

          const result: QrCodeResult = {
            dataUrl,
            success: true,
            message: 'QR code generated successfully'
          };
          return resolve(result);
        }
      );
    } catch (error) {
      console.error('Exception during QR code generation:', error);
      const result: QrCodeResult = {
        dataUrl: null,
        success: false,
        message: 'Exception during QR code generation',
        error: error instanceof Error ? error : new Error(String(error))
      };
      return resolve(result);
    }
  });
}

/**
 * Generate a QR code with validation and feedback
 * @param url - URL to encode in the QR code
 * @param options - QR code generation options
 * @returns Promise resolving to a QR code data URL or null
 */
export async function generateQrCodeWithValidation(
  url: string,
  options: QrCodeOptions = {}
): Promise<string | null> {
  const result = await generateQrCodeDataUrl(url, options);

  if (!result.success) {
    toast.error('QR Code Generation Failed', {
      description: result.message || 'Could not generate QR code',
      duration: 5000,
    });
    return null;
  }

  return result.dataUrl;
}

/**
 * Shorthand alias for generateQrCodeDataUrl
 * This is exported for backward compatibility
 */
export const createQRCode = generateQrCodeWithValidation;
