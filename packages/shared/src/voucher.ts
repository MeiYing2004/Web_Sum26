export type DiscountType = 'PERCENT' | 'FIXED';

export type VoucherRules = {
  code: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderValue: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number | null;
  usagePerUser: number | null;
  applicableRoutes: string[];
  applicableBusCompanies: string[];
  applicableTripTypes: string[];
  isActive: boolean;
  usedCount: number;
  /** CAPPY15 — chỉ khách chưa có đơn thanh toán trước đó */
  requiresNewUser?: boolean;
};

export type BookingVoucherContext = {
  ticketSubtotal: number;
  serviceFee: number;
  routeName: string;
  origin: string;
  destination: string;
  operatorName: string;
  tripType: string;
  departureTime: string;
  userId?: string | null;
  guestEmail?: string;
  userUsageCount: number;
  userPaidBookingCount: number;
};

export type VoucherValidationResult = {
  valid: boolean;
  message: string;
  discountAmount: number;
  ticketSubtotal: number;
  serviceFee: number;
  finalAmount: number;
  voucherCode?: string;
  voucherName?: string;
};

export const VOUCHER_ERROR = {
  NOT_FOUND: 'Voucher không tồn tại.',
  INACTIVE: 'Voucher không còn hoạt động.',
  NOT_STARTED: 'Voucher chưa đến thời gian sử dụng.',
  EXPIRED: 'Voucher đã hết hạn.',
  USAGE_LIMIT: 'Voucher đã hết lượt.',
  USER_LIMIT: 'Bạn đã sử dụng voucher này.',
  MIN_ORDER: 'Đơn hàng chưa đạt giá trị tối thiểu.',
  ROUTE: 'Voucher không áp dụng cho chuyến này.',
  OPERATOR: 'Voucher không áp dụng cho nhà xe này.',
  TRIP_TYPE: 'Voucher không áp dụng cho loại chuyến này.',
  NEW_USER: 'Voucher chỉ dành cho khách hàng mới.',
  WEEKEND: 'Voucher chỉ áp dụng cho chuyến cuối tuần.',
} as const;

function parseJsonList(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

export function voucherListsFromDb(row: {
  applicableRoutes?: string | null;
  applicableBusCompanies?: string | null;
  applicableTripTypes?: string | null;
}): Pick<VoucherRules, 'applicableRoutes' | 'applicableBusCompanies' | 'applicableTripTypes'> {
  return {
    applicableRoutes: parseJsonList(row.applicableRoutes),
    applicableBusCompanies: parseJsonList(row.applicableBusCompanies),
    applicableTripTypes: parseJsonList(row.applicableTripTypes),
  };
}

export function calculateVoucherDiscount(
  voucher: Pick<VoucherRules, 'discountType' | 'discountValue' | 'maxDiscount'>,
  ticketSubtotal: number
): number {
  const ticket = Math.round(ticketSubtotal);
  if (ticket <= 0) return 0;

  let discount =
    voucher.discountType === 'FIXED'
      ? Math.round(voucher.discountValue)
      : Math.round((ticket * voucher.discountValue) / 100);

  if (voucher.maxDiscount != null && voucher.maxDiscount > 0) {
    discount = Math.min(discount, Math.round(voucher.maxDiscount));
  }

  return Math.min(discount, ticket);
}

function isWeekendDeparture(departureTime: string): boolean {
  const d = new Date(departureTime);
  if (Number.isNaN(d.getTime())) return false;
  const day = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short' }).format(d);
  return day === 'Fri' || day === 'Sat' || day === 'Sun';
}

function routeMatches(rules: string[], routeName: string, origin: string, destination: string): boolean {
  if (rules.length === 0) return true;
  const haystack = `${routeName} ${origin} ${destination}`.toLowerCase();
  return rules.some((r) => haystack.includes(r.toLowerCase()));
}

export function validateVoucherRules(
  voucher: VoucherRules,
  ctx: BookingVoucherContext,
  now = new Date()
): VoucherValidationResult {
  const ticketSubtotal = Math.round(ctx.ticketSubtotal);
  const serviceFee = Math.round(ctx.serviceFee);
  const orderBeforeDiscount = ticketSubtotal + serviceFee;

  const fail = (message: string): VoucherValidationResult => ({
    valid: false,
    message,
    discountAmount: 0,
    ticketSubtotal,
    serviceFee,
    finalAmount: orderBeforeDiscount,
  });

  if (!voucher.isActive) return fail(VOUCHER_ERROR.INACTIVE);
  if (now < voucher.startDate) return fail(VOUCHER_ERROR.NOT_STARTED);
  if (now > voucher.endDate) return fail(VOUCHER_ERROR.EXPIRED);
  if (voucher.usageLimit != null && voucher.usedCount >= voucher.usageLimit) {
    return fail(VOUCHER_ERROR.USAGE_LIMIT);
  }
  if (voucher.usagePerUser != null && ctx.userUsageCount >= voucher.usagePerUser) {
    return fail(VOUCHER_ERROR.USER_LIMIT);
  }
  if (orderBeforeDiscount < voucher.minOrderValue) {
    return fail(VOUCHER_ERROR.MIN_ORDER);
  }
  if (!routeMatches(voucher.applicableRoutes, ctx.routeName, ctx.origin, ctx.destination)) {
    return fail(VOUCHER_ERROR.ROUTE);
  }
  if (
    voucher.applicableBusCompanies.length > 0 &&
    !voucher.applicableBusCompanies.some((op) =>
      ctx.operatorName.toLowerCase().includes(op.toLowerCase())
    )
  ) {
    return fail(VOUCHER_ERROR.OPERATOR);
  }
  if (
    voucher.applicableTripTypes.length > 0 &&
    !voucher.applicableTripTypes.includes(ctx.tripType)
  ) {
    return fail(VOUCHER_ERROR.TRIP_TYPE);
  }
  if (voucher.requiresNewUser && ctx.userPaidBookingCount > 0) {
    return fail(VOUCHER_ERROR.NEW_USER);
  }
  if (voucher.code === 'WEEKEND' && !isWeekendDeparture(ctx.departureTime)) {
    return fail(VOUCHER_ERROR.WEEKEND);
  }

  const discountAmount = calculateVoucherDiscount(voucher, ticketSubtotal);
  const finalAmount = Math.max(0, ticketSubtotal - discountAmount + serviceFee);

  return {
    valid: true,
    message: 'Áp dụng voucher thành công',
    discountAmount,
    ticketSubtotal,
    serviceFee,
    finalAmount,
    voucherCode: voucher.code,
    voucherName: voucher.name,
  };
}

export function formatDiscountLabel(voucher: Pick<VoucherRules, 'discountType' | 'discountValue'>): string {
  if (voucher.discountType === 'FIXED') {
    return `Giảm ${Math.round(voucher.discountValue).toLocaleString('vi-VN')}đ`;
  }
  return `Giảm ${voucher.discountValue}%`;
}
