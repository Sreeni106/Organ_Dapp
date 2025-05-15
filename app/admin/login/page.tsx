"use client";

import { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export default function AdminLogin() {
  const { connectWallet, address, role, setRole } = useWallet();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    if (formData.username !== ADMIN_CREDENTIALS.username || 
        formData.password !== ADMIN_CREDENTIALS.password) {
      setError('Invalid admin credentials');
      return;
    }

    try {
      // Set the role to ADMIN
      setRole('ADMIN');
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-[#0a192f] text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-[#112240] rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#64ffda]">Admin Login</h1>
        
        {!address ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Please connect your wallet to continue</p>
            <Button 
              onClick={connectWallet}
              className="w-full bg-[#64ffda] text-black hover:bg-[#52e0c4]"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Admin Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#64ffda]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Admin Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#1d2d50] border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#64ffda]"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#64ffda] text-black hover:bg-[#52e0c4]"
            >
              Login as Admin
            </Button>
          </form>
        )}
      </div>
    </div>
  );
} 