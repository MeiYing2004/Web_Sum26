'use client';

import { FAQ_ITEMS } from '@/lib/marketing-content';
import { Accordion } from '@/components/ui/Accordion';
import { cn } from '@/lib/cn';

/** Section FAQ — accordion */
export function FAQSection({ className }: { className?: string }) {
  const items = FAQ_ITEMS.map((item, i) => ({
    id: `faq-${i}`,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section className={cn('page-section page-container', className)}>
      <div className="mb-8 text-center">
        <h2 className="section-heading">Câu hỏi thường gặp</h2>
        <p className="section-subheading">Giải đáp nhanh các thắc mắc phổ biến khi đặt vé</p>
      </div>
      <div className="mx-auto max-w-3xl">
        <Accordion items={items} />
      </div>
    </section>
  );
}
