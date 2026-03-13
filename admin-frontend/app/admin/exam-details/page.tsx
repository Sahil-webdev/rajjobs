"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ExamDetail {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  lastUpdated: string;
}

export default function ExamDetailsPage() {
  const router = useRouter();
  const [examDetails, setExamDetails] = useState<ExamDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: "", status: "", search: "" });

  useEffect(() => {
    fetchExamDetails();
  }, [filter]);

  const fetchExamDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (filter.category) queryParams.append("category", filter.category);
      if (filter.status) queryParams.append("status", filter.status);
      if (filter.search) queryParams.append("search", filter.search);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exam-details?${queryParams}`,
        {
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        setExamDetails(data.data);
      }
    } catch (error) {
      console.error("Error fetching exam details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam detail?")) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exam-details/${id}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchExamDetails();
      }
    } catch (error) {
      console.error("Error deleting exam detail:", error);
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/exam-details/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchExamDetails();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2>Exam Management</h2>
            <p style={{ marginTop: '4px' }}>Create and manage exam notification pages</p>
          </div>
          <button
            onClick={() => router.push("/admin/exam-details/create")}
            className="button"
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            + Create New Exam
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Total Exams</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{examDetails.length}</div>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Published</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              {examDetails.filter((e) => e.status === "published").length}
            </div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>✓ Visible on Website</div>
          </div>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>Drafts</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6b7280' }}>
              {examDetails.filter((e) => e.status === "draft").length}
            </div>
            <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>⚠️ Hidden from Website</div>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      {examDetails.filter((e) => e.status === "draft").length > 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
          border: '1px solid #fbbf24',
          borderRadius: '12px', 
          padding: '16px 20px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '24px' }}>💡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>Exams in Draft Status</div>
            <div style={{ fontSize: '13px', color: '#78350f' }}>
              You have {examDetails.filter((e) => e.status === "draft").length} exam(s) in draft mode. 
              Click the <strong>"Publish"</strong> button on each exam card to make them visible on the website.
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: '600' }}>🔍 Filter Exams</h3>
        <div className="grid grid-3">
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>Category</label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="SSC">SSC</option>
              <option value="UPSC">UPSC</option>
              <option value="Railway">Railway</option>
              <option value="Banking">Banking</option>
              <option value="Teacher">Teacher</option>
              <option value="Defence">Defence</option>
              <option value="State Wise">State Wise</option>
              <option value="Police">Police</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label>Search</label>
            <input
              type="text"
              placeholder="Search exam titles..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280', fontWeight: '500' }}>Loading exams...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
        </div>
      ) : examDetails.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>No Exams Found</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Start creating exam notification pages to manage your content
          </p>
          <button
            onClick={() => router.push("/admin/exam-details/create")}
            className="button"
            style={{ width: 'auto', padding: '12px 24px', margin: '0 auto' }}
          >
            + Create First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-3">
          {examDetails.map((exam) => (
            <div
              key={exam._id}
              className="card"
              style={{ padding: '0', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Content */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  <span className={exam.status === "published" ? "badge-success" : "badge-warning"}>
                    {exam.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge-primary">{exam.category}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {new Date(exam.lastUpdated).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', minHeight: '40px', lineHeight: '1.4' }}>
                  {exam.title}
                </h3>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => router.push(`/admin/exam-details/edit/${exam._id}`)}
                    className="button"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(exam._id)}
                    className="button secondary"
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  >
                    {exam.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="button danger"
                    style={{ padding: '8px 12px', fontSize: '13px', width: 'auto' }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

