"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { setAuthToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const token = res.data?.accessToken;
      setAuthToken(token);
      localStorage.setItem('accessToken', token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f4f8 100%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: '#3b82f6' }}>RajJobs</h1>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Admin Panel</h2>
            <p style={{ color: '#6b7280', marginBottom: 0 }}>Sign in to your admin account</p>
          </div>

          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                className="input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                className="input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <a 
                  href="/forgot-password" 
                  style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="button" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
