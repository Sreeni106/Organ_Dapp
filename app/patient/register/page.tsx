"use client";

import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/OrganDonation-updated';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function PatientRegister() {
  const { connectWallet, address, setRole } = useWallet();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    bloodType: '',
    age: '',
    neededOrgan: '',
    urgency: '',
    medicalHistory: '',
    location: '',
    ipfsHash: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.bloodType || !formData.age || !formData.neededOrgan || !formData.urgency || !formData.location) {
      throw new Error('All fields are required');
    }
    const age = parseInt(formData.age);
    if (isNaN(age) || age <= 0) {
      throw new Error('Age must be a positive number');
    }
  };

  const registerPatient = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Validate input data
      validateForm();

      // Log the data being sent to the contract
      const registrationData = {
        name: formData.fullName,
        bloodType: formData.bloodType,
        age: parseInt(formData.age),
        neededOrgan: formData.neededOrgan,
        urgency: formData.urgency,
        location: formData.location
      };
      console.log('Registration Data:', registrationData);

      // Try to call the contract function
      try {
        console.log('Attempting to call contract function...');
        const tx = await contract.registerPatient(
          registrationData.name,
          registrationData.bloodType,
          registrationData.neededOrgan,
          registrationData.urgency,
          registrationData.location,
          formData.ipfsHash,
          registrationData.age,
          { gasLimit: 500000 }
        );

        console.log('Transaction sent:', tx.hash);

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction receipt:', receipt);
        
        if (receipt.status === 0) {
          throw new Error('Transaction failed');
        }

        return true;
      } catch (error: any) {
        console.error('Contract call failed:', {
          message: error.message,
          code: error.code,
          data: error.data,
          reason: error.reason
        });

        if (error.message.includes('execution reverted')) {
          throw new Error('Transaction would revert. Please check your input data.');
        } else if (error.message.includes('insufficient funds')) {
          throw new Error('Insufficient funds for gas');
        } else if (error.message.includes('nonce')) {
          throw new Error('Transaction nonce error. Please try again.');
        } else {
          throw new Error(`Contract call failed: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      throw new Error(`Registration failed: ${error.message || 'Unknown error occurred'}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!address) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    try {
      // Register patient on the smart contract
      const success = await registerPatient();
      
      if (!success) {
        setError('Failed to register as patient');
        setLoading(false);
        return;
      }

      // Set the role to RECIPIENT
      setRole('RECIPIENT');
      router.push('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a192f] text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#112240] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#64ffda]">Patient Registration</h1>
        
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
              />
            </div>

            <div>
              <Label>Blood Type</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))} value={formData.bloodType}>
                <SelectTrigger className="w-full bg-[#1d2d50] border-gray-600">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Age</Label>
              <Input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
                placeholder="Your age"
              />
            </div>

            <div>
              <Label>Needed Organ</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, neededOrgan: value }))} value={formData.neededOrgan}>
                <SelectTrigger className="w-full bg-[#1d2d50] border-gray-600">
                  <SelectValue placeholder="Select organ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kidney">Kidney</SelectItem>
                  <SelectItem value="Liver">Liver</SelectItem>
                  <SelectItem value="Heart">Heart</SelectItem>
                  <SelectItem value="Lung">Lung</SelectItem>
                  <SelectItem value="Pancreas">Pancreas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Urgency Level</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))} value={formData.urgency}>
                <SelectTrigger className="w-full bg-[#1d2d50] border-gray-600">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Low - Can wait months</SelectItem>
                  <SelectItem value="2">Medium - Can wait weeks</SelectItem>
                  <SelectItem value="3">High - Can wait days</SelectItem>
                  <SelectItem value="4">Critical - Immediate need</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
                placeholder="Your current location"
              />
            </div>

            <div>
              <Label>Medical History</Label>
              <Input
                type="text"
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
                placeholder="Any relevant medical conditions or history"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#64ffda] text-black hover:bg-[#52e0c4]"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register as Patient'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/patient/login" className="text-[#64ffda] hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 