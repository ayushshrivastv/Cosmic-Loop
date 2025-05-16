"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SmartWalletButton } from '@/components/wallet/smart-wallet-button';

interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

interface SidebarNavProps {
  navItems: NavItem[];
  logo?: React.ReactNode;
}

export const SidebarNav = ({
  navItems,
  logo
}: SidebarNavProps): React.JSX.Element => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Client-side only initialization
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-black z-50 flex-col hidden md:flex">
        {/* Logo */}
        <div className="p-6 mb-4">
          {logo || (
            <Link href="/" className="text-white font-bold text-xl block">
              <span className="text-white">Solana</span>
              <span className="text-white ml-1">OpenAPI</span>
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-2">
          <ul className="space-y-1 px-4">
            {navItems.map((item: NavItem) => {
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-2 text-base font-medium transition-colors ${
                        isActive 
                          ? 'text-white font-medium' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link 
                      href={item.href}
                      className={`block px-4 py-2 text-base font-medium transition-colors ${
                        isActive 
                          ? 'text-white font-medium' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Wallet Button removed from here and moved to top right */}
      </aside>
      
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-black/70 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logo || (
                <Link href="/" className="text-white font-bold text-xl">
                  <span className="text-white">Solana</span>
                  <span className="text-white ml-1">OpenAPI</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-4 py-6 space-y-4">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item: NavItem) => {
                    const isActive = pathname === item.href;
                    
                    return (
                      <div key={item.href}>
                        {item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block py-2 transition-colors ${
                              isActive 
                                ? 'text-white font-medium' 
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <Link 
                            href={item.href}
                            className={`block py-2 transition-colors ${
                              isActive 
                                ? 'text-white font-medium' 
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </nav>
                {/* Wallet button removed from here - now in top right corner */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
