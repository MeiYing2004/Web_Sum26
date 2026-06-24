import { Receipt } from 'lucide-react';
import {
  type AdminOrderRow,
  formatVnd,
  statusLabel,
  statusTone,
} from '@/lib/admin-dashboard';
import { formatAdminDateTime } from '@/lib/admin-datetime';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import EmptyState from './EmptyState';

type Props = {
  orders: AdminOrderRow[];
};

export default function OrdersTable({ orders }: Props) {
  return (
    <Card variant="glass" padding="md">
      <CardHeader
        title="Đơn hàng gần đây"
        description="Danh sách vé mới nhất từ hệ thống"
        action={<Badge variant="outline">{orders.length} đơn</Badge>}
      />

      <div className="mt-4">
        {!orders.length ? (
          <EmptyState
            icon={Receipt}
            title="Chưa có đơn hàng"
            description="Các đơn đặt vé sẽ xuất hiện tại đây sau khi khách hoàn tất thanh toán."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Mã vé</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Tuyến xe</TableHead>
                  <TableHead>Ghế</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.ticketCode}>
                    <TableCell>
                      <p className="font-semibold">{o.ticketCode}</p>
                      <p className="text-micro text-ink-muted">{o.bookingCode}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{o.customerName}</p>
                      <p className="text-micro text-ink-muted">{formatAdminDateTime(o.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{o.routeName}</p>
                      <p className="text-micro text-ink-muted">
                        {o.origin} → {o.destination}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold text-brand">{o.seatId}</TableCell>
                    <TableCell className="font-semibold">{formatVnd(o.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-micro font-semibold ring-1 ring-inset ${statusTone(o.status)}`}>
                        {statusLabel(o.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  );
}
