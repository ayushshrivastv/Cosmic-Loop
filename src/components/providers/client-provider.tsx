"use client";

import type { FC, ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { RouteConditionalWalletProvider } from '@/components/wallet/route-conditional-wallet-provider';
import { Toaster } from '@/components/ui/sonner';
import { DEFAULT_CLUSTER } from '@/lib/constants';

interface ClientProviderProps {
  children: ReactNode;
}

// This component wraps client-side providers that can't be used in server components
const ClientProvider: FC<ClientProviderProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <RouteConditionalWalletProvider cluster={DEFAULT_CLUSTER === 'localnet' ? 'devnet' : DEFAULT_CLUSTER}>
        {children}
        <Toaster position="bottom-right" />
      </RouteConditionalWalletProvider>
    </ThemeProvider>
  );
};

export default ClientProvider;
