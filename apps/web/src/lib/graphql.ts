const DEFAULT_GRAPHQL = 'http://localhost:4000/graphql';
const SERVER_GRAPHQL =
  (typeof process.env.API_GATEWAY_URL === 'string'
    ? `${process.env.API_GATEWAY_URL}/graphql`
    : null) ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  DEFAULT_GRAPHQL;
// Browser calls gateway directly (port 4000 is published). Next.js rewrites break in Docker standalone builds.
const GRAPHQL =
  typeof window === 'undefined'
    ? SERVER_GRAPHQL
    : process.env.NEXT_PUBLIC_GRAPHQL_URL || DEFAULT_GRAPHQL;

let authTokenGetter: (() => string | null) | null = null;

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

  const res = await fetch(GRAPHQL, {
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
    throw new Error(json.errors?.[0]?.message || `Lỗi máy chủ (${res.status})`);
  }
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error('Không nhận được dữ liệu từ máy chủ');
  return json.data;
}
