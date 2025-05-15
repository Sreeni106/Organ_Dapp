"use client";

import { useWallet } from './context/WalletContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function LandingPage() {
  const { address, connectWallet } = useWallet();
  const router = useRouter();

  return (
    <div className="bg-[#0a192f] text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-[#0a2540] shadow-md">
        <h1 className="text-2xl font-bold text-[#64ffda]">Organ DApp</h1>
        <ul className="flex gap-6 font-medium">
          <li className="hover:text-[#64ffda] cursor-pointer">Home</li>
          <li className="hover:text-[#64ffda] cursor-pointer">About</li>
          <li className="hover:text-[#64ffda] cursor-pointer">Contact</li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 px-4">
        <h2 className="text-4xl font-bold mb-4">
          Decentralized Organ Donation Platform
        </h2>
        <p className="text-lg max-w-xl text-gray-300 mb-6">
          Transparent, secure, and efficient management of organ donation using
          blockchain technology.
        </p>
        <Button 
          onClick={connectWallet}
          className="bg-[#64ffda] text-black hover:bg-[#52e0c4] px-6 py-2"
        >
          {address ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
        </Button>
      </section>

      {/* Login Cards */}
      <section className="flex flex-wrap justify-center gap-8 py-12 px-4">
        {/* Admin */}
        <div className="bg-[#112240] rounded-xl p-6 w-80 shadow-md text-center">
          <div className="text-purple-400 text-5xl mb-4">🛡️</div>
          <h3 className="text-2xl font-semibold mb-2">Admin</h3>
          <p className="text-gray-400 mb-4">
            Manage and verify all organ donation activities securely.
          </p>
          <Link href="/admin/login">
            <Button className="bg-blue-600 w-full">Admin Login</Button>
          </Link>
        </div>

        {/* Donor */}
        <div className="bg-[#112240] rounded-xl p-6 w-80 shadow-md text-center">
          <div className="text-green-400 text-5xl mb-4">💚</div>
          <h3 className="text-2xl font-semibold mb-2">Donor</h3>
          <p className="text-gray-400 mb-4">
            Register as a donor or manage your donation preferences.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/donor/login">
              <Button className="bg-green-600 w-full">Donor Login</Button>
            </Link>
            <Link href="/donor/register">
              <Button className="bg-green-300 text-black hover:bg-green-400 w-full">
                New Donor Registration
              </Button>
            </Link>
          </div>
        </div>

        {/* Patient */}
        <div className="bg-[#112240] rounded-xl p-6 w-80 shadow-md text-center">
          <div className="text-blue-400 text-5xl mb-4">🩺</div>
          <h3 className="text-2xl font-semibold mb-2">Patient</h3>
          <p className="text-gray-400 mb-4">
            Register as a patient in need of an organ or check your status.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/patient/login">
              <Button className="bg-purple-600 w-full">Patient Login</Button>
            </Link>
            <Link href="/patient/register">
              <Button className="bg-purple-300 text-black hover:bg-purple-400 w-full">
                New Patient Registration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a2540] text-gray-400 py-6 text-center text-sm mt-auto">
        © {new Date().getFullYear()} Organ Donation DApp. All rights reserved.
      </footer>
    </div>
  );
}
