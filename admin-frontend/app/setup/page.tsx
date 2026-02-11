"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function InitialSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/setup/check`);
      setSetupRequired(response.data.setupRequired);
      
      if (!response.data.setupRequired) {
        // Setup already done, redirect to login
        router.push("/login");
      }
    } catch (error) {
      console.error("Setup check error:", error);
      setError("Failed to check setup status");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/api/admin/setup/create-super-admin`, {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });

      alert("Super Admin account created successfully! Please login now.");
      router.push("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create admin account");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ marginBottom: '10px', fontSize: '24px' }}>🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!setupRequired) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8f9fb 0%, #f0f4f8 100%)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, marginBottom: 8, color: '#3b82f6' }}>RajJobs</h1>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Initial Setup</h2>
            <p style={{ color: '#6b7280', marginBottom: 0, fontSize: 14 }}>
              Create your Super Admin account
            </p>
          </div>

          {/* Info Box */}
          <div style={{ 
            background: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '8px', 
            padding: '12px 16px', 
            marginBottom: 24 
          }}>
            <p style={{ color: '#1e40af', fontSize: 13, margin: 0, lineHeight: '1.6' }}>
              ℹ️ This is a one-time setup. Keep your credentials safe!
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }} autoComplete="off">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                className="input"
                id="name"
                name="setup-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                className="input"
                id="email"
                name="setup-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@example.com"
                autoComplete="off"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mobile">Mobile Number</label>
              <input
                className="input"
                id="mobile"
                name="setup-mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit mobile number"
                autoComplete="off"
                required
                maxLength={10}
              />
              <small style={{ color: '#6b7280', fontSize: 12, display: 'block', marginTop: 4 }}>
                Used for OTP verification and password reset
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  id="password"
                  name="setup-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#6b7280',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  id="confirmPassword"
                  name="setup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#6b7280',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              className="button" 
              type="submit" 
              disabled={submitting}
              style={{ marginTop: 8 }}
            >
              {submitting ? 'Creating Account...' : 'Create Super Admin Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
