import { aggregateHealth } from '@bus/shared';

const SERVICE_HEALTH_URLS: Array<{ name: string; url: string }> = [
  { name: 'api-gateway', url: process.env.SELF_HEALTH_URL || 'http://127.0.0.1:4000/health/self' },
  { name: 'auth-service', url: process.env.AUTH_HEALTH_URL || 'http://auth-service:9101/health' },
  { name: 'trip-service', url: process.env.TRIP_HEALTH_URL || 'http://trip-service:9103/health' },
  { name: 'seat-inventory-service', url: process.env.SEAT_HEALTH_URL || 'http://seat-inventory-service:9104/health' },
  { name: 'booking-service', url: process.env.BOOKING_HEALTH_URL || 'http://booking-service:9105/health' },
  { name: 'payment-service', url: process.env.PAYMENT_HEALTH_URL || 'http://payment-service:9106/health' },
  { name: 'analytics-service', url: process.env.ANALYTICS_HEALTH_URL || 'http://analytics-service:9109/health' },
  { name: 'ticket-service', url: process.env.TICKET_HEALTH_URL || 'http://ticket-service:9107/health' },
  { name: 'notification-service', url: process.env.NOTIFICATION_HEALTH_URL || 'http://notification-service:9108/health' },
  { name: 'ai-service', url: process.env.AI_HEALTH_URL || 'http://ai-service:50060/health' },
];

export async function getAggregatedHealth() {
  return aggregateHealth(SERVICE_HEALTH_URLS);
}
