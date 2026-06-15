'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/AuthLayout';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLayout title="Đặt lại mật khẩu" subtitle="Đang tải..."><div /></AuthLayout>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!password) next.password = 'Vui lòng nhập mật khẩu mới';
    else if (password.length < 6) next.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (password !== confirm) next.confirm = 'Mật khẩu không khớp';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    toast.success('Đặt lại mật khẩu thành công!');
    setTimeout(() => router.push('/login'), 2000);
  }

  if (done) {
    return (
      <AuthLayout title="Hoàn tất!" subtitle="Mật khẩu đã được cập nhật">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <p className="mt-4 text-sm text-gray-600">Đang chuyển đến trang đăng nhập...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle={token ? 'Nhập mật khẩu mới cho tài khoản của bạn' : 'Link không hợp lệ hoặc đã hết hạn'}
    >
      {!token ? (
        <div className="text-center">
          <p className="text-sm text-gray-500">Vui lòng dùng link trong email hoặc yêu cầu gửi lại.</p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Gửi lại link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            label="Mật khẩu mới"
            value={password}
            error={errors.password}
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            onChange={(v) => {
              setPassword(v);
              setErrors((p) => ({ ...p, password: '' }));
            }}
          />
          <PasswordField
            label="Xác nhận mật khẩu"
            value={confirm}
            error={errors.confirm}
            show={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            onChange={(v) => {
              setConfirm(v);
              setErrors((p) => ({ ...p, confirm: '' }));
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

function PasswordField({
  label,
  value,
  error,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  show: boolean;
  onToggle: () => void;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className={`w-full rounded-xl border py-3 pl-10 pr-10 outline-none transition-all duration-200 focus:ring-2 ${
            error
              ? 'border-red-300 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-medium text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
