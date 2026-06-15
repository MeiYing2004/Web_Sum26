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
import { requestIdMiddleware, buildHealthResponse } from '@bus/shared';

const PORT = process.env.PORT || 50060;
const GRAPHQL_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000/graphql';

function resolveChatModel(): LanguageModelV1 | null {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.GEMINI_MODEL || 'gemini-2.5-flash');
  }
  if (process.env.OPENAI_API_KEY) {
    return openai('gpt-4o-mini');
  }
  return null;
}

const POLICIES = {
  cancellation: `Theo chính sách hủy vé nội bộ: Hủy trước 24 giờ được hoàn 80% giá vé. Hủy trong vòng 24 giờ không được hoàn tiền.`,
  checkin: `Theo hướng dẫn check-in nội bộ: Hành khách cần có mặt tại bến trước giờ khởi hành 30 phút. Xuất trình mã booking hoặc QR code trên vé điện tử.`,
};

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

const searchTripsTool = tool({
  description: 'Tìm chuyến xe theo điểm đi, điểm đến và ngày',
  parameters: z.object({
    origin: z.string(),
    destination: z.string(),
    travelDate: z.string().describe('YYYY-MM-DD'),
  }),
  execute: async ({ origin, destination, travelDate }) => {
    const data = await graphql(
      `query($origin:String!,$destination:String!,$travelDate:String!){
        searchTrips(origin:$origin,destination:$destination,travelDate:$travelDate){id routeName departureTime price operatorName availableSeats}
      }`,
      { origin, destination, travelDate }
    );
    return data.searchTrips;
  },
});

const getBookingStatusTool = tool({
  description: 'Tra cứu trạng thái booking bằng mã booking và email',
  parameters: z.object({
    bookingCode: z.string(),
    email: z.string().email(),
  }),
  execute: async ({ bookingCode, email }) => {
    const data = await graphql(
      `query($bookingCode:String!,$email:String!){
        bookingByCode(bookingCode:$bookingCode,email:$email){bookingCode status totalAmount createdAt passengers{fullName seatId}}
      }`,
      { bookingCode, email }
    );
    if (!data.bookingByCode) return { error: 'Không tìm thấy booking với mã và email đã cung cấp' };
    return data.bookingByCode;
  },
});

async function demoReply(lastMessage: string, note?: string) {
  const prefix = note ? `${note}\n\n` : '';
  const isPolicyQuestion = /hủy|đổi|check-in|checkin|chính sách/i.test(lastMessage);

  if (/tìm|chuyến|xe|đi/i.test(lastMessage)) {
    const data = await searchTripsTool.execute!(
      { origin: 'TP.HCM', destination: 'Đà Lạt', travelDate: new Date().toISOString().split('T')[0] },
      { toolCallId: '1', messages: [] }
    );
    return {
      reply: `${prefix}Tôi đã tìm được ${(data as unknown[]).length} chuyến xe TP.HCM → Đà Lạt hôm nay. Bạn có thể xem chi tiết trên trang chủ.`,
      source: 'searchTrips tool',
      data,
    };
  }
  if (isPolicyQuestion) {
    return {
      reply: `${prefix}${POLICIES.cancellation}\n\n${POLICIES.checkin}`,
      source: 'bus://policy/cancellation',
    };
  }
  return {
    reply: `${prefix}Xin chào! Tôi là Capy AI — trợ lý đặt vé Cappy Bus. Tôi có thể giúp bạn tìm chuyến xe, tra cứu booking hoặc giải thích chính sách vé.`,
    source: 'demo',
  };
}

const app = express();
app.use(requestIdMiddleware());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body as { messages: Array<{ role: string; content: string }> };
    const lastMessage = messages[messages.length - 1]?.content || '';

    const isPolicyQuestion = /hủy|đổi|check-in|checkin|chính sách/i.test(lastMessage);
    const policyContext = isPolicyQuestion
      ? `\nTài liệu tham chiếu:\n- Hủy vé: ${POLICIES.cancellation}\n- Check-in: ${POLICIES.checkin}`
      : '';

    const model = resolveChatModel();

    if (!model) {
      return res.json(await demoReply(lastMessage));
    }

    try {
      const result = await generateText({
        model,
        system: `Bạn là Capy AI — trợ lý đặt vé xe khách Cappy Bus. LUÔN gọi tool để lấy dữ liệu thực, KHÔNG tự bịa.
Khi tra cứu booking phải có cả mã booking và email. Nếu thiếu thì từ chối.
Khi trả lời chính sách, trích dẫn nguồn "Theo chính sách hủy vé nội bộ..."${policyContext}`,
        messages: messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        tools: { searchTrips: searchTripsTool, getBookingStatus: getBookingStatusTool },
        maxSteps: 3,
      });

      return res.json({ reply: result.text, toolCalls: result.toolCalls });
    } catch (aiErr) {
      console.error('AI provider failed, falling back to demo mode:', aiErr);
      const note =
        '⚠️ AI tạm không khả dụng (kiểm tra API key/quota trên Google AI Studio hoặc OpenAI). Đang trả lời ở chế độ demo:';
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
  throw err;
});
