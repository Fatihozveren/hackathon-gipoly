'use client';

import { useState, useEffect } from 'react';
import { workspaceAPI } from '@/services/api';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspace: any) => void;
  language: string;
}

export function WorkspaceModal({ isOpen, onClose, onWorkspaceCreated, language }: WorkspaceModalProps) {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    store_url: '',
    store_platform: ''
  });

  const translations = {
    en: {
      title: "Workspace Management",
      createNew: "Create New Workspace",
      workspaceName: "Workspace Name",
      storeUrl: "Store URL (Optional)",
      storePlatform: "Store Platform (Optional)",
      create: "Create Workspace",
      selectWorkspace: "Select Workspace",
      noWorkspaces: "No workspaces found. Create your first workspace to get started.",
      loading: "Loading...",
      error: "An error occurred. Please try again."
    },
    tr: {
      title: "Çalışma Alanı Yönetimi",
      createNew: "Yeni Çalışma Alanı Oluştur",
      workspaceName: "Çalışma Alanı Adı",
      storeUrl: "Mağaza URL'si (İsteğe Bağlı)",
      storePlatform: "Mağaza Platformu (İsteğe Bağlı)",
      create: "Çalışma Alanı Oluştur",
      selectWorkspace: "Çalışma Alanı Seç",
      noWorkspaces: "Çalışma alanı bulunamadı. Başlamak için ilk çalışma alanınızı oluşturun.",
      loading: "Yükleniyor...",
      error: "Bir hata oluştu. Lütfen tekrar deneyin."
    }
  };

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (isOpen) {
      loadWorkspaces();
    }
  }, [isOpen]);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspaceAPI.getWorkspaces();
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      const response = await workspaceAPI.createWorkspace(formData);
      const newWorkspace = response.data;
      
      setWorkspaces([...workspaces, newWorkspace]);
      setFormData({ name: '', store_url: '', store_platform: '' });
      onWorkspaceCreated(newWorkspace);
      onClose();
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      
      // Show error notification
      const errorMessage = error.response?.data?.detail || t.error;
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span>${errorMessage}</span>
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
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkspace = (workspace: any) => {
    onWorkspaceCreated(workspace);
    onClose();
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

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">{t.loading}</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Create New Workspace Form */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.createNew}</h3>
              <form onSubmit={handleCreateWorkspace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.workspaceName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="My E-commerce Store"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.storeUrl}
                  </label>
                  <input
                    type="url"
                    value={formData.store_url}
                    onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="https://mystore.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.storePlatform}
                  </label>
                  <select
                    value={formData.store_platform}
                    onChange={(e) => setFormData({ ...formData, store_platform: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select Platform</option>
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="magento">Magento</option>
                    <option value="prestashop">PrestaShop</option>
                    <option value="opencart">OpenCart</option>
                    <option value="trendyol">Trendyol</option>
                    <option value="hepsiburada">Hepsiburada</option>
                    <option value="n11">N11</option>
                    <option value="amazon">Amazon</option>
                    <option value="etsy">Etsy</option>
                    <option value="instagram">Instagram Shop</option>
                    <option value="facebook">Facebook Shop</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-sky-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t.loading : t.create}
                </button>
              </form>
            </div>

            {/* Existing Workspaces */}
            {workspaces.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.selectWorkspace}</h3>
                <div className="space-y-3">
                  {workspaces.map((workspace: any) => (
                    <div
                      key={workspace.id}
                      onClick={() => handleSelectWorkspace(workspace)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-cyan-300 hover:bg-cyan-50/50 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{workspace.name}</div>
                          {workspace.store_url && (
                            <div className="text-sm text-gray-600 mt-1">{workspace.store_url}</div>
                          )}
                          {workspace.store_platform && (
                            <div className="text-sm text-gray-500 mt-1">Platform: {workspace.store_platform}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <span>1 member</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workspaces.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-600">
                {t.noWorkspaces}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 