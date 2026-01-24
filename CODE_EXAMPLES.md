# Code Examples - ImageUploader & New Pages

## 🖼️ ImageUploader Component

**File:** `components/ImageUploader.tsx`

```typescript
"use client";

import { useState } from 'react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  previewHeight?: number;
}

export default function ImageUploader({ 
  label, 
  value, 
  onChange, 
  previewHeight = 150 
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(value);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);  // Pass to parent
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        onClick={() => document.getElementById(`uploader-${label}`)?.click()}
        style={{
          cursor: 'pointer',
          border: '2px dashed #3b82f6',
          borderRadius: 8,
          padding: 20,
          textAlign: 'center',
          background: '#f0f9ff',
        }}
      >
        <input
          id={`uploader-${label}`}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {preview ? (
          <div>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxHeight: previewHeight, 
                maxWidth: '100%', 
                borderRadius: 6, 
                marginBottom: 8 
              }} 
            />
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: 12 }}>
              Click to change image
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600 }}>
              Click to upload image
            </p>
            <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>
              JPG, PNG or WebP
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Usage in Courses Page

**Before (URL Input):**
```typescript
<div className="form-group">
  <label>Thumbnail Image URL</label>
  <input
    className="input"
    placeholder="https://example.com/course-thumbnail.jpg"
    value={form.thumbnailUrl || ''}
    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
  />
</div>
```

**After (ImageUploader):**
```typescript
<ImageUploader
  label="Course Thumbnail"
  value={form.thumbnailUrl || ''}
  onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
  previewHeight={150}
/>
```

---

## 👥 Users Management Page

**File:** `app/admin/users/page.tsx`

```typescript
"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'suspended';
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'student' });

  const load = () => {
    api.get('/api/admin/users').then((res) => setUsers(res.data)).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/users', form);
      setForm({ name: '', email: '', phone: '', role: 'student' });
      load();
    } catch (err) {
      alert('Error creating user');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await api.patch(`/api/admin/users/${id}/status`, { status: newStatus });
      load();
    } catch (err) {
      alert('Error updating user');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
        <p>Manage student and instructor accounts</p>
      </div>

      {/* Add User Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20 }}>Add New User</h3>
        <form onSubmit={addUser}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              className="input"
              placeholder="John Doe"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              className="input"
              type="email"
              placeholder="john@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              className="input"
              placeholder="+91 XXXXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="button" style={{ background: '#3b82f6', color: 'white', width: '100%' }}>
            Add User
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="card">
        <h3 style={{ marginBottom: 20 }}>All Users ({users.length})</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td>{u.email}</td>
                <td style={{ color: '#6b7280' }}>{u.phone || '-'}</td>
                <td>
                  <span className="badge-primary">
                    {u.role === 'student' ? '👤' : u.role === 'instructor' ? '👨‍🏫' : '👨‍💼'} {u.role}
                  </span>
                </td>
                <td>
                  <span className={u.status === 'active' ? 'badge-success' : 'badge-danger'}>
                    {u.status === 'active' ? '✅ Active' : '⛔ Suspended'}
                  </span>
                </td>
                <td>
                  <button
                    className="button"
                    onClick={() => toggleStatus(u._id, u.status)}
                    style={{
                      padding: '6px 12px',
                      fontSize: 12,
                      width: 'auto',
                      background: u.status === 'active' ? '#ef4444' : '#10b981',
                      color: 'white',
                    }}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 📝 Enrollments Page Structure

```typescript
"use client";

// Key features:
// 1. Status filter buttons (All, Active, Cancelled, Refunded)
// 2. Enrollments table with:
//    - Student name & email
//    - Course title
//    - Progress bar (visual %)
//    - Status badge
//    - Status dropdown selector
// 3. updateStatus function patches API on change
// 4. Filters trigger API call with query parameter

const statusFilters = ['all', 'active', 'cancelled', 'refunded'];

// Filter buttons:
{statusFilters.map((s) => (
  <button
    className="button"
    style={{
      width: 'auto',
      background: filter === s ? '#3b82f6' : '#e5e7eb',
    }}
    onClick={() => setFilter(s)}
  >
    {s}
  </button>
))}

// Progress bar example:
<div
  style={{
    width: '100%',
    height: 8,
    background: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  }}
>
  <div
    style={{
      height: '100%',
      width: `${progress}%`,
      background: '#3b82f6',
    }}
  />
</div>
```

---

## 💳 Orders Page Structure

```typescript
// Stats Cards:
// - Total Revenue (sum of paid orders)
// - Paid Orders count
// - Pending Orders count

// Status Filters:
['all', 'pending', 'paid', 'refunded', 'failed']

// Table Columns:
// - Customer (name + email)
// - Course title
// - Amount (₹)
// - Date (formatted)
// - Status badge
// - Status selector dropdown

// API: PATCH /api/admin/orders/{id}/status
// Payload: { status: 'paid' | 'pending' | 'refunded' | 'failed' }
```

---

## 🔔 Notifications Page Structure

```typescript
// Create form with:
// - Title (required)
// - Message (textarea, required)
// - Type selector (announcement, email, push)
// - Audience selector (all, students, instructors)
// - isActive checkbox (send immediately)

// Notifications list displays:
// - Title
// - Message
// - Type badge (📢 announcement, 📧 email, 🔔 push)
// - Audience badge (👥)
// - Status badge (✅ Sent or ⏸️ Draft)
// - Pause/Resume toggle
// - Delete button

// API Endpoints:
// POST /api/admin/notifications (create)
// PUT /api/admin/notifications/{id} (update)
// DELETE /api/admin/notifications/{id} (delete)
```

---

## 🛡️ Moderation Page Structure

```typescript
// Left column: Suspend Users
// - Search input (by name or email)
// - User list with name, email
// - Suspend button (red) or Activate button (green)
// - Shows top 10 results

// Right column: Manage Courses
// - Course list showing all courses
// - Status badge (published or unpublished)
// - Unpublish button or Publish button
// - Color coded based on status

// API Endpoints:
// PATCH /api/admin/moderation/users/{id}/suspend
// PATCH /api/admin/moderation/users/{id}/activate
// PATCH /api/admin/moderation/courses/{id}/unpublish
// PATCH /api/admin/moderation/courses/{id}/publish
```

---

## ⚙️ Settings Page Structure

```typescript
// General Settings Column:
// - Site Name (input)
// - Contact Email (email input)
// - Contact Phone (input)

// System Settings Column:
// - Currency (select: INR, USD, EUR)
// - Timezone (select: IST, UTC, EST)
// - Max Upload Size (input)

// Advanced Settings:
// - Maintenance Mode (checkbox)
// - Shows maintenance message to users when enabled

// Buttons:
// - Save Settings (blue button)
// - Reload Page (gray button)

// API: PUT /api/admin/settings
// Payload: [{ key: string, value: string }, ...]
```

---

## 🎨 Styling Classes Used

All pages use these CSS classes from `globals.css`:

```css
.page-header { /* Page title section */ }
.card { /* White card container */ }
.button { /* Action button */ }
.input { /* Form input/select */ }
.form-group { /* Input wrapper with label */ }
.form-row { /* Multiple inputs in row */ }
.table { /* Data table styling */ }
.badge-success { /* Green badge */ }
.badge-danger { /* Red badge */ }
.badge-warning { /* Yellow badge */ }
.badge-primary { /* Blue badge */ }
.grid { /* Grid layout */ }
.grid-2 { /* 2-column grid */ }
.grid-3 { /* 3-column grid */ }
```

---

**All components follow the light theme design system with:**
- White backgrounds
- Blue accents (#3b82f6)
- Consistent spacing
- Professional typography
- Responsive layouts
