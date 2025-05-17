"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Linkedin, Github, Twitter } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(2025); // Default year for SSR
  
  // Handle client-side initialization
  useEffect(() => {
    setIsMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);
  
  // Handler to prevent event propagation
  const handleModalOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };
  
  // Handler to close modal
  const handleModalClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(false);
  };
  
  return (
    <footer className={`bg-black text-zinc-400 py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Logo and brief description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold tracking-tight flex items-center">
                <span className="text-white">Scalable</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-600 ml-1">cToken</span>
              </span>
            </Link>
            <p className="text-sm">
              High throughput token issuance and distribution platform powered by Light Protocol's state compression technology.
            </p>
          </div>
          
          {/* Resources links */}
          <div>
            <h3 className="text-white font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Solana
                </Link>
              </li>
              <li>
                <Link href="https://lightprotocol.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Light Protocol
                </Link>
              </li>
              <li>
                <Link href="https://solanapay.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">
                  Solana Pay
                </Link>
              </li>
              <li>
                {isMounted && (
                  <button 
                    onClick={handleModalOpen}
                    className="text-sm hover:text-white transition-colors cursor-pointer"
                  >
                    MIT License
                  </button>
                )}
              </li>
            </ul>
          </div>
          
          {/* Connect section */}
          <div>
            <h3 className="text-white font-medium mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com/ayushshrivastv/Scalable-cToken" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
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
              <Link 
                href="https://x.com/ayushsrivastv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="X (Twitter)"
              >
                <Twitter size={20} />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-zinc-800 mt-10 pt-6 text-center text-xs">
          <p>&copy; {currentYear} Ayush Srivastava</p>
        </div>
      </div>
      
      {/* License Modal using React state instead of DOM manipulation */}
      {isMounted && isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleModalClose}
        >
          <div 
            className="relative bg-zinc-900 max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-zinc-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-medium">MIT License</h2>
              <button 
                onClick={handleModalClose}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="p-6 text-zinc-300 font-mono overflow-y-auto max-h-[70vh]">
              <pre className="whitespace-pre-wrap text-sm">
MIT License

Copyright (c) 2025 Ayush Srivastava

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
              </pre>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
