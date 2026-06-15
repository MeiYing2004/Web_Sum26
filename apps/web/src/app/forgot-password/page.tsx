'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '@/components/AuthLayout';

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
    // UI flow — backend chưa có mutation reset password
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Đã gửi hướng dẫn đặt lại mật khẩu!');
  }

  if (sent) {
    return (
      <AuthLayout
        title="Kiểm tra email của bạn"
        subtitle="Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Nếu tài khoản <span className="font-semibold text-gray-900">{email}</span> tồn tại,
            bạn sẽ nhận email chứa link đặt lại mật khẩu trong vài phút.
          </p>
          <p className="mt-2 text-xs text-gray-400">Kiểm tra cả thư mục Spam nếu không thấy email.</p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu?"
      subtitle="Nhập email đăng ký — chúng tôi sẽ gửi link đặt lại mật khẩu"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="email@example.com"
              className={`w-full rounded-xl border py-3 pl-10 pr-4 outline-none transition-all duration-200 focus:ring-2 ${
                error
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
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

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </motion.button>

        <p className="text-center text-sm text-gray-500">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
