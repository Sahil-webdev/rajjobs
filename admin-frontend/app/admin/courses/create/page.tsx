"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "../../../../components/ImageUploader";
import RichTextEditor from "../../../../components/RichTextEditor";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    thumbnailUrl: "",
    description: "",
    category: "SSC Exam",
    priceOriginal: 0,
    priceSale: 0,
    instructor: "",
    externalLink: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || formData.priceOriginal === 0 || formData.priceSale === 0) {
      setError("Please fill Title, Original Price and Sale Price");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("Please login first");
        router.push("/login");
        return;
      }

      const payload = {
        ...formData,
        categories: [formData.category]
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/courses`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Course created successfully!");
        setTimeout(() => {
          router.push("/admin/courses");
        }, 1500);
      } else {
        setError(data.message || "Failed to create course");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.back()}
            className="button secondary"
            style={{ width: 'auto', padding: '8px 12px' }}
          >
            ← Back
          </button>
          <div>
            <h2>Create New Course</h2>
            <p style={{ marginTop: '4px' }}>Fill in the course details below</p>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ marginBottom: '24px', padding: '16px', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '8px', color: '#059669' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: '600' }}>📝 Basic Information</h3>

          <div className="form-group">
            <label>Course Title *</label>
            <input
              type="text"
              placeholder="e.g. SSC CGL Complete Course 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>

          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value })}
            placeholder="Enter detailed course description with bullet points, formatting, etc."
            label="Course Description"
          />

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              <option value="SSC Exam">SSC Exam</option>
              <option value="Banking Exam">Banking Exam</option>
              <option value="Teaching Exam">Teaching Exam</option>
              <option value="Railway Exam">Railway Exam</option>
              <option value="Civil Service Exam">Civil Service Exam</option>
              <option value="Defence Exam">Defence Exam</option>
              <option value="State Exams">State Exams</option>
            </select>
          </div>

          <div className="form-group">
            <label>Instructor Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: '600' }}>🖼️ Course Thumbnail</h3>
          
          <ImageUploader
            currentImage={formData.thumbnailUrl}
            onUpload={(url: string) => setFormData({ ...formData, thumbnailUrl: url })}
            label="Course Thumbnail (Recommended: 1050x600px)"
          />
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: '600' }}>💰 Pricing</h3>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Original Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={formData.priceOriginal || ''}
                onChange={(e) => setFormData({ ...formData, priceOriginal: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label>Sale Price (₹) *</label>
              <input
                type="number"
                placeholder="e.g. 1999"
                value={formData.priceSale || ''}
                onChange={(e) => setFormData({ ...formData, priceSale: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
          </div>

          {formData.priceOriginal > 0 && formData.priceSale > 0 && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#f3f4f6', borderRadius: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Price Preview:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>₹{formData.priceSale}</span>
                <span style={{ fontSize: '16px', color: '#9ca3af', textDecoration: 'line-through' }}>₹{formData.priceOriginal}</span>
                <span className="badge-success">
                  {Math.round((1 - formData.priceSale / formData.priceOriginal) * 100)}% OFF
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px' }}>
                Students save ₹{formData.priceOriginal - formData.priceSale}
              </p>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: '600' }}>🔗 External Link</h3>

          <div className="form-group">
            <label>Course Details Link</label>
            <input
              type="url"
              placeholder="https://example.com/course-details"
              value={formData.externalLink}
              onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
              className="input"
            />
            <small style={{ color: '#6b7280', display: 'block', marginTop: '8px' }}>
              Users will be redirected to this URL when they click "View Details"
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="button secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button"
            disabled={loading}
          >
            {loading ? "Creating..." : "✓ Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
