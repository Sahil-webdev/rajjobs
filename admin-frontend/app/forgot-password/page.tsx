"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Verify OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/admin/password-reset/send-otp`, { email });
      setMessage(response.data.message);
      setStep(2);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/admin/password-reset/verify-otp`, { email, otp });
      setMessage(response.data.message);
      setStep(3);
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/admin/password-reset/reset-password`, {
        email,
        otp,
        newPassword,
      });
      
      alert(response.data.message);
      router.push("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "450px", width: "100%", background: "white", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "40px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
            Reset Password
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: "40px",
                height: "4px",
                borderRadius: "2px",
                background: s <= step ? "#667eea" : "#e5e7eb",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
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
              disabled={loading}
              style={{ width: "100%", background: loading ? "#9ca3af" : "#667eea", color: "white", border: "none", borderRadius: "8px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Sending OTP..." : "Send OTP to Email"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              style={{ width: "100%", background: "transparent", color: "#667eea", border: "2px solid #667eea", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "12px" }}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            {message && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <p style={{ color: "#065f46", fontSize: "14px", margin: 0 }}>✅ {message}</p>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "18px", letterSpacing: "4px", textAlign: "center", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <small style={{ color: "#64748b", fontSize: "12px", display: "block", marginTop: "4px", textAlign: "center" }}>
                OTP sent to {email.replace(/(.{2})(.*)(@.*)/, "$1****$3")}
              </small>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#9ca3af" : "#667eea", color: "white", border: "none", borderRadius: "8px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ width: "100%", background: "transparent", color: "#667eea", border: "2px solid #667eea", borderRadius: "8px", padding: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "12px" }}
            >
              Change Email Address
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            {message && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
                <p style={{ color: "#065f46", fontSize: "14px", margin: 0 }}>✅ {message}</p>
              </div>
            )}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
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
              disabled={loading}
              style={{ width: "100%", background: loading ? "#9ca3af" : "#667eea", color: "white", border: "none", borderRadius: "8px", padding: "14px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
