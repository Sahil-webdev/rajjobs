"use client";

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import ImageUploader from '../../../components/ImageUploader';

type Banner = { _id: string; imageUrl: string; order: number };

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/api/admin/banners')
      .then((res) => {
        console.log('Banners loaded:', res.data);
        setBanners(res.data);
      })
      .catch((err) => {
        console.error('Error loading banners:', err);
        setError('Failed to load banners');
      });
  };

  // Helper functions
  const getBannerAt = (order: number): Banner | undefined => {
    return banners.find((b) => b.order === order);
  };

  const setBannerImage = async (order: number, imageUrl: string) => {
    setLoading((prev) => ({ ...prev, [order]: true }));
    setError('');
    setSuccess('');
    try {
      const existingBanner = getBannerAt(order);
      if (existingBanner) {
        await api.put(`/api/admin/banners/${order}`, { imageUrl });
      } else {
        await api.post('/api/admin/banners', { imageUrl, order });
      }
      setSuccess('Banner updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error saving banner');
      console.error('Error:', err);
    } finally {
      setLoading((prev) => ({ ...prev, [order]: false }));
    }
  };

  const removeBanner = async (order: number) => {
    if (!confirm('Delete this banner?')) return;
    const banner = getBannerAt(order);
    if (!banner) return;
    setLoading((prev) => ({ ...prev, [order]: true }));
    try {
      await api.delete(`/api/admin/banners/${order}`);
      setSuccess('Banner deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error deleting banner');
      console.error('Error:', err);
    } finally {
      setLoading((prev) => ({ ...prev, [order]: false }));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Homepage Banners</h2>
        <p>Upload exactly 4 images for your homepage carousel</p>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 20 }}>❌ {error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#166534', padding: 12, borderRadius: 8, marginBottom: 20 }}>✅ {success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((order) => {
          const banner = getBannerAt(order);
          return (
            <div key={order} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', paddingBottom: '66.67%', background: '#f3f4f6', overflow: 'hidden' }}>
                {banner ? (
                  <img
                    src={banner.imageUrl}
                    alt={`Banner ${order}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f3f4f6',
                      fontSize: 32,
                      color: '#d1d5db',
                    }}
                  >
                    📸
                  </div>
                )}
              </div>

              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12, color: '#111827' }}>
                  Banner {order} {banner ? '✅' : '⬜'}
                </div>

                <ImageUploader
                  label="Upload Image"
                  currentImage={banner?.imageUrl || ''}
                  onUpload={(url) => setBannerImage(order, url)}
                  previewHeight={0}
                  id={`banner-${order}`}
                />

                {banner && (
                  <button
                    className="button"
                    style={{
                      width: '100%',
                      marginTop: 12,
                      background: '#ef4444',
                      color: 'white',
                      padding: '8px 16px',
                    }}
                    onClick={() => removeBanner(order)}
                    disabled={loading[order]}
                  >
                    🗑️ Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[1, 2, 3, 4].map((order) => {
            const banner = getBannerAt(order);
            return (
              <div
                key={order}
                style={{
                  padding: 12,
                  background: banner ? '#dcfce7' : '#fee2e2',
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Banner {order}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{banner ? '✅ Uploaded' : '⬜ Empty'}</div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: '#f0f9ff',
            borderRadius: 8,
            borderLeft: '4px solid #3b82f6',
          }}
        >
          <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>Uploaded: {banners.length}/4</div>
          <div style={{ fontSize: 12, color: '#1e40af' }}>
            {banners.length === 4 ? '✅ All banners ready!' : `Add ${4 - banners.length} more banner(s)`}
          </div>
        </div>
      </div>
    </div>
  );
}
