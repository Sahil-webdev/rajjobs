"use client";

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '../../lib/api';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/setup/check`);
      
      if (response.data.setupRequired) {
        // Setup required, redirect to setup page
        router.push('/setup');
      }
    } catch (error) {
      console.error("Setup check failed:", error);
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('🔐 Attempting login...');
      const res = await api.post('/api/auth/login', { email, password });
      const token = res.data?.accessToken;
      
      console.log('✅ Login successful, token received:', token ? 'Yes' : 'No');
      
      if (!token) {
        throw new Error('No access token received');
      }
      
      // Set token in localStorage first
      localStorage.setItem('accessToken', token);
      console.log('💾 Token saved to localStorage');
      
      // Then set in API headers
      setAuthToken(token);
      console.log('📡 Token set in API headers');
      
      // Small delay to ensure everything is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('🚀 Redirecting to dashboard...');
      // Use window.location for hard navigation to ensure token is properly set
      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err?.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ marginBottom: '10px', fontSize: '24px' }}>🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background)',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Background Decorative Blur Orbs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%)',
        filter: 'blur(60px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0) 70%)',
        filter: 'blur(70px)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Main card */}
      <div style={{ width: '100%', maxWidth: 440, zIndex: 10, position: 'relative' }}>
        <div className="card" style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '40px 32px',
          borderRadius: '16px',
          border: '1px solid var(--card-border)',
          boxShadow: '0 10px 30px var(--shadow)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 8,
              background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              RajJobs
            </h1>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Admin Panel</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to manage your portal</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="email" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px' }}>Email Address</label>
              <input
                className="input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                style={{ height: '46px', padding: '12px 16px', borderRadius: '10px' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label htmlFor="password" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', marginBottom: 0 }}>Password</label>
                <a 
                  href="/forgot-password" 
                  style={{ fontSize: 12, color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot Password?
                </a>
              </div>
              <input
                className="input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ height: '46px', padding: '12px 16px', borderRadius: '10px' }}
              />
            </div>

            {error && <div className="error-message" style={{ margin: 0 }}>{error}</div>}

            <button className="button" type="submit" disabled={loading} style={{
              marginTop: 10,
              height: '46px',
              borderRadius: '10px',
              fontSize: '15px',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)'
            }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="animate-spin" style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
