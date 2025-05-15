'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '../context/Web3Context';
import { FaHeartbeat, FaFilter, FaMapMarkerAlt, FaSort, FaSearch, FaCheck } from 'react-icons/fa';

export default function MatchesPage() {
  const router = useRouter();
  const { account, isPatient, loading, contract } = useWeb3();
  
  const [patientData, setPatientData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    minMatchScore: 0,
    maxDistance: 1000,
    sortBy: 'score',  // 'score', 'distance', 'date'
    sortDirection: 'desc'
  });

  useEffect(() => {
    if (!loading && !isPatient) {
      router.push('/');
    }
  }, [loading, isPatient, router]);

  // Fetch patient data and matches
  useEffect(() => {
    if (!contract || !account) return;

    const fetchPatientData = async () => {
      try {
        const patient = await contract.patients(account);
        
        setPatientData({
          name: patient.name,
          neededOrgan: patient.neededOrgan,
          urgency: patient.urgency,
          verified: patient.verified,
          location: patient.location,
          bloodType: patient.bloodType
        });
        
        // In a real app, fetch matches from contract
        // For demo, use sample matches
        const sampleMatches = [
          { 
            donorAddress: '0x1234...5678', 
            matchScore: 92, 
            organ: 'Kidney', 
            bloodType: 'A+', 
            location: 'Delhi',
            distance: 5,
            timestamp: Date.now() - 3600000
          },
          { 
            donorAddress: '0xabcd...ef01', 
            matchScore: 87, 
            organ: 'Kidney', 
            bloodType: 'A+', 
            location: 'Mumbai',
            distance: 1200,
            timestamp: Date.now() - 86400000
          },
          { 
            donorAddress: '0x9876...5432', 
            matchScore: 78, 
            organ: 'Kidney', 
            bloodType: 'A-', 
            location: 'Bangalore',
            distance: 800,
            timestamp: Date.now() - 172800000
          }
        ];
        
        setMatches(sampleMatches);
        setFilteredMatches(sampleMatches);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, [contract, account]);

  // Apply filters
  useEffect(() => {
    if (!matches.length) return;
    
    let filtered = [...matches];
    
    // Filter by match score
    filtered = filtered.filter(match => match.matchScore >= filters.minMatchScore);
    
    // Filter by distance
    filtered = filtered.filter(match => match.distance <= filters.maxDistance);
    
    // Sort matches
    filtered.sort((a, b) => {
      if (filters.sortBy === 'score') {
        return filters.sortDirection === 'desc' ? b.matchScore - a.matchScore : a.matchScore - b.matchScore;
      } else if (filters.sortBy === 'distance') {
        return filters.sortDirection === 'desc' ? b.distance - a.distance : a.distance - b.distance;
      } else if (filters.sortBy === 'date') {
        return filters.sortDirection === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
      }
      return 0;
    });
    
    setFilteredMatches(filtered);
  }, [matches, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSortDirection = () => {
    setFilters(prev => ({
      ...prev,
      sortDirection: prev.sortDirection === 'desc' ? 'asc' : 'desc'
    }));
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !patientData) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Your Organ Matches
      </h1>

      {patientData.verified ? (
        <>
          {/* Patient info */}
          <div className="bg-purple-50 rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Your Organ Request</h2>
                <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Needed Organ</p>
                    <p className="font-medium text-gray-900">{patientData.neededOrgan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="font-medium text-gray-900">{patientData.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Urgency</p>
                    <p className="font-medium text-gray-900">{patientData.urgency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{patientData.location}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="mt-4 md:mt-0 flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md"
              >
                <FaFilter className="mr-2" />
                {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>

          {/* Filters */}
          {isFilterOpen && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Filter Matches</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Match Score
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minMatchScore}
                      onChange={(e) => handleFilterChange('minMatchScore', parseInt(e.target.value))}
                      className="w-full mr-2"
                    />
                    <span className="text-sm font-medium text-gray-900 w-10">
                      {filters.minMatchScore}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Distance (km)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={filters.maxDistance}
                      onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                      className="w-full mr-2"
                    />
                    <span className="text-sm font-medium text-gray-900 w-14">
                      {filters.maxDistance}km
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <div className="flex items-center">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="score">Match Score</option>
                      <option value="distance">Distance</option>
                      <option value="date">Date</option>
                    </select>
                    <button
                      onClick={toggleSortDirection}
                      className="ml-2 bg-gray-200 p-2 rounded-md"
                    >
                      <FaSort className={`h-5 w-5 ${filters.sortDirection === 'desc' ? 'text-gray-800' : 'text-gray-500'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Match results */}
          {filteredMatches.length > 0 ? (
            <div className="space-y-4">
              {filteredMatches.map((match, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex items-start mb-4 md:mb-0">
                      <div className="bg-indigo-100 p-3 rounded-full mr-4">
                        <FaHeartbeat className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center flex-wrap">
                          <h3 className="font-medium text-gray-900 mr-2">
                            {match.organ} Donor
                          </h3>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {match.matchScore}% Match
                          </span>
                          <span className="ml-2 text-sm text-gray-500">
                            Found: {formatDate(match.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          Blood Type: {match.bloodType}
                        </p>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <FaMapMarkerAlt className="h-4 w-4 text-gray-500 mr-1" />
                          <span>{match.location} ({match.distance} km away)</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Donor ID: {match.donorAddress}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex space-x-2">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center text-sm">
                          <FaCheck className="mr-2" />
                          Express Interest
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FaSearch className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
              <p className="text-gray-600 mb-4">
                No donor matches found with the current filter settings.
              </p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or check back later for new donors.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="bg-yellow-50 p-6 rounded-lg mb-6">
            <FaHeartbeat className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Verification Required</h2>
            <p className="text-gray-600 mb-4">
              Your patient profile needs to be verified before you can view potential matches.
            </p>
            <p className="text-sm text-gray-500">
              Please check back later or wait for a notification when your verification is complete.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md inline-block"
          >
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
} 