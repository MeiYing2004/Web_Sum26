import { createServer } from 'http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { REDIS_KEYS, sanitizeLocation, parseTravelDate, createRedisClient, normalizeRole, USER_ROLES } from '@bus/shared';

const GRAPHQL_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/graphql';
const MCP_API_KEY = process.env.MCP_API_KEY || 'bus-mcp-demo-key';
const MCP_ROLE = normalizeRole(process.env.MCP_ROLE || 'customer');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = createRedisClient(REDIS_URL);

function assertAuth() {
  const key = process.env.MCP_SESSION_KEY;
  if (key && key !== MCP_API_KEY) throw new Error('Unauthorized MCP session');
}

function assertAdmin() {
  assertAuth();
  if (MCP_ROLE !== USER_ROLES.ADMIN) throw new Error('Forbidden — admin role required');
}

async function graphql(query: string, variables?: Record<string, unknown>, token?: string) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

function validateSearchTrips(args: Record<string, unknown> | undefined) {
  if (!args?.origin || !args?.destination || !args?.travelDate) {
    throw new Error('search_trips requires origin, destination, travelDate');
  }
  return {
    origin: sanitizeLocation(args.origin),
    destination: sanitizeLocation(args.destination),
    travelDate: parseTravelDate(args.travelDate),
  };
}

const RESOURCES = [
  { uri: 'bus://policy/cancellation', name: 'Chính sách hủy vé', mimeType: 'text/plain' },
  { uri: 'bus://policy/checkin', name: 'Hướng dẫn check-in', mimeType: 'text/plain' },
  { uri: 'bus://routes/popular', name: 'Tuyến phổ biến', mimeType: 'application/json' },
  { uri: 'bus://system/health', name: 'Tình trạng service', mimeType: 'application/json' },
];

const RESOURCE_CONTENT: Record<string, string> = {
  'bus://policy/cancellation': 'Hủy trước 24 giờ: hoàn 80%. Hủy trong 24 giờ: không hoàn tiền.',
  'bus://policy/checkin': 'Có mặt trước 30 phút. Xuất trình mã booking hoặc QR code.',
};

const server = new Server({ name: 'bus-booking-mcp', version: '1.1.0' }, { capabilities: { tools: {}, resources: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => {
  assertAuth();
  return {
    tools: [
      { name: 'search_trips', description: 'Tìm chuyến', inputSchema: { type: 'object', properties: { origin: { type: 'string' }, destination: { type: 'string' }, travelDate: { type: 'string' } }, required: ['origin', 'destination', 'travelDate'] } },
      { name: 'get_trip_detail', description: 'Chi tiết chuyến', inputSchema: { type: 'object', properties: { tripId: { type: 'string' } }, required: ['tripId'] } },
      { name: 'get_booking_status', description: 'Tra cứu booking', inputSchema: { type: 'object', properties: { bookingCode: { type: 'string' }, email: { type: 'string' } }, required: ['bookingCode', 'email'] } },
      { name: 'get_revenue_summary', description: 'Doanh thu (ADMIN)', inputSchema: { type: 'object', properties: {} } },
      { name: 'get_popular_routes', description: 'Tuyến phổ biến', inputSchema: { type: 'object', properties: { limit: { type: 'number' } } } },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  assertAuth();
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_trips': {
      const v = validateSearchTrips(args as Record<string, unknown>);
      const data = await graphql(
        `query($o:String!,$d:String!,$t:String!){searchTrips(origin:$o,destination:$d,travelDate:$t){id routeName price bookable availabilityStatus availabilityLabel}}`,
        { o: v.origin, d: v.destination, t: v.travelDate }
      );
      return { content: [{ type: 'text', text: JSON.stringify(data.searchTrips, null, 2) }] };
    }
    case 'get_trip_detail': {
      if (!args?.tripId) throw new Error('tripId required');
      const data = await graphql(`query($id:ID!){tripDetail(tripId:$id){id routeName price}}`, { id: args.tripId });
      return { content: [{ type: 'text', text: JSON.stringify(data.tripDetail, null, 2) }] };
    }
    case 'get_booking_status': {
      if (!args?.bookingCode || !args?.email) throw new Error('bookingCode and email required');
      const data = await graphql(
        `query($c:String!,$e:String!){bookingByCode(bookingCode:$c,email:$e){bookingCode status}}`,
        { c: args.bookingCode, e: args.email }
      );
      return { content: [{ type: 'text', text: JSON.stringify(data.bookingByCode, null, 2) }] };
    }
    case 'get_revenue_summary': {
      assertAdmin();
      const data = await graphql(`{revenueSummary{totalRevenue}}`);
      return { content: [{ type: 'text', text: JSON.stringify(data.revenueSummary, null, 2) }] };
    }
    case 'get_popular_routes': {
      const limit = typeof args?.limit === 'number' ? args.limit : 10;
      const cached = await redis.get(REDIS_KEYS.mcpPopularRoutes());
      if (cached) return { content: [{ type: 'text', text: cached }] };
      const data = await graphql(`query($limit:Int){popularRoutes(limit:$limit){origin destination searchCount}}`, {
        limit,
      });
      const text = JSON.stringify(data.popularRoutes, null, 2);
      await redis.setex(REDIS_KEYS.mcpPopularRoutes(), 300, text);
      return { content: [{ type: 'text', text }] };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  assertAuth();
  return { resources: RESOURCES };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  assertAuth();
  const { uri } = request.params;

  if (uri === 'bus://routes/popular') {
    const cached = await redis.get(REDIS_KEYS.mcpPopularRoutes());
    if (cached) return { contents: [{ uri, mimeType: 'application/json', text: cached }] };
    const data = await graphql(`{popularRoutes(limit:10){origin destination searchCount}}`);
    const text = JSON.stringify(data.popularRoutes);
    await redis.setex(REDIS_KEYS.mcpPopularRoutes(), 300, text);
    return { contents: [{ uri, mimeType: 'application/json', text }] };
  }

  if (uri === 'bus://system/health') {
    const health = await fetch(GRAPHQL_URL.replace('/graphql', '/health')).then((r) => r.json());
    return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(health) }] };
  }

  return { contents: [{ uri, mimeType: 'text/plain', text: RESOURCE_CONTENT[uri] || 'Not found' }] };
});

async function main() {
  const healthPort = Number(process.env.PORT || process.env.HEALTH_PORT || 0);
  if (healthPort > 0) {
    createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            service: 'mcp-server',
            role: MCP_ROLE,
            transport: 'stdio',
            redis: REDIS_URL.replace(/:[^:@]+@/, ':***@'),
          })
        );
        return;
      }
      res.writeHead(404);
      res.end();
    }).listen(healthPort, () => {
      console.error(`MCP health endpoint on :${healthPort} (stdio transport active)`);
    });
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Bus Booking MCP v1.1 role=${MCP_ROLE}`);
}

main().catch(console.error);
