'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { isAdmin } from '@/lib/roles';
import { type AdminRoute, type AdminStop, PAGE_SIZE } from '@/lib/admin-crud';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';

const emptyForm = { routeId: '', name: '', order: 1 };

export default function AdminStopsPage() {
  const { getToken, role } = useAuth();
  const canEdit = isAdmin(role);
  const [rows, setRows] = useState<AdminStop[]>([]);
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminStop | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadRoutes = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const data = await gql<{ adminRoutes: { routes: AdminRoute[] } }>(
      `{ adminRoutes(page: 1, pageSize: 100) { routes { id name } } }`,
      undefined,
      { token }
    );
    setRoutes(data.adminRoutes.routes);
  }, [getToken]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const parts = [`page: ${page}`, `pageSize: ${PAGE_SIZE}`];
      if (debouncedSearch) parts.push(`search: "${debouncedSearch.replace(/"/g, '')}"`);
      if (routeFilter) parts.push(`routeId: "${routeFilter}"`);
      const data = await gql<{ adminStops: { stops: AdminStop[]; total: number } }>(
        `{ adminStops(${parts.join(', ')}) { total stops { id routeId routeName name order } } }`,
        undefined,
        { token }
      );
      setRows(data.adminStops.stops);
      setTotal(data.adminStops.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải điểm dừng thất bại');
    } finally {
      setLoading(false);
    }
  }, [getToken, page, debouncedSearch, routeFilter]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ routeId: routeFilter || routes[0]?.id || '', name: '', order: 1 });
    setModalOpen(true);
  }

  function openEdit(row: AdminStop) {
    setEditing(row);
    setForm({ routeId: row.routeId, name: row.name, order: row.order });
    setModalOpen(true);
  }

  async function save() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      if (editing) {
        await gql(
          `mutation($id:ID!,$name:String!,$order:Int!){updateStop(id:$id,name:$name,order:$order){id}}`,
          { id: editing.id, name: form.name, order: form.order },
          { token }
        );
        toast.success('Đã cập nhật điểm dừng');
      } else {
        await gql(
          `mutation($routeId:ID!,$name:String!,$order:Int!){createStop(routeId:$routeId,name:$name,order:$order){id}}`,
          { routeId: form.routeId, name: form.name, order: form.order },
          { token }
        );
        toast.success('Đã tạo điểm dừng');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: AdminStop) {
    if (!confirm(`Xóa điểm dừng "${row.name}"?`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await gql(`mutation($id:ID!){deleteStop(id:$id){success}}`, { id: row.id }, { token });
      toast.success('Đã xóa điểm dừng');
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
        searchPlaceholder="Tìm điểm dừng..."
        emptyTitle="Chưa có điểm dừng"
        rowKey={(r) => r.id}
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 min-w-[160px]"
            >
              <option value="">Tất cả tuyến</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            {canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Thêm điểm dừng
              </Button>
            ) : null}
          </div>
        }
        columns={[
          { key: 'route', header: 'Tuyến', render: (r) => r.routeName },
          { key: 'name', header: 'Tên điểm dừng', render: (r) => r.name },
          { key: 'order', header: 'Thứ tự', render: (r) => r.order },
          ...(canEdit
            ? [
                {
                  key: 'actions',
                  header: '',
                  className: 'w-24 text-right',
                  render: (r: AdminStop) => (
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Sửa điểm dừng' : 'Thêm điểm dừng'}>
        <div className="space-y-4">
          {!editing && (
            <Field label="Tuyến">
              <Select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Tên điểm dừng">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Thứ tự">
            <Input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            />
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
