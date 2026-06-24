'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandLogo } from '@/components/BrandLogo';
import {
  AUTH_CARD_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_PRIMARY_BTN,
  AuthSplitLayout,
} from '@/components/auth/AuthSplitLayout';
import { useAuth } from '@/hooks/useAuth';
import { formatAuthError, normalizeAuthEmail } from '@/lib/auth-errors';
import { gql } from '@/lib/graphql';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function sanitizeReturnPath(value: string | null): string {
    if (!value) return '/';
    return /^\/(?!\/)/.test(value) ? value : '/';
  }

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email không hợp lệ';
    if (!password) next.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await gql<{
        login: { token: string; userId: string; role: string };
      }>(
        `mutation($email:String!,$password:String!){
          login(email:$email,password:$password){token userId role}
        }`,
        { email: normalizeAuthEmail(email), password }
      );
      if (!data.login?.token || !data.login?.userId) {
        throw new Error('Đăng nhập thất bại — không nhận được token');
      }
      login(data.login.token, { email: normalizeAuthEmail(email), fullName: email.split('@')[0] });
      toast.success('Đăng nhập thành công!');
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      router.push(sanitizeReturnPath(returnTo));
    } catch (err) {
      toast.error(formatAuthError(err, 'Đăng nhập thất bại'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout>
      <div className={AUTH_CARD_CLASS}>
        <div className="mb-8 text-center lg:text-left">
          <BrandLogo href="/" showText={false} size={52} className="justify-center lg:justify-start" />
          <h1 className="mt-5 text-[1.75rem] font-bold tracking-tight text-[#0F172A]">Đăng nhập</h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#64748B]">
            Đăng nhập để quản lý vé và lịch sử đặt vé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Email"
            htmlFor="login-email"
            error={errors.email}
            required
            className={AUTH_FIELD_CLASS}
          >
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="Nhập email của bạn"
              error={!!errors.email}
              className={AUTH_INPUT_CLASS}
            />
          </Field>

          <Field
            label="Mật khẩu"
            htmlFor="login-password"
            error={errors.password}
            required
            className={AUTH_FIELD_CLASS}
          >
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="Nhập mật khẩu"
                error={!!errors.password}
                className={cn(AUTH_INPUT_CLASS, 'pr-11')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#94A3B8] transition-colors hover:text-[#0F172A]"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <div className="flex justify-end pt-0.5">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" disabled={loading} className={AUTH_PRIMARY_BTN}>
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E2E8F0]" />
          <span className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Hoặc</span>
          <div className="h-px flex-1 bg-[#E2E8F0]" />
        </div>

        <button
          type="button"
          onClick={() => toast('Tính năng đăng nhập Google sẽ sớm khả dụng')}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2.5 rounded-[14px] border border-[#E2E8F0] bg-white text-[0.9375rem] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
        >
          <GoogleIcon />
          Đăng nhập với Google
        </button>

        <p className="mt-4 text-center text-sm text-[#64748B]">
          Hoặc{' '}
          <button
            type="button"
            onClick={() => toast('Tính năng đăng nhập số điện thoại sẽ sớm khả dụng')}
            className="font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            đăng nhập bằng số điện thoại
          </button>
        </p>

        <div className="mt-8 border-t border-[#E2E8F0] pt-6 text-center text-sm text-[#64748B]">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
