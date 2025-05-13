"use client";

import React, { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { formatPublicKey } from '@/lib/utils/solana';
import { SafeWalletComponentWrapper } from '@/components/providers/wallet-adapter-provider';

// Dynamically import the WalletMultiButton with SSR disabled
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

// Apple-inspired styling for the wallet button
const walletButtonStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  padding: '10px 18px',
  height: 'auto',
  lineHeight: '1.25rem',
  fontSize: '14px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '9999px',
  transition: 'all 0.2s ease',
};

const walletButtonHoverStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

// Placeholder button styling for pre-render state
const placeholderButtonStyle = {
  ...walletButtonStyle,
  cursor: 'default',
  width: '160px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

interface SafeWalletButtonProps {
  showAddress?: boolean;
  className?: string;
}

export const SafeWalletButton: FC<SafeWalletButtonProps> = ({
  showAddress = true,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show a placeholder during SSR and initial mounting
  if (!isMounted) {
    return (
      <motion.button 
        className={`wallet-adapter-button-trigger ${className}`}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        style={placeholderButtonStyle}
      >
        Connect Wallet
      </motion.button>
    );
  }

  // Safely render the real wallet button only when mounted
  return (
    <SafeWalletComponentWrapper>
      {!connected ? (
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={className}
        >
          <WalletMultiButton 
            className="wallet-adapter-button-trigger" 
            style={isHovered ? { ...walletButtonStyle, ...walletButtonHoverStyle } : walletButtonStyle} 
          />
        </motion.div>
      ) : (
        <div className={`flex items-center gap-2 ${className}`}>
          {showAddress && publicKey && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-zinc-300"
            >
              {formatPublicKey(publicKey)}
            </motion.span>
          )}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <WalletMultiButton 
              className="wallet-adapter-button-trigger" 
              style={isHovered ? { ...walletButtonStyle, ...walletButtonHoverStyle } : walletButtonStyle} 
            />
          </motion.div>
        </div>
      )}
    </SafeWalletComponentWrapper>
  );
};
