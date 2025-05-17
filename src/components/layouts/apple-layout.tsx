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
];

export const AppleLayout: React.FC<AppleLayoutProps> = ({ children }: AppleLayoutProps) => {
  return (
    <div className="min-h-screen bg-black text-foreground flex">
      {/* Sidebar Navigation */}
      <SidebarNav navItems={navItems} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-52"> {/* ml-52 matches the new width of the sidebar */}
        {/* Top wallet button bar */}
        <div className="sticky top-0 z-40 w-full h-24 flex items-center justify-end px-8 bg-black">
          <SmartWalletButton />
        </div>
        
        <main className="flex-grow px-8 pt-0 pb-6">
          {children}
        </main>
        
        <SimplifiedFooter />
      </div>
    </div>
  );
};
