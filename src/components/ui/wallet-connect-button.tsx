"use client";

import { useEffect, useState, useRef, type FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { formatPublicKey } from '@/lib/utils/solana';
import { motion } from 'framer-motion';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

// Dynamically import the WalletMultiButton to ensure it only loads client-side
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

// Modern wallet button style with improved visibility
const walletButtonStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.12)',
  color: 'white',
  padding: '10px 18px',
  height: 'auto',
  lineHeight: '1.25rem',
  fontSize: '14px',
  fontWeight: '500',
  whiteSpace: 'nowrap',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '9999px', 
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
};

const walletButtonHoverStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
};

interface WalletConnectButtonProps {
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showAddress?: boolean;
}

export const WalletConnectButton: FC<WalletConnectButtonProps> = ({
  buttonVariant = 'default',
  buttonSize = 'default',
  showAddress = true
}) => {
  // Use client-side only rendering to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const { publicKey, connected, connecting, disconnect, select, wallet, wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const [isHovered, setIsHovered] = useState(false);
  const walletCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  // Ensure wallet adapter is fully initialized
  useEffect(() => {
    setIsMounted(true);
    
    // Staggered approach to wallet initialization
    walletCheckTimeout.current = setTimeout(() => {
      setIsWalletReady(true);
      console.debug('[WalletButton] Ready for interaction');
    }, 1500);
    
    return () => {
      if (walletCheckTimeout.current) {
        clearTimeout(walletCheckTimeout.current);
      }
    };
  }, []);

  // Attempt to force reconnect when wallet is available but not connected
  useEffect(() => {
    if (isWalletReady && !connected && !connecting && wallet) {
      // Wait a moment before trying to reconnect
      const reconnectTimeout = setTimeout(() => {
        try {
          console.debug('[WalletButton] Attempting auto-reconnect');
          select(wallet.adapter.name);
        } catch (e) {
          console.debug('[WalletButton] Auto-reconnect failed:', e);
        }
      }, 2000); 
      
      return () => clearTimeout(reconnectTimeout);
    }
  }, [isWalletReady, connected, connecting, wallet, select]);

  // Handle direct wallet connection
  const handleConnectClick = () => {
    if (!connected && !connecting) {
      setVisible(true); // Open the wallet modal
    }
  };

  // During SSR or initial render, show a placeholder
  if (!isMounted) {
    return (
      <motion.button 
        className="wallet-adapter-button-trigger" 
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        style={{
          ...walletButtonStyle,
          width: '160px',
        }}
      >
        Connect Wallet
      </motion.button>
    );
  }

  // When wallet is ready but not connected
  if (isWalletReady && !connected) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {connecting ? (
          <Button
            className="wallet-adapter-button-loading"
            style={{
              ...walletButtonStyle,
              cursor: 'progress',
              opacity: 0.8,
            }}
            disabled
          >
            Connecting...
          </Button>
        ) : (
          <WalletMultiButton 
            className="wallet-adapter-button-trigger" 
            style={isHovered ? { ...walletButtonStyle, ...walletButtonHoverStyle } : walletButtonStyle} 
            onClick={handleConnectClick}
          />
        )}
      </motion.div>
    );
  }

  // When connected, show address and the wallet button
  return (
    <div className="flex items-center gap-2">
      {showAddress && publicKey && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm font-medium text-zinc-200"
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
  );
};
