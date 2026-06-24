export const KAFKA_TOPICS = {
  SEARCH_EVENTS: 'search-events',
  BOOKING_EVENTS: 'booking-events',
  PAYMENT_EVENTS: 'payment-events',
} as const;

export const RABBITMQ_QUEUES = {
  BOOKING_PAID: 'booking.paid',
  TICKET_GENERATE: 'ticket.generate',
  EMAIL_SEND: 'email.send',
} as const;

export const REDIS_KEYS = {
  searchCache: (origin: string, dest: string, date: string) =>
    `search:${origin}:${dest}:${date}`,
  autocomplete: (keyword: string) => `autocomplete:${keyword.toLowerCase().trim()}`,
  rateLookup: (ip: string) => `rate:lookup:${ip}`,
  idempotency: (key: string) => `idempotency:${key}`,
  busLayout: (busId: string) => `bus:layout:${busId}`,
  tripBus: (tripId: string) => `trip:bus:${tripId}`,
  mcpPopularRoutes: () => 'mcp:resource:routes:popular',
  seatHold: (tripId: string, seatId: string) => `hold:${tripId}:${seatId}`,
  seatHoldLock: (tripId: string, seatId: string) => `lock:hold:${tripId}:${seatId}`,
  seatStatus: (tripId: string) => `seats:${tripId}`,
  holdToken: (token: string) => `holdtoken:${token}`,
} as const;

export const PAYMENT_STATUS = {
  INIT: 'INIT',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;

export const SEAT_HOLD_TTL_SECONDS = 300;

export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  TICKET_ISSUED: 'TICKET_ISSUED',
  CHECKED_IN: 'CHECKED_IN',
  COMPLETED: 'COMPLETED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  HELD: 'HELD',
  BOOKED: 'BOOKED',
  BLOCKED: 'BLOCKED',
} as const;

export type SeatStatus = (typeof SEAT_STATUS)[keyof typeof SEAT_STATUS];

export const TRIP_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DEPARTED: 'DEPARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TripStatus = (typeof TRIP_STATUS)[keyof typeof TRIP_STATUS];

export const VALID_TRIP_STATUSES = Object.values(TRIP_STATUS);

export function isValidTripStatus(status: string): status is TripStatus {
  return VALID_TRIP_STATUSES.includes(status as TripStatus);
}

export const VALID_BOOKING_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING_PAYMENT'],
  PENDING_PAYMENT: ['PAID', 'EXPIRED'],
  PAID: ['TICKET_ISSUED', 'CANCELLED'],
  TICKET_ISSUED: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['COMPLETED'],
};

export function canTransition(from: string, to: string): boolean {
  return VALID_BOOKING_TRANSITIONS[from]?.includes(to) ?? false;
}
