'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { userInitials } from '@/lib/auth';
import { isAdmin, isEmployee } from '@/lib/roles';
import {
  AccountCard,
  AccountDashboard,
  QuickLinkCard,
  SettingsToggle,
} from '@/components/domain/AccountDashboard';
import { Badge } from '@/components/ui/Badge';
import { Mail, Ticket, History, Shield } from 'lucide-react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const { user, role } = useAuth();
  const name = user?.fullName || user?.email?.split('@')[0] || 'User';
  const initials = user ? userInitials(user) : 'U';
  const roleLabel = isAdmin(role) ? 'Quản trị viên' : isEmployee(role) ? 'Nhân viên' : 'Khách hàng';

  if (tab === 'settings') {
    return (
      <AccountCard title="Cài đặt tài khoản" description="Quản lý thông báo và bảo mật">
        <div className="space-y-3">
          <SettingsToggle
            label="Thông báo chuyến đi"
            desc="Nhận email nhắc trước giờ khởi hành"
            defaultOn
          />
          <SettingsToggle
            label="Ưu đãi & khuyến mãi"
            desc="Nhận thông tin giảm giá từ Cappy Bus"
            defaultOn
          />
          <SettingsToggle
            label="Xác nhận thanh toán"
            desc="Email sau khi thanh toán thành công"
            defaultOn
          />
        </div>
      </AccountCard>
    );
  }

  return (
    <div className="space-y-6">
      <AccountCard
        title="Thông tin cá nhân"
        description="Thông tin tài khoản đăng ký trên Cappy Bus"
        action={<Badge variant="brand">{roleLabel}</Badge>}
      >
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white shadow-elevated">
            {initials}
          </div>
          <div>
            <p className="text-title font-semibold text-ink">{name}</p>
            <p className="mt-1 flex items-center gap-2 text-body text-ink-muted">
              <Mail className="h-4 w-4 text-brand" />
              {user?.email || '—'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <InfoField label="Họ tên" value={user?.fullName || '—'} />
          <InfoField label="Email" value={user?.email || '—'} />
          <InfoField label="Vai trò" value={roleLabel} />
          <InfoField label="Trạng thái" value="Đang hoạt động" />
        </div>
      </AccountCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickLinkCard
          href="/my-tickets"
          icon={Ticket}
          title="Vé của tôi"
          desc="Xem và quản lý vé điện tử"
        />
        <QuickLinkCard
          href="/my-tickets?filter=COMPLETED"
          icon={History}
          title="Lịch sử chuyến đi"
          desc="Các chuyến đã hoàn thành"
        />
      </div>

      <AccountCard title="Bảo mật tài khoản">
        <div className="flex items-start gap-4 rounded-xl bg-brand-50/50 p-4 ring-1 ring-brand/10">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="font-medium text-ink">Tài khoản được bảo vệ</p>
            <p className="mt-1 text-caption text-ink-muted">
              Để đổi mật khẩu, sử dụng chức năng quên mật khẩu qua email xác minh.
            </p>
            <Link href="/forgot-password" className="mt-2 inline-block text-caption font-medium text-brand hover:underline">
              Đổi mật khẩu →
            </Link>
          </div>
        </div>
      </AccountCard>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-sunken px-4 py-3">
      <p className="text-micro font-semibold uppercase tracking-wide text-ink-subtle">{label}</p>
      <p className="mt-1 text-body font-medium text-ink">{value}</p>
    </div>
  );
}

function ProfilePageInner() {
  return (
    <AccountDashboard>
      <Suspense fallback={null}>
        <ProfileContent />
      </Suspense>
    </AccountDashboard>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth>
      <ProfilePageInner />
    </AuthGuard>
  );
}
