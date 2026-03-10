import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'RajJobs Admin Panel',
  description: 'Admin panel for RajJobs - Manage courses, exams, and content',
  icons: {
    icon: '/logo2.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo2.png" type="image/png" />
      </head>
      <body>
        <Script
          src="https://cdn.ckbox.io/ckbox/2.9.2/ckbox.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
