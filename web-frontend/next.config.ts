import type { NextConfig } from "next";

const BACKEND_URL = 'https://rajjobs-backend.onrender.com';

const nextConfig: NextConfig = {
  // Hardcode the backend URL so it is always baked in at Vercel build time,
  // even if NEXT_PUBLIC_* env vars are not set in the Vercel dashboard.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || BACKEND_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || BACKEND_URL,
  },
};

export default nextConfig;
