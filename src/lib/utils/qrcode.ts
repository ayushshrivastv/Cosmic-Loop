/**
 * @file qrcode.ts
 * @description Utilities for generating QR codes and Solana Pay URLs for token claiming
 * This file contains functions for creating URLs and QR codes that enable users to claim
 * their proof-of-participation tokens through Solana Pay integration.
 */

import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import QRCode from 'qrcode';

// Since we may not have uuid installed, create a simple function to generate a unique reference
function generateUUID() {
  // This is a simple implementation that's good enough for our Solana Pay references
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

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
 * Generate a Solana Pay URL for claiming tokens
 *
 * Creates a URL following the Solana Pay protocol specification that can be used
 * to initiate a token transfer when scanned with a compatible wallet.
 *
 * @see https://docs.solanapay.com/spec
 * @format solana:<recipient>?spl-token=<token-mint>&amount=<amount>&reference=<reference>
 *
 * @param recipient - PublicKey of the wallet receiving the payment/transfer
 * @param tokenMint - PublicKey of the token mint address
 * @param amount - Amount of tokens to transfer (in base units)
 * @param reference - Unique identifier for tracking the transaction
 * @param label - Optional label to display in the wallet (e.g., event name)
 * @param message - Optional message to display in the wallet
 * @returns Solana Pay URL as a string
 */
export const createSolanaPayUrl = (
  recipient: PublicKey,
  tokenMint: PublicKey,
  amount: number,
  reference: string,
  label?: string,
  message?: string
): string => {
  // Base URL with recipient
  let url = `solana:${recipient.toBase58()}`;

  // Add SPL token parameter for the token mint
  url += `?spl-token=${tokenMint.toBase58()}`;

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
};

/**
 * Create a URL for claiming a token through the application's claim page
 *
 * This creates a direct link to the claim page with the necessary parameters
 * for the user to claim their token. This URL can be shared directly or
 * embedded in a QR code.
 *
 * @param baseUrl - Base URL of the application (e.g., https://example.com)
 * @param eventId - Identifier or name of the event
 * @param tokenMint - PublicKey of the token mint to claim
 * @returns Full URL to the claim page with parameters
 *
 * @example
 * // Returns "https://example.com/claim?event=DevConference2025&mint=7nB3aDJ...5aB"
 * createClaimUrl("https://example.com", "DevConference2025", new PublicKey("7nB3aDJ...5aB"))
 */
export const createClaimUrl = (
  baseUrl: string,
  eventId: string,
  tokenMint: PublicKey,
): string => {
  return `${baseUrl}/claim?event=${encodeURIComponent(eventId)}&mint=${tokenMint.toBase58()}`;
};

/**
 * Create a URL for claiming a token using a parameters object
 *
 * Alternative to createClaimUrl that accepts a single object with all parameters.
 * This is useful when you have all parameters in a structured object already.
 *
 * @param params - Object containing all parameters needed for the claim URL
 * @returns Full URL to the claim page with parameters
 *
 * @example
 * // Returns "https://example.com/claim?event=DevConference2025&mint=7nB3aDJ...5aB"
 * createClaimUrlWithParams({
 *   baseUrl: "https://example.com",
 *   eventName: "DevConference2025",
 *   mintAddress: "7nB3aDJ...5aB",
 *   organizerPubkey: "EPjFW...PCh"
 * })
 */
export const createClaimUrlWithParams = (params: ClaimUrlParams): string => {
  return `${params.baseUrl}/claim?event=${encodeURIComponent(params.eventName)}&mint=${params.mintAddress}`;
};

/**
 * Generate a Solana Pay transfer request URL specifically for claiming a token
 *
 * Simplifies the process of creating a Solana Pay URL for token claiming by
 * automatically generating a UUID reference and setting sensible defaults.
 * This URL can be converted to a QR code for easy scanning.
 *
 * @param recipient - PublicKey of the wallet that owns the tokens (event organizer)
 * @param tokenMint - PublicKey of the token mint to claim
 * @param label - Label to show in the wallet UI (typically the event name)
 * @param memo - Optional additional information to include in the transaction
 * @returns Complete Solana Pay URL as a string
 *
 * @example
 * // Returns a Solana Pay URL like "solana:EPjFW...PCh?spl-token=7nB3aDJ...5aB&amount=1&reference=..."
 * createSolanaPayClaimUrl(
 *   new PublicKey("EPjFW...PCh"),
 *   new PublicKey("7nB3aDJ...5aB"),
 *   "DevConference2025",
 *   "Thanks for attending our conference!"
 * )
 */
export const createSolanaPayClaimUrl = (
  recipient: PublicKey,
  tokenMint: PublicKey,
  label: string,
  memo?: string
): string => {
  // Create unique reference for this transaction
  // This helps wallets track and identify the specific transaction
  const reference = generateUUID();

  // Create the complete Solana Pay URL with all necessary parameters
  return createSolanaPayUrl(
    recipient,
    tokenMint,
    1, // Amount - typically 1 for an NFT/token claim
    reference,
    label, // Event name as label
    memo || "Claim your proof-of-participation token"
  );
};

/**
 * Generate a QR code as a data URL from any URL string
 *
 * Creates a QR code image as a data URL (Base64 encoded) that can be directly
 * used in HTML img tags or downloaded as an image file.
 *
 * @param url - The URL to encode in the QR code (Solana Pay URL or any URL)
 * @param size - Size of the QR code in pixels (default: 256)
 * @param includeMargin - Whether to include a margin around the QR code (default: true)
 * @returns Promise resolving to a data URL string (format: data:image/png;base64,...)
 *
 * @example
 * // Generate a QR code and set it as an image source
 * const dataUrl = await generateQrCodeDataUrl("https://example.com");
 * document.getElementById("qr-code").src = dataUrl;
 */
export function generateQrCodeDataUrl(
  url: string,
  size: number = 256,
  includeMargin: boolean = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      QRCode.toDataURL(
        url,
        {
          width: size,
          margin: includeMargin ? 4 : 0,
          errorCorrectionLevel: 'H', // High error correction level for better readability
          type: 'image/png',
          color: {
            dark: '#000000', // Black QR code modules
            light: '#ffffff', // White background
          },
        },
        (err, dataUrl) => {
          if (err) {
            console.error('Error generating QR code data URL:', err);
            reject(err);
            return;
          }
          resolve(dataUrl);
        }
      );
    } catch (error) {
      console.error('Exception during QR code generation:', error);
      reject(error);
    }
  });
}

/**
 * Shorthand alias for generateQrCodeDataUrl
 * This is exported for backward compatibility and convenience
 */
export const createQRCode = generateQrCodeDataUrl;
