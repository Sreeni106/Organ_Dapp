'use client';

import { useEffect, useState } from 'react';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';

export default function NotificationToast() {
  const { notifications } = useNotifications();
  const [activeToasts, setActiveToasts] = useState([]);

  // Listen for new notifications to show toasts
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // Only show toast for unread notifications
      if (!latestNotification.read) {
        const toastId = Date.now();
        
        // Add to active toasts
        setActiveToasts(prev => [...prev, { 
          id: toastId, 
          ...latestNotification 
        }]);
        
        // Auto remove after timeout
        setTimeout(() => {
          setActiveToasts(prev => prev.filter(toast => toast.id !== toastId));
        }, 5000);
      }
    }
  }, [notifications]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'info':
        return <FaInfoCircle className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FaInfoCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getToastBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const removeToast = (id) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center p-4 rounded-md shadow-lg border ${getToastBgColor(toast.type)} transition-opacity duration-300 max-w-md`}
        >
          <div className="flex-shrink-0 mr-3">
            {getToastIcon(toast.type)}
          </div>
          <div className="flex-1 mr-2">
            <p className="text-sm font-medium text-gray-900">{toast.title}</p>
            <p className="text-sm text-gray-700 mt-1">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 