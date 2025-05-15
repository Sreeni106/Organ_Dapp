'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeb3 } from '../context/Web3Context';
import { useIPFS } from '../context/IPFSContext';
import { organTypes } from '../config';
import { FaHeartbeat, FaQrcode, FaDownload, FaShare, FaTimes, FaCheck } from 'react-icons/fa';

export default function BadgePage() {
  const router = useRouter();
  const { account, isDonor, loading, contract } = useWeb3();
  const { mintDonorBadge } = useIPFS();
  
  const [donorData, setDonorData] = useState(null);
  const [badgeUrl, setBadgeUrl] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!loading && !isDonor) {
      router.push('/');
    }
  }, [loading, isDonor, router]);

  useEffect(() => {
    if (!contract || !account) return;

    const fetchDonorData = async () => {
      try {
        const donor = await contract.donors(account);
        setDonorData({
          name: donor.name,
          organs: donor.organs.map(id => Number(id)), // Convert BigNumber to Number
          bloodType: donor.bloodType,
          verified: donor.verified,
          registrationDate: new Date().toISOString() // In a real app, get this from contract events
        });
      } catch (error) {
        console.error('Error fetching donor data:', error);
      }
    };

    fetchDonorData();
  }, [contract, account]);

  // Function to get organ names from IDs
  const getOrganNames = (organIds) => {
    if (!organIds || !organIds.length) return 'None';
    try {
      return organIds.map(id => organTypes[id]?.name || 'Unknown').join(', ');
    } catch (error) {
      console.error('Error parsing organ IDs:', error);
      return 'Unknown';
    }
  };

  const generateBadge = async () => {
    if (!donorData) return;
    
    try {
      // In a real app, this would mint an NFT and return the token URI
      const url = await mintDonorBadge({
        name: donorData.name,
        organs: donorData.organs.map(id => organTypes[id]?.name || '')
      });
      
      setBadgeUrl(url || 'https://example.com/donor-badge/12345'); // Fallback for demo
    } catch (error) {
      console.error('Error generating badge:', error);
    }
  };

  useEffect(() => {
    if (donorData && donorData.verified && !badgeUrl) {
      generateBadge();
    }
  }, [donorData]);

  const handleShare = () => {
    // Generate a unique shareable link for the badge
    const link = `https://organ-chain.example.com/badge/view/${account}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const downloadBadge = () => {
    // In a real app, this would download the badge image
    alert('Badge download would start in a real app');
  };

  if (loading || !donorData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Your Donor Badge
      </h1>

      {donorData.verified ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-50 border-4 border-indigo-200 rounded-lg p-8 w-full max-w-md mx-auto mb-6">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full p-4 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <FaHeartbeat className="h-12 w-12 text-indigo-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Verified Organ Donor
                </h3>
                
                <p className="text-lg text-gray-600 mb-4">{donorData.name}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Registered Organs</p>
                  <p className="font-medium">{getOrganNames(donorData.organs)}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Blood Type</p>
                  <p className="font-medium">{donorData.bloodType}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <p className="text-sm text-gray-500 mb-1">Verified On</p>
                  <p className="font-medium">{new Date(donorData.registrationDate).toLocaleDateString()}</p>
                </div>
                
                <div className="bg-white p-2 rounded-md inline-block mb-2">
                  <FaQrcode className="h-32 w-32 text-gray-800" />
                </div>
                
                <p className="text-xs text-gray-500">
                  Scan to verify this donor badge on the blockchain
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={downloadBadge}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md flex items-center"
              >
                <FaDownload className="mr-2" />
                Download Badge
              </button>
              <button
                onClick={handleShare}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md flex items-center"
              >
                <FaShare className="mr-2" />
                Share Badge
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-3">About Your Donor Badge</h3>
            <p className="text-blue-700 mb-4">
              Your donor badge is a digital certificate stored on the blockchain that verifies your commitment to organ donation.
              The badge can be shared with family members and medical professionals to ensure your wishes are known.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <FaCheck className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-blue-700 text-sm">
                  Tamper-proof verification that can be validated by any hospital
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <FaCheck className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-blue-700 text-sm">
                  Securely stored on the blockchain with encryption
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <FaCheck className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-blue-700 text-sm">
                  Accessible anywhere, anytime via the QR code
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <FaCheck className="h-4 w-4 text-blue-700" />
                </div>
                <p className="text-blue-700 text-sm">
                  Automatically updates if you register additional organs
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <FaHeartbeat className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Verification Required</h2>
            <p className="text-gray-600 mb-4">
              Your donor profile is currently awaiting verification. Once verified, you'll be able to claim your donor badge.
            </p>
            <p className="text-sm text-gray-500">
              Please check back later or wait for a notification when your verification is complete.
            </p>
          </div>
          
          <Link
            href="/dashboard"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Share Your Donor Badge</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Share this link with others to let them view your donor badge:
            </p>
            
            <div className="flex mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 border border-gray-300 rounded-l-md px-3 py-2"
              />
              <button
                onClick={copyToClipboard}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md"
              >
                {shareCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real app, this could open native sharing
                  navigator.share?.({
                    title: 'My Organ Donor Badge',
                    text: `Check out my verified organ donor badge for ${getOrganNames(donorData.organs)}`,
                    url: shareLink
                  }).catch(() => {
                    copyToClipboard();
                  });
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 