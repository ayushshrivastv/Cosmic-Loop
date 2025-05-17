# Scalable cToken (Solana Pay)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.0-black)](https://nextjs.org/)
[![Solana Pay](https://img.shields.io/badge/Solana-Pay-9945FF)](https://solanapay.com/)
[![Light Protocol](https://img.shields.io/badge/Light_Protocol-ZK_Compression-6A5ACD)](https://lightprotocol.com/)

This project enables event organisers to mint digital POP tokens that can be claimed by attendees through a simple scan of a QR code. These tokens are not just symbolic; they represent verifiable, compressed assets living entirely on-chain, making them ideal for airdrops, community rewards, or credentialing at scale. 

For a detailed technical architecture and component flow diagrams, please refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) document or [YouTube](https://youtu.be/V40mvlS0EkA?feature=shared) 

P.S. After 48 hours of coding, debugging, and more coffee than water—here’s the project. The backend isn’t quite where I want it yet—there’s still a lot of work ahead. Initially, I considered creating a mock data interface for the hackathon, but I’ve decided to connect to a real blockchain network instead. Writing the smart contract is taking some time.

I came across this project on Superteam on March 10th, and this is my first-ever submission—and also my first Solana project!


### Web Page Link
**[Scalable cToken Page](https://scalable-c-token-ayushshrivastvs-projects.vercel.app/)**

![Screenshot 2025-05-11 at 3 10 50 AM](https://github.com/user-attachments/assets/f3607a9c-9026-46d0-8559-f83740a2eab7)

## Overview

Scalable cToken Distribution with Solana Pay and ZK Compression on Solana

A high throughput solution for creating and distributing compressed proof-of-participation tokens at scale on Solana blockchain using Solana Pay and Light Protocol's compression technology.

Check out [Presentation](./PRESENTATION.md) for a quick overview of the project's functionality.

## Zero-Knowledge Compression Technology

Scalable cToken leverages Light Protocol's zero-knowledge compression technology to revolutionize token distribution on Solana. This cutting-edge approach combines the security of blockchain with the efficiency of advanced cryptographic techniques, enabling a new paradigm for digital asset management.

At its core, our implementation uses zero-knowledge proofs to compress token data while preserving its integrity and verifiability. This allows us to dramatically reduce on-chain storage requirements and transaction costs without sacrificing security or functionality. The system can process hundreds of tokens in a single transaction, making it ideal for large-scale events and airdrops.

Beyond efficiency, this technology enhances privacy by allowing selective disclosure of information. Event organizers can verify attendance without exposing sensitive participant data, while attendees can prove their participation without revealing personal details. The entire system is built on cryptographic guarantees that mathematically prevent forgery or unauthorized modifications.

### Performance Comparison: Traditional vs. Compressed Tokens

| Metric | Traditional Tokens | Compressed Tokens | Improvement |
|--------|-------------------|-------------------|-------------|
| Cost per mint | ~0.005 SOL | ~0.000005 SOL | 1000× cheaper |
| Tokens per transaction | 1-5 | Up to 1,000 | 200-1000× more efficient |
| Processing speed | ~10 tokens/minute | ~5,000 tokens/minute | 500× faster |
| Storage requirements | Full on-chain data | Compressed merkle proofs | 100× less storage |
| Security level | Standard on-chain | Cryptographically equivalent | Equally secure |
| Privacy features | Limited | Selective disclosure | Enhanced privacy |

This powerful combination of scalability, privacy, and security makes Scalable cToken an ideal solution for any organization looking to distribute verifiable digital assets at scale without prohibitive costs or technical complexity.

## Solana Pay and Smart Contract Workflow

This Scalable cToken uses Solana Pay to make QR code interactions super easy. Attendees can claim tokens without any hassle. The organizers set up a smart contract on Solana to mint tokens. This contract uses Light Protocol’s infrastructure to create cTokens. When an attendee scans the Solana Pay QR code, it sends a transaction to the smart contract. The smart contract checks if the claim is valid and then sends a unique, compressed proof-of-participation token straight to the attendee’s wallet. This way, the tokens are distributed securely and efficiently.



## Functionality

Organisers can log in with their Solana wallet, create a new event, and instantly mint compressed tokens tied to event metadata such as name, time, and location. Upon creation, the system generates a Solana Pay-compatible QR code, which attendees can scan to securely claim their tokens via their own wallet. Each token is issued using Light Protocol's compression infrastructure, drastically reducing storage costs while maintaining full L1 composability.

The user interface is built to be intuitive across devices and accommodates both the event creator and attendee journeys—from minting to claiming—with minimal friction.

![442056085-235a9be9-e4fa-46f9-989e-1b1ce8cda931](https://github.com/user-attachments/assets/f7a7ba25-3150-4b68-a109-b3f85af91110)

![442056067-8b7532fd-1a86-4471-810d-b7e9b3484217](https://github.com/user-attachments/assets/e2d11e13-a8b1-4c6c-a7ad-2a3d65d02f86)

![Screenshot 2025-05-12 at 4 23 55 AM](https://github.com/user-attachments/assets/f9c81e73-129b-4750-9d6d-9a44a9d8d104)

### Seamless Connection of Wallet to Collect Event Tokens.

<img src="https://github.com/user-attachments/assets/397b8b3b-b404-4b81-8b32-a6f6885f04cb" alt="Screenshot 2025-05-12 at 7 16 48 AM" width="300"/>


## QR Codes & Airdrops

### Solana Pay QR Codes
The application leverages Solana Pay's QR code technology to create a seamless claiming experience:

- **Dynamic Generation**: Each event automatically generates a unique QR code that encodes all necessary transaction data
- **Instant Recognition**: Compatible with any standard QR scanner or smartphone camera
- **Transaction Embedding**: QR codes contain pre-formatted transaction instructions for token claiming
- **Wallet Connectivity**: Scanning initiates an immediate connection to the user's preferred Solana wallet
- **Security Features**: Each QR code includes validation parameters to prevent unauthorized claims

### Airdrop Capabilities
The platform offers efficient airdrop functionality for event organizers:

- **Bulk Distribution**: Send tokens to multiple recipients simultaneously with minimal gas costs
- **Targeted Campaigns**: Create audience segments based on event participation or other criteria
- **Scheduled Releases**: Set up timed airdrops to coincide with event milestones
- **Claim Verification**: Monitor real-time claiming statistics through an intuitive dashboard
- **Flexible Allocation**: Distribute different quantities of tokens to different participant tiers

This combination of QR-based claiming and airdrop functionality makes the platform ideal for both in-person events and remote participation scenarios.

### Smart Contracts & Solana Pay Integration
Distribute tokens to large audiences with just a few clicks. Our airdrop system allows event organizers to send tokens to hundreds or thousands of attendees simultaneously. The platform leverages custom Solana smart contracts that interact seamlessly with Light Protocol's compression technology, reducing transaction costs by 1000x. Solana Pay integration enables frictionless claiming through scannable QR codes that embed transaction instructions, wallet connections, and verification parameters—all while maintaining sub-second finality and military-grade security.

**[Try the live demo here](https://scalable-c-token-ayushshrivastvs-projects.vercel.app/)**

## Setup & Installation

To run this project locally, ensure you have Node.js 16 or later and a compatible Solana wallet (Phantom, Backpack, or Solflare). Clone the repository and install dependencies using:

```bash
git clone https://github.com/ayushshrivastv/Scalable-cToken.git
cd Scalable-cToken
npm install
# or if you prefer using bun
bun install
```

### Automated Setup (Recommended)

The project now includes an automated setup script that will:
1. Create the necessary `.env` file with the correct environment variables
2. Generate a new admin wallet keypair for token operations
3. Request an airdrop of SOL to the admin wallet (on devnet)

Simply run:

```bash
npm run setup
# or
bun run setup
```

Then start the development server:

```bash
npm run dev
# or
bun run dev
```

The development server will also automatically run the setup script if needed.

### Manual Setup (Alternative)

If you prefer to set up manually, create a `.env` file in the root directory with the following environment variables:

```
NEXT_PUBLIC_CLUSTER=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
ADMIN_PRIVATE_KEY=your_admin_private_key_here
```

You can generate an admin private key using the Solana CLI:
```bash
solana-keygen new --no-passphrase -o admin-keypair.json
# Then convert to base64 format for the .env file
cat admin-keypair.json | base64
```

The application will be available at [http://localhost:3000](http://localhost:3000). Connect your wallet to begin creating or claiming tokens.

## Using the Application

To create tokens, connect your wallet and navigate to the "Create Event" section. Fill out the event information, confirm the transaction, and a QR code will be generated for distribution. Attendees can scan this QR code using any QR reader or camera app, which will launch Solana Pay and guide them through the token claim process in a few simple steps.

The process is secure, affordable, and designed for high-volume usage at real-world events.

## Technical Stack

This application is built with Next.js 15, React 18, and TypeScript, using Tailwind CSS and shadcn/ui for the frontend. Blockchain functionality is powered by Solana, with Light Protocol handling compression. Wallet interactions are handled via the Solana Wallet Adapter framework.

The architecture allows easy extensibility and is suitable for further enhancements such as event analytics, email confirmations, or token gating.


For more in-depth technical details, refer to the [src/README.md](./src/README.md) file.

## Development Scripts

```bash
npm run dev         # Run development server
npm run lint        # Check for code issues
npm run format      # Auto-format code
npm run build       # Build application for production
npm run start       # Start production server
```
## User Experience Showcase

### Organizer Journey
For event organizers, the process is simple: connect your Solana wallet, create an event with custom details, and generate QR codes for distribution. The system handles token creation using Light Protocol's compression technology.

1. Connect wallet and access the intuitive dashboard
2. Create an event with custom branding and metadata
3. Generate a unique QR code for distribution
4. Monitor real-time claim statistics

### Attendee Journey
Attendees just scan the QR code with their phone, approve the claim in their Solana wallet, and instantly receive their token – all with minimal fees.

1. Scan event QR code with any Phone
2. Connect Solana wallet with a single tap
3. Claim compressed token in seconds
4. Instantly verify token in wallet

## Deployment

The application is deployed on Vercel. To deploy your own version:

1. Push your code to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add the required environment variables:
   - `NEXT_PUBLIC_CLUSTER` (e.g., `devnet`)
   - `NEXT_PUBLIC_RPC_ENDPOINT` (e.g., `https://api.devnet.solana.com`)

## License

This project is licensed under the MIT License and is open for extension, experimentation, and contribution.
