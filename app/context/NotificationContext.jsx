'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useWeb3 } from './Web3Context';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { contract, account } = useWeb3();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!contract || !account) return;

    const handleOrganRegistered = (donor, organs) => {
      if (donor.toLowerCase() !== account.toLowerCase()) {
        addNotification({
          type: 'success',
          title: 'New Organ Registered',
          message: `A new organ donation has been registered by ${donor.substring(0, 8)}...`,
          timestamp: Date.now(),
        });
      }
    };

    const handleMatchFound = (donor, patient) => {
      if (patient.toLowerCase() === account.toLowerCase()) {
        addNotification({
          type: 'success',
          title: 'Match Found',
          message: `A compatible donor has been found for you!`,
          timestamp: Date.now(),
          urgent: true,
        });
      } else if (donor.toLowerCase() === account.toLowerCase()) {
        addNotification({
          type: 'info',
          title: 'Donation Matched',
          message: `Your organ donation has been matched with a patient`,
          timestamp: Date.now(),
        });
      }
    };

    const handleDonorDeceased = (donor) => {
      addNotification({
        type: 'info',
        title: 'Donor Status Update',
        message: `Donor ${donor.substring(0, 8)}... has been marked as deceased.`,
        timestamp: Date.now(),
      });
    };

    const handleUserVerified = (user, role) => {
      if (user.toLowerCase() === account.toLowerCase()) {
        const roleNames = ['None', 'Donor', 'Patient', 'Admin'];
        addNotification({
          type: 'success',
          title: 'Account Verified',
          message: `Your account has been verified as a ${roleNames[role]}`,
          timestamp: Date.now(),
        });
      }
    };

    // Set up event listeners
    contract.on('OrganRegistered', handleOrganRegistered);
    contract.on('MatchFound', handleMatchFound);
    contract.on('DonorDeceased', handleDonorDeceased);
    contract.on('UserVerified', handleUserVerified);

    return () => {
      contract.off('OrganRegistered', handleOrganRegistered);
      contract.off('MatchFound', handleMatchFound);
      contract.off('DonorDeceased', handleDonorDeceased);
      contract.off('UserVerified', handleUserVerified);
    };
  }, [contract, account]);

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = { id, read: false, ...notification };
    
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    
    // For urgent notifications, also show browser notification if supported
    if (notification.urgent && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Organ Donation DApp', {
          body: notification.message,
          icon: '/logo.png',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext); 