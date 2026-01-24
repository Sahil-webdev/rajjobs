import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'RajJobs Admin',
  description: 'Admin panel for RajJobs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
