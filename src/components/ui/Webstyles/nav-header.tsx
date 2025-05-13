"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { SmartWalletButton } from '@/components/wallet/smart-wallet-button';

interface NavItem {
  label: string;
  href: string;
}

interface NavHeaderProps {
  navItems: NavItem[];
  logo?: React.ReactNode;
}

export const NavHeader: React.FC<NavHeaderProps> = ({
  navItems,
  logo
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isWalletButtonMounted, setIsWalletButtonMounted] = useState(false);
  const walletButtonDelay = useRef<NodeJS.Timeout | null>(null);

  // Client-side only initialization and cleanup
  useEffect(() => {
    setIsMounted(true);
    
    // Delay rendering the wallet button to ensure wallet adapter is ready
    walletButtonDelay.current = setTimeout(() => {
      setIsWalletButtonMounted(true);
    }, 1500); // Longer delay to ensure adapter is fully ready
    
    return () => {
      if (walletButtonDelay.current) {
        clearTimeout(walletButtonDelay.current);
      }
    };
  }, []);

  // Track scroll position for translucent effect
  useEffect(() => {
    const handleScroll = () => {
      const show = window.scrollY > 20;
      if (show !== isScrolled) setIsScrolled(show);
    };
    
    document.addEventListener('scroll', handleScroll);
    return () => document.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/70 backdrop-blur-lg border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo || (
              <Link href="/" className="text-white font-bold text-xl">
                <span className="text-white">Scalable</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">cToken</span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-300 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <SmartWalletButton />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white focus:outline-none"
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
            className="md:hidden bg-black/95 backdrop-blur-lg border-b border-white/10"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className="text-zinc-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-4 border-t border-white/10">
                <SmartWalletButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
