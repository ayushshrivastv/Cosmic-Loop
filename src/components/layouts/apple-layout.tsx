"use client";

import React, { ReactNode } from 'react';
import { NavHeader } from '@/components/ui/Webstyles/nav-header';
import { SimplifiedFooter } from '@/components/ui/Webstyles/simplified-footer';
import { ROUTES } from '@/lib/constants';

interface AppleLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Dashboard', href: ROUTES.DASHBOARD },
  { label: 'Create Event', href: ROUTES.MINT },
  { label: 'Claim Token', href: ROUTES.CLAIM },
];

export const AppleLayout: React.FC<AppleLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <NavHeader navItems={navItems} />
      <main className="flex-grow">
        {children}
      </main>
      <SimplifiedFooter />
    </div>
  );
};
