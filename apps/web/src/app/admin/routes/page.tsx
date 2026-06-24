'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { isAdmin } from '@/lib/roles';
import { type AdminRoute, PAGE_SIZE } from '@/lib/admin-crud';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';

const emptyForm = { name: '', origin: '', destination: '' };

export default function AdminRoutesPage() {
  const { getToken, role } = useAuth();
  const canEdit = isAdmin(role);
  const [rows, setRows] = useState<AdminRoute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRoute | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const q = debouncedSearch ? `, search: "${debouncedSearch.replace(/"/g, '')}"` : '';
      const data = await gql<{ adminRoutes: { routes: AdminRoute[]; total: number } }>(
        `{ adminRoutes(page: ${page}, pageSize: ${PAGE_SIZE}${q}) { total routes { id name origin destination createdAt stops { id name order } } } }`,
        undefined,
        { token }
      );
      setRows(data.adminRoutes.routes);
      setTotal(data.adminRoutes.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải tuyến thất bại');
    } finally {
      setLoading(false);
    }
  }, [getToken, page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(row: AdminRoute) {
    setEditing(row);
    setForm({ name: row.name, origin: row.origin, destination: row.destination });
    setModalOpen(true);
  }

  async function save() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const vars = {
        name: form.name,
        origin: form.origin,
        destination: form.destination,
      };
      if (editing) {
        await gql(
          `mutation($id:ID!,$name:String!,$origin:String!,$destination:String!){updateRoute(id:$id,name:$name,origin:$origin,destination:$destination){id}}`,
          { id: editing.id, ...vars },
          { token }
        );
        toast.success('Đã cập nhật tuyến');
      } else {
        await gql(
          `mutation($name:String!,$origin:String!,$destination:String!){createRoute(name:$name,origin:$origin,destination:$destination){id}}`,
          vars,
          { token }
        );
        toast.success('Đã tạo tuyến');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: AdminRoute) {
    if (!confirm(`Xóa tuyến "${row.name}"?`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await gql(`mutation($id:ID!){deleteRoute(id:$id){success}}`, { id: row.id }, { token });
      toast.success('Đã xóa tuyến');
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
        searchPlaceholder="Tìm tuyến, điểm đi/đến..."
        emptyTitle="Chưa có tuyến xe"
        rowKey={(r) => r.id}
        toolbarExtra={
          canEdit ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Thêm tuyến
            </Button>
          ) : null
        }
        columns={[
          { key: 'name', header: 'Tên tuyến', render: (r) => r.name },
          { key: 'origin', header: 'Điểm đi', render: (r) => r.origin },
          { key: 'destination', header: 'Điểm đến', render: (r) => r.destination },
          {
            key: 'stops',
            header: 'Điểm dừng',
            render: (r) => r.stops.length,
          },
          ...(canEdit
            ? [
                {
                  key: 'actions',
                  header: '',
                  className: 'w-24 text-right',
                  render: (r: AdminRoute) => (
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa tuyến' : 'Thêm tuyến mới'}
      >
        <div className="space-y-4">
          <Field label="Tên tuyến">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Điểm đi">
            <Input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          </Field>
          <Field label="Điểm đến">
            <Input
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
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
