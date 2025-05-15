"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/OrganDonation-updated';
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

interface Donor {
  donorAddress: string;
  name: string;
  bloodType: string;
  organs: string[];
  location: string;
  deceased: boolean;
  verified: boolean;
  ipfsHash: string;
}

interface Patient {
  patientAddress: string;
  name: string;
  bloodType: string;
  neededOrgan: string;
  urgency: number;
  location: string;
  verified: boolean;
  ipfsHash: string;
}

interface Match {
  donorAddress: string;
  patientAddress: string;
  organType: string;
  matchScore: number;
  distance: number;
}

export default function AdminDashboard() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('verification');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalPatients: 0,
    totalMatches: 0,
    pendingVerifications: 0
  });

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) throw new Error('MetaMask is not installed');

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Fetch donor addresses (unchanged)
      const donorAddresses: string[] = await contract.getDonorList();

      // Fetch patient addresses using the new function
      const patientAddresses: string[] = await contract.getPatientList(); // Use the new function

      const donorsData = await Promise.all(
        donorAddresses.map(async (address: string) => {
          const donor = await contract.donors(address);
          return {
            donorAddress: address,
            name: donor.name,
            bloodType: donor.bloodType,
            organs: donor.organs,
            location: donor.location,
            deceased: donor.deceased,
            verified: donor.verified,
            ipfsHash: donor.ipfsHash
          };
        })
      );

      const patientsData = await Promise.all(
        patientAddresses.map(async (address: string) => {
          const patient = await contract.patients(address);
          return {
            patientAddress: address,
            name: patient.name,
            bloodType: patient.bloodType,
            neededOrgan: patient.neededOrgan,
            urgency: patient.urgency,
            location: patient.location,
            verified: patient.verified,
            ipfsHash: patient.ipfsHash
          };
        })
      );

      setDonors(donorsData);
      setPatients(patientsData);

      // Calculate statistics
      setStats({
        totalDonors: donorsData.length,
        totalPatients: patientsData.length,
        totalMatches: matches.length,
        pendingVerifications: donorsData.filter(d => !d.verified).length + patientsData.filter(p => !p.verified).length
      });

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userAddress: string, role: 'donor' | 'patient') => {
  try {
    setLoading(true);
    setError('Transaction in progress... Please wait.');

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    if (!contract.verifyUser) {
      throw new Error('verifyUser function is not available on the contract');
    }

    // Role handling: 'donor' maps to 1 and 'patient' maps to 2
    const roleValue = role === 'donor' ? 1 : 2;

    // Call the verifyUser function on the contract
    const tx = await contract.verifyUser(userAddress, roleValue);

    // Wait for the transaction to be mined and get the receipt
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      // Transaction succeeded
      await loadDashboardData(); // Reload data after successful verification
      setError('User verified successfully!');
    } else {
      // Transaction failed
      setError('Transaction failed. Please try again.');
    }
  } catch (error: any) {
    console.error('Error verifying user:', error);

    // Log the full error to the console to inspect all details
    console.log('Error details:', error);

    // Handle different types of errors
    if (error.code === 'INSUFFICIENT_FUNDS') {
      setError('Insufficient funds for transaction. Please check your wallet.');
    } else if (error.data && error.data.message) {
      setError(error.data.message);  // Custom error message from the contract
    } else if (error.message) {
      setError(error.message);  // Standard error message
    } else {
      setError('Unknown error during user verification.');
    }
  } finally {
    setLoading(false); // Ensure loading state is reset
  }
};


  // Suspend user
  const suspendUser = async (userAddress: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.suspendUser(userAddress);
      await tx.wait();

      await loadDashboardData();
    } catch (error: any) {
      console.error('Error suspending user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Flag user
  const flagUser = async (userAddress: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.flagUser(userAddress);
      await tx.wait();

      await loadDashboardData();
    } catch (error: any) {
      console.error('Error flagging user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Revoke donor commitment
  const revokeDonorCommitment = async (donorAddress: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.revokeDonorCommitment(donorAddress);
      await tx.wait();

      await loadDashboardData();
    } catch (error: any) {
      console.error('Error revoking donor commitment:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validate donor commitment
  const validateDonorCommitment = async (donorAddress: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.validateDonorCommitment(donorAddress);
      await tx.wait();

      await loadDashboardData();
    } catch (error: any) {
      console.error('Error validating donor commitment:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark donor as deceased
  const markDonorDeceased = async (donorAddress: string) => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.markDonorDeceased(donorAddress);
      await tx.wait();

      // Reload data after marking deceased
      await loadDashboardData();
    } catch (error: any) {
      console.error('Error marking donor deceased:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Find matches
  const findMatches = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Get all verified patients
      const verifiedPatients = patients.filter(p => p.verified);
      const newMatches: Match[] = [];

      for (const patient of verifiedPatients) {
        const patientMatches = await contract.getMatches(patient.patientAddress);
        newMatches.push(...patientMatches);
      }

      setMatches(newMatches);
    } catch (error: any) {
      console.error('Error finding matches:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two locations (simplified)
  const calculateDistance = (loc1: string, loc2: string) => {
    // This is a placeholder. In a real application, you would use a geocoding service
    // to convert locations to coordinates and calculate actual distances
    return Math.random() * 100; // Random distance for demonstration
  };

  // Load data on component mount
  useEffect(() => {
    if (address) {
      loadDashboardData();
    }
  }, [address]);

  return (
    <div className="bg-[#0a192f] text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#64ffda]">Admin Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalDonors}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Total Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Total Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.totalMatches}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Pending Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-[#112240]">
            <TabsTrigger value="verification">Registration Verification</TabsTrigger>
            <TabsTrigger value="death">Death Confirmation</TabsTrigger>
            <TabsTrigger value="matchmaking">Matchmaking</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
          </TabsList>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unverified Donors */}
              <Card className="bg-[#112240] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#64ffda]">Unverified Donors</CardTitle>
                </CardHeader>
                <CardContent>
                  {donors.filter(d => !d.verified).map((donor) => (
                    <div key={donor.donorAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                      <p className="font-bold">{donor.name}</p>
                      <p>Blood Type: {donor.bloodType}</p>
                      <p>Location: {donor.location}</p>
                      <Button
                        onClick={() => verifyUser(donor.donorAddress, 'donor')}
                        className="mt-2 bg-[#64ffda] text-black hover:bg-[#52e0c4]"
                        disabled={loading}
                      >
                        Verify Donor
                      </Button>
                    </div>
                  ))}
                  {donors.filter(d => d.verified).map((donor) => (
                    <div key={donor.donorAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                      <p className="font-bold">{donor.name}</p>
                      <p>Blood Type: {donor.bloodType}</p>
                      <p>Location: {donor.location}</p>
                      <p>Status: {donor.deceased ? "Deceased" : "Active"}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          onClick={() => suspendUser(donor.donorAddress)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                          disabled={loading}
                        >
                          Suspend
                        </Button>
                        <Button
                          onClick={() => flagUser(donor.donorAddress)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={loading}
                        >
                          Flag
                        </Button>
                        <Button
                          onClick={() => revokeDonorCommitment(donor.donorAddress)}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                          disabled={loading}
                        >
                          Revoke Commitment
                        </Button>
                        <Button
                          onClick={() => validateDonorCommitment(donor.donorAddress)}
                          className="bg-green-500 hover:bg-green-600 text-white"
                          disabled={loading}
                        >
                          Validate Commitment
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Unverified Patients */}
              <Card className="bg-[#112240] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#64ffda]">Unverified Patients</CardTitle>
                </CardHeader>
                <CardContent>
                  {patients.filter(p => !p.verified).map((patient) => (
                    <div key={patient.patientAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                      <p className="font-bold">{patient.name}</p>
                      <p>Blood Type: {patient.bloodType}</p>
                      <p>Needed Organ: {patient.neededOrgan}</p>
                      <p>Urgency: {patient.urgency}</p>
                      <Button
                        onClick={() => verifyUser(patient.patientAddress, 'patient')}
                        className="mt-2 bg-[#64ffda] text-black hover:bg-[#52e0c4]"
                        disabled={loading}
                      >
                        Verify Patient
                      </Button>
                    </div>
                  ))}
                  {patients.filter(p => p.verified).map((patient) => (
                    <div key={patient.patientAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                      <p className="font-bold">{patient.name}</p>
                      <p>Blood Type: {patient.bloodType}</p>
                      <p>Needed Organ: {patient.neededOrgan}</p>
                      <p>Urgency: {patient.urgency}</p>
                      <p>Status: Active</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          onClick={() => suspendUser(patient.patientAddress)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                          disabled={loading}
                        >
                          Suspend
                        </Button>
                        <Button
                          onClick={() => flagUser(patient.patientAddress)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                          disabled={loading}
                        >
                          Flag
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Death Confirmation Tab */}
          <TabsContent value="death" className="space-y-4">
            <Card className="bg-[#112240] border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#64ffda]">Donor Death Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {donors.filter(d => d.verified && !d.deceased).map((donor) => (
                  <div key={donor.donorAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                    <p className="font-bold">{donor.name}</p>
                    <p>Blood Type: {donor.bloodType}</p>
                    <p>Location: {donor.location}</p>
                    <Button
                      onClick={() => markDonorDeceased(donor.donorAddress)}
                      className="mt-2 bg-red-500 hover:bg-red-600"
                      disabled={loading}
                    >
                      Confirm Death
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Matchmaking Tab */}
          <TabsContent value="matchmaking" className="space-y-4">
            <Card className="bg-[#112240] border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#64ffda]">Organ Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={findMatches}
                  className="mb-4 bg-[#64ffda] text-black hover:bg-[#52e0c4]"
                  disabled={loading}
                >
                  Find Matches
                </Button>

                <div className="space-y-4">
                  {matches.map((match, index) => (
                    <div key={index} className="p-4 border border-gray-700 rounded-lg">
                      <p className="font-bold">Match #{index + 1}</p>
                      <p>Donor: {match.donorAddress}</p>
                      <p>Patient: {match.patientAddress}</p>
                      <p>Organ: {match.organType}</p>
                      <p>Match Score: {match.matchScore}</p>
                      <p>Distance: {match.distance.toFixed(2)} km</p>
                      <Badge className="mt-2" variant={match.matchScore > 80 ? "success" : "warning"}>
                        {match.matchScore > 80 ? "High Priority" : "Medium Priority"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#112240] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#64ffda]">Donor Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Donors: {stats.totalDonors}</p>
                  <p>Verified Donors: {donors.filter(d => d.verified).length}</p>
                  <p>Deceased Donors: {donors.filter(d => d.deceased).length}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#64ffda]">Patient Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Total Patients: {stats.totalPatients}</p>
                  <p>Verified Patients: {patients.filter(p => p.verified).length}</p>
                  <p>Critical Patients: {patients.filter(p => p.urgency === 4).length}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#112240] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#64ffda]">Donor Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {donors.map((donor) => (
                    <div key={donor.donorAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                      <p className="font-bold">{donor.name}</p>
                      <p>Blood Type: {donor.bloodType}</p>
                      <p>Location: {donor.location}</p>
                      <p>Status: {donor.deceased ? "Deceased" : donor.verified ? "Verified" : "Unverified"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#112240] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#64ffda]">Patient Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {patients.map((patient) => (
                    <div key={patient.patientAddress} className="p-4 border border-gray-700 rounded-lg mb-4">
                      <p className="font-bold">{patient.name}</p>
                      <p>Blood Type: {patient.bloodType}</p>
                      <p>Needed Organ: {patient.neededOrgan}</p>
                      <p>Urgency: {patient.urgency}</p>
                      <p>Status: {patient.verified ? "Verified" : "Unverified"}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 