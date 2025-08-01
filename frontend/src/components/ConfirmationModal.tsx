import React from 'react';
import { X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-500 hover:bg-yellow-600',
          borderColor: 'border-yellow-200'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-500 hover:bg-blue-600',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-500 hover:bg-red-600',
          borderColor: 'border-red-200'
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full relative shadow-2xl border border-white/60">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center`}>
            <span className="text-2xl">{styles.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 ${styles.buttonBg} text-white rounded-xl font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}; 