'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';

export default function AdminPage() {
  const [revenue, setRevenue] = useState<Record<string, unknown> | null>(null);
  const [routes, setRoutes] = useState<Array<Record<string, unknown>>>([]);
  const [conversion, setConversion] = useState<Record<string, unknown> | null>(null);
  const [checkInCode, setCheckInCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      gql<{ revenueSummary: Record<string, unknown> }>(
        `{revenueSummary{totalRevenue daily{date revenue bookingCount}}}`
      ),
      gql<{ popularRoutes: Array<Record<string, unknown>> }>(
        `{popularRoutes(limit:5){origin destination searchCount}}`
      ),
      gql<{ conversionRate: Record<string, unknown> }>(
        `{conversionRate{totalSearches totalBookings conversionRate}}`
      ),
    ])
      .then(([rev, pop, conv]) => {
        setRevenue(rev.revenueSummary);
        setRoutes(pop.popularRoutes);
        setConversion(conv.conversionRate);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function checkIn() {
    if (!checkInCode.trim()) {
      toast.error('Vui lòng nhập mã booking');
      return;
    }
    try {
      const data = await gql<{ checkIn: { success: boolean; message: string } }>(
        `mutation($bookingCode:String!){checkIn(bookingCode:$bookingCode){success message}}`,
        { bookingCode: checkInCode.trim() }
      );
      if (data.checkIn.success) toast.success(data.checkIn.message);
      else toast.error(data.checkIn.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check-in thất bại');
    }
  }

  if (loading) {
    return <p className="p-8 text-sm text-slate-500">Đang tải dashboard...</p>;
  }

  if (error) {
    return (
      <div className="m-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0F172A]">Admin Dashboard</h1>
      <div className="mb-6 mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={card}>
          <h3 className="text-sm font-medium text-slate-500">Doanh thu</h3>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {Number(revenue?.totalRevenue || 0).toLocaleString('vi-VN')}đ
          </p>
        </div>
        <div className={card}>
          <h3 className="text-sm font-medium text-slate-500">Tỷ lệ chuyển đổi</h3>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {((Number(conversion?.conversionRate) || 0) * 100).toFixed(1)}%
          </p>
          <small className="text-slate-400">
            {String(conversion?.totalSearches)} tìm kiếm / {String(conversion?.totalBookings)} booking
          </small>
        </div>
        <div className={card}>
          <h3 className="text-sm font-medium text-slate-500">Check-in</h3>
          <input
            placeholder="Mã booking"
            value={checkInCode}
            onChange={(e) => setCheckInCode(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={checkIn}
            className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Check-in
          </button>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#0F172A]">Top tuyến tìm kiếm</h2>
      {routes.map((r, i) => (
        <div key={i} className={`${card} mt-3`}>
          {String(r.origin)} → {String(r.destination)}: {String(r.searchCount)} lượt
        </div>
      ))}
    </div>
  );
}

const card = 'rounded-2xl border border-slate-100 bg-white p-5 shadow-sm';
