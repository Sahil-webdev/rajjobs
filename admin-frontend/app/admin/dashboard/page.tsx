"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Summary = {
  users: number;
  courses: number;
  activeEnrollments: number;
  revenue: number;
};

type Banner = { _id: string; title?: string; imageUrl: string; order: number; isActive: boolean };

type Course = {
  _id: string;
  title: string;
  priceSale: number;
  priceOriginal: number;
  status: string;
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/reports/summary').then((res) => setSummary(res.data)).catch(() => {}),
      api.get('/api/admin/banners').then((res) => setBanners(res.data)).catch(() => {}),
      api.get('/api/admin/courses?status=published').then((res) => setCourses(res.data)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your platform</p>
      </div>

      <div className="grid grid-3">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>👥</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Total Users</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.users || 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Registered students & instructors</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>📚</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Published Courses</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.courses || 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Active courses on platform</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Active Enrollments</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.activeEnrollments || 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Students enrolled in courses</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>💰</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Total Revenue</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>₹{summary?.revenue?.toLocaleString() || 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>From paid enrollments</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📱 Active Banners</h3>
          {banners.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No active banners</div>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {banners.map((b) => (
                <div key={b._id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <img src={b.imageUrl} alt={b.title} style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.title || 'Banner'}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>Order: {b.order}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <a href="/admin/banners" style={{ display: 'inline-block', marginTop: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
            Manage banners →
          </a>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📚 Recent Courses</h3>
          {courses.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No courses</div>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {courses.slice(0, 5).map((c) => (
                <div key={c._id} style={{ padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                    <span style={{ color: '#059669', fontWeight: 600 }}>₹{c.priceSale}</span>
                    <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>₹{c.priceOriginal}</span>
                    <span className="badge-primary" style={{ marginLeft: 'auto' }}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <a href="/admin/courses" style={{ display: 'inline-block', marginTop: 12, color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>
            View all courses →
          </a>
        </div>
      </div>
    </div>
  );
}
