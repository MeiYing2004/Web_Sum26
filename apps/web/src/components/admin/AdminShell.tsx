'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Bus,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Route,
  ScrollText,
  Settings2,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { avatarGradient, userInitials } from '@/lib/auth';
import { ADMIN_EVENT_LOGS_ENABLED } from '@/lib/admin-features';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/routes', label: 'Tuyến xe', icon: Route },
  { href: '/admin/stops', label: 'Điểm dừng', icon: MapPin },
  { href: '/admin/buses', label: 'Xe', icon: Bus },
  { href: '/admin/trips', label: 'Chuyến xe', icon: LayoutGrid },
  ...(ADMIN_EVENT_LOGS_ENABLED
    ? [{ href: '/admin/events' as const, label: 'Nhật ký', icon: ScrollText }]
    : []),
  { href: '/admin/layout', label: 'Sơ đồ ghế', icon: Settings2 },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/routes': 'Quản lý tuyến xe',
  '/admin/stops': 'Quản lý điểm dừng',
  '/admin/buses': 'Quản lý xe',
  '/admin/trips': 'Quản lý chuyến xe',
  '/admin/events': 'Nhật ký sự kiện',
  '/admin/layout': 'Cấu hình sơ đồ ghế',
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="min-h-[calc(100vh-76px)] bg-surface-sunken">
      <div className="flex min-h-[calc(100vh-76px)]">
        <aside
          className={`fixed left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:min-h-[calc(100vh-76px)] lg:translate-x-0 top-[76px] h-[calc(100vh-76px)] ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Quản trị hệ thống
            </p>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
            <ul className="space-y-0.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-brand-50 text-brand ring-1 ring-inset ring-brand-100'
                          : 'text-ink-muted hover:bg-slate-50 hover:text-ink'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-slate-100 p-3">
            <div className="mb-2 flex items-center gap-2.5 rounded-lg px-1 py-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${avatarGradient(user?.email ?? 'admin')}`}
              >
                {user ? userInitials(user) : 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{user?.fullName || 'Admin'}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              <LogOut className="h-3.5 w-3.5" />
              Đăng xuất
            </button>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-[76px] z-30 bg-slate-900/20 backdrop-blur-[1px] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng overlay"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">Admin Panel</p>
                <h1 className="text-base font-semibold text-slate-900">{pageTitle}</h1>
              </div>
            </div>
            <Link
              href="/"
              className="hidden rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:inline-flex"
            >
              Về trang chủ
            </Link>
          </header>

          <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
