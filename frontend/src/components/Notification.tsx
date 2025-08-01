import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return ''; // No icon for info notifications
      default:
        return '';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg ${getTypeStyles()}`}>
        <span className="text-lg">{getIcon()}</span>
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}; 