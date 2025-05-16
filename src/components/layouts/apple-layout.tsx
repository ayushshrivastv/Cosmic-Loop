"use client";

import * as React from 'react';
import { SidebarNav } from '@/components/ui/Webstyles/sidebar-nav';
import { SimplifiedFooter } from '@/components/ui/Webstyles/simplified-footer';
import { SmartWalletButton } from '@/components/wallet/smart-wallet-button';
import { ROUTES } from '@/lib/constants';

interface AppleLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Create Event', href: ROUTES.MINT },
  { label: 'Claim Token', href: ROUTES.CLAIM },
  { label: 'OpenAPI', href: ROUTES.OPENAPI, external: false },
];

export const AppleLayout = ({ children }: AppleLayoutProps): React.JSX.Element => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top right wallet button */}
      <div className="fixed top-4 right-4 z-50">
        <SmartWalletButton />
      </div>
      
      <SidebarNav navItems={navItems} />
      <main className="flex-grow md:pl-[260px] pt-16 md:pt-6 px-4 md:px-8 max-w-screen-xl mx-auto"> {/* Match OpenAI's content layout */}
        {children}
      </main>
      <SimplifiedFooter className="md:pl-[260px]" /> {/* Add left padding to the footer on desktop only */}
    </div>
  );
};
