'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { isAdmin } from '@/lib/roles';
import { type AdminBus, type AdminOperator, PAGE_SIZE } from '@/lib/admin-crud';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';

const LAYOUT_OPTIONS = [
  { value: 'bus-29', label: 'Ghế ngồi 29' },
  { value: 'bus-34', label: 'Giường nằm 34' },
  { value: 'bus-22', label: 'Limousine 22' },
];

const emptyForm = {
  plate: '',
  busType: '',
  seatCount: 29,
  layoutType: 'bus-29',
  operatorId: '',
};

export default function AdminBusesPage() {
  const { getToken, role } = useAuth();
  const canEdit = isAdmin(role);
  const [rows, setRows] = useState<AdminBus[]>([]);
  const [operators, setOperators] = useState<AdminOperator[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBus | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadMeta = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await gql<{ adminOperators: AdminOperator[] }>(`{ adminOperators { id name } }`, undefined, {
        token,
      });
      setOperators(data.adminOperators);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải nhà xe thất bại');
    }
  }, [getToken]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const q = debouncedSearch ? `, search: "${debouncedSearch.replace(/"/g, '')}"` : '';
      const data = await gql<{ adminBuses: { buses: AdminBus[]; total: number } }>(
        `{ adminBuses(page: ${page}, pageSize: ${PAGE_SIZE}${q}) { total buses { id plate busType seatCount layoutType operatorId operatorName } } }`,
        undefined,
        { token }
      );
      setRows(data.adminBuses.buses);
      setTotal(data.adminBuses.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải xe thất bại');
    } finally {
      setLoading(false);
    }
  }, [getToken, page, debouncedSearch]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, operatorId: operators[0]?.id || '' });
    setModalOpen(true);
  }

  function openEdit(row: AdminBus) {
    setEditing(row);
    setForm({
      plate: row.plate,
      busType: row.busType,
      seatCount: row.seatCount,
      layoutType: row.layoutType,
      operatorId: row.operatorId,
    });
    setModalOpen(true);
  }

  async function save() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const vars = {
        plate: form.plate,
        busType: form.busType,
        seatCount: form.seatCount,
        layoutType: form.layoutType,
        operatorId: form.operatorId,
      };
      if (editing) {
        await gql(
          `mutation($id:ID!,$plate:String!,$busType:String!,$seatCount:Int!,$layoutType:String!,$operatorId:ID!){updateBus(id:$id,plate:$plate,busType:$busType,seatCount:$seatCount,layoutType:$layoutType,operatorId:$operatorId){id}}`,
          { id: editing.id, ...vars },
          { token }
        );
        toast.success('Đã cập nhật xe');
      } else {
        await gql(
          `mutation($plate:String!,$busType:String!,$seatCount:Int!,$layoutType:String!,$operatorId:ID!){createBus(plate:$plate,busType:$busType,seatCount:$seatCount,layoutType:$layoutType,operatorId:$operatorId){id}}`,
          vars,
          { token }
        );
        toast.success('Đã tạo xe');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: AdminBus) {
    if (!confirm(`Xóa xe biển số "${row.plate}"?`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await gql(`mutation($id:ID!){deleteBus(id:$id){success}}`, { id: row.id }, { token });
      toast.success('Đã xóa xe');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  return (
    <div className="space-y-4">
      <AdminDataTable
        rows={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        searchPlaceholder="Tìm biển số, loại xe..."
        emptyTitle="Chưa có xe"
        rowKey={(r) => r.id}
        toolbarExtra={
          canEdit ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Thêm xe
            </Button>
          ) : null
        }
        columns={[
          { key: 'plate', header: 'Biển số', render: (r) => r.plate },
          { key: 'busType', header: 'Loại xe', render: (r) => r.busType },
          { key: 'seatCount', header: 'Số ghế', render: (r) => r.seatCount },
          { key: 'layoutType', header: 'Layout', render: (r) => r.layoutType },
          { key: 'operator', header: 'Nhà xe', render: (r) => r.operatorName },
          ...(canEdit
            ? [
                {
                  key: 'actions',
                  header: '',
                  className: 'w-24 text-right',
                  render: (r: AdminBus) => (
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Sửa">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(r)} aria-label="Xóa">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa xe' : 'Thêm xe mới'}>
        <div className="space-y-4">
          <Field label="Biển số">
            <Input value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} />
          </Field>
          <Field label="Loại xe">
            <Input value={form.busType} onChange={(e) => setForm({ ...form, busType: e.target.value })} />
          </Field>
          <Field label="Số ghế">
            <Input
              type="number"
              min={1}
              value={form.seatCount}
              onChange={(e) => setForm({ ...form, seatCount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Layout">
            <Select value={form.layoutType} onChange={(e) => setForm({ ...form, layoutType: e.target.value })}>
              {LAYOUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nhà xe">
            <Select value={form.operatorId} onChange={(e) => setForm({ ...form, operatorId: e.target.value })}>
              {operators.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
