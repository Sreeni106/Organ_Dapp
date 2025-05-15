"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Define the Role type
type Role = 'ADMIN' | 'DONOR' | 'RECIPIENT' | null;

// Define the context type
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  loading: boolean;
  role: Role;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  setRole: (role: Role) => void;
}

// Create the context
const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  loading: true,
  role: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  setRole: () => {}
});

// Create the provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role>(null);

  // Check if MetaMask is installed
  const checkIfWalletIsInstalled = () => {
    if (typeof window !== 'undefined') {
      return Boolean(window.ethereum);
    }
    return false;
  };

  // Connect to wallet
  const connectWallet = async () => {
    try {
      if (!checkIfWalletIsInstalled()) {
        throw new Error('Please install MetaMask to use this feature');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        // Check if the connected address is admin
        if (accounts[0].toLowerCase() === '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24'.toLowerCase()) {
          setRole('ADMIN');
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setRole(null);
  };

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (checkIfWalletIsInstalled()) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
            // Check if the connected address is admin
            if (accounts[0].toLowerCase() === '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24'.toLowerCase()) {
              setRole('ADMIN');
            }
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          // Check if the connected address is admin
          if (accounts[0].toLowerCase() === '0x5b1869D9A4C187F2EAa108f3062412ecf0526b24'.toLowerCase()) {
            setRole('ADMIN');
          } else {
            setRole(null);
          }
        } else {
          disconnectWallet();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        loading,
        role,
        connectWallet,
        disconnectWallet,
        setRole
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Create a custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 