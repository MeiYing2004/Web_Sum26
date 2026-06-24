'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  History,
  KeyRound,
  Settings,
  Ticket,
  User,
} from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { id: 'profile', href: '/profile', label: 'Thông tin cá nhân', icon: User },
  { id: 'tickets', href: '/my-tickets', label: 'Vé của tôi', icon: Ticket },
  { id: 'history', href: '/my-tickets?filter=COMPLETED', label: 'Lịch sử chuyến đi', icon: History },
  { id: 'password', href: '/forgot-password', label: 'Đổi mật khẩu', icon: KeyRound },
  { id: 'settings', href: '/profile?tab=settings', label: 'Cài đặt tài khoản', icon: Settings },
] as const;

export function AccountDashboard({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href.startsWith('/profile')) return pathname === '/profile';
    if (href.startsWith('/my-tickets')) return pathname.startsWith('/my-tickets');
    return pathname === href;
  }

  return (
    <div className="mesh-bg min-h-[calc(100vh-80px)]">
      <div className="page-section page-container">
        <div className="mb-8">
          <h1 className="text-display text-ink">Tài khoản của tôi</h1>
          <p className="mt-2 text-body text-ink-muted">
            Quản lý thông tin, vé và cài đặt tài khoản Cappy Bus
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            <nav className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-card">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-body font-medium transition-all duration-200',
                    isActive(href)
                      ? 'bg-brand-50 text-brand shadow-sm'
                      : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            {sidebar}

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-card">
              <div className="relative h-28">
                <Image
                  src="/images/bus-limousine.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="260px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-caption font-semibold text-white">Cappy Bus Premium</p>
                  <p className="text-micro text-white/70">Ưu đãi thành viên mới 15%</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AccountCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-subtitle font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-caption text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function QuickLinkCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="card-hover-lift flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-caption text-ink-muted">{desc}</p>
      </div>
    </Link>
  );
}

export function SettingsToggle({
  label,
  desc,
  defaultOn,
}: {
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-sunken px-4 py-3">
      <div>
        <p className="flex items-center gap-2 text-body font-medium text-ink">
          <Bell className="h-4 w-4 text-brand" />
          {label}
        </p>
        <p className="mt-0.5 text-caption text-ink-muted">{desc}</p>
      </div>
      <label className="relative inline-flex ipe-clickable items-center">
        <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
        <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}
