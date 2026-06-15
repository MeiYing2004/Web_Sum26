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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#0F172A]">Cấu hình sơ đồ ghế</h1>
      <p className="mt-1 text-sm text-slate-500">Sử dụng token đăng nhập Admin hiện tại</p>
      <select
        value={busType}
        onChange={(e) => {
          setBusType(e.target.value);
          setLayoutJson(JSON.stringify(DEFAULT_LAYOUTS[e.target.value], null, 2));
        }}
        className="mt-4 block rounded-xl border border-slate-200 px-3 py-2 text-sm"
      >
        <option value="bus-29">Ghế ngồi 29</option>
        <option value="bus-34">Giường nằm 34</option>
        <option value="bus-22">Limousine 22</option>
      </select>
      <textarea
        value={layoutJson}
        onChange={(e) => setLayoutJson(e.target.value)}
        rows={20}
        className="mt-4 w-full rounded-xl border border-slate-200 p-3 font-mono text-xs"
      />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? 'Đang lưu...' : 'Lưu'}
      </button>
    </div>
  );
}
