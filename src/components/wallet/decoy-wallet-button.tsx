"use client";

import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

interface DecoyWalletButtonProps {
  className?: string;
  redirectPath?: string;
}

/**
 * A non-functional wallet button that redirects to a wallet-enabled page
 * Used on routes where real wallet functionality is not needed
 */
export const DecoyWalletButton: FC<DecoyWalletButtonProps> = ({ 
  className = '',
  redirectPath = ROUTES.MINT // Default redirect to mint page
}) => {
  const router = useRouter();
  const [isClicked, setIsClicked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Client-side only functionality
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    // Visual feedback that we're redirecting
    setIsClicked(true);
    
    if (isClient) {
      // Show toast notifying user we're redirecting to connect wallet
      toast.info('Redirecting to wallet connection page', {
        position: 'bottom-right'
      });
      
      // Redirect to the page where real wallet connection is available
      setTimeout(() => {
        router.push(redirectPath);
      }, 300);
    }
  };

  // Tailwind classes for styling similar to the black IsolatedWalletButton
  const buttonClasses = `
    bg-black text-white hover:bg-gray-800 
    px-[18px] py-[10px] rounded-full 
    text-sm font-medium 
    transition-colors duration-200 
    flex items-center justify-center 
    whitespace-nowrap
  `;

  return (
    <motion.button
      className={`${buttonClasses} ${className}`.trim()} // Combine base classes with passed className
      onClick={handleClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      animate={isClicked ? { opacity: 0.8, scale: 0.97 } : { opacity: 1, scale: 1 }}
    >
      <span>Connect Wallet</span>
      {/* <ExternalLink size={14} className="inline-block ml-1 opacity-80" /> */}
    </motion.button>
  );
};
