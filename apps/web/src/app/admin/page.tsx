'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bus,
  Percent,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import { gql } from '@/lib/graphql';
import { useAuth } from '@/hooks/useAuth';
import {
  ADMIN_DASHBOARD_QUERY,
  type AdminDashboard,
  formatPercent,
  formatVnd,
} from '@/lib/admin-dashboard';
import StatCard from '@/components/admin/StatCard';
import RevenueChart from '@/components/admin/RevenueChart';
import TicketsChart from '@/components/admin/TicketsChart';
import TopList from '@/components/admin/TopList';
import OrdersTable from '@/components/admin/OrdersTable';
import CheckInCard from '@/components/admin/CheckInCard';
import DashboardSkeleton from '@/components/admin/DashboardSkeleton';

export default function AdminDashboardPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Vui lòng đăng nhập với tài khoản Admin');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await gql<{ adminDashboard: AdminDashboard }>(ADMIN_DASHBOARD_QUERY, undefined, { token });
      setData(res.adminDashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dashboard');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    const isBackendDown = /UNAVAILABLE|No connection|ticket-service|backend/i.test(error);
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-sm text-rose-700 backdrop-blur-xl">
        <p className="font-semibold">Không tải được dữ liệu dashboard</p>
        <p className="mt-1">{error}</p>
        {isBackendDown ? (
          <p className="mt-3 text-xs text-rose-600/90">
            Thường do <strong>ticket-service</strong> chưa chạy. Trong PowerShell tại thư mục dự án chạy:{' '}
            <code className="rounded bg-rose-100 px-1">docker compose up -d ticket-service trip-service auth-service</code>
          </p>
        ) : null}
        <button
          type="button"
          onClick={load}
          className="mt-4 rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, revenue7Days, revenue30Days, topRoutes, topOperators, topCustomers, recentOrders } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Tổng quan vận hành theo thời gian thực</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Bảng điều khiển</h2>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center rounded-2xl border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Tổng doanh thu"
          value={formatVnd(stats.totalRevenue)}
          icon={TrendingUp}
          accent="from-indigo-500 to-violet-600"
        />
        <StatCard
          label="Vé đã bán"
          value={stats.ticketsSold.toLocaleString('vi-VN')}
          icon={Ticket}
          accent="from-violet-500 to-purple-600"
        />
        <StatCard
          label="Khách hàng"
          value={stats.customers.toLocaleString('vi-VN')}
          icon={Users}
          accent="from-cyan-500 to-blue-600"
        />
        <StatCard
          label="Chuyến hoạt động"
          value={stats.activeTrips.toLocaleString('vi-VN')}
          icon={Bus}
          accent="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Tỷ lệ chuyển đổi"
          value={formatPercent(stats.conversionRate)}
          hint={`${stats.totalSearches} tìm kiếm · ${stats.totalBookings} booking`}
          icon={Percent}
          accent="from-fuchsia-500 to-pink-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart title="Doanh thu 7 ngày" data={revenue7Days} rangeLabel="7 ngày gần nhất" />
        <RevenueChart title="Doanh thu 30 ngày" data={revenue30Days} rangeLabel="30 ngày gần nhất" />
      </div>

      <TicketsChart data={revenue30Days.length ? revenue30Days : revenue7Days} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopList title="Top tuyến bán chạy" icon={TrendingUp} items={topRoutes} />
        <TopList title="Top nhà xe" icon={Bus} items={topOperators} />
        <TopList title="Top khách hàng" icon={Users} items={topCustomers} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <OrdersTable orders={recentOrders} />
        </div>
        <CheckInCard onSuccess={load} />
      </div>
    </div>
  );
}
