"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/setup/check`);
      
      if (response.data.setupRequired) {
        // Initial setup needed
        router.push('/setup');
      } else {
        // Setup done, go to login
        router.push('/login');
      }
    } catch (error) {
      console.error("Setup check failed:", error);
      // If API fails, assume setup done and go to login
      router.push('/login');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '10px' }}>🔄</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return null;
}
