"use client";

import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/OrganDonation-updated';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type OrganType = 0 | 1 | 2 | 3 | 4;

export default function DonorRegistration() {
  const { connectWallet, address, setRole } = useWallet();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodType: '',
    organType: 0 as OrganType,
    medicalHistory: '',
    contactInfo: '',
    location: '',
    organs: [] as OrganType[],
    ipfsHash: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`handleChange DEBUG: Setting formData.${name} to: "${value}"`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrganChange = (value: string) => {
    const organType = parseInt(value) as OrganType;
    console.log(`handleOrganChange DEBUG: Setting formData.organType to: ${organType}, and formData.organs to: [${organType}]`);
    setFormData(prev => ({
      ...prev,
      organType,
      organs: [organType]
    }));
  };

  const handleBloodTypeChange = (value: string) => {
    console.log(`handleBloodTypeChange DEBUG: Setting formData.bloodType to: "${value}"`);
    setFormData(prev => ({
      ...prev,
      bloodType: value
    }));
  };

  const registerDonor = async () => {
    console.log('registerDonor DEBUG: formData received by registerDonor:', JSON.stringify(formData, null, 2));
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

      console.log('registerDonor DEBUG: Validating fields ->',
        'Name:', formData.name, '(Type:', typeof formData.name, ')',
        'Age:', formData.age, '(Type:', typeof formData.age, ')',
        'BloodType:', formData.bloodType, '(Type:', typeof formData.bloodType, ')',
        'OrganType (single selected):', formData.organType, '(Type:', typeof formData.organType, ')',
        'Organs Array (for contract):', JSON.stringify(formData.organs), '(Length:', formData.organs.length, ')',
        'MedicalHistory:', formData.medicalHistory, '(Type:', typeof formData.medicalHistory, ')',
        'Location:', formData.location, '(Type:', typeof formData.location, ')',
        'ContactInfo:', formData.contactInfo, '(Type:', typeof formData.contactInfo, ')',
        'IPFSHash:', formData.ipfsHash, '(Type:', typeof formData.ipfsHash, ')'
      );

      // Validate input data
      if (!formData.name || !formData.age || !formData.bloodType || formData.organs.length === 0 || !formData.location) {
        console.error('registerDonor DEBUG: VALIDATION FAILED. Problematic formData:', JSON.stringify(formData, null, 2));
        throw new Error('Validation failed: All fields (Name, Age, Blood Type, Organ, Location) are required');
      }

      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18) {
        throw new Error('Age must be at least 18 years old');
      }

      // Log the data being sent to the contract
      const registrationData = {
        name: formData.name,
        age: age,
        bloodType: formData.bloodType,
        organs: [formData.organType],
        location: formData.location,
        ipfsHash: formData.ipfsHash || "DefaultPlaceholderHashIfEmpty"
      };
      console.log('Registration Data:', registrationData);

      // Try to call the contract function
      try {
        console.log('Attempting to call contract function with parameters:', {
          name: registrationData.name,
          age: registrationData.age,
          bloodType: registrationData.bloodType,
          organs: registrationData.organs,
          location: registrationData.location,
          ipfsHash: registrationData.ipfsHash
        });

        const tx = await contract.registerDonor(
          registrationData.name,
          registrationData.age,
          registrationData.bloodType,
          registrationData.organs,
          registrationData.location,
          registrationData.ipfsHash,
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
    console.log('handleSubmit DEBUG: Initial formData upon submit:', JSON.stringify(formData, null, 2));
    setError('');
    setLoading(true);

    if (!address) {
      setError('Please connect your wallet first');
      setLoading(false);
      return;
    }

    try {
      // Register donor on the smart contract
      const success = await registerDonor();
      
      if (!success) {
        setError('Failed to register as donor');
        setLoading(false);
        return;
      }

      // Set the role to DONOR
      setRole('DONOR');
      router.push('/donor/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a192f] text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#112240] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#64ffda]">Donor Registration</h1>
        
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
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
              />
            </div>

            <div>
              <Label>Age</Label>
              <Input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="18"
                max="65"
                className="w-full bg-[#1d2d50] border-gray-600"
                required
              />
            </div>

            <div>
              <Label>Blood Type</Label>
              <Select onValueChange={handleBloodTypeChange} value={formData.bloodType}>
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
              <Label>Organ Type</Label>
              <Select onValueChange={handleOrganChange} value={formData.organType.toString()}>
                <SelectTrigger className="w-full bg-[#1d2d50] border-gray-600">
                  <SelectValue placeholder="Select organ type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Kidney</SelectItem>
                  <SelectItem value="1">Liver</SelectItem>
                  <SelectItem value="2">Heart</SelectItem>
                  <SelectItem value="3">Lung</SelectItem>
                  <SelectItem value="4">Pancreas</SelectItem>
                </SelectContent>
              </Select>
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

            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
              />
            </div>

            <div>
              <Label>Contact Information</Label>
              <Input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border-gray-600"
                required
                placeholder="Emergency contact details"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#64ffda] text-black hover:bg-[#52e0c4]"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register as Donor'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/donor/login" className="text-[#64ffda] hover:underline">
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