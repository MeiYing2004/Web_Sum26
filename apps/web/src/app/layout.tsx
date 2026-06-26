import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';
import { BackToTop } from '@/components/ui/BackToTop';
import CapyAI from '@/components/CapyAI';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Cappy Bus — Đặt vé xe khách liên tỉnh',
    template: '%s | Cappy Bus',
  },
  description:
    'Đặt vé xe khách liên tỉnh nhanh chóng & an tâm. So sánh giá, chọn ghế trực quan, thanh toán online và nhận vé điện tử ngay lập tức.',
  keywords: ['đặt vé xe', 'vé xe khách', 'xe liên tỉnh', 'Cappy Bus', 'đặt vé online'],
  authors: [{ name: 'Lữ Minh Hoàng' }],
  creator: 'Lữ Minh Hoàng',
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'Cappy Bus',
    title: 'Cappy Bus — Đặt vé xe khách liên tỉnh',
    description:
      'So sánh giá từ hàng trăm nhà xe, chọn ghế trực quan và nhận vé điện tử ngay lập tức.',
    images: [
      {
        url: '/images/cappy-bus-logo.png',
        width: 1024,
        height: 1024,
        alt: 'Cappy Bus',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Cappy Bus — Đặt vé xe khách liên tỉnh',
    description: 'Đặt vé xe khách dễ dàng với Cappy Bus',
    images: ['/images/cappy-bus-logo.png'],
  },
  other: { copyright: '© 2026 Lữ Minh Hoàng. All rights reserved.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen bg-surface font-sans text-ink antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <CapyAI />
          <Footer />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
