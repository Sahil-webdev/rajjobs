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
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/_render/exam-page.css',
          destination: `${BACKEND_URL}/_render/exam-page.css`,
        },
        // Serve exam articles from the backend's classic HTML renderer. The
        // browser keeps the public URL, while view-source remains clean HTML.
        {
          source: '/exams/:slug',
          destination: `${BACKEND_URL}/_render/exams/:slug`,
        },
      ],
    };
  },
};

export default nextConfig;
