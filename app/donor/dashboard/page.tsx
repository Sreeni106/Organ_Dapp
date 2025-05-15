"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../contracts/OrganDonation';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { organTypes } from '../../config';

interface DonorInfo {
  name: string;
  age: number;
  bloodType: string;
  organs: string[];
  location: string;
  deceased: boolean;
  verified: boolean;
  suspended: boolean;
  flagged: boolean;
  committed: boolean;
  ipfsHash: string;
}

interface Match {
  patientAddress: string;
  patientName: string;
  neededOrgan: string;
  urgency: number;
  matchScore: number;
  distance: number;
}

export default function DonorDashboard() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [donorInfo, setDonorInfo] = useState<DonorInfo | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum || !address) {
        throw new Error('MetaMask is not installed or not connected.');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Fetch donor info using getDonorDetails
      const rawDonorData = await contract.getDonorDetails(address);
      console.log("Donor Dashboard DEBUG: Data returned by getDonorDetails:", rawDonorData);
      console.log("Donor Dashboard DEBUG: Raw organs array from contract:", JSON.stringify(rawDonorData.organs));

      const parsedDonor: DonorInfo = {
        name: rawDonorData.name,
        age: parseInt(rawDonorData.age.toString()),
        bloodType: rawDonorData.bloodType,
        organs: rawDonorData.organs.map((orgEnumValue: any) => {
          const numericValue = parseInt(orgEnumValue.toString());
          console.log("Donor Dashboard DEBUG: Mapping organEnumValue:", numericValue, "(Type:", typeof numericValue, ")");
          const organName = organTypes[numericValue] || `Unknown Organ (${numericValue})`;
          console.log("Donor Dashboard DEBUG: Mapped to organ name:", organName);
          return organName;
        }),
        location: rawDonorData.location,
        deceased: rawDonorData.deceased,
        verified: rawDonorData.verified,
        suspended: rawDonorData.suspended,
        flagged: rawDonorData.flagged,
        committed: rawDonorData.committed,
        ipfsHash: rawDonorData.ipfsHash,
      };

      console.log("Donor Dashboard DEBUG: Final parsedDonor object:", JSON.stringify(parsedDonor, null, 2));
      setDonorInfo(parsedDonor);

      // Fetch matches
      let matchList: Match[] = [];
      if (contract && typeof contract.getMatches === 'function') {
        try {
          matchList = await contract.getMatches(address);
          console.warn("Donor Dashboard: contract.getMatches() exists but is likely a placeholder. Using returned matches.");
        } catch (e) {
          console.error("Donor Dashboard: Error calling getMatches:", e);
          matchList = [];
        }
      } else {
        console.warn("Donor Dashboard: contract.getMatches function not found or contract not loaded. Using empty array for matches.");
      }
      setMatches(matchList);

      // Generate notifications
      const urgentMatches = matchList
        .filter((m) => m.matchScore > 80 || m.urgency >= 3)
        .map((m) => `Urgent match: ${m.patientName} needs a ${m.neededOrgan}`);
      setNotifications(urgentMatches);

    } catch (err: any) {
      console.error("Error loading donor data:", err);
      setError(err.message || 'Something went wrong fetching donor data.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (address) loadDonorData();
  }, [address]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (address) loadDonorData();
    }, 30000);
    return () => clearInterval(interval);
  }, [address]);

  if (loading || !donorInfo) {
    return (
      <div className="bg-[#0a192f] text-white min-h-screen flex items-center justify-center">
        <p>⏳ Loading donor dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0a192f] text-white min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">⚠️ Error: {error}</p>
        <Button onClick={loadDonorData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#0a192f] text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-[#64ffda]">
          Welcome, {donorInfo.name}
        </h1>

        <Button className="mb-6" onClick={loadDonorData}>
          🔄 Refresh Data
        </Button>

        <div className="mb-8">
          <Badge
            variant={donorInfo.verified ? "success" : "warning"}
            className="text-lg px-4 py-2"
          >
            {donorInfo.verified ? "Verified Donor" : "Pending Verification"}
          </Badge>
        </div>

        {/* Donor Info + Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-[#112240] border-gray-700">
            <CardHeader>
              <CardTitle className="text-[#64ffda]">Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Blood Type</p>
                  <p className="text-xl">{donorInfo.bloodType}</p>
                </div>
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="text-xl">{donorInfo.location}</p>
                </div>
                <div>
                  <p className="text-gray-400">Registered Organs</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {donorInfo.organs.length > 0 ? (
                      donorInfo.organs.map((organ, index) => (
                        <Badge key={index} variant="outline" className="text-[#64ffda]">
                          {organ}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No organs listed</p>
                    )}
                  </div>
                </div>
                {donorInfo.ipfsHash && (
                  <div>
                    <p className="text-gray-400">Medical Records</p>
                    <a
                      href={`https://ipfs.io/ipfs/${donorInfo.ipfsHash}`}
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
                <ul className="space-y-2">
                  {notifications.map((note, idx) => (
                    <li key={idx} className="p-3 bg-[#1d2d50] rounded-lg">
                      {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No urgent matches currently</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Matches Section */}
        <Card className="bg-[#112240] border-gray-700">
          <CardHeader>
            <CardTitle className="text-[#64ffda]">Potential Matches</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match, index) => (
                  <div key={index} className="p-4 bg-[#1d2d50] rounded-lg">
                    <p className="font-bold">{match.patientName}</p>
                    <p>Organ Needed: {match.neededOrgan}</p>
                    <p>Urgency Level: {match.urgency}</p>
                    <p>Match Score: {match.matchScore}%</p>
                    <p>Distance: {match.distance.toFixed(2)} km</p>
                    <Badge
                      className="mt-2"
                      variant={match.matchScore > 80 ? "success" : "warning"}
                    >
                      {match.matchScore > 80 ? "High Priority Match" : "Match Found"}
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
