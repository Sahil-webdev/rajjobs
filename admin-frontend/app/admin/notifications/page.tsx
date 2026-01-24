"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  audience: string;
  isActive: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement', audience: 'all', isActive: true });

  const load = () => {
    api.get('/api/admin/notifications').then((res) => setNotifications(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/notifications', form);
      setForm({ title: '', message: '', type: 'announcement', audience: 'all', isActive: true });
      load();
    } catch (err) {
      alert('Error creating notification');
    }
  };

  const update = async (id: string, updates: Partial<Notification>) => {
    try {
      await api.put(`/api/admin/notifications/${id}`, updates);
      load();
    } catch (err) {
      alert('Error updating notification');
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('Delete this notification?')) return;
    try {
      await api.delete(`/api/admin/notifications/${id}`);
      load();
    } catch (err) {
      alert('Error deleting notification');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Notifications</h2>
        <p>Send announcements and notifications to users</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>Create New Notification</h3>
        <form onSubmit={create}>
          <div className="form-group">
            <label>Title *</label>
            <input
              className="input"
              placeholder="Notification title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Message *</label>
            <textarea
              className="input"
              placeholder="Notification message"
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ minHeight: 100, fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="announcement">Announcement</option>
                <option value="email">Email</option>
                <option value="push">Push Notification</option>
              </select>
            </div>

            <div className="form-group">
              <label>Send to</label>
              <select
                className="input"
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="instructors">Instructors Only</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="isActive" style={{ marginBottom: 0, cursor: 'pointer' }}>
              Send now (publish immediately)
            </label>
          </div>

          <button type="submit" className="button" style={{ background: '#3b82f6', color: 'white', width: '100%' }}>
            Send Notification
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>Recent Notifications ({notifications.length})</h3>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No notifications sent yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  padding: 16,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{n.title}</div>
                  <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 8 }}>{n.message}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge-primary" style={{ fontSize: 11 }}>
                      {n.type === 'announcement' ? '📢' : n.type === 'email' ? '📧' : '🔔'} {n.type}
                    </span>
                    <span className="badge-secondary" style={{ fontSize: 11 }}>
                      👥 {n.audience}
                    </span>
                    <span className={n.isActive ? 'badge-success' : 'badge-danger'} style={{ fontSize: 11 }}>
                      {n.isActive ? '✅ Sent' : '⏸️ Draft'}
                    </span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="button"
                    style={{ padding: '8px 12px', fontSize: 12, width: 'auto' }}
                    onClick={() => update(n._id, { isActive: !n.isActive })}
                  >
                    {n.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button
                    className="button"
                    style={{ padding: '8px 12px', fontSize: 12, width: 'auto', background: '#ef4444', color: 'white' }}
                    onClick={() => deleteNotification(n._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
