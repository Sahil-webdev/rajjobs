"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Notification = {
  _id: string;
  title: string;
  category: string;
  link: string;
  date: string;
  isActive: boolean;
};

type FormState = {
  title: string;
  category: string;
  link: string;
  date: string;
  isActive: boolean;
};

const initialForm: FormState = {
  title: '',
  category: 'SSC',
  link: '',
  date: new Date().toISOString().split('T')[0],
  isActive: true,
};

const categories = ['SSC', 'UPSC', 'Railway', 'Defence', 'Teacher', 'Banking', 'Army', 'Police', 'Other'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/api/admin/notifications').then((res) => setNotifications(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.title || !form.category || !form.link) {
      setError('Title, category and link are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/admin/notifications', form);
      setForm(initialForm);
      setSuccess('Notification created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      console.error('Notification creation error:', err);
      setError(err?.response?.data?.message || 'Error saving notification');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      await api.delete(`/api/admin/notifications/${id}`);
      setSuccess('Notification deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err?.response?.data?.message || 'Error deleting notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="page-header">
        <h2>Notifications</h2>
        <p>Manage homepage notifications and announcements</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Create New Notification</h3>
          <form onSubmit={submit}>
            <div className="grid" style={{ gap: 16 }}>
              <div className="form-group">
                <label>Notification Title *</label>
                <input
                  className="input"
                  placeholder="e.g., SSC CGL 2024 Result Released"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>
                  Keep it short and clear
                </small>
              </div>

              <div className="form-group">
                <label>Category/Tag *</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ cursor: 'pointer' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>
                  Select the exam category or type
                </small>
              </div>

              <div className="form-group">
                <label>Link/URL *</label>
                <input
                  className="input"
                  type="url"
                  placeholder="https://example.com/notification-details"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>
                  Users will be redirected here when they click the notification
                </small>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                <small style={{ color: '#6b7280', display: 'block', marginTop: 4 }}>
                  Notification display date
                </small>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Active (Show on website)</span>
                </label>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="button" disabled={loading}>
                {loading ? 'Creating notification...' : '✓ Create Notification'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Preview</h3>
          <div style={{ padding: 16, background: '#f9fafb', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, background: 'white', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <span style={{ 
                fontSize: 11, 
                fontWeight: 600, 
                color: '#2563eb', 
                background: '#eff6ff', 
                padding: '4px 10px', 
                borderRadius: 12,
                textTransform: 'uppercase'
              }}>
                {form.category || 'Category'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                  {form.title || 'Notification title will appear here'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {form.date ? formatDate(form.date) : 'Date'}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
              <strong>Link:</strong> {form.link || 'No link specified'}
            </div>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              <strong>Status:</strong> {form.isActive ? 
                <span style={{ color: '#059669' }}>✓ Active (Visible on website)</span> : 
                <span style={{ color: '#dc2626' }}>✗ Inactive (Hidden)</span>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>All Notifications ({notifications.length})</h3>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            <svg style={{ width: 48, height: 48, margin: '0 auto 12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div style={{ fontWeight: 500, color: '#6b7280' }}>No notifications yet</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Create your first notification above</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification._id}>
                    <td>
                      <span className="badge badge-blue">{notification.category}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{notification.title}</div>
                      <a 
                        href={notification.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}
                      >
                        {notification.link.length > 40 ? notification.link.substring(0, 40) + '...' : notification.link}
                      </a>
                    </td>
                    <td>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>
                        {formatDate(notification.date)}
                      </span>
                    </td>
                    <td>
                      {notification.isActive ? (
                        <span className="badge badge-green">Active</span>
                      ) : (
                        <span className="badge badge-gray">Inactive</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => deleteNotification(notification._id, notification.title)}
                        className="button button-danger button-sm"
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
