import React, { FC, MouseEvent, useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui'; 
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base'; 
import { Button, ButtonProps } from '@/components/ui/button'; 
import { WalletReadyContext } from '@/components/wallet/isolated-wallet-provider';

export interface IsolatedWalletButtonProps extends ButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const IsolatedWalletButton: FC<IsolatedWalletButtonProps> = ({
  children, 
  disabled, 
  onConnect,
  onDisconnect,
  onClick, 
  ...props 
}) => {
  const buttonInitTime = performance.now();
  console.log(`[PW] IsolatedWalletButton: Init at ${buttonInitTime.toFixed(0)}ms`);

  const { 
    wallet, 
    connect, 
    disconnect, 
    select, 
    connected, 
    connecting, 
    disconnecting, 
    publicKey, 
    wallets 
  } = useWallet();
  const { setVisible: setModalVisible } = useWalletModal(); 
  
  const walletSystemReady = useContext(WalletReadyContext);
  const [buttonMounted, setButtonMounted] = useState(false);

  useEffect(() => {
    const now = performance.now();
    console.log(`[PW] IsolatedWalletButton: useEffect (mount) at ${now.toFixed(0)}ms. Setting buttonMounted = true.`);
    setButtonMounted(true);
  }, []);

  useEffect(() => {
    const now = performance.now();
    if (buttonMounted) {
      console.log(`[PW] IsolatedWalletButton: useEffect (walletSystemReady change) at ${now.toFixed(0)}ms. WalletSystemReady: ${walletSystemReady}`);
    }
  }, [walletSystemReady, buttonMounted]);

  const [visible, setVisible] = useState(false); 
  const [copied, setCopied] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const selectedWalletName = wallet?.adapter.name as WalletName;
  const selectedWalletIcon = wallet?.adapter.icon;
  const readyState = wallet?.adapter.readyState || WalletReadyState.Unsupported;

  const isConnectActionDisabled = useMemo(() => {
    return disabled || !walletSystemReady || !wallet || connecting || disconnecting || connected;
  }, [disabled, walletSystemReady, wallet, connecting, disconnecting, connected]);

  const isDisconnectActionDisabled = useMemo(() => {
    return disabled || disconnecting || !connected;
  }, [disabled, disconnecting, connected]);

  const openDropdown = useCallback(() => setDropdownActive(true), [setDropdownActive]);
  const closeDropdown = useCallback(() => setDropdownActive(false), [setDropdownActive]);
  
  const openWalletSelection = useCallback(() => {
      console.log(`[PW] IsolatedWalletButton: openWalletSelection called at ${performance.now().toFixed(0)}ms`);
      setModalVisible(true); 
  }, [setModalVisible]);


  const handleConnectClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const now = performance.now();
      console.log(`[PW] IsolatedWalletButton: handleConnectClick at ${now.toFixed(0)}ms. WalletSystemReady: ${walletSystemReady}, ReadyState: ${readyState}`);
      if (onClick) onClick(event); 
      if (event.defaultPrevented) return;

      if (!wallet) { 
        openWalletSelection();
      } else if (readyState === WalletReadyState.NotDetected) {
        window.open(wallet.adapter.url, '_blank');
      } else if (readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable) {
        connect().catch((error) => {
          console.error('[WalletButton] Connect error:', error);
        });
        if (onConnect) onConnect();
      } else { 
        openWalletSelection();
      }
    },
    [onClick, wallet, readyState, connect, onConnect, openWalletSelection, walletSystemReady]
  );

  const handleDisconnectClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(event); 
      if (event.defaultPrevented) return;

      disconnect().catch((error) => {
        console.error('[WalletButton] Disconnect error:', error);
      });
      if (onDisconnect) onDisconnect();
      closeDropdown(); 
    },
    [onClick, disconnect, onDisconnect, closeDropdown]
  );

  const handleSelectWallet = useCallback(
    (walletNameToSelect: WalletName) => {
      select(walletNameToSelect);
      closeDropdown();
    },
    [select, closeDropdown]
  );

  const handleCopyAddress = useCallback(async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 400);
    }
    closeDropdown();
  }, [publicKey, closeDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    if (dropdownActive) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownActive, closeDropdown]);

  if (!buttonMounted || !walletSystemReady) {
    const now = performance.now();
    console.log(`[PW] IsolatedWalletButton: Not ready to render full button at ${now.toFixed(0)}ms. ButtonMounted: ${buttonMounted}, WalletSystemReady: ${walletSystemReady}. Rendering placeholder.`);
    return (
      <Button disabled={true} {...props}>
        {connecting ? 'Connecting...' : children ?? 'Connect Wallet'}
      </Button>
    );
  }

  if (!wallet || !connected) {
    const now = performance.now();
    let buttonText = children ?? 'Connect Wallet';
    if (connecting) buttonText = 'Connecting...';
    else if (wallet && readyState !== WalletReadyState.Unsupported) buttonText = `Connect ${selectedWalletName}`;
    else if (wallets.length === 0) buttonText = 'No Wallets Detected';

    console.log(`[PW] IsolatedWalletButton: Rendering 'Connect' or 'Select' button at ${now.toFixed(0)}ms. ReadyState: ${readyState}`);
    return (
      <Button
        disabled={disabled || !walletSystemReady || connecting || (wallet && readyState === WalletReadyState.Unsupported) || wallets.length === 0}
        onClick={handleConnectClick}
        {...props}
      >
        {buttonText}
      </Button>
    );
  }
  
  const nowRender = performance.now();
  console.log(`[PW] IsolatedWalletButton: Rendering connected state button at ${nowRender.toFixed(0)}ms.`);
  return (
    <div className="wallet-adapter-dropdown relative">
      <Button
        aria-expanded={dropdownActive}
        onClick={openDropdown}
        {...props}
      >
        {children ?? (publicKey ? `${publicKey.toBase58().slice(0, 4)}..${publicKey.toBase58().slice(-4)}` : 'Account')}
      </Button>
      {dropdownActive && (
        <ul
          aria-label="dropdown-list"
          className={`absolute z-10 mt-1 min-w-[150px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${dropdownActive ? 'animate-in fade-in-0 zoom-in-95' : 'animate-out fade-out-0 zoom-out-95'}`}
          ref={dropdownRef}
          role="menu"
          style={{ top: '100%', right: 0 }} 
        >
          <li onClick={handleCopyAddress} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" role="menuitem">
            {copied ? 'Copied' : 'Copy address'}
          </li>
          <li onClick={handleDisconnectClick as unknown as React.MouseEventHandler<HTMLLIElement>} className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" role="menuitem">
            Disconnect
          </li>
        </ul>
      )}
    </div>
  );
};
