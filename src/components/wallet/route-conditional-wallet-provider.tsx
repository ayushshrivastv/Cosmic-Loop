"use client";

import React, { FC, ReactNode, useEffect, useState } from 'react';
import { IsolatedWalletProvider } from '@/components/wallet/isolated-wallet-provider';

interface ConditionalWalletProviderProps {
  children: ReactNode;
  cluster?: 'devnet' | 'mainnet-beta' | 'testnet';
}

/**
 * A wallet provider that wraps IsolatedWalletProvider. 
 * Previously conditional, now always enables wallet functionality.
 */
export const RouteConditionalWalletProvider: FC<ConditionalWalletProviderProps> = ({
  children,
  cluster = 'devnet'
}) => {
  const providerInitTime = performance.now();
  console.log(`[PW] RouteConditionalWalletProvider: Init at ${providerInitTime.toFixed(0)}ms`);

  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    const now = performance.now();
    console.log(`[PW] RouteConditionalWalletProvider: useEffect (mount) at ${now.toFixed(0)}ms. Setting isClient = true.`);
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    const now = performance.now();
    console.log(`[PW] RouteConditionalWalletProvider: Not client at ${now.toFixed(0)}ms. Rendering children directly.`);
    return <>{children}</>;
  }
  
  const nowRender = performance.now();
  console.log(`[PW] RouteConditionalWalletProvider: Rendering IsolatedWalletProvider at ${nowRender.toFixed(0)}ms.`);
  return (
    <IsolatedWalletProvider cluster={cluster}>
      {children}
    </IsolatedWalletProvider>
  );
};
