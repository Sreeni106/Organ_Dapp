'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWeb3 } from '../context/Web3Context';
import { useIPFS } from '../context/IPFSContext';
import { bloodTypes, organTypes, urgencyLevels } from '../config';
import { FaSpinner } from 'react-icons/fa';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, registerAsDonor, registerAsPatient, loading } = useWeb3();
  const { storeMedicalData, mintDonorBadge } = useIPFS();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(searchParams.get('role') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    bloodType: bloodTypes[0],
    organs: [],
    location: '',
    neededOrgan: organTypes[0].name,
    urgency: urgencyLevels[0].id,
    additionalInfo: ''
  });

  // Check if wallet is connected
  useEffect(() => {
    if (!account && !loading) {
      setError('Please connect your wallet first');
    } else {
      setError('');
    }
  }, [account, loading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleOrganSelect = (organId) => {
    const organIdNum = Number(organId);
    setFormData(prev => {
      const organExists = prev.organs.includes(organIdNum);
      
      if (organExists) {
        return {
          ...prev,
          organs: prev.organs.filter(id => id !== organIdNum)
        };
      } else {
        return {
          ...prev,
          organs: [...prev.organs, organIdNum]
        };
      }
    });
  };

  const validateForm = () => {
    if (!formData.name || formData.name.trim() === '') {
      setError('Name is required');
      return false;
    }
    if (!formData.bloodType) {
      setError('Blood type is required');
      return false;
    }
    if (role === 'donor' && formData.organs.length === 0) {
      setError('Please select at least one organ to donate');
      return false;
    }
    if (!formData.location || formData.location.trim() === '') {
      setError('Location is required');
      return false;
    }
    if (role === 'patient' && !formData.neededOrgan) {
      setError('Please select the organ you need');
      return false;
    }
    if (role === 'patient' && !formData.urgency) {
      setError('Please select the urgency level');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Prepare medical data for IPFS storage
      const medicalData = {
        ...formData,
        timestamp: Date.now(),
        wallet: account
      };
      
      // Generate a simple key for encryption (in a real app, use a proper key)
      const encryptionKey = `${account.substring(2, 10)}-key`;
      
      // Store in IPFS and get the hash
      const ipfsHash = await storeMedicalData(medicalData, encryptionKey);
      
      if (role === 'donor') {
        // Register as donor
        const tx = await registerAsDonor(
          formData.name,
          formData.bloodType,
          formData.organs,
          formData.location,
          ipfsHash
        );
        
        if (tx) {
          // Mint donor badge as NFT
          const badgeUrl = await mintDonorBadge({
            name: formData.name,
            organs: formData.organs.map(id => organTypes.find(o => o.id === id)?.name || '')
          });
          
          setSuccessMessage(`Successfully registered as a donor! Your donor badge NFT is available.`);
          
          // Redirect to badge page after a delay
          setTimeout(() => {
            router.push('/badge');
          }, 3000);
        }
      } else {
        // Register as patient
        const tx = await registerAsPatient(
          formData.name,
          formData.bloodType,
          formData.neededOrgan,
          formData.urgency,
          formData.location,
          ipfsHash
        );
        
        if (tx) {
          setSuccessMessage('Successfully registered as a patient! Redirecting to your dashboard...');
          
          // Redirect to dashboard after a delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(`Registration failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        {role === 'donor' ? 'Register as an Organ Donor' : role === 'patient' ? 'Register as a Patient' : 'Choose Your Role'}
      </h1>
      
      {/* Role Selection */}
      {!role && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-center">How would you like to participate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setRole('donor')}
              className="bg-indigo-100 hover:bg-indigo-200 border-2 border-indigo-300 rounded-lg p-6 flex flex-col items-center"
            >
              <div className="bg-indigo-500 text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">I want to be a Donor</h3>
              <p className="text-gray-600 text-center">Register to donate your organs and help save lives</p>
            </button>
            
            <button
              onClick={() => setRole('patient')}
              className="bg-purple-100 hover:bg-purple-200 border-2 border-purple-300 rounded-lg p-6 flex flex-col items-center"
            >
              <div className="bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">I need an Organ</h3>
              <p className="text-gray-600 text-center">Register as a patient looking for an organ donation</p>
            </button>
          </div>
        </div>
      )}
      
      {/* Registration Form */}
      {role && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p>{successMessage}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">
                Blood Type
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="City, State/Province"
                required
              />
            </div>
            
            {/* Donor-specific fields */}
            {role === 'donor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organs Available for Donation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {organTypes.map((organ) => (
                    <div
                      key={organ.id}
                      className={`border rounded-md p-3 cursor-pointer ${
                        formData.organs.includes(organ.id)
                          ? 'bg-indigo-50 border-indigo-500'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleOrganSelect(organ.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.organs.includes(organ.id)}
                          onChange={() => {}}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 text-sm text-gray-700">{organ.name}</label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Patient-specific fields */}
            {role === 'patient' && (
              <>
                <div>
                  <label htmlFor="neededOrgan" className="block text-sm font-medium text-gray-700 mb-1">
                    Needed Organ
                  </label>
                  <select
                    id="neededOrgan"
                    name="neededOrgan"
                    value={formData.neededOrgan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {organTypes.map((organ) => (
                      <option key={organ.id} value={organ.name}>
                        {organ.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Medical Information (Optional)
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Any additional information that might be relevant..."
              />
              <p className="mt-1 text-sm text-gray-500">
                This information will be encrypted and stored securely.
              </p>
            </div>
            
            <div className="flex items-center pt-4">
              <button
                type="button"
                onClick={() => setRole('')}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md mr-4"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !account}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center disabled:bg-indigo-300"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Register as ${role === 'donor' ? 'Donor' : 'Patient'}`
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}