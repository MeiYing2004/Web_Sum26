'use client';

import AuthGuard from '@/components/AuthGuard';
import AdminShell from '@/components/admin/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireStaff>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
