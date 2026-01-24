"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'inactive';
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'instructor' | 'admin';
};

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  role: 'student',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/api/admin/users').then((res) => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name || !form.email) {
      setError('Name and email are required');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log('Submitting user:', form);
      await api.post('/api/admin/users', form);
      setForm(initialForm);
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      console.error('User creation error:', err);
      setError(err?.response?.data?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/api/admin/users/${id}/status`, { status: newStatus });
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error updating');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>User Management</h2>
        <p>Add and manage students, instructors, and admins</p>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Add New User</h3>
          <form onSubmit={submit}>
          <div className="grid" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                className="input"
                placeholder="e.g., Raj Kumar"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                className="input"
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                className="input"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              >
                <option value="student">Student (👨‍🎓)</option>
                <option value="instructor">Instructor (👨‍🏫)</option>
                <option value="admin">Admin (⚙️)</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Adding user...' : '✓ Add User'}
            </button>
          </div>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>User Statistics</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, borderLeft: '4px solid #10b981' }}>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Total Users</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#059669', marginTop: 4 }}>{users.length}</div>
            </div>
            <div style={{ padding: 12, background: '#f0f9ff', borderRadius: 8, borderLeft: '4px solid #3b82f6' }}>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Students</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
                {users.filter((u) => u.role === 'student').length}
              </div>
            </div>
            <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, borderLeft: '4px solid #f59e0b' }}>
              <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>Instructors</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                {users.filter((u) => u.role === 'instructor').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 20 }}>All Users ({users.length})</h3>
        {users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No users yet. Add one above!</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span className="badge-primary">
                      {u.role === 'student' ? '👨‍🎓 Student' : u.role === 'instructor' ? '👨‍🏫 Instructor' : '⚙️ Admin'}
                    </span>
                  </td>
                  <td>
                    <span className={u.status === 'active' ? 'badge-success' : 'badge-warning'}>
                      {u.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="button"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                      onClick={() => toggleStatus(u._id, u.status)}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
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
