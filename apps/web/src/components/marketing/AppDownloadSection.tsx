'use client';

import { Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/** Section tải app — Coming Soon với QR placeholder */
export function AppDownloadSection({ className }: { className?: string }) {
  return (
    <section className={cn('page-section page-container', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 p-8 shadow-elevated sm:p-12"
      >
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-between">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white/90 backdrop-blur-sm">
              <Smartphone className="h-4 w-4" />
              Sắp ra mắt
            </div>
            <h2 className="mt-5 text-section-title font-bold text-white">Tải app Cappy Bus</h2>
            <p className="mt-3 max-w-md text-base text-white/80">
              Đặt vé mọi lúc mọi nơi trên điện thoại. Ứng dụng đang được hoàn thiện — hãy theo dõi!
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
                Google Play — Coming Soon
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-sm font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
                App Store — Coming Soon
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-2xl bg-white p-5 shadow-elevated">
              <div className="flex h-36 w-36 items-center justify-center rounded-xl border-2 border-dashed border-border bg-slate-50">
                <div className="grid grid-cols-5 gap-0.5 p-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn('h-2.5 w-2.5 rounded-sm', i % 3 === 0 ? 'bg-ink' : 'bg-slate-200')}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-white/70">Quét mã khi app ra mắt</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
