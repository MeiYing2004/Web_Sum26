/** Browser-safe mirror of @bus/shared/booking-pricing — do not import @bus/shared in client bundles */
export const BOOKING_SERVICE_FEE_RATE = 0.02;

export function computePricingFromTicketTotal(ticketTotal: number) {
  const ticket = Math.round(ticketTotal);
  const serviceFee = Math.round(ticket * BOOKING_SERVICE_FEE_RATE);
  return {
    ticketTotal: ticket,
    serviceFee,
    grandTotal: ticket + serviceFee,
  };
}

export function computeBookingPricing(seatCount: number, pricePerSeat: number) {
  return computePricingFromTicketTotal(Math.round(pricePerSeat) * seatCount);
}

export function splitGrandTotal(grandTotal: number) {
  const grand = Math.round(grandTotal);
  const ticketTotal = Math.round(grand / (1 + BOOKING_SERVICE_FEE_RATE));
  const serviceFee = grand - ticketTotal;
  return { ticketTotal, serviceFee, grandTotal: grand };
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}
