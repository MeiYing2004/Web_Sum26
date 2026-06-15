'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/hooks/useAuth';
import { gql } from '@/lib/graphql';

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
        { email: email.trim(), password, fullName: fullName.trim() }
      );
      login(data.register.token, { email: email.trim(), fullName: fullName.trim() });
      toast.success('Đăng ký thành công! Chào mừng bạn đến Cappy Bus');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản mới"
      subtitle="Đăng ký miễn phí để đặt vé và theo dõi lịch sử"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Họ và tên" error={errors.fullName} icon={<User className="h-4 w-4" />}>
          <input
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setErrors((p) => ({ ...p, fullName: '' }));
            }}
            placeholder="Nguyễn Văn A"
            className={inputClass(!!errors.fullName)}
          />
        </FormField>

        <FormField label="Email" error={errors.email} icon={<Mail className="h-4 w-4" />}>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder="email@example.com"
            className={inputClass(!!errors.email)}
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password} icon={<Lock className="h-4 w-4" />}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: '' }));
              }}
              placeholder="Tối thiểu 6 ký tự"
              className={inputClass(!!errors.password, true)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField
          label="Xác nhận mật khẩu"
          error={errors.confirmPassword}
          icon={<Lock className="h-4 w-4" />}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((p) => ({ ...p, confirmPassword: '' }));
            }}
            placeholder="Nhập lại mật khẩu"
            className={inputClass(!!errors.confirmPassword)}
          />
        </FormField>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </motion.button>

        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function FormField({
  label,
  error,
  icon,
  children,
}: {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        {children}
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

function inputClass(hasError: boolean, withRightPad?: boolean) {
  return `w-full rounded-xl border py-3 pl-10 ${withRightPad ? 'pr-10' : 'pr-4'} text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:ring-2 ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
  }`;
}
