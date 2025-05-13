"use client";

import React from 'react';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';

interface FooterProps {
  className?: string;
}

/**
 * A simplified footer without any modal dialogs to prevent wallet connection issues
 */
export const SimplifiedFooter: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-black text-zinc-400 py-12 ${className}`}>
      <div className="px-4 md:px-6 max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Logo and brief description */}
          <div className="space-y-5 p-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight flex items-center">
                <span className="text-white">Cosmic</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">Loop</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Omnichain solution for NFT-based event attendance verification, connecting Solana with all LayerZero-supported networks.
            </p>
          </div>
          
          {/* Resources links */}
          <div className="p-4">
            <h3 className="text-white font-medium mb-5">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Solana
                </Link>
              </li>
              <li>
                <Link href="https://layerzero.network" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  LayerZero
                </Link>
              </li>
              <li>
                <Link href="https://layerzerolabs.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  LayerZero Labs
                </Link>
              </li>
              <li>
                <Link href="https://github.com/ayushshrivastv/Cosmic-Loop/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  MIT License
                </Link>
              </li>
              <li>
                <Link href="https://github.com/ayushshrivastv/Cosmic-Loop" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  GitHub Repository
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Connect section */}
          <div className="p-4">
            <h3 className="text-white font-medium mb-5">Connect</h3>
            <div className="flex space-x-5">
              <Link 
                href="https://x.com/ayushsrivastv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </Link>
              <Link 
                href="https://www.linkedin.com/in/ayushshrivastv/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-xs">
          <p>&copy; {currentYear} Ayush Srivastava</p>
        </div>
      </div>
    </footer>
  );
};
