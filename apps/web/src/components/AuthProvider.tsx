'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AuthUser,
  UserProfile,
  clearAuth,
  decodeToken,
  getStoredProfile,
  getStoredToken,
  getUserFromStorage,
  saveAuth,
} from '@/lib/auth';
import { normalizeRole } from '@/lib/roles';
import { gql, setAuthTokenGetter } from '@/lib/graphql';

export type AuthContextValue = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  role: string | null;
  loading: boolean;
  login: (token: string, profile: UserProfile) => void;
  logout: () => void;
  getUser: () => AuthUser | null;
  getToken: () => string | null;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getUserFromStorage());
    setLoading(false);
  }, []);

  useEffect(() => {
    async function validateSession() {
      const token = getStoredToken();
      if (!token) return;
      const decoded = decodeToken(token);
      if (!decoded) {
        clearAuth();
        setUser(null);
        return;
      }
      try {
        const data = await gql<{ session: { valid: boolean; userId: string; role: string } }>(
          `query { session { valid userId role } }`,
          undefined,
          { token }
        );
        if (!data.session?.valid) {
          clearAuth();
          setUser(null);
          return;
        }
        const profile = getStoredProfile();
        setUser({
          userId: data.session.userId,
          role: normalizeRole(data.session.role),
          email: profile?.email,
          fullName: profile?.fullName,
        });
      } catch {
        // Giữ session local nếu gateway tạm thời không phản hồi
      }
    }

    void validateSession();
  }, []);

  useEffect(() => {
    setAuthTokenGetter(() => getStoredToken());
  }, [user]);

  const login = useCallback((token: string, profile: UserProfile) => {
    const decoded = decodeToken(token);
    if (!decoded) throw new Error('Token không hợp lệ');
    saveAuth(token, profile);
    setUser({ userId: decoded.userId, role: decoded.role, ...profile });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const getUser = useCallback(() => user, [user]);
  const getToken = useCallback(() => getStoredToken(), []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      role: user?.role ?? null,
      loading,
      login,
      logout,
      getUser,
      getToken,
    }),
    [user, loading, login, logout, getUser, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
