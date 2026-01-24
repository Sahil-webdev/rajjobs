"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type User = {
  _id: string;
  name: string;
  email: string;
  status: string;
};

type Course = {
  _id: string;
  title: string;
  status: string;
};

export default function ModerationPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, c] = await Promise.all([
          api.get('/api/admin/users'),
          api.get('/api/admin/courses'),
        ]);
        setUsers(u.data || []);
        setCourses(c.data || []);
      } catch (err) {}
      setLoading(false);
    };
    load();
  }, []);

  const suspendUser = async (id: string) => {
    if (!confirm('Suspend this user?')) return;
    try {
      await api.patch(`/api/admin/moderation/users/${id}/suspend`);
      setUsers(users.map((u) => (u._id === id ? { ...u, status: 'suspended' } : u)));
    } catch (err) {
      alert('Error suspending user');
    }
  };

  const activateUser = async (id: string) => {
    try {
      await api.patch(`/api/admin/moderation/users/${id}/activate`);
      setUsers(users.map((u) => (u._id === id ? { ...u, status: 'active' } : u)));
    } catch (err) {
      alert('Error activating user');
    }
  };

  const unpublishCourse = async (id: string) => {
    if (!confirm('Unpublish this course?')) return;
    try {
      await api.patch(`/api/admin/moderation/courses/${id}/unpublish`);
      setCourses(courses.map((c) => (c._id === id ? { ...c, status: 'unpublished' } : c)));
    } catch (err) {
      alert('Error unpublishing course');
    }
  };

  const publishCourse = async (id: string) => {
    try {
      await api.patch(`/api/admin/moderation/courses/${id}/publish`);
      setCourses(courses.map((c) => (c._id === id ? { ...c, status: 'published' } : c)));
    } catch (err) {
      alert('Error publishing course');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()),
  );

  const publishedCourses = courses.filter((c) => c.status === 'published');

  return (
    <div>
      <div className="page-header">
        <h2>Moderation</h2>
        <p>Manage user access and course publishing</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>👤 Suspend Users</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>Search and suspend users to restrict their access</p>

          <input
            className="input"
            placeholder="Search user by name or email..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#6b7280' }}>
              <p>{searchUser ? 'No users found' : 'No users available'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredUsers.slice(0, 10).map((u) => (
                <div
                  key={u._id}
                  style={{
                    padding: 12,
                    background: '#f8f9fb',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{u.email}</div>
                  </div>
                  {u.status === 'suspended' ? (
                    <button
                      className="button"
                      style={{ padding: '6px 12px', fontSize: 12, width: 'auto', background: '#10b981', color: 'white' }}
                      onClick={() => activateUser(u._id)}
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      className="button"
                      style={{ padding: '6px 12px', fontSize: 12, width: 'auto', background: '#ef4444', color: 'white' }}
                      onClick={() => suspendUser(u._id)}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>📚 Manage Courses</h3>
          <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
            Publish or unpublish courses ({publishedCourses.length} published)
          </p>

          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#6b7280' }}>
              <p>No courses available</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {courses.map((c) => (
                <div
                  key={c._id}
                  style={{
                    padding: 12,
                    background: '#f8f9fb',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{c.title}</div>
                    <span className={c.status === 'published' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 11 }}>
                      {c.status === 'published' ? '✅ Published' : '⏸️ Unpublished'}
                    </span>
                  </div>
                  {c.status === 'published' ? (
                    <button
                      className="button"
                      style={{ padding: '6px 12px', fontSize: 12, width: 'auto', background: '#ef4444', color: 'white' }}
                      onClick={() => unpublishCourse(c._id)}
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      className="button"
                      style={{ padding: '6px 12px', fontSize: 12, width: 'auto', background: '#10b981', color: 'white' }}
                      onClick={() => publishCourse(c._id)}
                    >
                      Publish
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
