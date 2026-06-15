'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, LogOut, Search, Settings, Ticket } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import type { AuthUser } from '@/lib/auth';
import { userInitials } from '@/lib/auth';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { href: '/', label: 'Tìm chuyến', icon: Search },
  { href: '/lookup', label: 'Tra cứu vé', icon: Ticket },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    toast.success('Đã đăng xuất');
    router.push('/');
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <div
        className={`mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-4 rounded-[20px] border px-4 transition-all duration-300 sm:px-5 ${
          scrolled
            ? 'border-white/60 bg-white/75 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'border-white/40 bg-white/55 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-lg'
        }`}
      >
        <BrandLogo
          size={40}
          textClassName="text-base font-bold tracking-tight text-[#0F172A] sm:text-lg"
        />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(href)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-[#0F172A]"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/25"
              >
                Đăng ký
              </Link>
            </>
          ) : (
            <ProfileMenu
              menuRef={menuRef}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              user={user}
              role={role}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}

const AVATAR_GRADIENT = 'from-violet-500 via-indigo-500 to-purple-600';

function ProfileMenu({
  menuRef,
  menuOpen,
  setMenuOpen,
  user,
  role,
  onLogout,
}: {
  menuRef: React.RefObject<HTMLDivElement | null>;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: AuthUser | null;
  role: string | null;
  onLogout: () => void;
}) {
  const name = displayName(user);
  const initials = user ? userInitials(user) : 'U';

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className="group flex items-center gap-2 rounded-full p-0.5 outline-none transition-all duration-200 hover:bg-slate-900/[0.04] focus-visible:ring-2 focus-visible:ring-indigo-500/25"
      >
        <div
          className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white shadow-sm ${AVATAR_GRADIENT}`}
        >
          {initials}
        </div>
        <span className="hidden max-w-[72px] truncate text-sm font-normal text-slate-600 sm:block">
          {name}
        </span>
        <ChevronDown
          className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block ${menuOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6)',
            }}
          >
            <div className="px-6 pb-5 pt-7 text-center">
              <div className="relative mx-auto mb-4 w-fit">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-semibold text-white shadow-md ${AVATAR_GRADIENT}`}
                >
                  {initials}
                </div>
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-white bg-emerald-500 shadow-sm" />
              </div>
              <p className="text-[17px] font-bold tracking-tight text-[#0F172A]">{name}</p>
              <p className="mt-1 text-[13px] font-medium text-slate-500">{roleSubtitle(role)}</p>
              <p className="mt-0.5 truncate text-[12px] font-normal text-slate-400">{user?.email}</p>
            </div>
            <div className="mx-4 h-px bg-slate-100/80" />
            <div className="space-y-0.5 p-2">
              <MenuLink href="/my-bookings" icon={Ticket} label="Ticket History" onClick={() => setMenuOpen(false)} />
              {role === 'ADMIN' && (
                <MenuLink href="/admin" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenuOpen(false)} />
              )}
              {role === 'ADMIN' && (
                <MenuLink href="/admin/layout" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
              )}
            </div>
            <div className="mx-4 h-px bg-slate-100/80" />
            <div className="p-2 pb-3">
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-normal text-red-500 transition-all duration-200 hover:translate-x-0.5 hover:bg-[#fef2f2]"
              >
                <LogOut className="h-[18px] w-[18px] text-red-400" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="group flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-normal text-slate-700 transition-all duration-200 hover:translate-x-0.5 hover:bg-[#f8fafc]"
    >
      <Icon className="h-[18px] w-[18px] text-slate-400 group-hover:text-slate-600" />
      {label}
    </Link>
  );
}

function displayName(user: AuthUser | null) {
  if (!user) return 'User';
  if (user.fullName && user.fullName !== user.email?.split('@')[0]) return user.fullName;
  const fromEmail = user.email?.split('@')[0] || 'User';
  return fromEmail.charAt(0).toUpperCase() + fromEmail.slice(1);
}

function roleSubtitle(role: string | null) {
  if (role === 'ADMIN') return 'System Administrator';
  if (role === 'STAFF') return 'Staff Member';
  return 'Thành viên';
}
