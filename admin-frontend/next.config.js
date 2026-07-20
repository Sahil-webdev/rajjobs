/** @type {import('next').NextConfig} */
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: BACKEND_URL,
    NEXT_PUBLIC_BACKEND_URL: BACKEND_URL,
  },
};

module.exports = nextConfig;
