"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Enrollment = {
  _id: string;
  user: { _id: string; name: string; email: string };
  course: { _id: string; title: string };
  status: 'active' | 'cancelled' | 'refunded';
  progress: number;
};

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled' | 'refunded'>('all');

  const load = () => {
    const url = filter === 'all' ? '/api/admin/enrollments' : `/api/admin/enrollments?status=${filter}`;
    api.get(url).then((res) => setEnrollments(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id: string, newStatus: 'active' | 'cancelled' | 'refunded') => {
    try {
      await api.patch(`/api/admin/enrollments/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      alert('Error updating enrollment');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Enrollments</h2>
        <p>Manage student course enrollments</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['all', 'active', 'cancelled', 'refunded'] as const).map((s) => (
            <button
              key={s}
              className="button"
              style={{
                width: 'auto',
                padding: '8px 16px',
                background: filter === s ? '#3b82f6' : '#e5e7eb',
                color: filter === s ? '#fff' : '#1f2937',
              }}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s === 'active' ? '✅ Active' : s === 'cancelled' ? '❌ Cancelled' : '↩️ Refunded'}
            </button>
          ))}
        </div>

        <h3 style={{ marginBottom: 16 }}>Enrollments ({enrollments.length})</h3>
        {enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No enrollments found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{e.user.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{e.user.email}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{e.course.title}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${e.progress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.2s' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{e.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={e.status === 'active' ? 'badge-success' : e.status === 'cancelled' ? 'badge-danger' : 'badge-warning'}>
                      {e.status === 'active' ? '✅ Active' : e.status === 'cancelled' ? '❌ Cancelled' : '↩️ Refunded'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="input"
                      value={e.status}
                      onChange={(ev) => updateStatus(e._id, ev.target.value as any)}
                      style={{ padding: '6px 8px', fontSize: 12 }}
                    >
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
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
