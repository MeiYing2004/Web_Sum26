const API_PORT = process.env.NEXT_PUBLIC_API_PORT || '4000';

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function isResolvableBrowserHost(hostname: string): boolean {
  if (!hostname || hostname === '0.0.0.0') return false;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

/** GraphQL HTTP — browser dùng cùng hostname với trang web (hỗ trợ truy cập qua WiFi LAN). */
export function resolveGraphqlUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (explicit && !isLocalhostUrl(explicit)) return explicit;

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (isResolvableBrowserHost(hostname)) {
      return `${protocol}//${hostname}:${API_PORT}/graphql`;
    }
  }

  return explicit || `http://localhost:${API_PORT}/graphql`;
}

/** GraphQL WebSocket — cùng hostname với trang web. */
export function resolveWsGraphqlUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL;
  if (explicit && !isLocalhostUrl(explicit)) return explicit;

  if (typeof window !== 'undefined') {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const { hostname } = window.location;
    if (isResolvableBrowserHost(hostname)) {
      return `${wsProto}//${hostname}:${API_PORT}/graphql`;
    }
  }

  return explicit || `ws://localhost:${API_PORT}/graphql`;
}
