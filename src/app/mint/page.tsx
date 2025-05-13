"use client";

import { AppleLayout } from '@/components/layouts/apple-layout';
import { ROUTES } from '@/lib/constants';
import { MintForm } from '@/components/mint/mint-form';
import { TokenStatistics } from '@/components/mint/token-statistics';

export default function MintPage() {
  return (
    <AppleLayout>
      {/* Content */}
      <div className="container mx-auto pt-32 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Create Event Token</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">About Event Tokens</h2>
              <p className="text-muted-foreground mb-4">
                Create a unique compressed token for your event using ZK Compression on Solana. These tokens can be distributed to attendees as proof-of-participation.
              </p>

              <h3 className="font-medium text-lg mt-6 mb-2">Benefits</h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>Gas-efficient minting through ZK compression</li>
                <li>Easy distribution via QR codes</li>
                <li>On-chain verification of attendance</li>
                <li>Customizable metadata for your event</li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your wallet is connected and you have SOL for transaction fees.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Form */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-lg p-6">
              <MintForm />
            </div>
          </div>
        </div>
        
        {/* Token Statistics Section */}
        <TokenStatistics />
      </div>
    </AppleLayout>
  );
}
