"use client";

import { useState, useEffect } from 'react';

interface ImageUploaderProps {
  label: string;
  currentImage?: string;
  onUpload: (url: string) => void;
  previewHeight?: number;
  id?: string;
}

export default function ImageUploader({ label, currentImage, onUpload, previewHeight = 150, id = Math.random().toString() }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(currentImage || "");

  // Sync preview with currentImage prop when it changes
  useEffect(() => {
    setPreview(currentImage || "");
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onUpload(dataUrl);
    };
    reader.readAsDataURL(file);
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
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600, fontSize: 12 }}>Click to change image</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
            <p style={{ margin: 0, color: '#3b82f6', fontWeight: 600 }}>Click to upload image</p>
            <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>JPG, PNG or WebP</p>
          </div>
        )}
      </div>
    </div>
  );
}
