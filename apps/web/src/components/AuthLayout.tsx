'use client';

import { motion } from 'framer-motion';
import { BrandLogo } from '@/components/BrandLogo';
import { Card } from '@/components/ui/Card';

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <BrandLogo size={44} textClassName="text-lg font-bold text-ink" className="justify-center" />
          <h1 className="mt-6 text-title text-ink">{title}</h1>
          <p className="mt-1.5 text-body text-ink-muted">{subtitle}</p>
        </div>
        <Card variant="elevated" padding="lg">
          {children}
        </Card>
      </motion.div>
    </div>
  );
}
