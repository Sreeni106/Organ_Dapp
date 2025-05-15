'use client';

import { createContext, useContext } from 'react';
import { NFTStorage } from 'nft.storage';
import { useWeb3 } from './Web3Context';

const IPFSContext = createContext();

// Create NFT.Storage client (you'll need your API key)
const NFT_STORAGE_KEY = 'your-nft-storage-api-key'; // Replace with env variable in production
const client = new NFTStorage({ token: NFT_STORAGE_KEY });

export const IPFSProvider = ({ children }) => {
  const { account, isAdmin } = useWeb3();

  // Basic AES encryption for sensitive data
  const encryptData = async (data, key) => {
    try {
      // In a real app, use a proper encryption library
      // This is a simplistic example for demo purposes
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(JSON.stringify(data));
      
      // Use account address as additional entropy for encryption
      const combinedKey = key + account.substring(2, 10);
      
      // Convert to base64 for storing
      const encryptedString = btoa(combinedKey + JSON.stringify(dataBytes));
      return encryptedString;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  };

  // Basic decryption
  const decryptData = async (encryptedData, key) => {
    try {
      // In a real app, use a proper decryption method
      // This is a simplistic example for demo purposes
      const combinedKey = key + account.substring(2, 10);
      
      // Parse the base64 string
      const rawString = atob(encryptedData);
      
      // Extract the data part (removing the key prefix)
      const dataString = rawString.substring(combinedKey.length);
      
      // Parse the JSON data
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw error;
    }
  };

  // Store medical records on IPFS with encryption
  const storeMedicalData = async (medicalData, encryptionKey) => {
    try {
      // Encrypt the data before storing
      const encryptedData = await encryptData(medicalData, encryptionKey);
      
      // Create a blob with the encrypted data
      const blob = new Blob([encryptedData], { type: 'application/encrypted' });
      
      // Store on IPFS via NFT.Storage
      const metadata = await client.storeBlob(blob);
      
      // Return IPFS hash (CID)
      return metadata;
    } catch (error) {
      console.error('Error storing data on IPFS:', error);
      throw error;
    }
  };

  // Retrieve and decrypt medical records from IPFS
  const retrieveMedicalData = async (ipfsHash, encryptionKey) => {
    try {
      // Check if user is authorized (admin or owner of the data)
      if (!isAdmin && !account) {
        throw new Error('Unauthorized access to medical data');
      }
      
      // Fetch the data from IPFS
      const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
      const encryptedData = await response.text();
      
      // Decrypt the data
      const decryptedData = await decryptData(encryptedData, encryptionKey);
      
      return decryptedData;
    } catch (error) {
      console.error('Error retrieving data from IPFS:', error);
      throw error;
    }
  };

  // Store donor badge as NFT
  const mintDonorBadge = async (donorData) => {
    try {
      // Create JSON metadata for the NFT
      const metadata = {
        name: 'Organ Donor Badge',
        description: `Certificate of organ donation by ${donorData.name}`,
        image: 'https://example.com/donor-badge.png', // Replace with actual badge image
        properties: {
          donorName: donorData.name,
          donorAddress: account,
          organs: donorData.organs.join(', '),
          dateRegistered: new Date().toISOString(),
        },
      };
      
      // Store as NFT metadata on IPFS
      const stored = await client.store(metadata);
      
      return stored.url;
    } catch (error) {
      console.error('Error minting donor badge:', error);
      throw error;
    }
  };

  return (
    <IPFSContext.Provider
      value={{
        storeMedicalData,
        retrieveMedicalData,
        mintDonorBadge,
      }}
    >
      {children}
    </IPFSContext.Provider>
  );
};

export const useIPFS = () => useContext(IPFSContext); 