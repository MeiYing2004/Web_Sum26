import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import CopyrightNotice from '@/components/CopyrightNotice';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Cappy Bus — Đặt vé xe khách liên tỉnh',
  description: 'Đặt vé xe khách dễ dàng với Cappy Bus',
  authors: [{ name: 'Lữ Minh Hoàng' }],
  creator: 'Lữ Minh Hoàng',
  other: { copyright: '© 2026 Lữ Minh Hoàng. All rights reserved.' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="min-h-screen bg-[#FAFAFA] font-sans antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <CopyrightNotice />
        </Providers>
      </body>
    </html>
  );
}
