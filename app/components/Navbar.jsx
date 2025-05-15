'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWeb3 } from '../context/Web3Context';
import { useNotifications } from '../context/NotificationContext';
import { FaBell, FaUserCircle, FaTimes } from 'react-icons/fa';

export default function Navbar() {
  const { account, connectWallet, loading, isAdmin, isDonor, isPatient } = useWeb3();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getNavLinks = () => {
    const commonLinks = [
      { href: '/', label: 'Home' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/about', label: 'About' },
    ];

    if (isAdmin) {
      return [
        ...commonLinks,
        { href: '/dashboard', label: 'Admin Dashboard' },
      ];
    } else if (isDonor) {
      return [
        ...commonLinks,
        { href: '/dashboard', label: 'Donor Dashboard' },
        { href: '/register', label: 'Register Organ' },
        { href: '/badge', label: 'My Badge' },
      ];
    } else if (isPatient) {
      return [
        ...commonLinks,
        { href: '/dashboard', label: 'Patient Dashboard' },
        { href: '/matches', label: 'My Matches' },
      ];
    }

    return commonLinks;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">OrganChain</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {/* Notifications */}
            {account && (
              <div className="relative mr-4">
                <button
                  className="relative p-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <FaBell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50">
                    <div className="p-3 border-b flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimes className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500 text-center">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* User account */}
            {account ? (
              <div className="flex items-center">
                <span className="hidden md:inline-block mr-2 text-sm text-gray-700">
                  {formatAddress(account)}
                </span>
                <div className="rounded-full bg-indigo-100 p-2">
                  <FaUserCircle className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 