"use client";

import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/OrganDonation';

export default function PatientLogin() {
  const { connectWallet, address, setRole } = useWallet();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const verifyPatient = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // Check if the address is registered as a patient
      const patient = await contract.patients(address);
      console.log('Patient data:', patient);

      // Check if the patient exists and is verified
      if (!patient.patientAddress || patient.patientAddress === ethers.constants.AddressZero) {
        throw new Error('Address not registered as a patient');
      }

      if (!patient.verified) {
        throw new Error('Patient account not verified yet');
      }

      return true;
    } catch (error: any) {
      console.error('Error verifying patient:', error);
      if (error.message.includes('not registered')) {
        throw new Error('Address not registered as a patient');
      } else if (error.message.includes('not verified')) {
        throw new Error('Patient account not verified yet');
      } else {
        throw new Error('Failed to verify patient status');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!address) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    try {
      // Verify patient status through smart contract
      await verifyPatient();
      
      // Set the role to RECIPIENT
      setRole('RECIPIENT');
      router.push('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a192f] text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#112240] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#64ffda]">Patient Login</h1>
        
        {!address ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Please connect your wallet to continue</p>
            <Button 
              onClick={connectWallet}
              className="w-full bg-[#64ffda] text-black hover:bg-[#52e0c4]"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#64ffda]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#64ffda]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#64ffda] text-black hover:bg-[#52e0c4]"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Login'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link href="/patient/register" className="text-[#64ffda] hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 