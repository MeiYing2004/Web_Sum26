export const BOOKING_SERVICE_FEE_RATE = 0.02;

export function computePricingFromTicketTotal(ticketTotal: number) {
  const serviceFee = Math.round(ticketTotal * BOOKING_SERVICE_FEE_RATE);
  return {
    ticketTotal,
    serviceFee,
    grandTotal: ticketTotal + serviceFee,
  };
}

export function computeBookingPricing(seatCount: number, pricePerSeat: number) {
  return computePricingFromTicketTotal(pricePerSeat * seatCount);
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}
