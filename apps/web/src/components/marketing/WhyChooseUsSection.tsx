'use client';

import { motion } from 'framer-motion';
import { WHY_CHOOSE_US } from '@/lib/marketing-content';
import { cn } from '@/lib/cn';

/** Section "Tại sao chọn Cappy Bus" */
export function WhyChooseUsSection({ className }: { className?: string }) {
  return (
    <section className={cn('page-section page-container', className)}>
      <div className="mb-10 text-center">
        <h2 className="section-heading">Tại sao chọn Cappy Bus</h2>
        <p className="section-subheading">Trải nghiệm đặt vé xe khách hiện đại và đáng tin cậy</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {WHY_CHOOSE_US.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-card-title font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
