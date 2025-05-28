"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { ThemeToggleButton } from '@/components/ui/theme-toggle-button';
import { APP_NAME } from '@/lib/constants';
import { Linkedin, Menu } from 'lucide-react';
import { useState } from 'react';

// Dynamically import WalletConnectButton
const WalletConnectButton = dynamic(
  () => import('@/components/ui/wallet-connect-button').then(mod => mod.WalletConnectButton),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="sm" disabled className="opacity-50">
        Loading Wallet...
      </Button>
    ),
  }
);

// Define routes directly to ensure they're available
const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  MINT: "/mint",
  CLAIM: "/claim",
  BRIDGE: "/bridge",
};

interface HeaderProps {
  activePage?: string;
}

export const Header: FC<HeaderProps> = ({ activePage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto flex h-16 items-center justify-between py-4">
        {/* Logo and app name with white + gradient style */}
        <div className="flex items-center">
          <Link href={ROUTES.HOME} className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
              <span className="text-white">Scalable</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">cToken</span>
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Dashboard
          </Link>
          <Link
            href="/mint"
            className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/mint' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Create Event
          </Link>
          <Link
            href="/claim"
            className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/claim' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Claim Token
          </Link>
          <Link
            href="/bridge"
            className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${activePage === '/bridge' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Bridge
          </Link>
        </nav>

        {/* Right section - actions */}
        <div className="flex items-center gap-4">
          {/* OpenAPI Button */}
          <Button
            variant="outline"
            className="hidden sm:flex items-center gap-2 bg-[#303030] text-white hover:bg-[#202020] border-none"
            onClick={() => window.location.href = '/openapi'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12L8 4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>OpenAPI</span>
          </Button>
          <Link
            href="https://www.linkedin.com/in/ayushshrivastv/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center text-white bg-[#0077b5] rounded-md p-2 hover:bg-[#0066a0] transition-colors"
            aria-label="Connect on LinkedIn"
          >
            <Linkedin size={18} />
          </Link>
          <div className="hidden sm:block">
            <WalletConnectButton />
          </div>
          <ThemeToggleButton />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 px-4 bg-background border-b border-border/40 animate-in slide-in-from-top-5 duration-300">
          <nav className="flex flex-col space-y-4 pb-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/mint"
              className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/mint' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Create Event
            </Link>
            <Link
              href="/claim"
              className={`text-sm font-medium transition-colors hover:text-primary ${activePage === '/claim' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Claim Token
            </Link>
            <Link
              href="/bridge"
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${activePage === '/bridge' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Bridge
            </Link>
          </nav>
          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Link
              href="https://www.linkedin.com/in/ayushshrivastv/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-white bg-[#0077b5] rounded-md p-2 hover:bg-[#0066a0] transition-colors"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin size={18} />
            </Link>
            <WalletConnectButton />
          </div>
        </div>
      )}
    </header>
  );
};
