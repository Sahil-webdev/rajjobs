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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin-sidebar-collapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    } catch (_) {}
  }, []);

  const handleCollapseToggle = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin-sidebar-collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>⏳</div>
          <p style={{ color: 'var(--text-muted)' }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`main-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />
      
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        onCollapseToggle={handleCollapseToggle} 
        isCollapsed={sidebarCollapsed}
        handleLogout={handleLogout}
        admin={admin}
      />
      
      <div className="main-content">
        <div className="navbar" style={{ 
          backdropFilter: 'blur(12px)', 
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky', 
          top: 0, 
          zIndex: 90,
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid var(--navbar-border)'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
            {sidebarCollapsed && (
              <button
                onClick={() => handleCollapseToggle()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s, color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Expand Sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            {/* Elegant profile welcome text */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                System Overview
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Welcome, <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{admin?.name || admin?.email}</strong>
              </span>
            </div>
          </div>

          <div className="nav-links" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Premium Capsule Slider Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 58,
                height: 30,
                borderRadius: 15,
                background: theme === 'dark' ? 'linear-gradient(135deg, #1e1b4b, #312e81)' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '0 3px',
                transition: 'background 0.4s ease, transform 0.2s',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08), 0 1px 2px var(--shadow)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{
                position: 'absolute',
                left: 8,
                fontSize: 10,
                opacity: theme === 'dark' ? 1 : 0,
                transform: theme === 'dark' ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.3s, transform 0.3s',
                pointerEvents: 'none'
              }}>
                ⭐
              </div>
              <div style={{
                position: 'absolute',
                right: 8,
                fontSize: 10,
                opacity: theme === 'light' ? 1 : 0,
                transform: theme === 'light' ? 'scale(1)' : 'scale(0.5)',
                transition: 'opacity 0.3s, transform 0.3s',
                pointerEvents: 'none'
              }}>
                ☀️
              </div>

              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: theme === 'dark' ? '#fbbf24' : '#ffffff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transform: theme === 'dark' ? 'translate3d(28px, 0, 0)' : 'translate3d(0, 0, 0)',
                  transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#1e1b4b" style={{ width: 13, height: 13 }}>
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={3} style={{ width: 13, height: 13 }}>
                    <circle cx="12" cy="12" r="5" fill="#f59e0b" />
                  </svg>
                )}
              </div>
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
