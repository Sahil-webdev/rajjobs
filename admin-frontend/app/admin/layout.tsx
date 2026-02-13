"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '../../lib/api';
import Sidebar from '../../components/Sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ email: string; name?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setAuthToken(null);
    api.post('/api/auth/logout').catch(() => {});
    router.replace('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      console.log('🔐 Admin Layout: Checking authentication...');
      console.log('📝 Token exists:', token ? 'Yes' : 'No');
      
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        router.replace('/login');
        return;
      }
      
      // Set token before making request
      setAuthToken(token);
      console.log('✅ Token set in headers');
      
      try {
        console.log('📡 Fetching admin profile...');
        const res = await api.get('/api/auth/me');
        console.log('✅ Admin profile fetched successfully:', res.data);
        setAdmin(res.data);
        setLoading(false);
      } catch (err: any) {
        console.error('❌ Failed to fetch admin profile:', err.response?.status, err.response?.data);
        console.log('🗑️ Clearing invalid token and redirecting to login');
        localStorage.removeItem('accessToken');
        setAuthToken(null);
        router.replace('/login');
      }
    };
    
    verifyAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8f9fb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>⏳</div>
          <p style={{ color: '#6b7280' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="main-content">
        <div className="navbar">
          <div style={{ flex: 1 }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>Welcome, <strong>{admin?.name || admin?.email}</strong></span>
          </div>
          <div className="nav-links" style={{ justifyContent: 'flex-end' }}>
            <button className="button secondary" style={{ width: 'auto', padding: '8px 16px', fontWeight: 500 }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <div className="container">{children}</div>
      </div>
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        ☰
      </button>
    </div>
  );
}
