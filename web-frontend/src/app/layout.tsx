import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rajjobs.com"),
  title: {
    default: "RajJobs - Competitive Exam Preparation",
    template: "%s | RajJobs",
  },
  description: "Prepare for SSC, UPSC, Railway, Banking and other competitive exams with RajJobs",
  icons: {
    icon: '/logo2.png',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main className="bg-white min-h-screen">{children}</main>
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-V3KR48H637" />
    </html>
  );
}
