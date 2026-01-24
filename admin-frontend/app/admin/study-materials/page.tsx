"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface StudyMaterial {
  _id: string;
  type: 'notes' | 'current_affairs' | 'previous_year_questions' | 'syllabus';
  title: string;
  description: string;
  pdfUrl: string;
  courseId?: string;
  createdAt: string;
}

const typeLabels = {
  notes: 'Notes 📓',
  current_affairs: 'Current Affairs 📰',
  previous_year_questions: 'Previous Year Questions ❓',
  syllabus: 'Syllabus 📚',
};

const typeColors = {
  notes: '#3b82f6',
  current_affairs: '#f59e0b',
  previous_year_questions: '#ef4444',
  syllabus: '#8b5cf6',
};

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    type: 'notes',
    title: '',
    description: '',
    pdfFile: null as File | null,
  });

  const load = () => {
    api
      .get('/api/admin/study-materials')
      .then((res) => setMaterials(res.data))
      .catch((err) => {
        console.error('Error loading materials:', err);
        setError('Failed to load materials');
      });
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setForm({ ...form, pdfFile: file });
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.type || !form.pdfFile) {
      setError('Title, type, and PDF file are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const pdfBase64 = reader.result as string;
        await api.post('/api/admin/study-materials', {
          type: form.type,
          title: form.title,
          description: form.description,
          pdfUrl: pdfBase64,
        });
        setSuccess('Study material uploaded successfully');
        setForm({ type: 'notes', title: '', description: '', pdfFile: null });
        setTimeout(() => setSuccess(''), 3000);
        load();
      };
      reader.readAsDataURL(form.pdfFile);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error uploading material');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    try {
      await api.delete(`/api/admin/study-materials/${id}`);
      setSuccess('Material deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error deleting material');
    }
  };

  const filteredMaterials = selectedType
    ? materials.filter((m) => m.type === selectedType)
    : materials;

  const materialsByType = {
    notes: materials.filter((m) => m.type === 'notes'),
    current_affairs: materials.filter((m) => m.type === 'current_affairs'),
    previous_year_questions: materials.filter((m) => m.type === 'previous_year_questions'),
    syllabus: materials.filter((m) => m.type === 'syllabus'),
  };

  return (
    <div>
      <div className="page-header">
        <h2>Study Materials</h2>
        <p>Upload notes, current affairs, previous year questions, and syllabus</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          ❌ {error}
        </div>
      )}
      {success && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          ✅ {success}
        </div>
      )}

      {/* Upload Form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Upload New Material</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                <option value="notes">📓 Notes</option>
                <option value="current_affairs">📰 Current Affairs</option>
                <option value="previous_year_questions">❓ Previous Year Questions</option>
                <option value="syllabus">📚 Syllabus</option>
              </select>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g., Physics Chapter 5"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              placeholder="Add description for this material"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 14,
                minHeight: 80,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div className="form-group">
            <label>PDF File</label>
            <div
              onClick={() => document.getElementById('pdf-upload')?.click()}
              style={{
                cursor: 'pointer',
                border: '2px dashed #3b82f6',
                borderRadius: 8,
                padding: 20,
                textAlign: 'center',
                background: '#f0f9ff',
                transition: 'all 0.2s',
              }}
            >
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {form.pdfFile ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                  <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600 }}>
                    {form.pdfFile.name}
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>
                    {(form.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
                  <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600 }}>
                    Click to select PDF
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>
                    Maximum 50 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button"
            style={{
              width: '100%',
              background: '#3b82f6',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Uploading...' : '📤 Upload Material'}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {Object.entries(typeLabels).map(([type, label]) => (
          <div
            key={type}
            onClick={() => setSelectedType(selectedType === type ? '' : type)}
            style={{
              padding: 16,
              background: selectedType === type ? typeColors[type as keyof typeof typeColors] : '#f3f4f6',
              color: selectedType === type ? 'white' : '#111827',
              borderRadius: 8,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              {label.split(' ')[1]}
            </div>
            <div style={{ fontWeight: 600, fontSize: 20 }}>
              {materialsByType[type as keyof typeof materialsByType].length}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              {label.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Materials List */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>
          {selectedType
            ? `${typeLabels[selectedType as keyof typeof typeLabels]} (${filteredMaterials.length})`
            : `All Materials (${materials.length})`}
        </h3>

        {filteredMaterials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            <p style={{ fontSize: 18, fontWeight: 600 }}>No materials uploaded yet</p>
            <p style={{ margin: '8px 0 0' }}>Upload your first material to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filteredMaterials.map((material) => (
              <div
                key={material._id}
                style={{
                  padding: 16,
                  border: `2px solid ${typeColors[material.type]}`,
                  borderRadius: 8,
                  background: '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: typeColors[material.type], marginBottom: 4 }}>
                      {typeLabels[material.type]}
                    </div>
                    <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>{material.title}</h4>
                    {material.description && (
                      <p style={{ margin: '8px 0', fontSize: 14, color: '#6b7280' }}>
                        {material.description}
                      </p>
                    )}
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                      Uploaded: {new Date(material.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(material._id)}
                    className="button"
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    🗑️ Delete
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
