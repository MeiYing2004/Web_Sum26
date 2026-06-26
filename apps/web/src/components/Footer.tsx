import Link from 'next/link';
import { CreditCard, Mail, MapPin, Phone, Smartphone } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { SocialLinks } from '@/components/SocialLinks';
import { CONTACT_INFO } from '@/lib/marketing-content';
import { COPYRIGHT_OWNER, COPYRIGHT_YEAR, COPYRIGHT_PROJECT } from '@/components/CopyrightNotice';

const PAYMENT_METHODS = [
  { label: 'Visa', color: 'bg-blue-900' },
  { label: 'Mastercard', color: 'bg-red-600' },
  { label: 'MoMo', color: 'bg-pink-500' },
  { label: 'ZaloPay', color: 'bg-blue-500' },
  { label: 'VNPay', color: 'bg-blue-700' },
] as const;

/** Footer 4 cột — logo, liên hệ, hỗ trợ, mạng xã hội & thanh toán */
export default function Footer() {
  return (
    <footer className="border-t border-border bg-white" data-copyright-protected="true">
      <div className="page-container py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo & giới thiệu */}
          <div>
            <BrandLogo textClassName="text-xl font-bold tracking-tight text-ink" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Cappy Bus — nền tảng đặt vé xe khách liên tỉnh hàng đầu Việt Nam. So sánh giá, chọn ghế
              trực quan và nhận vé điện tử ngay lập tức.
            </p>
            <SocialLinks className="mt-5" />
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Liên hệ</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={`tel:${CONTACT_INFO.hotline.replace(/\s/g, '')}`}
                  className="flex items-center gap-2.5 text-sm text-ink-muted transition-colors hover:text-brand"
                >
                  <Phone className="h-4 w-4 shrink-0 text-brand" />
                  {CONTACT_INFO.hotline}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-center gap-2.5 text-sm text-ink-muted transition-colors hover:text-brand"
                >
                  <Mail className="h-4 w-4 shrink-0 text-brand" />
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-ink-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {CONTACT_INFO.address}
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Hỗ trợ</h3>
            <ul className="mt-5 space-y-2.5">
              {[
                { href: '/', label: 'Tìm chuyến' },
                { href: '/lookup', label: 'Tra cứu vé' },
                { href: '/my-tickets', label: 'Vé của tôi' },
                { href: '/about#refund', label: 'Chính sách hoàn vé' },
                { href: '/about#terms', label: 'Điều khoản' },
                { href: '/about#privacy', label: 'Bảo mật' },
                { href: '/#faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Thanh toán */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink">Thanh toán</h3>
            <p className="mt-5 text-sm text-ink-muted">
              Hỗ trợ nhiều phương thức thanh toán an toàn, bảo mật SSL.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method.label}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-slate-50 px-3 py-1.5 text-xs font-semibold text-ink-muted"
                >
                  <CreditCard className="h-3.5 w-3.5 text-brand" />
                  {method.label}
                </span>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-brand-50/50 px-4 py-3">
              <Smartphone className="h-5 w-5 text-brand" />
              <p className="text-xs text-ink-muted">
                Quét QR thanh toán nhanh qua MoMo, ZaloPay, VNPay
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-surface py-6 text-center">
        <p className="text-sm text-ink-muted">
          © {COPYRIGHT_YEAR} {COPYRIGHT_PROJECT} — Bản quyền thuộc về{' '}
          <span className="font-semibold text-brand">{COPYRIGHT_OWNER}</span>
        </p>
        <p className="mt-1 text-xs text-ink-subtle">All rights reserved. Mọi quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}
