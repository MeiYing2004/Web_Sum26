/**
 * user-service — deprecated shell.
 * All accounts live in auth-service `users` table (bus_auth).
 * Saved passengers: auth-service GetSavedPassengers gRPC.
 */
import { bootstrapServiceHealth } from '@bus/shared';

if (require.main === module) {
  bootstrapServiceHealth({
    service: 'user-service',
    defaultPort: 9102,
    checkDb: async () => true,
  });
  console.log('user-service: accounts consolidated into auth-service `users` table');
}
