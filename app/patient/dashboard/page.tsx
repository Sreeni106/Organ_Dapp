"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/OrganDonation-updated';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PatientInfo {
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
  donorName: string;
  organType: string;
  matchScore: number;
  distance: number;
}

export default function PatientDashboard() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const urgencyLevels: Record<number, { label: string; variant: "destructive" | "warning" | "default" | "secondary" }> = {
    4: { label: "Critical", variant: "destructive" },
    3: { label: "High", variant: "warning" },
    2: { label: "Medium", variant: "default" },
    1: { label: "Low", variant: "default" },
  };

const loadPatientData = async () => {
  try {
    setLoading(true);
    setError('');

    if (!window.ethereum || !address) {
      throw new Error('MetaMask is not installed or not connected');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Get patient info directly from the mapping (no 'function' needed)
    const patientData = await contract.patients(address); // Mapping access, not function call

    setPatientInfo({
      name: patientData.name,
      bloodType: patientData.bloodType,
      neededOrgan: patientData.neededOrgan,
      urgency: Number(patientData.urgency),
      location: patientData.location,
      verified: patientData.verified,
      ipfsHash: patientData.ipfsHash,
    });

    // Continue with matches fetching as before
    let potentialMatches: Match[] = [];
    if (contract && typeof contract.getMatches === 'function') {
      try {
        potentialMatches = await contract.getMatches(address);
        console.warn("Patient Dashboard: contract.getMatches() exists but is likely a placeholder. Using returned matches.");
      } catch (e) {
        console.error("Patient Dashboard: Error calling getMatches:", e);
        potentialMatches = [];
      }
    } else {
      console.warn("Patient Dashboard: contract.getMatches function not found or contract not loaded. Using empty array for matches.");
    }
    setMatches(potentialMatches);

    const newNotifs = potentialMatches
      .filter((match: Match) => match.matchScore > 80)
      .map((match: Match) => `New high-priority match with ${match.donorName} (${match.organType})`);
    setNotifications(newNotifs);
  } catch (err: any) {
    console.error('Error loading patient data:', err);
    setError(err.message || "An unknown error occurred");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (address) {
      loadPatientData();
    }
  }, [address]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (address) {
        loadPatientData();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [address]);

  if (error) {
    return (
      <div className="bg-[#0a192f] text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">⚠️ Error: {error}</p>
        <Button onClick={loadPatientData}>Try Again</Button>
      </div>
    );
  }

  if (loading || !patientInfo) {
    return (
      <div className="bg-[#0a192f] text-white min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const urgency = urgencyLevels[patientInfo.urgency] || { label: "Unknown", variant: "secondary" };

  return (
    <div className="bg-[#0a192f] text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#64ffda]">Welcome, {patientInfo.name}</h1>

        <Button className="mb-6" onClick={loadPatientData}>
          🔄 Refresh Data
        </Button>

        <div className="mb-8">
          <Badge
            variant={patientInfo.verified ? "success" : "warning"}
            className="text-lg px-4 py-2"
          >
            {patientInfo.verified ? "Verified Patient" : "Pending Verification"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Blood Type</p>
                  <p className="text-xl">{patientInfo.bloodType}</p>
                </div>
                <div>
                  <p className="text-gray-400">Needed Organ</p>
                  <p className="text-xl">{patientInfo.neededOrgan}</p>
                </div>
                <div>
                  <p className="text-gray-400">Urgency Level</p>
                  <Badge variant={urgency.variant} className="mt-2">{urgency.label}</Badge>
                </div>
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="text-xl">{patientInfo.location}</p>
                </div>
                {patientInfo.ipfsHash && (
                  <div>
                    <p className="text-gray-400">Medical Records</p>
                    <a
                      href={`https://ipfs.io/ipfs/${patientInfo.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#64ffda] underline text-sm"
                    >
                      View on IPFS
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div key={index} className="p-4 bg-[#1d2d50] rounded-lg">
                      {notification}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No new notifications</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#112240] border-gray-700">
          <CardHeader>
            <CardTitle className="text-[#64ffda]">Potential Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match) => (
                  <div key={match.donorAddress} className="p-4 bg-[#1d2d50] rounded-lg">
                    <p className="font-bold">{match.donorName}</p>
                    <p>Organ Type: {match.organType}</p>
                    <p>Match Score: {match.matchScore}%</p>
                    <p>Distance: {match.distance.toFixed(2)} km</p>
                    <Badge
                      className="mt-2"
                      variant={match.matchScore > 80 ? "success" : "warning"}
                    >
                      {match.matchScore > 80 ? "High Priority Match" : "Potential Match"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No potential matches found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
