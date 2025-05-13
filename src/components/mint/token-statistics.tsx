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
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalTokensMinted: number;
    tokensDistributed: number;
    activeEvents: number;
  } | null>(null);
  
  // Mark when component is client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract wallet properties safely
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;

  // Function to fetch token statistics
  const fetchTokenStats = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      // This would be replaced with actual API calls to fetch statistics
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - would be replaced with actual API response
      setStats({
        totalTokensMinted: 1500,
        tokensDistributed: 750,
        activeEvents: 3
      });
    } catch (error) {
      console.error("Error fetching token stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchTokenStats();
    } else {
      setStats(null);
    }
  }, [connected, publicKey]);

  return (
    <div className="border border-border rounded-lg p-6 mt-8 bg-black">
      <h2 className="text-xl font-semibold mb-6">Referral Statistics</h2>
      
      <div className="bg-[#121212] rounded-lg border border-dashed border-gray-800 overflow-hidden">
        {!connected ? (
          <div className="p-8 flex items-center justify-center min-h-[160px]">
            <p className="text-gray-400 text-center">Connect your wallet to view your referral statistics</p>
          </div>
        ) : isLoading ? (
          <div className="p-8 flex items-center justify-center min-h-[160px]">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400">Loading statistics...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-6">
            <div className="text-center px-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Campaigns</h3>
              <p className="text-3xl font-bold text-white">{stats.activeEvents}</p>
            </div>
            
            <div className="text-center px-4 border-x border-gray-800">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Token Referrals</h3>
              <p className="text-3xl font-bold text-white">{stats.tokensDistributed}</p>
            </div>
            
            <div className="text-center px-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Minted</h3>
              <p className="text-3xl font-bold text-white">{stats.totalTokensMinted}</p>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center min-h-[160px]">
            <p className="text-gray-400 text-center mb-4">No referral statistics found</p>
            <Button 
              onClick={fetchTokenStats} 
              className="bg-white text-black hover:bg-gray-200 transition-colors"
              size="sm"
            >
              Refresh Statistics
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
