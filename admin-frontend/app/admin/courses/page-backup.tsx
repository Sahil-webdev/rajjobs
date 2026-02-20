"use client";

import { useEffect, useState } from 'react';
import api, { setAuthToken } from '../../../lib/api';
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
  externalLink?: string;
};

const initialForm: FormState = {
  title: '',
  thumbnailUrl: '',
  description: '',
  category: 'SSC Exam',
  priceOriginal: 0,
  priceSale: 0,
  externalLink: '',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Ensure token is set before making any API calls
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAuthToken(token);
    }
  }, []);

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
    <div className="container">
      <h1>Courses</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* FORM */}
      <div className="card">
        <h2>Create New Course</h2>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder="e.g. SSC CGL 2024 Mains"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>Thumbnail URL</label>
            <ImageUploader
              currentImageUrl={form.thumbnailUrl}
              onUploadSuccess={(url: string) => setForm({ ...form, thumbnailUrl: url })}
              uploadType="general"
              label="Course Thumbnail"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Short description about course"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            >
              <option value="SSC Exam">SSC Exam</option>
              <option value="UPSC">UPSC</option>
              <option value="Railway">Railway</option>
              <option value="Banking">Banking</option>
              <option value="State Exams">State Exams</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Original Price *</label>
              <input
                type="number"
                step="0.01"
                placeholder="999"
                value={form.priceOriginal || ''}
                onChange={(e) => setForm({ ...form, priceOriginal: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label>Sale Price *</label>
              <input
                type="number"
                step="0.01"
                placeholder="799"
                value={form.priceSale || ''}
                onChange={(e) => setForm({ ...form, priceSale: parseFloat(e.target.value) || 0 })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>External Link (optional)</label>
            <input
              type="url"
              placeholder="https://example.com/course"
              value={form.externalLink}
              onChange={(e) => setForm({ ...form, externalLink: e.target.value })}
              className="input"
            />
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      {/* LIST */}
      <div className="card">
        <h2>Existing Courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>No courses yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Original</th>
                  <th>Sale</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>₹{c.priceOriginal}</td>
                    <td>₹{c.priceSale}</td>
                    <td>
                      <button
                        onClick={() => deleteCourse(c._id, c.title)}
                        className="button danger"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
