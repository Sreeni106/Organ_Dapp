'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { organTypes } from '../../config.js';
import { FaHeartbeat, FaQrcode, FaPlus, FaHistory } from 'react-icons/fa';

export default function DonorDashboard({ data }) {
  const { contract } = useWeb3();
  const [selectedTab, setSelectedTab] = useState('donations');

  // Defensive check for data to avoid undefined errors
  if (!data) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500">Error: Donor data is not available.</p>
      </div>
    );
  }

  // Display organ names instead of IDs
  const getOrganNames = (organIds) => {
    if (!organIds || !organIds.length) return 'None';
    try {
      return organIds.map(id => organTypes[id].name).join(', ');
    } catch (error) {
      console.error('Error parsing organ IDs:', error);
      return 'Unknown';
    }
  };

  const renderStatusBadge = (verified) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${
        verified
          ? 'bg-green-100 text-green-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {verified ? 'Verified' : 'Pending Verification'}
    </span>
  );

  const renderDonationsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">My Organ Donations</h2>
          <p className="text-gray-600 mt-1">
            Registered organs available for donation
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center">
          <div className="mr-4">
            Status: {renderStatusBadge(data.verified)}
          </div>
          <Link
            href="/register?role=donor"
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm"
          >
            <FaPlus className="mr-2" />
            Register New Organ
          </Link>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Donor Name</p>
            <p className="font-medium text-gray-900">{data.name}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <p className="text-sm text-gray-500 mb-1">Available Organs</p>
            <p className="font-medium text-gray-900">{getOrganNames(data.organs)}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <p className="font-medium text-gray-900">
              {data.verified ? 'Verified Donor' : 'Awaiting Verification'}
            </p>
          </div>
        </div>
      </div>

      {/* Individual organs */}
      {data.organs && data.organs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.organs.map((organId, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                  <FaHeartbeat className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {organTypes[organId]?.name || 'Unknown Organ'}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Registered for donation
                  </p>
                  {data.verified ? (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Verified & Ready
                    </span>
                  ) : (
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Awaiting Verification
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FaHeartbeat className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organs Registered</h3>
          <p className="text-gray-600 mb-4">
            You haven't registered any organs for donation yet.
          </p>
          <Link
            href="/register?role=donor"
            className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm"
          >
            <FaPlus className="mr-2" />
            Register New Organ
          </Link>
        </div>
      )}
    </div>
  );

  const renderBadgeTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Donor Badge</h2>
      
      {data.verified ? (
        <div className="flex flex-col items-center">
          <div className="bg-indigo-50 border-4 border-indigo-200 rounded-lg p-8 mb-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full p-4 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <FaHeartbeat className="h-12 w-12 text-indigo-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Verified Organ Donor
              </h3>
              
              <p className="text-lg text-gray-600 mb-4">{data.name}</p>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500">Registered Organs</p>
                <p className="font-medium">{getOrganNames(data.organs)}</p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Verified On</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="bg-white p-2 rounded-md inline-block">
                <FaQrcode className="h-32 w-32 text-gray-800" />
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Scan to verify this donor badge on the blockchain
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-md">
              Download Badge
            </button>
            <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md flex items-center">
              <FaQrcode className="mr-2" />
              Share QR Code
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FaQrcode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Badge Not Available</h3>
          <p className="text-gray-600 mb-4">
            Your donor status needs to be verified before you can claim your badge.
          </p>
          <p className="text-sm text-gray-500">
            Please wait for an admin to verify your account.
          </p>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Donation History</h2>
      
      {data.donatedOrgans && data.donatedOrgans.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.donatedOrgans.map((donation, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {donation.organ}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donation.recipient}
                    </div>
                    <div className="text-xs text-gray-500">
                      {donation.recipientAddress.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {donation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        donation.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {donation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FaHistory className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Donation History</h3>
          <p className="text-gray-600">
            Your past donations will appear here once they've been completed.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'donations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('donations')}
          >
            <div className="flex items-center">
              <FaHeartbeat className="mr-2" />
              My Donations
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'badge'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('badge')}
          >
            <div className="flex items-center">
              <FaQrcode className="mr-2" />
              Donor Badge
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'history'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('history')}
          >
            <div className="flex items-center">
              <FaHistory className="mr-2" />
              History
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'donations' && renderDonationsTab()}
      {selectedTab === 'badge' && renderBadgeTab()}
      {selectedTab === 'history' && renderHistoryTab()}
    </div>
  );
} 