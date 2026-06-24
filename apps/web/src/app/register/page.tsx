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

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = 'Vui lòng nhập họ tên';
    if (!email.trim()) next.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email không hợp lệ';
    if (!password) next.password = 'Vui lòng nhập mật khẩu';
    else if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!confirmPassword) next.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (password !== confirmPassword) next.confirmPassword = 'Mật khẩu không khớp';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await gql<{
        register: { token: string; userId: string; role: string };
      }>(
        `mutation($email:String!,$password:String!,$fullName:String!){
          register(email:$email,password:$password,fullName:$fullName){token userId role}
        }`,
        { email: normalizeAuthEmail(email), password, fullName: fullName.trim() }
      );
      if (!data.register?.token || !data.register?.userId) {
        throw new Error('Đăng ký thất bại — không nhận được token');
      }
      login(data.register.token, { email: normalizeAuthEmail(email), fullName: fullName.trim() });
      toast.success('Đăng ký thành công! Chào mừng bạn đến Cappy Bus');
      router.push('/');
    } catch (err) {
      toast.error(formatAuthError(err, 'Đăng ký thất bại'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout
      headline="Tham gia Cappy Bus"
      headlineAccent="đặt vé dễ hơn"
      imageAlt="Đăng ký tài khoản Cappy Bus"
    >
      <div className={AUTH_CARD_CLASS}>
        <div className="mb-8 text-center lg:text-left">
          <BrandLogo href="/" showText={false} size={52} className="justify-center lg:justify-start" />
          <h1 className="mt-5 text-[1.75rem] font-bold tracking-tight text-[#0F172A]">
            Tạo tài khoản
          </h1>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#64748B]">
            Đăng ký miễn phí để đặt vé và theo dõi lịch sử.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Họ và tên"
            htmlFor="register-name"
            error={errors.fullName}
            required
            className={AUTH_FIELD_CLASS}
          >
            <Input
              id="register-name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((p) => ({ ...p, fullName: '' }));
              }}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              error={!!errors.fullName}
              className={AUTH_INPUT_CLASS}
            />
          </Field>

          <Field
            label="Email"
            htmlFor="register-email"
            error={errors.email}
            required
            className={AUTH_FIELD_CLASS}
          >
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: '' }));
              }}
              placeholder="Nhập email của bạn"
              autoComplete="email"
              error={!!errors.email}
              className={AUTH_INPUT_CLASS}
            />
          </Field>

          <Field
            label="Mật khẩu"
            htmlFor="register-password"
            error={errors.password}
            required
            className={AUTH_FIELD_CLASS}
          >
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: '' }));
                }}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
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

          <Field
            label="Xác nhận mật khẩu"
            htmlFor="register-confirm"
            error={errors.confirmPassword}
            required
            className={AUTH_FIELD_CLASS}
          >
            <Input
              id="register-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((p) => ({ ...p, confirmPassword: '' }));
              }}
              placeholder="Nhập lại mật khẩu"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              className={AUTH_INPUT_CLASS}
            />
          </Field>

          <button type="submit" disabled={loading} className={cn(AUTH_PRIMARY_BTN, 'mt-2')}>
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-8 border-t border-[#E2E8F0] pt-6 text-center text-sm text-[#64748B]">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]">
            Đăng nhập
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
