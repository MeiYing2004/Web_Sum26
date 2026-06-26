import { resolveGraphqlUrl } from './api-url';

const SERVER_GRAPHQL =
  (typeof process.env.API_GATEWAY_URL === 'string'
    ? `${process.env.API_GATEWAY_URL}/graphql`
    : null) ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  'http://localhost:4000/graphql';

let authTokenGetter: (() => string | null) | null = null;

function formatGraphqlError(message: string): string {
  const cleaned = message.replace(/^\d+\s+[A-Z_]+:\s*/, '').trim();
  if (/14 UNAVAILABLE|No connection established/i.test(cleaned)) {
    return 'Dịch vụ trip-service chưa chạy. Trong thư mục dự án chạy: docker compose up -d trip-service';
  }
  if (/12 UNIMPLEMENTED.*ValidateHold/i.test(cleaned)) {
    return 'Dịch vụ seat-inventory-service chưa cập nhật. Chạy: docker compose up -d --build seat-inventory-service booking-service';
  }
  if (/không còn được giữ|hết hạn|không hợp lệ/i.test(cleaned)) {
    return 'Mã giữ ghế đã hết hạn. Vui lòng quay lại chọn ghế.';
  }
  return cleaned;
}

export function setAuthTokenGetter(getter: () => string | null) {
  authTokenGetter = getter;
}

export async function gql<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { revalidate?: number; token?: string }
): Promise<T> {
  const token = options?.token ?? authTokenGetter?.() ?? null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const graphqlUrl = typeof window === 'undefined' ? SERVER_GRAPHQL : resolveGraphqlUrl();
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    next: options?.revalidate ? { revalidate: options.revalidate } : undefined,
  });

  let json: { data?: T; errors?: Array<{ message: string }> };
  try {
    json = await res.json();
  } catch {
    throw new Error(`Máy chủ trả về phản hồi không hợp lệ (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(formatGraphqlError(json.errors?.[0]?.message || `Lỗi máy chủ (${res.status})`));
  }
  if (json.errors?.length) throw new Error(formatGraphqlError(json.errors[0].message));
  if (!json.data) throw new Error('Không nhận được dữ liệu từ máy chủ');
  return json.data;
}
