/**
 * Integration test for Module 4 admin CRUD (trip-service gRPC).
 * Requires: postgres, redis, trip-service running.
 *
 * Usage: npx tsx scripts/test-admin-crud.ts
 */
import * as grpc from '@grpc/grpc-js';
import { TripService } from '@bus/proto';

const TRIP_URL = process.env.TRIP_SERVICE_URL || 'localhost:50053';

function promisify<T>(fn: (cb: (err: Error | null, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => fn((err, res) => (err ? reject(err) : resolve(res))));
}

async function main() {
  const client = new TripService(TRIP_URL, grpc.credentials.createInsecure());

  console.log('── GetRoutes ──');
  const routesRes = await promisify<{ routes: Array<{ id: string; name: string }>; total: number }>((cb) =>
    client.GetRoutes({ page: 1, page_size: 5 }, cb)
  );
  console.log(`  total=${routesRes.total}, first=${routesRes.routes[0]?.name ?? 'none'}`);
  if (routesRes.total < 1) throw new Error('Expected at least 1 route from seed');

  console.log('── CreateRoute ──');
  const created = await promisify<{ id: string; name: string; origin: string; destination: string }>((cb) =>
    client.CreateRoute(
      { name: 'Test Route CRUD', origin: 'TP.HCM', destination: 'Test City' },
      cb
    )
  );
  console.log(`  created id=${created.id}`);

  console.log('── GetRouteById ──');
  const routeById = await promisify<{ id: string; name: string }>((cb) =>
    client.GetRouteById({ route_id: created.id }, cb)
  );
  if (routeById.id !== created.id) throw new Error('GetRouteById mismatch');

  console.log('── UpdateRoute ──');
  const updated = await promisify<{ name: string }>((cb) =>
    client.UpdateRoute(
      { route_id: created.id, name: 'Test Route Updated', origin: 'TP.HCM', destination: 'Test City' },
      cb
    )
  );
  if (updated.name !== 'Test Route Updated') throw new Error('UpdateRoute failed');

  console.log('── CreateStop ──');
  const stop = await promisify<{ id: string; name: string }>((cb) =>
    client.CreateStop({ route_id: created.id, name: 'Điểm dừng test', order: 3 }, cb)
  );
  console.log(`  stop id=${stop.id}`);

  console.log('── GetStops ──');
  const stopsRes = await promisify<{ stops: unknown[]; total: number }>((cb) =>
    client.GetStops({ route_id: created.id }, cb)
  );
  if (stopsRes.total < 3) throw new Error('Expected 3 stops');

  console.log('── GetBuses ──');
  const busesRes = await promisify<{ buses: Array<{ id: string; plate: string }>; total: number }>((cb) =>
    client.GetBuses({ page: 1, page_size: 5 }, cb)
  );
  if (busesRes.total < 1) throw new Error('Expected at least 1 bus');
  const busId = busesRes.buses[0].id;

  console.log('── GetOperators ──');
  const opsRes = await promisify<{ operators: Array<{ id: string }> }>((cb) =>
    client.GetOperators({}, cb)
  );
  if (opsRes.operators.length < 1) throw new Error('Expected operators');

  console.log('── CreateTrip ──');
  const dep = new Date();
  dep.setDate(dep.getDate() + 30);
  dep.setHours(10, 0, 0, 0);
  const arr = new Date(dep);
  arr.setHours(dep.getHours() + 6);
  const trip = await promisify<{ id: string; status: string }>((cb) =>
    client.CreateTrip(
      {
        route_id: created.id,
        bus_id: busId,
        operator_id: opsRes.operators[0].id,
        departure_time: dep.toISOString(),
        arrival_time: arr.toISOString(),
        price: 199000,
        pickup_point: 'Bến test',
        dropoff_point: 'Bến đích test',
        status: 'INACTIVE',
      },
      cb
    )
  );
  console.log(`  trip id=${trip.id} status=${trip.status}`);
  if (trip.status !== 'INACTIVE') throw new Error('Trip status should be INACTIVE');

  console.log('── UpdateTrip (ACTIVE → DEPARTED) ──');
  const tripActive = await promisify<{ status: string }>((cb) =>
    client.UpdateTrip({ trip_id: trip.id, status: 'ACTIVE' }, cb)
  );
  const tripDeparted = await promisify<{ status: string }>((cb) =>
    client.UpdateTrip({ trip_id: trip.id, status: 'DEPARTED' }, cb)
  );
  if (tripDeparted.status !== 'DEPARTED') throw new Error('DEPARTED status failed');

  console.log('── GetTripsAdmin ──');
  const tripsAdmin = await promisify<{ trips: unknown[]; total: number }>((cb) =>
    client.GetTripsAdmin({ route_id: created.id, status: 'DEPARTED' }, cb)
  );
  if (tripsAdmin.total < 1) throw new Error('GetTripsAdmin should find trip');

  console.log('── DeleteTrip ──');
  await promisify<{ success: boolean }>((cb) => client.DeleteTrip({ trip_id: trip.id }, cb));

  console.log('── DeleteStop ──');
  await promisify<{ success: boolean }>((cb) => client.DeleteStop({ stop_id: stop.id }, cb));

  console.log('── DeleteRoute ──');
  await promisify<{ success: boolean }>((cb) => client.DeleteRoute({ route_id: created.id }, cb));

  console.log('\n✅ Phase 1 admin CRUD gRPC tests passed');
}

main().catch((e) => {
  console.error('❌ Test failed:', e.message || e);
  process.exit(1);
});
