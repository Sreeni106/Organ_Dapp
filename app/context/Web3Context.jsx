"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/OrganDonation-updated';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(0); // 0 = None, 1 = Donor, 2 = Patient, 3 = Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Connect wallet 
  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions: {},
      });

      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      const organDonationContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      
      setProvider(provider);
      setContract(organDonationContract);
      setAccount(address);

      // Determine user role
      const userRole = await organDonationContract.roles(address);
      setRole(userRole);
      setIsAdmin(userRole == 3);
      setIsDonor(userRole == 1);
      setIsPatient(userRole == 2);
      setLoading(false);

      // Set up event listeners for wallet changes
      connection.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
        window.location.reload();
      });

      connection.on('chainChanged', () => {
        window.location.reload();
      });

      return organDonationContract;
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setLoading(false);
    }
  };

  // Fetch pending users (unverified donors and patients)
  const fetchPendingUsers = async () => {
    if (!contract || !isAdmin) return;
    try {
      const pendingPatients = [];
      const pendingDonors = [];

      const patientCount = await contract.patientList.length;
      const donorCount = await contract.donorList.length;

      for (let i = 0; i < patientCount; i++) {
        const patientAddress = await contract.patientList(i);
        const patient = await contract.patients(patientAddress);
        if (!patient.verified) {
          pendingPatients.push({
            address: patientAddress,
            name: patient.name,
            role: 2, // Patient role
            verified: patient.verified,
            bloodType: patient.bloodType,
            neededOrgan: patient.neededOrgan,
            urgency: patient.urgency,
            location: patient.location,
          });
        }
      }

      for (let i = 0; i < donorCount; i++) {
        const donorAddress = await contract.donorList(i);
        const donor = await contract.donors(donorAddress);
        if (!donor.verified) {
          pendingDonors.push({
            address: donorAddress,
            name: donor.name,
            role: 1, // Donor role
            verified: donor.verified,
            bloodType: donor.bloodType,
            organs: donor.organs || [],
            location: donor.location,
          });
        }
      }

      setPendingUsers([...pendingPatients, ...pendingDonors]);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          await connectWallet();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Listen for contract events and update pending users in real time
  useEffect(() => {
    if (contract && isAdmin) {
      fetchPendingUsers();

      const onUserVerified = (user, role) => {
        fetchPendingUsers();
      };

      const onUserFlagged = (user) => {
        fetchPendingUsers();
      };

      const onUserSuspended = (user) => {
        fetchPendingUsers();
      };

      contract.on('UserVerified', onUserVerified);
      contract.on('UserFlagged', onUserFlagged);
      contract.on('UserSuspended', onUserSuspended);

      return () => {
        contract.off('UserVerified', onUserVerified);
        contract.off('UserFlagged', onUserFlagged);
        contract.off('UserSuspended', onUserSuspended);
      };
    }
  }, [contract, isAdmin]);

  // Other existing methods...

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        contract,
        role,
        isAdmin,
        isDonor,
        isPatient,
        loading,
        connectWallet,
        fetchPendingUsers,
        pendingUsers,
        // other methods...
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
