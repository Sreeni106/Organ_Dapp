'use client';

import Link from 'next/link';
import { FaUserPlus, FaUserCheck, FaHeartbeat, FaClipboardCheck, FaHospital, FaUserMd, FaShieldAlt, FaMedkit } from 'react-icons/fa';

export default function HowItWorksPage() {
  const steps = [
    {
      title: 'Register',
      description: 'Create an account as a donor or patient by connecting your wallet and providing basic information.',
      icon: <FaUserPlus className="h-6 w-6 text-indigo-600" />,
      forDonor: 'Register your personal information and organs you wish to donate.',
      forPatient: 'Register your personal information and the organ you need.'
    },
    {
      title: 'Verification',
      description: 'Your profile is verified by admins to ensure authenticity and prevent fraud.',
      icon: <FaUserCheck className="h-6 w-6 text-indigo-600" />,
      forDonor: 'Once verified, your organs become available for potential matches.',
      forPatient: 'After verification, the system will start looking for potential donors.'
    },
    {
      title: 'Matching',
      description: 'Our AI-powered system matches donors and patients based on compatibility criteria.',
      icon: <FaHeartbeat className="h-6 w-6 text-indigo-600" />,
      forDonor: 'Your organs are matched with patients based on compatibility.',
      forPatient: 'The system finds the most compatible donors for your needed organ.'
    },
    {
      title: 'Notification',
      description: 'You receive notifications when matches are found or when your status changes.',
      icon: <FaClipboardCheck className="h-6 w-6 text-indigo-600" />,
      forDonor: 'You\'ll be notified when your donation is matched with a patient.',
      forPatient: 'You\'ll be instantly notified when a compatible donor is found.'
    },
    {
      title: 'Hospital Coordination',
      description: 'Hospitals coordinate the transplant process with donors and patients.',
      icon: <FaHospital className="h-6 w-6 text-indigo-600" />,
      forDonor: 'Hospitals will contact you to coordinate the donation process.',
      forPatient: 'Hospitals will contact you to coordinate the transplant procedure.'
    },
    {
      title: 'Transplantation',
      description: 'The transplant is performed by medical professionals at approved hospitals.',
      icon: <FaUserMd className="h-6 w-6 text-indigo-600" />,
      forDonor: 'Medical professionals handle the organ donation process.',
      forPatient: 'Medical professionals perform the transplant procedure.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
        How Organ Donation Works
      </h1>
      <p className="text-lg text-center mb-12 text-gray-600 max-w-3xl mx-auto">
        Our blockchain-based platform ensures secure, transparent, and efficient organ donation matching.
      </p>

      {/* Process Steps */}
      <div className="space-y-8 mb-16">
        {steps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row">
              <div className="bg-indigo-100 rounded-full p-4 h-16 w-16 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl font-semibold text-gray-800 mr-2">
                    Step {index + 1}: {step.title}
                  </h2>
                  <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    On-chain
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{step.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                      <FaHeartbeat className="mr-2" /> For Donors
                    </h3>
                    <p className="text-blue-700 text-sm">{step.forDonor}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-800 mb-2 flex items-center">
                      <FaUserMd className="mr-2" /> For Patients
                    </h3>
                    <p className="text-purple-700 text-sm">{step.forPatient}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Features */}
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Key Features & Benefits
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <FaShieldAlt className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Privacy & Security
              </h3>
              <p className="text-gray-600">
                All sensitive medical data is encrypted and stored securely on IPFS.
                Only authorized parties can access your information.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <FaHeartbeat className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Real-time Matching
              </h3>
              <p className="text-gray-600">
                Our AI-powered system continuously searches for optimal matches
                and immediately notifies you when a compatible donor/patient is found.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <FaHospital className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Hospital Verification
              </h3>
              <p className="text-gray-600">
                All users are verified by approved medical institutions to
                ensure the integrity and safety of the donation process.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-3 rounded-full mr-4">
              <FaMedkit className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Transparent Process
              </h3>
              <p className="text-gray-600">
                The entire organ donation process is recorded on the blockchain,
                ensuring transparency and traceability at every step.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-600 text-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to make a difference?</h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto">
          Join our platform today and help save lives through secure, transparent organ donation.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="/register?role=donor"
            className="bg-white text-indigo-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
          >
            Register as Donor
          </Link>
          <Link
            href="/register?role=patient"
            className="bg-indigo-500 text-white hover:bg-indigo-400 px-6 py-3 rounded-md font-medium"
          >
            Request an Organ
          </Link>
        </div>
      </div>
    </div>
  );
} 