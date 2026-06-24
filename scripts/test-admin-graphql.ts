/**
 * Phase 2 — GraphQL admin CRUD + RBAC test.
 * Requires: api-gateway, trip-service, auth-service, postgres, redis.
 */
const GRAPHQL = process.env.GRAPHQL_URL || 'http://localhost:4000/graphql';

async function gql(query: string, token?: string) {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query }),
  }).then((r) => r.json());
  return res;
}

async function login(email: string, password: string) {
  const res = await gql(`mutation { login(email: "${email}", password: "${password}") { token role } }`);
  if (res.errors?.length) throw new Error(`Login failed: ${res.errors[0].message}`);
  return res.data.login.token as string;
}

async function main() {
  console.log('── Login admin ──');
  const adminToken = await login('admin@bus.demo', 'admin123');

  console.log('── adminRoutes (staff read) ──');
  const routesRes = await gql(
    `{ adminRoutes(page: 1, pageSize: 5) { total routes { id name origin destination } } }`,
    adminToken
  );
  if (routesRes.errors?.length) throw new Error(routesRes.errors[0].message);
  if (routesRes.data.adminRoutes.total < 1) throw new Error('Expected routes');

  console.log('── createRoute (admin CRUD) ──');
  const createRes = await gql(
    `mutation { createRoute(name: "GQL Test Route", origin: "TP.HCM", destination: "GQL City") { id name } }`,
    adminToken
  );
  if (createRes.errors?.length) throw new Error(createRes.errors[0].message);
  const routeId = createRes.data.createRoute.id;
  console.log(`  routeId=${routeId}`);

  console.log('── adminBuses ──');
  const busesRes = await gql(`{ adminBuses(page: 1, pageSize: 3) { buses { id plate } } }`, adminToken);
  const busId = busesRes.data.adminBuses.buses[0]?.id;
  if (!busId) throw new Error('No buses');

  console.log('── adminOperators ──');
  const opsRes = await gql(`{ adminOperators { id name } }`, adminToken);
  const opId = opsRes.data.adminOperators[0]?.id;
  if (!opId) throw new Error('No operators');

  console.log('── createTrip ──');
  const dep = new Date();
  dep.setDate(dep.getDate() + 45);
  dep.setUTCHours(3, 0, 0, 0);
  const arr = new Date(dep);
  arr.setUTCHours(9, 0, 0, 0);
  const tripRes = await gql(
    `mutation {
      createTrip(
        routeId: "${routeId}"
        busId: "${busId}"
        operatorId: "${opId}"
        departureTime: "${dep.toISOString()}"
        arrivalTime: "${arr.toISOString()}"
        price: 250000
        pickupPoint: "Bến test"
        dropoffPoint: "Bến đích"
        status: INACTIVE
      ) { id status }
    }`,
    adminToken
  );
  if (tripRes.errors?.length) throw new Error(tripRes.errors[0].message);
  const tripId = tripRes.data.createTrip.id;

  console.log('── updateTrip status DEPARTED ──');
  const updRes = await gql(
    `mutation { updateTrip(id: "${tripId}", status: DEPARTED) { status } }`,
    adminToken
  );
  if (updRes.data.updateTrip.status !== 'DEPARTED') throw new Error('Status update failed');

  console.log('── RBAC: customer cannot createRoute ──');
  let customerToken: string | null = null;
  try {
    customerToken = await login('customer@bus.demo', 'customer123');
  } catch {
    console.log('  (skip — no customer demo account)');
  }
  if (customerToken) {
    const forbidden = await gql(
      `mutation { createRoute(name: "X", origin: "A", destination: "B") { id } }`,
      customerToken
    );
    if (!forbidden.errors?.length) throw new Error('Customer should be forbidden');
    console.log('  forbidden OK');
  }

  console.log('── Cleanup ──');
  await gql(`mutation { deleteTrip(id: "${tripId}") { success } }`, adminToken);
  await gql(`mutation { deleteRoute(id: "${routeId}") { success } }`, adminToken);

  console.log('\n✅ Phase 2 GraphQL admin CRUD tests passed');
}

main().catch((e) => {
  console.error('❌ Test failed:', e.message || e);
  process.exit(1);
});
