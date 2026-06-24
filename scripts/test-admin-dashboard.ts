const GRAPHQL = process.env.GRAPHQL_URL || 'http://localhost:4000/graphql';

async function main() {
  const loginRes = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'mutation { login(email: "admin@bus.demo", password: "admin123") { token } }',
    }),
  }).then((r) => r.json());

  const token = loginRes.data?.login?.token;
  if (!token) {
    console.error('Login failed:', loginRes);
    process.exit(1);
  }

  const dashRes = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: `{ adminDashboard { stats { totalRevenue ticketsSold customers activeTrips } recentOrders { ticketCode } } }`,
    }),
  }).then((r) => r.json());

  console.log(JSON.stringify(dashRes, null, 2));
  if (dashRes.errors?.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
