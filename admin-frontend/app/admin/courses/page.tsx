"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ImageUploader from '../../../components/ImageUploader';

type Course = {
  _id: string;
  title: string;
  priceOriginal: number;
  priceSale: number;
};

type FormState = {
  title: string;
  thumbnailUrl?: string;
  description?: string;
  category: string;
  priceOriginal: number;
  priceSale: number;
};

const initialForm: FormState = {
  title: '',
  thumbnailUrl: '',
  description: '',
  category: 'SSC Exam',
  priceOriginal: 0,
  priceSale: 0,
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/api/admin/courses').then((res) => setCourses(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title || form.priceOriginal === 0 || form.priceSale === 0) {
      setError('Title and prices are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        categories: [form.category]
      };
      console.log('Submitting course:', payload);
      await api.post('/api/admin/courses', payload);
      setForm(initialForm);
      setSuccess('Course created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      console.error('Course creation error:', err);
      setError(err?.response?.data?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/api/admin/courses/${id}`);
      setSuccess('Course deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err?.response?.data?.message || 'Error deleting course');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Courses</h2>
        <p>Create and manage your online courses</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Create New Course</h3>
          <form onSubmit={submit}>
          <div className="grid" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Course Title *</label>
              <input
                className="input"
                placeholder="e.g., Complete Web Development Bootcamp"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Course Description</label>
              <textarea
                className="input"
                placeholder="Enter a brief description of the course (2-3 lines recommended)"
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
              <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>
                This will be displayed on the homepage and courses page (2 lines max on cards)
              </small>
            </div>

            <ImageUploader
              label="Course Thumbnail (Recommended: 1050x600px)"
              currentImage={form.thumbnailUrl || ''}
              onUpload={(url: string) => setForm({ ...form, thumbnailUrl: url })}
              previewHeight={150}
            />
            <small style={{ color: '#6b7280', display: 'block', marginTop: -12, marginBottom: 12 }}>Optimal size: 1050px width × 600px height for best display</small>

            <div className="form-group">
              <label>Course Category *</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ cursor: 'pointer' }}
              >
                <option value="SSC Exam">SSC Exam</option>
                <option value="Banking Exam">Banking Exam</option>
                <option value="Teaching Exam">Teaching Exam</option>
                <option value="Railway Exam">Railway Exam</option>
                <option value="Civil Service Exam">Civil Service Exam</option>
                <option value="Defence Exam">Defence Exam</option>
                <option value="State Exams">State Exams</option>
              </select>
              <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>Select the exam category for this course</small>
            </div>

            <div className="form-group two-col">
              <div>
                <label>Original Price (₹) *</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g., 5000"
                  value={form.priceOriginal || ''}
                  onChange={(e) => setForm({ ...form, priceOriginal: Number(e.target.value) || 0 })}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>Displayed as struck through</small>
              </div>
              <div>
                <label>Sale Price (₹) *</label>
                <input
                  className="input"
                  type="number"
                  placeholder="e.g., 1999"
                  value={form.priceSale || ''}
                  onChange={(e) => setForm({ ...form, priceSale: Number(e.target.value) })}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>Actual price students pay</small>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Creating course...' : '✓ Create Course'}
            </button>
          </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Price Preview</h3>
          <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18, color: '#059669', fontWeight: 700 }}>₹{form.priceSale || 0}</span>
              <span style={{ fontSize: 14, textDecoration: 'line-through', color: '#9ca3af' }}>₹{form.priceOriginal || 0}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Save ₹{(form.priceOriginal || 0) - (form.priceSale || 0)} ({form.priceOriginal ? Math.round(((form.priceOriginal - form.priceSale) / form.priceOriginal) * 100) : 0}% off)
            </div>
          </div>

          {form.thumbnailUrl && (
            <div>
              <img src={form.thumbnailUrl} alt="Course" style={{ width: '100%', borderRadius: 8, maxHeight: 150, objectFit: 'cover', marginBottom: 12 }} />
            </div>
          )}

          <div style={{ padding: 12, background: '#f3f4f6', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#111827' }}>{form.title || 'Course Title'}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {form.description || 'Course description will appear here'}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>All Courses ({courses.length})</h3>
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No courses yet. Create one above!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Course Title</th>
                <th>Price</th>
                <th style={{ width: 100, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#059669', fontWeight: 600 }}>₹{c.priceSale}</span>
                      <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: 12 }}>₹{c.priceOriginal}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => deleteCourse(c._id, c.title)}
                      className="delete-btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 16px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#fff',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                      }}
                      title="Delete Course"
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      <span className="delete-text">Delete</span>
                    </button>
                    <style jsx>{`
                      @media (max-width: 768px) {
                        .delete-btn {
                          padding: 8px !important;
                          gap: 0 !important;
                        }
                        .delete-text {
                          display: none;
                        }
                      }
                    `}</style>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
