"use client";

import { AppleLayout } from '@/components/layouts/apple-layout';
import { ROUTES } from '@/lib/constants';
import { ClaimForm } from '@/components/claim/new-claim-form';
import { AirdropForm } from '@/components/claim/airdrop-form';
import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClaimPage() {
  return (
    <AppleLayout>
      {/* Content */}
      <div className="container mx-auto pt-4 pb-16 flex-1">
        <h1 className="text-3xl font-bold mb-8">Claim Your Token</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">About Token Claims</h2>
              <p className="text-muted-foreground mb-4">
                Easily claim your proof-of-participation token by entering a claim code or scanning a QR code provided by the event organizer.
              </p>

              <h3 className="font-medium text-lg mt-6 mb-2">How to Claim</h3>
              <ol className="list-decimal pl-5 text-muted-foreground space-y-2">
                <li>Connect your Solana wallet</li>
                <li>Enter the claim code or scan the QR code</li>
                <li>Approve the transaction in your wallet</li>
                <li>Receive your token in seconds</li>
              </ol>

              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your wallet is connected and you have SOL for transaction fees.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Claim & Airdrop Forms */}
          <div className="lg:col-span-2">
            <div className="border border-border rounded-lg p-6">
              <Tabs defaultValue="claim" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="claim" className="text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                      <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                    </svg>
                    Claim Token
                  </TabsTrigger>
                  <TabsTrigger value="airdrop" className="text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a3 3 0 100-6 3 3 0 000 6zM9.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      <path d="M17 10a3 3 0 100-6 3 3 0 000 6zM15.5 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      <path d="M5 14a3 3 0 100-6 3 3 0 000 6zM3.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      <path d="M8 16H7a4 4 0 01-4-4v-1a2 2 0 00-1-1.73V8a2 2 0 001-1.73V6a4 4 0 014-4h7a4 4 0 014 4v.27a2 2 0 001 1.73v1.27a2 2 0 00-1 1.73V12a4 4 0 01-4 4h-3.1M13 16v2H9v-2h4z" />
                    </svg>
                    Airdrop Tokens
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="claim">
                  <Suspense fallback={<div className="py-8 text-center">Loading claim form...</div>}>
                    <ClaimForm />
                  </Suspense>
                </TabsContent>
                
                <TabsContent value="airdrop">
                  <Suspense fallback={<div className="py-8 text-center">Loading airdrop form...</div>}>
                    <AirdropForm />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* QR Code & Airdrop Sections - Moved to bottom */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-start">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-purple-900/20 text-purple-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">QR Code Scanning</h3>
                <p className="text-muted-foreground mb-4">Instantly claim tokens by scanning event QR codes with your device's camera. Each code contains embedded transaction instructions for seamless verification.</p>
                <div className="flex items-center text-sm text-indigo-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Compatible with Solana Pay
                </div>
              </div>
            </div>
          </div>
          
          {/* Airdrop Section */}
          <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 rounded-xl p-6 backdrop-blur-sm border border-white/10">
            <div className="flex items-start">
              <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-900/20 text-blue-400 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bulk Airdrops</h3>
                <p className="text-muted-foreground mb-4">Distribute tokens to large audiences with just a few clicks. Our airdrop system allows event organizers to send tokens to hundreds or thousands of attendees simultaneously.</p>
                <div className="flex items-center text-sm text-sky-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  1000x cost reduction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppleLayout>
  );
}
