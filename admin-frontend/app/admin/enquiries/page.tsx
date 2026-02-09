"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";

interface Enquiry {
  _id: string;
  name: string;
  mobile: string;
  email: string;
  message: string;
  status: "pending" | "contacted" | "resolved";
  createdAt: string;
  updatedAt: string;
}

interface StatusCounts {
  all: number;
  pending: number;
  contacted: number;
  resolved: number;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [counts, setCounts] = useState<StatusCounts>({
    all: 0,
    pending: 0,
    contacted: 0,
    resolved: 0,
  });

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, searchQuery]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Please login first");
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get(
        `/api/admin/enquiries?${params.toString()}`
      );
      setEnquiries(response.data.enquiries);
      setCounts(response.data.counts);
    } catch (error: any) {
      console.error("Error fetching enquiries:", error);
      alert(error.response?.data?.message || "Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/admin/enquiries/${id}`, { status: newStatus });
      alert("Status updated successfully!");
      fetchEnquiries();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      await api.delete(`/api/admin/enquiries/${id}`);
      alert("Enquiry deleted successfully!");
      fetchEnquiries();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete enquiry");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
          Enquiries Management
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Manage customer enquiries and counseling requests
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "All Enquiries", value: counts.all, color: "#3b82f6", filter: "all" },
          { label: "Pending", value: counts.pending, color: "#eab308", filter: "pending" },
          { label: "Contacted", value: counts.contacted, color: "#3b82f6", filter: "contacted" },
          { label: "Resolved", value: counts.resolved, color: "#22c55e", filter: "resolved" },
        ].map((stat) => (
          <div
            key={stat.filter}
            onClick={() => setStatusFilter(stat.filter)}
            style={{
              background: statusFilter === stat.filter ? "#f0f9ff" : "white",
              border: `2px solid ${statusFilter === stat.filter ? stat.color : "#e2e8f0"}`,
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (statusFilter !== stat.filter) {
                e.currentTarget.style.borderColor = stat.color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== stat.filter) {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            <div style={{ fontSize: "32px", fontWeight: "700", color: stat.color, marginBottom: "4px" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="Search by name, email, mobile, or message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
        />
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#64748b" }}>
          <div style={{ fontSize: "18px", fontWeight: "500" }}>Loading enquiries...</div>
        </div>
      ) : enquiries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px", background: "white", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", marginBottom: "8px" }}>
            No enquiries found
          </div>
          <div style={{ color: "#64748b", fontSize: "14px" }}>
            {searchQuery
              ? "Try adjusting your search query"
              : "Customer enquiries will appear here"}
          </div>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Name
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Contact
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Message
                  </th>
                  <th style={{ padding: "16px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Date
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Status
                  </th>
                  <th style={{ padding: "16px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "4px" }}>
                        {enquiry.name}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontSize: "14px", color: "#1e293b", marginBottom: "4px" }}>
                        📱 {enquiry.mobile}
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        ✉️ {enquiry.email}
                      </div>
                    </td>
                    <td style={{ padding: "16px", maxWidth: "300px" }}>
                      <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                        {enquiry.message.length > 100
                          ? enquiry.message.substring(0, 100) + "..."
                          : enquiry.message}
                      </div>
                    </td>
                    <td style={{ padding: "16px", fontSize: "13px", color: "#64748b" }}>
                      {formatDate(enquiry.createdAt)}
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <select
                        value={enquiry.status}
                        onChange={(e) => updateStatus(enquiry._id, e.target.value)}
                        className={getStatusColor(enquiry.status)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td style={{ padding: "16px", textAlign: "center" }}>
                      <button
                        onClick={() => deleteEnquiry(enquiry._id)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fecaca";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fee2e2";
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
