import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên hệ — Cappy Bus',
  description: 'Liên hệ Cappy Bus qua hotline, email hoặc form hỗ trợ trực tuyến.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
