export const PAGE_SIZE = 10;

export type AdminRoute = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  stops: Array<{ id: string; name: string; order: number }>;
  createdAt: string;
};

export type AdminStop = {
  id: string;
  routeId: string;
  routeName: string;
  name: string;
  order: number;
};

export type AdminBus = {
  id: string;
  plate: string;
  busType: string;
  seatCount: number;
  layoutType: string;
  seatLayoutJson: string;
  operatorId: string;
  operatorName: string;
};

export type AdminTrip = {
  id: string;
  routeId: string;
  routeName: string;
  origin: string;
  destination: string;
  busId: string;
  busPlate: string;
  busType: string;
  operatorId: string;
  operatorName: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  status: string;
  displayStatus?: string;
  displayStatusLabel?: string;
  pickupPoint: string;
  dropoffPoint: string;
  cancellationPolicy: string;
};

export type AdminOperator = { id: string; name: string };

export const TRIP_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Tạm khóa' },
  { value: 'DEPARTED', label: 'Đã khởi hành' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
] as const;

export const TRIP_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Đang mở bán',
  INACTIVE: 'Tạm khóa',
  DEPARTED: 'Đã khởi hành',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  UPCOMING: 'Sắp khởi hành',
  SELLING: 'Đang mở bán',
};

export function formatPrice(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export { formatAdminDate, formatAdminDateTime } from './admin-datetime';
