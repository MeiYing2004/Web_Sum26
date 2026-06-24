import { formatAdminDate } from './admin-datetime';

export type DailyRevenue = {
  date: string;
  revenue: number;
  bookingCount: number;
};

export type AdminRankItem = {
  name: string;
  subtitle: string;
  count: number;
  revenue: number;
};

export type AdminOrderRow = {
  ticketCode: string;
  bookingCode: string;
  customerName: string;
  routeName: string;
  origin: string;
  destination: string;
  seatId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
};

export type AdminDashboard = {
  stats: {
    totalRevenue: number;
    ticketsSold: number;
    customers: number;
    activeTrips: number;
    conversionRate: number;
    totalSearches: number;
    totalBookings: number;
  };
  revenue7Days: DailyRevenue[];
  revenue30Days: DailyRevenue[];
  topRoutes: AdminRankItem[];
  topOperators: AdminRankItem[];
  topCustomers: AdminRankItem[];
  recentOrders: AdminOrderRow[];
};

export const ADMIN_DASHBOARD_QUERY = `
  query AdminDashboard {
    adminDashboard {
      stats {
        totalRevenue
        ticketsSold
        customers
        activeTrips
        conversionRate
        totalSearches
        totalBookings
      }
      revenue7Days { date revenue bookingCount }
      revenue30Days { date revenue bookingCount }
      topRoutes { name subtitle count revenue }
      topOperators { name subtitle count revenue }
      topCustomers { name subtitle count revenue }
      recentOrders {
        ticketCode
        bookingCode
        customerName
        routeName
        origin
        destination
        seatId
        totalAmount
        status
        createdAt
      }
    }
  }
`;

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/** Chart axis labels — DD/MM/YYYY in Vietnam calendar */
export function formatShortDate(iso: string): string {
  return formatAdminDate(iso);
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Nháp',
    PENDING_PAYMENT: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    TICKET_ISSUED: 'Đã xuất vé',
    CHECKED_IN: 'Đã check-in',
    COMPLETED: 'Hoàn tất',
    EXPIRED: 'Hết hạn',
    CANCELLED: 'Đã hủy',
  };
  return map[status] || status;
}

export function statusTone(status: string): string {
  switch (status) {
    case 'CHECKED_IN':
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'TICKET_ISSUED':
    case 'PAID':
      return 'bg-indigo-50 text-indigo-700 ring-indigo-200';
    case 'PENDING_PAYMENT':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 ring-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 ring-slate-200';
  }
}
