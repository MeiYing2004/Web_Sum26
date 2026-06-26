'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bus,
  Calendar,
  ListOrdered,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';
import { isAdmin } from '@/lib/roles';
import {
  type AdminBus,
  type AdminOperator,
  type AdminRoute,
  type AdminTrip,
  formatPrice,
  formatAdminDateTime,
  PAGE_SIZE,
  TRIP_STATUS_LABEL,
  TRIP_STATUS_OPTIONS,
} from '@/lib/admin-crud';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { TripBookingsModal } from '@/components/admin/TripBookingsModal';
import { TripSeatModal } from '@/components/admin/TripSeatModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

function toLocalInput(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function fromLocalInput(v: string) {
  return new Date(v).toISOString();
}

const emptyForm = {
  routeId: '',
  busId: '',
  operatorId: '',
  departureTime: '',
  arrivalTime: '',
  price: 150000,
  pickupPoint: '',
  dropoffPoint: '',
  cancellationPolicy: 'Hủy trước 24h được hoàn 80%',
  status: 'ACTIVE',
};

export default function AdminTripsPage() {
  const { getToken, role } = useAuth();
  const canEdit = isAdmin(role);
  const [rows, setRows] = useState<AdminTrip[]>([]);
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [buses, setBuses] = useState<AdminBus[]>([]);
  const [operators, setOperators] = useState<AdminOperator[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTrip | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [bookingsTrip, setBookingsTrip] = useState<AdminTrip | null>(null);
  const [seatsTrip, setSeatsTrip] = useState<AdminTrip | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadMeta = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const [r, b, o] = await Promise.all([
      gql<{ adminRoutes: { routes: AdminRoute[] } }>(
        `{ adminRoutes(page:1,pageSize:100){routes{id name origin destination}}}`,
        undefined,
        { token }
      ),
      gql<{ adminBuses: { buses: AdminBus[] } }>(
        `{ adminBuses(page:1,pageSize:100){buses{id plate busType operatorId}}}`,
        undefined,
        { token }
      ),
      gql<{ adminOperators: AdminOperator[] }>(`{ adminOperators { id name } }`, undefined, { token }),
    ]);
    setRoutes(r.adminRoutes.routes);
    setBuses(b.adminBuses.buses);
    setOperators(o.adminOperators);
  }, [getToken]);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const parts = [`page: ${page}`, `pageSize: ${PAGE_SIZE}`];
      if (debouncedSearch) parts.push(`search: "${debouncedSearch.replace(/"/g, '')}"`);
      if (statusFilter) parts.push(`status: ${statusFilter}`);
      if (routeFilter) parts.push(`routeId: "${routeFilter}"`);
      const data = await gql<{ adminTrips: { trips: AdminTrip[]; total: number } }>(
        `{ adminTrips(${parts.join(', ')}) { total trips { id routeId routeName origin destination busId busPlate busType operatorId operatorName departureTime arrivalTime price status displayStatus displayStatusLabel pickupPoint dropoffPoint cancellationPolicy } } }`,
        undefined,
        { token }
      );
      setRows(data.adminTrips.trips);
      setTotal(data.adminTrips.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Tải chuyến thất bại');
    } finally {
      setLoading(false);
    }
  }, [getToken, page, debouncedSearch, statusFilter, routeFilter]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      void load();
    }, 60_000);
    return () => clearInterval(timer);
  }, [load]);

  function openCreate() {
    const route = routes[0];
    const bus = buses[0];
    const dep = new Date();
    dep.setDate(dep.getDate() + 7);
    dep.setHours(8, 0, 0, 0);
    const arr = new Date(dep);
    arr.setHours(14, 0, 0, 0);
    setEditing(null);
    setForm({
      ...emptyForm,
      routeId: route?.id || '',
      busId: bus?.id || '',
      operatorId: bus?.operatorId || operators[0]?.id || '',
      departureTime: toLocalInput(dep.toISOString()),
      arrivalTime: toLocalInput(arr.toISOString()),
      pickupPoint: route ? `Bến xe ${route.origin}` : '',
      dropoffPoint: route ? `Bến xe ${route.destination}` : '',
    });
    setModalOpen(true);
  }

  function openEdit(row: AdminTrip) {
    setEditing(row);
    setForm({
      routeId: row.routeId,
      busId: row.busId,
      operatorId: row.operatorId,
      departureTime: toLocalInput(row.departureTime),
      arrivalTime: toLocalInput(row.arrivalTime),
      price: row.price,
      pickupPoint: row.pickupPoint,
      dropoffPoint: row.dropoffPoint,
      cancellationPolicy: row.cancellationPolicy,
      status: row.status,
    });
    setModalOpen(true);
  }

  async function save() {
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const dep = fromLocalInput(form.departureTime);
      const arr = fromLocalInput(form.arrivalTime);
      if (editing) {
        await gql(
          `mutation($id:ID!,$routeId:ID,$busId:ID,$operatorId:ID,$departureTime:String,$arrivalTime:String,$price:Float,$pickupPoint:String,$dropoffPoint:String,$cancellationPolicy:String,$status:TripStatus){
            updateTrip(id:$id,routeId:$routeId,busId:$busId,operatorId:$operatorId,departureTime:$departureTime,arrivalTime:$arrivalTime,price:$price,pickupPoint:$pickupPoint,dropoffPoint:$dropoffPoint,cancellationPolicy:$cancellationPolicy,status:$status){id}
          }`,
          {
            id: editing.id,
            routeId: form.routeId,
            busId: form.busId,
            operatorId: form.operatorId,
            departureTime: dep,
            arrivalTime: arr,
            price: form.price,
            pickupPoint: form.pickupPoint,
            dropoffPoint: form.dropoffPoint,
            cancellationPolicy: form.cancellationPolicy,
            status: form.status,
          },
          { token }
        );
        toast.success('Đã cập nhật chuyến');
      } else {
        await gql(
          `mutation($routeId:ID!,$busId:ID!,$operatorId:ID!,$departureTime:String!,$arrivalTime:String!,$price:Float!,$pickupPoint:String!,$dropoffPoint:String!,$status:TripStatus){
            createTrip(routeId:$routeId,busId:$busId,operatorId:$operatorId,departureTime:$departureTime,arrivalTime:$arrivalTime,price:$price,pickupPoint:$pickupPoint,dropoffPoint:$dropoffPoint,status:$status){id}
          }`,
          {
            routeId: form.routeId,
            busId: form.busId,
            operatorId: form.operatorId,
            departureTime: dep,
            arrivalTime: arr,
            price: form.price,
            pickupPoint: form.pickupPoint,
            dropoffPoint: form.dropoffPoint,
            status: form.status,
          },
          { token }
        );
        toast.success('Đã tạo chuyến');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(row: AdminTrip, status: string) {
    const token = getToken();
    if (!token) return;
    try {
      await gql(
        `mutation($id:ID!,$status:TripStatus){updateTrip(id:$id,status:$status){id status}}`,
        { id: row.id, status },
        { token }
      );
      toast.success(`Đã đổi trạng thái → ${TRIP_STATUS_LABEL[status] || status}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
    }
  }

  async function remove(row: AdminTrip) {
    if (!confirm(`Xóa chuyến ${row.routeName} (${formatAdminDateTime(row.departureTime)})?`)) return;
    const token = getToken();
    if (!token) return;
    try {
      await gql(`mutation($id:ID!){deleteTrip(id:$id){success}}`, { id: row.id }, { token });
      toast.success('Đã xóa chuyến');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Xóa thất bại');
    }
  }

  function statusBadge(row: AdminTrip) {
    const label = row.displayStatusLabel || TRIP_STATUS_LABEL[row.status] || row.status;
    const status = row.displayStatus || row.status;
    const variant =
      status === 'SELLING' || status === 'ACTIVE'
        ? 'success'
        : status === 'UPCOMING'
          ? 'warning'
          : status === 'INACTIVE'
            ? 'warning'
            : status === 'CANCELLED'
              ? 'danger'
              : 'default';
    return <Badge variant={variant}>{label}</Badge>;
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
        searchPlaceholder="Tìm tuyến, biển số, nhà xe..."
        emptyTitle="Chưa có chuyến"
        rowKey={(r) => r.id}
        toolbarExtra={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={routeFilter}
              onChange={(e) => {
                setRouteFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 min-w-[140px]"
            >
              <option value="">Tất cả tuyến</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 min-w-[140px]"
            >
              {TRIP_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            {canEdit ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Thêm chuyến
              </Button>
            ) : null}
          </div>
        }
        columns={[
          {
            key: 'route',
            header: 'Tuyến / Xe',
            render: (r) => (
              <div>
                <p className="font-medium">{r.routeName}</p>
                <p className="text-xs text-slate-500">
                  {r.busPlate} · {r.operatorName}
                </p>
              </div>
            ),
          },
          {
            key: 'time',
            header: 'Giờ đi → đến',
            render: (r) => (
              <div className="text-sm">
                <p>{formatAdminDateTime(r.departureTime)}</p>
                <p className="text-xs text-slate-500">→ {formatAdminDateTime(r.arrivalTime)}</p>
              </div>
            ),
          },
          { key: 'price', header: 'Giá vé', render: (r) => formatPrice(r.price) },
          { key: 'status', header: 'Trạng thái', render: (r) => statusBadge(r) },
          {
            key: 'ops',
            header: 'Thao tác',
            className: 'min-w-[200px]',
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                <Button variant="ghost" size="sm" onClick={() => setBookingsTrip(r)} title="Booking">
                  <Users className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSeatsTrip(r)} title="Ghế">
                  <Bus className="h-3.5 w-3.5" />
                </Button>
                {canEdit && (
                  <>
                    {r.status !== 'ACTIVE' && (
                      <Button variant="ghost" size="sm" onClick={() => setStatus(r, 'ACTIVE')} title="Kích hoạt">
                        <Calendar className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    )}
                    {r.status === 'ACTIVE' && (
                      <Button variant="ghost" size="sm" onClick={() => setStatus(r, 'INACTIVE')} title="Khóa">
                        <ListOrdered className="h-3.5 w-3.5 text-amber-600" />
                      </Button>
                    )}
                    {(r.status === 'ACTIVE' || r.status === 'INACTIVE') && (
                      <Button variant="ghost" size="sm" onClick={() => setStatus(r, 'CANCELLED')} title="Hủy chuyến">
                        <span className="text-[10px] font-bold text-red-600">X</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Sửa">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r)} aria-label="Xóa">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa chuyến' : 'Thêm chuyến mới'}
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tuyến">
            <Select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Xe">
            <Select value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })}>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.plate} — {b.busType}
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
          <Field label="Trạng thái">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {TRIP_STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Giờ đi">
            <Input
              type="datetime-local"
              value={form.departureTime}
              onChange={(e) => setForm({ ...form, departureTime: e.target.value })}
            />
          </Field>
          <Field label="Giờ đến">
            <Input
              type="datetime-local"
              value={form.arrivalTime}
              onChange={(e) => setForm({ ...form, arrivalTime: e.target.value })}
            />
          </Field>
          <Field label="Giá vé (VND)">
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </Field>
          <Field label="Điểm đón">
            <Input value={form.pickupPoint} onChange={(e) => setForm({ ...form, pickupPoint: e.target.value })} />
          </Field>
          <Field label="Điểm trả" className="sm:col-span-2">
            <Input value={form.dropoffPoint} onChange={(e) => setForm({ ...form, dropoffPoint: e.target.value })} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Hủy
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </Modal>

      <TripBookingsModal trip={bookingsTrip} open={!!bookingsTrip} onClose={() => setBookingsTrip(null)} />
      <TripSeatModal trip={seatsTrip} open={!!seatsTrip} onClose={() => setSeatsTrip(null)} />
    </div>
  );
}
