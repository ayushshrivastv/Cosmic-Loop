"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * TokenStatistics component - styled to match the application design theme
 * Displays statistics about tokens minted by the user
 */
export function TokenStatistics() {
  // Always call hooks unconditionally - this is required by React's Rules of Hooks
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);
  
  // Mark when component is client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract wallet properties safely
  const connected = isClient ? wallet.connected : false;

  return (
    <div className="border border-border rounded-lg p-6 mt-8 bg-black">
      <h2 className="text-xl font-semibold mb-6">Referral Statistics</h2>
      
      <div className="bg-[#121212] rounded-lg border border-dashed border-gray-800 overflow-hidden">
        {!connected ? (
          <div className="p-8 flex items-center justify-center min-h-[160px]">
            <p className="text-gray-400 text-center">Connect your wallet to view your referral statistics</p>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center min-h-[160px] text-center">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
            <p className="text-blue-200/80 mb-2">I&apos;m still reading docs and building</p>
            <p className="text-gray-400 text-sm">Check back later for your referral statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}
