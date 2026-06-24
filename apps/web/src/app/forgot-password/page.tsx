'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandLogo } from '@/components/BrandLogo';
import {
  AUTH_CARD_CLASS,
  AUTH_FIELD_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_PRIMARY_BTN,
  AuthSplitLayout,
} from '@/components/auth/AuthSplitLayout';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

const RECOVERY_HIGHLIGHTS = [
  { icon: Mail, text: 'Xác nhận email đăng ký' },
  { icon: KeyRound, text: 'Nhận link đặt lại mật khẩu' },
  { icon: ShieldCheck, text: 'Quay lại quản lý vé an toàn' },
] as const;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validate() {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ');
      return false;
    }
    setError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Đã gửi hướng dẫn đặt lại mật khẩu!');
  }

  return (
    <AuthSplitLayout
      headline="Khôi phục tài khoản"
      headlineAccent="nhanh và an toàn"
      highlights={[...RECOVERY_HIGHLIGHTS]}
      imageAlt="Khôi phục mật khẩu Cappy Bus"
    >
      <div className={AUTH_CARD_CLASS}>
        {sent ? (
          <div className="text-center">
            <BrandLogo href="/" showText={false} size={52} className="justify-center" />
            <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <h1 className="mt-5 text-[1.75rem] font-bold tracking-tight text-[#0F172A]">
              Kiểm tra email
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[#64748B]">
              Nếu tài khoản{' '}
              <span className="font-semibold text-[#0F172A]">{email}</span> tồn tại, bạn sẽ nhận
              email chứa link đặt lại mật khẩu trong vài phút.
            </p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Kiểm tra cả thư mục Spam nếu không thấy email.
            </p>
            <Link
              href="/login"
              className={cn(AUTH_PRIMARY_BTN, 'mt-8 inline-flex no-underline')}
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center lg:text-left">
              <BrandLogo href="/" showText={false} size={52} className="justify-center lg:justify-start" />
              <h1 className="mt-5 text-[1.75rem] font-bold tracking-tight text-[#0F172A]">
                Quên mật khẩu?
              </h1>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#64748B]">
                Nhập email đăng ký để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Email"
                htmlFor="forgot-email"
                error={error}
                required
                className={AUTH_FIELD_CLASS}
              >
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                  error={!!error}
                  className={AUTH_INPUT_CLASS}
                />
              </Field>

              <button type="submit" disabled={loading} className={AUTH_PRIMARY_BTN}>
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </button>

              <p className="pt-2 text-center text-sm text-[#64748B]">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Quay lại đăng nhập
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </AuthSplitLayout>
  );
}
