import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: BACKEND_URL,
    NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
  },
};

export default nextConfig;
