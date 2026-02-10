"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "password">("profile");

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/admin/profile/me");
      setProfile(response.data);
      setProfileForm({
        name: response.data.name,
        email: response.data.email,
        mobile: response.data.mobile,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);
      const response = await api.put("/api/admin/profile/update", profileForm);
      setSuccess("Profile updated successfully!");
      setProfile(response.data.admin);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setSaving(true);
      const response = await api.put("/api/admin/profile/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      alert(response.data.message);
      
      // Clear form
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Logout and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", color: "#64748b" }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "800px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
          My Profile
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Manage your account settings and password
        </p>
      </div>

      {/* Profile Card */}
      {profile && (
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", padding: "24px", marginBottom: "24px", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
              👤
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>{profile.name}</h2>
              <p style={{ fontSize: "14px", opacity: 0.9 }}>{profile.email}</p>
              <div style={{ marginTop: "8px", display: "inline-block", background: "rgba(255,255,255,0.2)", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                {profile.role === "super_admin" ? "🌟 Super Admin" : "Admin"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "2px solid #e5e7eb" }}>
        <button
          onClick={() => setTab("profile")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom: tab === "profile" ? "3px solid #667eea" : "3px solid transparent",
            color: tab === "profile" ? "#667eea" : "#64748b",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "-2px",
          }}
        >
          📝 Profile Info
        </button>
        <button
          onClick={() => setTab("password")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            border: "none",
            borderBottom: tab === "password" ? "3px solid #667eea" : "3px solid transparent",
            color: tab === "password" ? "#667eea" : "#64748b",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "-2px",
          }}
        >
          🔐 Change Password
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "32px" }}>
        {/* Profile Tab */}
        {tab === "profile" && (
          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Mobile Number
              </label>
              <input
                type="tel"
                value={profileForm.mobile}
                onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
              <small style={{ color: "#64748b", fontSize: "12px", display: "block", marginTop: "4px" }}>
                Used for OTP verification and password reset
              </small>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
                <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>❌ {error}</p>
              </div>
            )}

            {success && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
                <p style={{ color: "#065f46", fontSize: "14px", margin: 0 }}>✅ {success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{ background: saving ? "#9ca3af" : "#667eea", color: "white", border: "none", borderRadius: "8px", padding: "12px 32px", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {/* Password Tab */}
        {tab === "password" && (
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 8 characters"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                style={{ width: "100%", padding: "12px 16px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", outline: "none" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
              />
            </div>

            {error && (
              <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
                <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>❌ {error}</p>
              </div>
            )}

            <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "8px", padding: "12px", marginBottom: "16px" }}>
              <p style={{ color: "#92400e", fontSize: "13px", margin: 0 }}>
                ⚠️ <strong>Note:</strong> After changing your password, you will be logged out and need to login again with your new password.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{ background: saving ? "#9ca3af" : "#dc2626", color: "white", border: "none", borderRadius: "8px", padding: "12px 32px", fontSize: "14px", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Changing..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
