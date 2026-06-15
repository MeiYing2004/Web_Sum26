const TOKEN_KEY = 'bus_auth_token';
const PROFILE_KEY = 'bus_user_profile';

export type AuthUser = {
  userId: string;
  role: string;
  email?: string;
  fullName?: string;
};

export type UserProfile = {
  email: string;
  fullName: string;
};

export function decodeToken(token: string): { userId: string; role: string; exp: number } | null {
  try {
    const [payload] = token.split('.');
    if (!payload) return null;
    const data = JSON.parse(atob(payload)) as { userId: string; role: string; exp: number };
    if (!data.userId || !data.role || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, profile: UserProfile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function getUserFromStorage(): AuthUser | null {
  const token = getStoredToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) {
    clearAuth();
    return null;
  }
  const profile = getStoredProfile();
  return {
    userId: decoded.userId,
    role: decoded.role,
    email: profile?.email,
    fullName: profile?.fullName,
  };
}

export function avatarGradient(seed: string): string {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
}

export function userInitials(user: AuthUser): string {
  if (user.fullName) {
    const parts = user.fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return 'U';
}
