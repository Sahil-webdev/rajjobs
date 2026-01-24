"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

type Setting = {
  key: string;
  value: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings = [
    { key: 'siteName', value: '', label: 'Site Name' },
    { key: 'siteEmail', value: '', label: 'Contact Email' },
    { key: 'sitePhone', value: '', label: 'Contact Phone' },
    { key: 'currency', value: 'INR', label: 'Currency' },
    { key: 'timezone', value: 'Asia/Kolkata', label: 'Timezone' },
    { key: 'maxUploadSize', value: '50MB', label: 'Max Upload Size' },
    { key: 'maintenanceMode', value: 'false', label: 'Maintenance Mode' },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/admin/settings');
        setSettings(res.data || []);
      } catch (err) {
        setSettings(defaultSettings);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getSetting = (key: string) => {
    return settings.find((s) => s.key === key)?.value || '';
  };

  const setSetting = (key: string, value: string) => {
    setSettings(
      settings.find((s) => s.key === key)
        ? settings.map((s) => (s.key === key ? { ...s, value } : s))
        : [...settings, { key, value }],
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Error saving settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="page-header">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Configure site-wide settings and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>🏢 General Settings</h3>

          <div className="form-group">
            <label>Site Name</label>
            <input
              className="input"
              placeholder="Raj Jobs"
              value={getSetting('siteName')}
              onChange={(e) => setSetting('siteName', e.target.value)}
            />
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>The name of your learning platform</p>
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input
              className="input"
              type="email"
              placeholder="support@rajjobs.com"
              value={getSetting('siteEmail')}
              onChange={(e) => setSetting('siteEmail', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input
              className="input"
              placeholder="+91 XXXXX XXXXX"
              value={getSetting('sitePhone')}
              onChange={(e) => setSetting('sitePhone', e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20 }}>⚙️ System Settings</h3>

          <div className="form-group">
            <label>Currency</label>
            <select className="input" value={getSetting('currency')} onChange={(e) => setSetting('currency', e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select className="input" value={getSetting('timezone')} onChange={(e) => setSetting('timezone', e.target.value)}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Max Upload Size</label>
            <input
              className="input"
              placeholder="50MB"
              value={getSetting('maxUploadSize')}
              onChange={(e) => setSetting('maxUploadSize', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 20 }}>🔒 Advanced Settings</h3>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="checkbox"
            id="maintenance"
            checked={getSetting('maintenanceMode') === 'true'}
            onChange={(e) => setSetting('maintenanceMode', e.target.checked ? 'true' : 'false')}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          <label htmlFor="maintenance" style={{ marginBottom: 0, cursor: 'pointer' }}>
            <div style={{ fontWeight: 500 }}>Maintenance Mode</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Show "under maintenance" message to users</div>
          </label>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <button
          className="button"
          onClick={save}
          disabled={saving}
          style={{
            background: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
        <button
          className="button"
          onClick={() => window.location.reload()}
          style={{ padding: '12px 24px', background: '#e5e7eb' }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
