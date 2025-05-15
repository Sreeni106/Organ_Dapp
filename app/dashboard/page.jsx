'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';
import { FaUserCircle, FaHospital, FaHeartbeat, FaUserMd, FaListAlt, FaHistory, FaExclamationTriangle, FaChartLine, FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa';
import { organTypes } from '../config';

export default function Dashboard() {
  const router = useRouter();
  const { address, role, isConnected, loading } = useWallet();
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isConnected && !loading) {
      router.push('/');
    }
  }, [isConnected, loading, router]);

  // Fetch user-specific dashboard data
  useEffect(() => {
    if (!address) return;

    const fetchDashboardData = async () => {
      setFetching(true);
      setError(null);
      try {
        if (role === 'ADMIN') {
          // Mock admin data
          setDashboardData({
            pendingVerifications: 7,
            activeDonors: 24,
            activePatients: 32,
            recentMatches: 3,
            totalOrgans: 45,
            stats: {
              monthlyDonations: 12,
              successRate: '85%',
              averageWaitTime: '45 days'
            }
          });
        } else if (role === 'DONOR') {
          // Mock donor data
          setDashboardData({
            name: 'John Doe',
            organs: ['Kidney', 'Liver'],
            verified: true,
            donatedOrgans: [],
            stats: {
              totalDonations: 2,
              impactScore: 95,
              lastDonation: '2024-02-15'
            }
          });
        } else if (role === 'RECIPIENT') {
          // Mock patient data
          const matches = [
            { 
              donorAddress: '0x1234...5678', 
              matchScore: 92, 
              organ: 'Kidney', 
              bloodType: 'A+', 
              location: 'Delhi' 
            },
            { 
              donorAddress: '0xabcd...ef01', 
              matchScore: 87, 
              organ: 'Kidney', 
              bloodType: 'A+', 
              location: 'Mumbai' 
            }
          ];
          
          setDashboardData({
            name: 'Jane Smith',
            neededOrgan: 'Kidney',
            urgency: 'High',
            verified: true,
            matches: matches,
            stats: {
              waitTime: '30 days',
              matchProbability: '75%',
              priorityScore: 85
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setFetching(false);
      }
    };

    fetchDashboardData();
  }, [address, role]);

  if (loading || !address || fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center">
          <FaExclamationTriangle className="mr-2" />
        {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {role === 'ADMIN' ? 'Admin Dashboard' : role === 'DONOR' ? 'Donor Dashboard' : 'Patient Dashboard'}
      </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <FaUserCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {role === 'ADMIN' && dashboardData && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FaUsers className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Donors</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.activeDonors}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FaCheckCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Recent Matches</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.recentMatches}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <FaClock className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.pendingVerifications}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'DONOR' && dashboardData && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FaHeartbeat className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Donations</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.totalDonations}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FaChartLine className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Impact Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.impactScore}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <FaListAlt className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Organs</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.organs.length}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'RECIPIENT' && dashboardData && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FaClock className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Wait Time</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.waitTime}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <FaChartLine className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Match Probability</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.matchProbability}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <FaExclamationTriangle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Priority Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboardData.stats.priorityScore}</p>
                  </div>
                </div>
              </div>
        </>
      )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {role === 'ADMIN' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                {/* Add admin-specific content */}
              </div>
            )}

            {role === 'DONOR' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">My Donations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.organs.map((organ, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                          <FaHeartbeat className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900">{organ}</h3>
                          <p className="text-sm text-gray-500">Available for donation</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role === 'RECIPIENT' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Potential Matches</h2>
                <div className="space-y-4">
                  {dashboardData.matches.map((match, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <FaUserMd className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-900">{match.organ}</h3>
                            <p className="text-sm text-gray-500">Blood Type: {match.bloodType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{match.matchScore}% Match</p>
                          <p className="text-sm text-gray-500">{match.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}