'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Ticket,
  User,
  X,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/hooks/useAuth';
import type { AuthUser } from '@/lib/auth';
import { userInitials } from '@/lib/auth';
import toast from 'react-hot-toast';
import { isAdmin } from '@/lib/roles';

const NAV_LINKS = [
  { href: '/', label: 'Tìm chuyến', icon: Search },
  { href: '/my-tickets', label: 'Vé của tôi', icon: ClipboardList },
  { href: '/lookup', label: 'Tra cứu vé', icon: Ticket },
] as const;

const LOGIN_BTN_CLASS =
  'rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-card transition-all duration-200 hover:shadow-elevated';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileNavOpen(false);
    toast.success('Đã đăng xuất');
    router.push('/');
  }

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const showLoginBtn = !isLoggedIn && pathname !== '/login';

  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6">
      <div
        className={`mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-2xl border px-3 transition-all duration-300 sm:gap-4 sm:px-5 ${
          scrolled ? 'glass-nav' : 'border-white/50 bg-white/70 shadow-nav backdrop-blur-xl'
        }`}
      >
        <BrandLogo
          size={40}
          textClassName="text-base font-bold tracking-tight text-ink sm:text-lg"
        />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(href)
                  ? 'bg-brand-50 text-brand'
                  : 'text-ink-muted hover:bg-slate-50 hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <ProfileMenu
              menuRef={menuRef}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              user={user}
              role={role}
              onLogout={handleLogout}
            />
          ) : (
            showLoginBtn && (
              <Link href="/login" className={LOGIN_BTN_CLASS}>
                Đăng nhập
              </Link>
            )
          )}

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label={mobileNavOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileNavOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-7xl overflow-hidden md:hidden"
          >
            <div className="rounded-[20px] border border-white/60 bg-white/90 p-3 shadow-lg backdrop-blur-xl">
              <nav className="space-y-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(href)
                        ? 'bg-brand-50 text-brand'
                        : 'text-ink-muted hover:bg-surface-sunken'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
              {!isLoggedIn && showLoginBtn && (
                <Link href="/login" className={`mt-2 block w-full text-center ${LOGIN_BTN_CLASS}`}>
                  Đăng nhập
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const AVATAR_GRADIENT = 'from-brand-500 via-brand-600 to-brand-800';

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
        <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 sm:block md:max-w-[120px]">
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
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-[20px] sm:w-80"
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.6)',
            }}
          >
            <div className="px-5 pb-4 pt-5 text-center sm:px-6 sm:pt-7">
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-white shadow-md sm:h-16 sm:w-16 sm:text-xl ${AVATAR_GRADIENT}`}
              >
                {initials}
              </div>
              <p className="text-base font-bold tracking-tight text-[#0F172A] sm:text-[17px]">{name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-[12px]">{user?.email}</p>
            </div>
            <div className="mx-4 h-px bg-slate-100/80" />
            <div className="space-y-0.5 p-2">
              <MenuLink href="/profile" icon={User} label="Thông tin cá nhân" onClick={() => setMenuOpen(false)} />
              <MenuLink href="/my-tickets" icon={ClipboardList} label="Vé của tôi" onClick={() => setMenuOpen(false)} />
              {isAdmin(role) && (
                <MenuLink href="/admin" icon={LayoutDashboard} label="Dashboard" onClick={() => setMenuOpen(false)} />
              )}
              {isAdmin(role) && (
                <MenuLink href="/admin/layout" icon={Settings} label="Settings" onClick={() => setMenuOpen(false)} />
              )}
            </div>
            <div className="mx-4 h-px bg-slate-100/80" />
            <div className="p-2 pb-3">
              <button
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-normal text-red-500 transition-all duration-200 hover:bg-[#fef2f2]"
              >
                <LogOut className="h-[18px] w-[18px] text-red-400" />
                Đăng xuất
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
      className="group flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-normal text-slate-700 transition-all duration-200 hover:bg-[#f8fafc]"
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
