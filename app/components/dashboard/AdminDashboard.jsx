'use client';

import { useState, useEffect } from 'react';
import { FaUserCheck, FaExclamationTriangle, FaHeartbeat, FaHospital, FaUserMd } from 'react-icons/fa';
import { useWeb3 } from '../../context/Web3Context';
import { roles } from '../../config';


export default function AdminDashboard({ data }) {
  const { contract } = useWeb3();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('verify');
  const [loading, setLoading] = useState(false);

  // Fetch pending users for verification
  useEffect(() => {
    if (!contract) return;

    const fetchPendingUsers = async () => {
      try {
        // In a real app, this would query contract events/state
        // Mock data for demo purposes
        setPendingUsers([
          {
            address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
            name: 'Ravi Kumar',
            role: roles.DONOR,
            verified: false,
            registerDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            bloodType: 'A+',
            organs: ['Kidney'],
            location: 'Delhi'
          },
          {
            address: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
            name: 'Anjali Mehra',
            role: roles.PATIENT,
            verified: false,
            registerDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            bloodType: 'A+',
            neededOrgan: 'Kidney',
            urgency: 'High',
            location: 'Lucknow'
          }
        ]);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      }
    };

    fetchPendingUsers();
  }, [contract]);

  const verifyUser = async (address, role) => {
    if (!contract) return;

    setLoading(true);
    try {
      const tx = await contract.verifyUser(address, role);
      await tx.wait();
      
      // Update UI
      setPendingUsers(prev => prev.filter(user => user.address !== address));
      
      // Success notification handled by NotificationContext
    } catch (error) {
      console.error('Error verifying user:', error);
    } finally {
      setLoading(false);
    }
  };

  const markDonorDeceased = async (address) => {
    if (!contract) return;

    setLoading(true);
    try {
      const tx = await contract.markDonorDeceased(address);
      await tx.wait();
      
      // Success notification handled by NotificationContext
    } catch (error) {
      console.error('Error marking donor as deceased:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Pending Verifications ({pendingUsers.length})</h2>
      
      {pendingUsers.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No pending verifications</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingUsers.map((user) => (
                <tr key={user.address}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          {user.role === roles.DONOR ? (
                            <FaHeartbeat className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <FaUserMd className="h-5 w-5 text-purple-600" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.address.substring(0, 8)}...{user.address.substring(user.address.length - 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.role === roles.DONOR ? 'Donor' : 'Patient'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.role === roles.DONOR ? (
                        <>Blood: {user.bloodType}, Organs: {user.organs.join(', ')}</>
                      ) : (
                        <>Blood: {user.bloodType}, Needed: {user.neededOrgan}, Urgency: {user.urgency}</>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">Location: {user.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.registerDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => verifyUser(user.address, user.role)}
                      disabled={loading}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setPendingUsers(prev => prev.filter(u => u.address !== user.address))}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderDonorStatusTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Donor Status</h2>
      
      {/* This would be a real-time list from the blockchain in a full app */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
        <p className="text-gray-700">
          When a donor is marked as deceased, all their available organs will be made available for matching with patients.
          This will trigger real-time notifications to matching patients.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Sample donors - in a real app, this would be fetched from the blockchain */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Ravi Kumar</div>
                    <div className="text-sm text-gray-500">0x1a2b...9a0b</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Kidney</div>
                <div className="text-sm text-gray-500">Blood Type: A+</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => markDonorDeceased('0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b')}
                  className="text-red-600 hover:text-red-900 flex items-center"
                >
                  <FaExclamationTriangle className="mr-1" />
                  Mark Deceased
                </button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Priya Sharma</div>
                    <div className="text-sm text-gray-500">0x9a8b...1a0b</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">Liver, Lung</div>
                <div className="text-sm text-gray-500">Blood Type: O-</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => markDonorDeceased('0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b')}
                  className="text-red-600 hover:text-red-900 flex items-center"
                >
                  <FaExclamationTriangle className="mr-1" />
                  Mark Deceased
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStatsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <FaHeartbeat className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Donors</p>
              <p className="text-2xl font-bold text-gray-800">{data.activeDonors}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <FaUserMd className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Patients</p>
              <p className="text-2xl font-bold text-gray-800">{data.activePatients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <FaUserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Recent Matches</p>
              <p className="text-2xl font-bold text-gray-800">{data.recentMatches}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-gray-800">System Health</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Smart Contract Status</p>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">IPFS Connection</p>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Matching Engine</p>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Running
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Total Organs Available</p>
            <span className="font-medium">{data.totalOrgans}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'verify'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('verify')}
          >
            <div className="flex items-center">
              <FaUserCheck className="mr-2" />
              Verify Users
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'status'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('status')}
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Donor Status
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'stats'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('stats')}
          >
            <div className="flex items-center">
              <FaHospital className="mr-2" />
              System Stats
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'verify' && renderVerificationTab()}
      {selectedTab === 'status' && renderDonorStatusTab()}
      {selectedTab === 'stats' && renderStatsTab()}
    </div>
  );
} 