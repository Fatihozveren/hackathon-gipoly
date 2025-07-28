'use client';

import { useState } from 'react';
import api from '@/services/api';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  language: string;
  onUserUpdated: (user: any) => void;
}

export function UserSettingsModal({ isOpen, onClose, user, language, onUserUpdated }: UserSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    website_url: user?.website_url || '',
    store_platform: user?.store_platform || ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const translations = {
    en: {
      title: "User Settings",
      profile: "Profile",
      password: "Password",
      fullName: "Full Name",
      websiteUrl: "Website URL",
      storePlatform: "Store Platform",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      save: "Save Changes",
      updateProfile: "Update Profile",
      changePassword: "Change Password",
      loading: "Saving...",
      success: "Settings updated successfully!",
      error: "An error occurred. Please try again.",
      passwordsNotMatch: "Passwords do not match"
    },
    tr: {
      title: "Kullanıcı Ayarları",
      profile: "Profil",
      password: "Şifre",
      fullName: "Ad Soyad",
      websiteUrl: "Website URL",
      storePlatform: "Mağaza Platformu",
      currentPassword: "Mevcut Şifre",
      newPassword: "Yeni Şifre",
      confirmPassword: "Şifre Tekrar",
      save: "Değişiklikleri Kaydet",
      updateProfile: "Profili Güncelle",
      changePassword: "Şifre Değiştir",
      loading: "Kaydediliyor...",
      success: "Ayarlar başarıyla güncellendi!",
      error: "Bir hata oluştu. Lütfen tekrar deneyin.",
      passwordsNotMatch: "Şifreler eşleşmiyor"
    }
  };

  const t = translations[language as keyof typeof translations];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/profile', profileData);
      onUserUpdated(response.data);
      showNotification(t.success, 'success');
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || t.error;
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showNotification(t.passwordsNotMatch, 'error');
      return;
    }

    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      showNotification(t.success, 'success');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || t.error;
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500';
    notification.className = `fixed top-4 right-4 bg-gradient-to-r ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${type === 'success' ? 'M5 13l4 4L19 7' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'}" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'profile' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.profile}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'password' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.password}
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.fullName}
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.websiteUrl}
              </label>
              <input
                type="url"
                value={profileData.website_url}
                onChange={(e) => setProfileData({ ...profileData, website_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.storePlatform}
              </label>
              <select
                value={profileData.store_platform}
                onChange={(e) => setProfileData({ ...profileData, store_platform: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Select Platform</option>
                <option value="shopify">Shopify</option>
                <option value="woocommerce">WooCommerce</option>
                <option value="trendyol">Trendyol</option>
                <option value="hepsiburada">Hepsiburada</option>
                <option value="n11">N11</option>
                <option value="amazon">Amazon</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-sky-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.loading : t.updateProfile}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.currentPassword}
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.newPassword}
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-sky-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.loading : t.changePassword}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 