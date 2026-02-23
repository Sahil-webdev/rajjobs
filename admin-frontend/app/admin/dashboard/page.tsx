"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Summary = {
  exams: { total: number; published: number };
  banners: { total: number; active: number };
  enquiries: { total: number; unread: number };
  notifications: number;
  testSeries: number;
};

type Banner = { _id: string; title?: string; imageUrl: string; order: number; isActive: boolean };

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/reports/summary').then((res) => setSummary(res.data.data)).catch(() => {}),
      api.get('/api/admin/banners').then((res) => setBanners(res.data)).catch(() => {}),
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
            <div style={{ fontSize: 28 }}>📋</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Total Exams</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.exams?.total ?? 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{summary?.exams?.published ?? 0} published</span> &nbsp;|&nbsp; {(summary?.exams?.total ?? 0) - (summary?.exams?.published ?? 0)} drafts
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>📩</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Enquiries</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.enquiries?.total ?? 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>{summary?.enquiries?.unread ?? 0} unread</span>
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Notifications</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.notifications ?? 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Total sent notifications</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>📝</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Test Series</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.testSeries ?? 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>Available test series</p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 28 }}>🖼️</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#6b7280', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>Banners</div>
              <h3 style={{ fontSize: 24, marginTop: 4 }}>{summary?.banners?.total ?? 0}</h3>
            </div>
          </div>
          <div style={{ height: 1, background: '#e5e7eb', marginBottom: 12 }}></div>
          <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{summary?.banners?.active ?? 0} active</span>
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📱 Active Banners</h3>
          {banners.length === 0 ? (
            <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No banners yet</div>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {banners.slice(0, 5).map((b) => (
                <div key={b._id} style={{ display: 'flex', gap: 12, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <img src={b.imageUrl} alt={b.title} style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{b.title || 'Banner'}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>Order: {b.order} &nbsp;|&nbsp;
                      <span style={{ color: b.isActive ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
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
          <h3 style={{ marginBottom: 16 }}>🔗 Quick Links</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '📋 Manage Exam Details', href: '/admin/exam-details' },
              { label: '📩 View Enquiries', href: '/admin/enquiries' },
              { label: '🔔 Send Notifications', href: '/admin/notifications' },
              { label: '🖼️ Manage Banners', href: '/admin/banners' },
              { label: '📝 Test Series', href: '/admin/test-series' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  padding: '10px 14px',
                  background: '#eff6ff',
                  borderRadius: 8,
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
