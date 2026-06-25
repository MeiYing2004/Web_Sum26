import { existsSync } from 'fs';
import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';

for (const envPath of [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
]) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath });
    break;
  }
}

import express from 'express';
import { generateText, tool, type LanguageModelV1 } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {
  requestIdMiddleware,
  buildHealthResponse,
  todayVN,
  parseTravelDate,
  resolveLocationAlias,
  CANONICAL_LOCATIONS,
  normalizeVietnamese,
} from '@bus/shared';

const PORT = process.env.PORT || 8765;
const GRAPHQL_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/graphql';

const POLICIES = {
  cancellation: `Theo chính sách hủy vé nội bộ: Hủy trước 24 giờ được hoàn 80% giá vé. Hủy trong vòng 24 giờ không được hoàn tiền.`,
  checkin: `Theo hướng dẫn check-in nội bộ: Hành khách cần có mặt tại bến trước giờ khởi hành 30 phút. Xuất trình mã booking hoặc QR code trên vé điện tử.`,
  booking: `Hướng dẫn đặt vé: Chọn điểm đi/đến và ngày → chọn chuyến → chọn ghế → nhập thông tin hành khách → thanh toán trong 15 phút.`,
};

function resolveChatModel(): LanguageModelV1 | null {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.GEMINI_MODEL || 'gemini-2.5-flash');
  }
  if (process.env.OPENAI_API_KEY) {
    return openai('gpt-4o-mini');
  }
  return null;
}

async function graphql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

function normalizeToolDate(input: string): string {
  return parseTravelDate(input);
}

function normalizeToolLocation(input: string): string {
  return resolveLocationAlias(input);
}

const searchTripsTool = tool({
  description:
    'Tìm chuyến xe theo điểm đi, điểm đến và ngày. BẮT BUỘC gọi khi user hỏi về chuyến xe, giá vé, còn ghế. travelDate: YYYY-MM-DD hoặc hôm nay/hôm qua/ngày mai.',
  parameters: z.object({
    origin: z.string().describe('Điểm đi, vd: TP.HCM, HCM, Cần Thơ'),
    destination: z.string().describe('Điểm đến, vd: Đà Lạt, Nha Trang'),
    travelDate: z.string().describe('YYYY-MM-DD hoặc hôm nay/hôm qua/ngày mai'),
  }),
  execute: async ({ origin, destination, travelDate }) => {
    const o = normalizeToolLocation(origin);
    const d = normalizeToolLocation(destination);
    const t = normalizeToolDate(travelDate);
    const data = await graphql(
      `query($origin:String!,$destination:String!,$travelDate:String!){
        searchTrips(origin:$origin,destination:$destination,travelDate:$travelDate){
          id routeName origin destination operatorName busType departureTime arrivalTime price availableSeats durationMinutes
          bookable availabilityStatus availabilityLabel
        }
      }`,
      { origin: o, destination: d, travelDate: t }
    );
    return { travelDate: t, origin: o, destination: d, trips: data.searchTrips };
  },
});

const getTripDetailTool = tool({
  description: 'Lấy chi tiết một chuyến xe theo tripId (sau khi search_trips)',
  parameters: z.object({
    tripId: z.string(),
  }),
  execute: async ({ tripId }) => {
    const data = await graphql(
      `query($tripId:ID!){
        tripDetail(tripId:$tripId){
          id routeName origin destination operatorName busType departureTime arrivalTime price
          pickupPoint dropoffPoint cancellationPolicy totalSeats
        }
      }`,
      { tripId }
    );
    if (!data.tripDetail) return { error: 'Không tìm thấy chuyến xe' };
    return data.tripDetail;
  },
});

const getBookingStatusTool = tool({
  description: 'Tra cứu trạng thái booking — cần CẢ mã booking (BK...) VÀ email',
  parameters: z.object({
    bookingCode: z.string(),
    email: z.string(),
  }),
  execute: async ({ bookingCode, email }) => {
    const data = await graphql(
      `query($bookingCode:String!,$email:String!){
        bookingByCode(bookingCode:$bookingCode,email:$email){
          bookingCode status totalAmount createdAt passengers{fullName seatId}
        }
      }`,
      { bookingCode: bookingCode.toUpperCase(), email: email.trim().toLowerCase() }
    );
    if (!data.bookingByCode) {
      return { error: 'Không tìm thấy booking với mã và email đã cung cấp' };
    }
    return data.bookingByCode;
  },
});

const ROUTE_PATTERNS: Array<{ re: RegExp; origin: string; destination: string }> = [
  { re: /tp\.?hcm|hcm|sài gòn|sai gon|hồ chí minh|ho chi minh/i, origin: 'TP.HCM', destination: '' },
  { re: /đà lạt|da lat|dalat/i, origin: '', destination: 'Đà Lạt' },
  { re: /nha trang/i, origin: '', destination: 'Nha Trang' },
  { re: /cần thơ|can tho/i, origin: '', destination: 'Cần Thơ' },
  { re: /đà nẵng|da nang/i, origin: '', destination: 'Đà Nẵng' },
  { re: /hà nội|ha noi|hanoi/i, origin: '', destination: 'Hà Nội' },
];

function extractRouteFromMessage(msg: string): { origin: string; destination: string } | null {
  const norm = msg.toLowerCase();
  let origin = '';
  let destination = '';

  const fromTo = norm.match(
    /(?:từ|tu)\s+(.+?)\s+(?:đi|den|đến|toi|to)\s+(.+?)(?:\?|$|\.|,)/
  );
  if (fromTo) {
    origin = resolveLocationAlias(fromTo[1]);
    destination = resolveLocationAlias(fromTo[2]);
    return { origin, destination };
  }

  for (const city of CANONICAL_LOCATIONS) {
    const cityNorm = normalizeVietnamese(city);
    if (norm.includes(cityNorm) || norm.includes(city.toLowerCase())) {
      if (!origin) origin = city;
      else if (!destination && city !== origin) destination = city;
    }
  }

  for (const { re, origin: o, destination: d } of ROUTE_PATTERNS) {
    if (re.test(msg)) {
      if (o) origin = origin || o;
      if (d) destination = destination || d;
    }
  }

  if (origin && destination && origin !== destination) return { origin, destination };
  return null;
}

function extractDateFromMessage(msg: string): string {
  try {
    return parseTravelDate(msg);
  } catch {
    if (/hôm nay|hom nay|tối nay|toi nay/i.test(msg)) return todayVN();
    if (/hôm qua|hom qua/i.test(msg)) return parseTravelDate('hôm qua');
    if (/ngày mai|ngay mai|sáng mai|sang mai/i.test(msg)) return parseTravelDate('ngày mai');
    return todayVN();
  }
}

function policySources(msg: string): string[] {
  const sources: string[] = [];
  if (/hủy|đổi vé|hoàn tiền/i.test(msg)) {
    sources.push('Theo chính sách hủy vé nội bộ (bus://policy/cancellation)');
  }
  if (/check-in|checkin|lên xe/i.test(msg)) {
    sources.push('Theo hướng dẫn check-in nội bộ (bus://policy/checkin)');
  }
  if (/đặt vé|dat ve|hướng dẫn/i.test(msg)) {
    sources.push('Theo hướng dẫn đặt vé nội bộ');
  }
  return sources;
}

function toolSources(toolCalls: Array<{ toolName: string }> | undefined): string[] {
  if (!toolCalls?.length) return [];
  const labels: Record<string, string> = {
    searchTrips: 'Theo dữ liệu hệ thống (searchTrips)',
    getTripDetail: 'Chi tiết chuyến (getTripDetail)',
    getBookingStatus: 'Tra cứu booking (getBookingStatus)',
  };
  return [...new Set(toolCalls.map((tc) => labels[tc.toolName] || `Tool: ${tc.toolName}`))];
}

function mergeSources(...groups: string[][]): string[] {
  return [...new Set(groups.flat().filter(Boolean))];
}

async function demoReply(lastMessage: string, note?: string) {
  const prefix = note ? `${note}\n\n` : '';
  const isPolicyQuestion = /hủy|đổi|check-in|checkin|chính sách/i.test(lastMessage);
  const isBookingGuide = /đặt vé|dat ve|hướng dẫn/i.test(lastMessage);
  const isTripQuestion = /tìm|chuyến|xe|đi|ghế|giá/i.test(lastMessage);
  const isBookingLookup = /booking|mã vé|ma ve|tra cứu/i.test(lastMessage);

  if (isTripQuestion) {
    const route = extractRouteFromMessage(lastMessage);
    const travelDate = extractDateFromMessage(lastMessage);
    const origin = route?.origin || 'TP.HCM';
    const destination = route?.destination || 'Đà Lạt';

    const data = await searchTripsTool.execute!(
      { origin, destination, travelDate },
      { toolCallId: 'demo-search', messages: [] }
    );
    const trips = (data as { trips: unknown[] }).trips;
    return {
      reply: `${prefix}Tôi tìm thấy ${trips.length} chuyến ${origin} → ${destination} ngày ${travelDate}. Dữ liệu lấy từ hệ thống thật qua searchTrips.`,
      sources: mergeSources(['Theo dữ liệu hệ thống (searchTrips)'], policySources(lastMessage)),
      data,
    };
  }

  if (isBookingLookup) {
    return {
      reply: `${prefix}Để tra cứu booking, vui lòng cung cấp mã booking (dạng BK...) và email đã đặt vé.`,
      sources: ['Yêu cầu xác thực booking (mã + email)'],
    };
  }

  if (isPolicyQuestion || isBookingGuide) {
    return {
      reply: `${prefix}${POLICIES.cancellation}\n\n${POLICIES.checkin}\n\n${POLICIES.booking}`,
      sources: mergeSources(
        ['Theo chính sách hủy vé nội bộ (bus://policy/cancellation)'],
        ['Theo hướng dẫn check-in nội bộ (bus://policy/checkin)'],
        policySources(lastMessage)
      ),
    };
  }

  return {
    reply: `${prefix}Xin chào! Tôi là cappy — trợ lý đặt vé Cappy Bus. Tôi có thể giúp bạn tìm chuyến xe, tra cứu booking hoặc giải thích chính sách vé.`,
    sources: ['cappy — trợ lý đặt vé'],
  };
}

const app = express();
app.use(requestIdMiddleware());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
    const lastMessage = messages[messages.length - 1]?.content || '';
    const today = todayVN();

    const isPolicyQuestion = /hủy|đổi|check-in|checkin|chính sách/i.test(lastMessage);
    const policyContext = isPolicyQuestion
      ? `\nTài liệu tham chiếu:\n- Hủy vé: ${POLICIES.cancellation}\n- Check-in: ${POLICIES.checkin}\n- Đặt vé: ${POLICIES.booking}`
      : '';

    const model = resolveChatModel();

    if (!model) {
      return res.json(await demoReply(lastMessage));
    }

    try {
      const result = await generateText({
        model,
        system: `Bạn là cappy — trợ lý đặt vé xe khách Cappy Bus (timezone Asia/Ho_Chi_Minh).
Hôm nay theo giờ Việt Nam: ${today}.

QUY TẮC BẮT BUỘC:
- LUÔN gọi tool để lấy dữ liệu chuyến xe và booking. KHÔNG tự bịa số chuyến, giá, giờ khởi hành.
- Khi user nói "hôm nay", "hôm qua", "ngày mai", "tối nay", "sáng mai" → truyền đúng cụm đó vào travelDate (tool tự parse).
- Khi tra cứu booking: bắt buộc có mã BK... và email. Thiếu thì hỏi lại, không đoán.
- Trả lời chính sách hủy/check-in/đặt vé dựa trên tài liệu nội bộ, trích dẫn nguồn.
- Thành phố: TP.HCM (HCM, Sài Gòn), Đà Lạt, Nha Trang, Cần Thơ, Đà Nẵng, Hà Nội.${policyContext}`,
        messages: messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        tools: {
          searchTrips: searchTripsTool,
          getTripDetail: getTripDetailTool,
          getBookingStatus: getBookingStatusTool,
        },
        maxSteps: 5,
      });

      return res.json({
        reply: result.text,
        toolCalls: result.toolCalls,
        sources: mergeSources(toolSources(result.toolCalls), policySources(lastMessage)),
      });
    } catch (aiErr) {
      console.error('AI provider failed, falling back to demo mode:', aiErr);
      const note =
        '⚠️ AI tạm không khả dụng (kiểm tra API key/quota). Đang trả lời bằng tool thật (không bịa dữ liệu):';
      return res.json(await demoReply(lastMessage, note));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/health', async (_req, res) => {
  const body = await buildHealthResponse({ service: 'ai-service' });
  res.json(body);
});

const server = app.listen(PORT, () => console.log(`AI Service on :${PORT}`));

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPort ${PORT} đã được sử dụng.\n` +
        `- Chạy lại từ thư mục gốc: npm run dev:ai (tự giải phóng port)\n` +
        `- Hoặc tắt Docker AI: docker compose stop ai-service\n`
    );
    process.exit(1);
  }
  if (err.code === 'EACCES') {
    console.error(
      `\nKhông thể bind port ${PORT} (EACCES).\n` +
        `- Trên Windows, port có thể nằm trong dải bị hệ thống giữ — thử PORT=8765 hoặc port khác.\n` +
        `- Kiểm tra: netsh interface ipv4 show excludedportrange protocol=tcp\n`
    );
    process.exit(1);
  }
  throw err;
});
