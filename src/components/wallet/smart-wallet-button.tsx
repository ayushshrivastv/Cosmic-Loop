"use client";

import React, { FC, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ROUTES } from '@/lib/constants';
import { DecoyWalletButton } from './decoy-wallet-button';

// Routes that need the real wallet button
const WALLET_ENABLED_ROUTES = [
  ROUTES.MINT,
  ROUTES.CLAIM
];

// Dynamically import the IsolatedWalletButton only when needed
const IsolatedWalletButton = dynamic(
  () => import('./isolated-wallet-button').then(mod => mod.IsolatedWalletButton),
  { ssr: false }
);

interface SmartWalletButtonProps {
  className?: string;
  showAddress?: boolean;
}

/**
 * A smart button that shows different wallet components based on the current route
 * - On wallet-enabled routes (mint, claim): Shows real wallet functionality
 * - On other routes: Shows a decoy button that redirects to mint page
 */
export const SmartWalletButton: FC<SmartWalletButtonProps> = ({
  className = '',
  showAddress = true
}) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything during SSR to prevent hydration issues
  if (!mounted) {
    return null;
  }
  
  // Check if current route needs real wallet functionality
  const needsRealWallet = WALLET_ENABLED_ROUTES.includes(pathname);
  
  if (needsRealWallet) {
    // On wallet-enabled routes, render the real wallet button
    const mintClaimClasses = "bg-black text-white hover:bg-gray-800";
    return <IsolatedWalletButton className={`${className} ${mintClaimClasses}`} />;
  } else {
    // On other routes, render the decoy button
    return <DecoyWalletButton className={className} />;
  }
};
