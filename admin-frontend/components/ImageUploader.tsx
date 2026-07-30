"use client";

import { useState, useEffect } from 'react';
import api from '../lib/api';

interface ImageUploaderProps {
  label: string;
  currentImage?: string;
  onUpload: (url: string) => void;
  previewHeight?: number;
  id?: string;
  folder?: string;
}

export default function ImageUploader({ label, currentImage, onUpload, previewHeight = 150, id = Math.random().toString(), folder = 'images' }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Sync preview with currentImage prop when it changes
  useEffect(() => {
    setPreview(currentImage || "");
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError('');
    setUploading(true);

    try {
      const body = new FormData();
      body.append('upload', file);
      body.append('folder', folder);
      const response = await api.post('/api/admin/file/upload-image', body);
      const url = response.data?.url;
      if (!url) throw new Error('The server did not return an image URL.');
      setPreview(url);
      onUpload(url);
    } catch (uploadError: any) {
      URL.revokeObjectURL(objectUrl);
      setPreview(currentImage || '');
      setError(uploadError?.response?.data?.error?.message || uploadError?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div
        onClick={() => document.getElementById(`uploader-${id}`)?.click()}
        style={{
          cursor: 'pointer',
          border: '2px dashed #3b82f6',
          borderRadius: 8,
          padding: 20,
          textAlign: 'center',
          background: '#f0f9ff',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#e0f2fe')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#f0f9ff')}
      >
        <input
          id={`uploader-${id}`}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {preview ? (
          <div>
            <img src={preview} alt="Preview" style={{ maxHeight: previewHeight, maxWidth: '100%', borderRadius: 6, marginBottom: 8 }} />
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: 12 }}>{uploading ? 'Uploading to media storage…' : 'Click to change image'}</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600 }}>Click to upload image</p>
            <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>JPG, PNG or WebP</p>
          </div>
        )}
      </div>
      {error && <p style={{ margin: '6px 0 0', color: '#dc2626', fontSize: 12 }}>{error}</p>}
    </div>
  );
}
