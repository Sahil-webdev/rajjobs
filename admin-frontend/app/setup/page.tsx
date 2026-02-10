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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ color: "white", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  if (!setupRequired) {
    return null; // Will redirect to login
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "500px", width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚀</div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
            Initial Setup
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Create your Super Admin account to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@example.com"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Mobile Number *
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10-digit mobile number"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
            <small style={{ color: "#64748b", fontSize: "12px", display: "block", marginTop: "4px" }}>
              Used for OTP verification and password reset
            </small>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter your password"
              style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
              <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>❌ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ width: "100%", background: submitting ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "8px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer", transition: "transform 0.2s" }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            {submitting ? "Creating Account..." : "Create Super Admin Account"}
          </button>
        </form>

        {/* Info Box */}
        <div style={{ marginTop: "24px", background: "#f0f9ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "16px" }}>
          <p style={{ color: "#1e40af", fontSize: "13px", margin: 0, lineHeight: "1.6" }}>
            ℹ️ <strong>Note:</strong> This is a one-time setup. After creating your Super Admin account, this page will not be accessible again. Keep your credentials safe!
          </p>
        </div>
      </div>
    </div>
  );
}
