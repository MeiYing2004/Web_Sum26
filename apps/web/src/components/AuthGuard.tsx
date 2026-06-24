'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { isAdmin, isStaffRole } from '@/lib/roles';

type Props = {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireStaff?: boolean;
};

export default function AuthGuard({ children, requireAuth, requireAdmin, requireStaff }: Props) {
  const { isLoggedIn, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (requireAuth && !isLoggedIn) {
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/login?returnTo=${returnTo}`);
      return;
    }
    if (requireAdmin && !isAdmin(role)) {
      router.replace('/');
      return;
    }
    if (requireStaff && !isStaffRole(role)) {
      router.replace('/');
    }
  }, [loading, isLoggedIn, role, requireAuth, requireAdmin, requireStaff, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse space-y-4 px-4 py-10">
        <div className="h-8 w-48 rounded-lg bg-gray-200" />
        <div className="h-32 rounded-2xl bg-gray-100" />
        <div className="h-32 rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (requireAuth && !isLoggedIn) return null;
  if (requireAdmin && !isAdmin(role)) return null;
  if (requireStaff && !isStaffRole(role)) return null;

  return <>{children}</>;
}
