'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWeb3 } from '../../context/Web3Context';
import { FaHeartbeat, FaSearch, FaHospital, FaBell, FaUserMd } from 'react-icons/fa';

export default function PatientDashboard({ data }) {
  const { contract } = useWeb3();
  const [selectedTab, setSelectedTab] = useState('matches');

  const getUrgencyBadge = (urgency) => {
    const classes = {
      'Low': 'bg-blue-100 text-blue-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-orange-100 text-orange-800',
      'Critical': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[urgency] || 'bg-gray-100'}`}>
        {urgency}
      </span>
    );
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

  const renderMatchesTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">My Organ Matches</h2>
          <p className="text-gray-600 mt-1">
            Compatible donors based on your medical profile
          </p>
        </div>
        <div className="mt-3 md:mt-0">
          Status: {renderStatusBadge(data.verified)}
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Patient</p>
            <p className="font-medium text-gray-900">{data.name}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <p className="text-sm text-gray-500 mb-1">Needed Organ</p>
            <p className="font-medium text-gray-900">{data.neededOrgan}</p>
          </div>
          <div className="mt-3 md:mt-0">
            <p className="text-sm text-gray-500 mb-1">Urgency</p>
            <p className="font-medium text-gray-900 flex items-center">
              {getUrgencyBadge(data.urgency)}
            </p>
          </div>
        </div>
      </div>

      {data.verified ? (
        data.matches && data.matches.length > 0 ? (
          <div className="space-y-4">
            {data.matches.map((match, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition duration-150">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                      <FaHeartbeat className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 mr-2">
                          {match.organ} Donor
                        </h3>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Blood Type: {match.bloodType} • Location: {match.location}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Donor ID: {match.donorAddress}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">
                      Contact Hospital
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <FaSearch className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-600 mb-4">
              We're actively searching for compatible donors for your requested organ.
            </p>
            <p className="text-sm text-gray-500">
              You'll receive a notification as soon as a match is found.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <FaUserMd className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Required</h3>
          <p className="text-gray-600 mb-4">
            Your patient profile needs to be verified before you can view potential matches.
          </p>
          <p className="text-sm text-gray-500">
            Please wait for an admin to verify your account.
          </p>
        </div>
      )}
    </div>
  );

  const renderRequestsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">My Organ Requests</h2>
          <p className="text-gray-600 mt-1">
            Track the status of your organ requests
          </p>
        </div>
        <Link
          href="/register?role=patient"
          className="mt-3 md:mt-0 bg-purple-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Request New Organ
        </Link>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaHeartbeat className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {data.neededOrgan} Requested
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Requested on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center">
                  <span className="text-gray-600 text-sm mr-2">Urgency:</span>
                  {getUrgencyBadge(data.urgency)}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        Request Status
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-indigo-600">
                        {data.verified ? 'Active Search' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div
                      style={{ width: data.verified ? '75%' : '25%' }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    ></div>
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-center">
                  <div className="space-y-1">
                    <div className={`h-2 w-2 rounded-full mx-auto ${
                      true ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <p className="text-gray-600">Requested</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-2 w-2 rounded-full mx-auto ${
                      data.verified ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <p className="text-gray-600">Verified</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-2 w-2 rounded-full mx-auto ${
                      data.verified && data.matches && data.matches.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <p className="text-gray-600">Matched</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`h-2 w-2 rounded-full mx-auto bg-gray-300`}></div>
                    <p className="text-gray-600">Transplanted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Notifications</h2>
      
      <div className="space-y-4">
        <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaBell className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-indigo-800">Profile Received</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>Your patient profile has been received and is awaiting verification.</p>
              </div>
              <div className="mt-1">
                <p className="text-sm text-indigo-500">Today at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        {data.verified && data.matches && data.matches.length > 0 && (
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaUserMd className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">New Match Found!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>We've found a potential donor match for your {data.neededOrgan} request.</p>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-green-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaHospital className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Verification Complete</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Your patient profile has been verified. We're now searching for compatible donors.</p>
              </div>
              <div className="mt-1">
                <p className="text-sm text-blue-500">2 days ago</p>
              </div>
            </div>
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
              selectedTab === 'matches'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('matches')}
          >
            <div className="flex items-center">
              <FaHeartbeat className="mr-2" />
              My Matches
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'requests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('requests')}
          >
            <div className="flex items-center">
              <FaUserMd className="mr-2" />
              My Requests
            </div>
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              selectedTab === 'notifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTab('notifications')}
          >
            <div className="flex items-center">
              <FaBell className="mr-2" />
              Notifications
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'matches' && renderMatchesTab()}
      {selectedTab === 'requests' && renderRequestsTab()}
      {selectedTab === 'notifications' && renderNotificationsTab()}
    </div>
  );
} 