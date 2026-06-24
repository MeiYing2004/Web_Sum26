'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { DEFAULT_LAYOUTS } from './default-layouts';

export default function AdminLayoutPage() {
  const { getToken } = useAuth();
  const [busType, setBusType] = useState('bus-29');
  const [layoutJson, setLayoutJson] = useState(JSON.stringify(DEFAULT_LAYOUTS['bus-29'], null, 2));
  const [saving, setSaving] = useState(false);

  async function save() {
    const token = getToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập với tài khoản Admin');
      return;
    }
    try {
      JSON.parse(layoutJson);
    } catch {
      toast.error('JSON layout không hợp lệ');
      return;
    }

    setSaving(true);
    try {
      await gql(
        `mutation($t:String!,$j:String!){updateBusSeatLayout(busLayoutType:$t,layoutJson:$j)}`,
        { t: busType, j: layoutJson },
        { token }
      );
      toast.success('Đã lưu layout');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lưu layout thất bại');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Chỉnh sửa layout ghế theo loại xe — dùng token Admin hiện tại</p>

      <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_8px_32px_rgba(79,70,229,0.08)] backdrop-blur-xl">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Loại xe
        </label>
        <select
          value={busType}
          onChange={(e) => {
            setBusType(e.target.value);
            setLayoutJson(JSON.stringify(DEFAULT_LAYOUTS[e.target.value], null, 2));
          }}
          className="block w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
        >
          <option value="bus-29">Ghế ngồi 29</option>
          <option value="bus-34">Giường nằm 34</option>
          <option value="bus-22">Limousine 22</option>
        </select>

        <label className="mb-2 mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          JSON layout
        </label>
        <textarea
          value={layoutJson}
          onChange={(e) => setLayoutJson(e.target.value)}
          rows={20}
          className="w-full rounded-2xl border border-slate-200/80 bg-slate-950/95 p-4 font-mono text-xs text-emerald-100 outline-none focus:ring-2 focus:ring-indigo-300"
        />

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="mt-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:opacity-60"
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>
    </div>
  );
}
