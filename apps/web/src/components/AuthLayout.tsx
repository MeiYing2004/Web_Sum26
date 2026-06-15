'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Zap } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left — hero image */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image
          src="/images/hero-bus.png"
          alt="Xe khách hiện đại"
          fill
          priority
          className="object-cover object-[60%_center]"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative z-10">
          <BrandLogo
            href="/"
            size={48}
            textClassName="text-lg font-bold text-white drop-shadow-sm"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-bold leading-tight text-white drop-shadow-sm">
            Đặt vé xe khách
            <br />
            <span className="text-white/90">nhanh & an toàn</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/85">
            Hàng nghìn chuyến xe mỗi ngày. Chọn ghế online, thanh toán trong 60 giây.
          </p>
          <div className="mt-10 space-y-4">
            {[
              { icon: Zap, text: 'Đặt vé siêu tốc' },
              { icon: Shield, text: 'Bảo mật tuyệt đối' },
              { icon: Sparkles, text: 'Hỗ trợ AI 24/7' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-sm text-white/60">
          © 2026 Cappy Bus — Bản quyền <span className="font-medium text-white/80">Lữ Minh Hoàng</span>
        </p>
      </div>

      {/* Right form */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-4 py-10 lg:w-1/2 lg:bg-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
