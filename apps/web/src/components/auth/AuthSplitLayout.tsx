import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Bot, Sparkles, Ticket, Zap } from 'lucide-react';

export const AUTH_INPUT_CLASS =
  'h-12 rounded-xl border-[#E2E8F0] bg-white text-[#0F172A] placeholder:text-[#94A3B8] shadow-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15';

export const AUTH_FIELD_CLASS = '[&_label]:text-sm [&_label]:font-medium [&_label]:text-[#0F172A]';

export const AUTH_PRIMARY_BTN =
  'flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#2563EB] text-[0.9375rem] font-semibold text-white shadow-[0_1px_2px_rgba(37,99,235,0.2)] transition-all hover:bg-[#1D4ED8] active:scale-[0.99] disabled:opacity-60';

export const AUTH_CARD_CLASS =
  'rounded-2xl border border-[#E2E8F0]/80 bg-white px-6 py-8 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.04)] sm:px-8 sm:py-9';

const DEFAULT_HIGHLIGHTS: { icon: LucideIcon; text: string }[] = [
  { icon: Zap, text: 'Đặt vé nhanh chóng' },
  { icon: Ticket, text: 'Quản lý vé mọi lúc' },
  { icon: Bot, text: 'Tích hợp cappy' },
];

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  headline?: string;
  headlineAccent?: string;
  highlights?: { icon: LucideIcon; text: string }[];
  imageAlt?: string;
};

export function AuthSplitLayout({
  children,
  headline = 'Hành trình liên tỉnh',
  headlineAccent = 'chuẩn cao cấp',
  highlights = DEFAULT_HIGHLIGHTS,
  imageAlt = 'Xe limousine Cappy Bus',
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1200px] flex-col lg:flex-row">
        <section className="relative flex min-h-[280px] flex-1 flex-col justify-end overflow-hidden lg:min-h-0 lg:max-w-[52%]">
          <Image
            src="/images/bus-limousine.jpg"
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/92 via-[#0F172A]/55 to-[#0F172A]/25" />

          <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Cappy Bus
            </p>

            <h2 className="mt-5 max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2rem]">
              {headline}
              {headlineAccent ? <span className="block text-sky-300">{headlineAccent}</span> : null}
            </h2>

            <ul className="mt-8 space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[0.9375rem] font-medium text-white/95">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-sky-200" strokeWidth={2} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:px-10 lg:py-12">
          <div className="w-full max-w-[480px]">{children}</div>
        </section>
      </div>
    </div>
  );
}
