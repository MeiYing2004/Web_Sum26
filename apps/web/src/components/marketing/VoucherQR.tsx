'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { cn } from '@/lib/cn';

type VoucherQRProps = {
  code: string;
  size?: number;
  className?: string;
};

/** QR nhỏ cho voucher khuyến mãi */
export function VoucherQR({ code, size = 72, className }: VoucherQRProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(`CAPPY:${code}`, {
      width: size * 2,
      margin: 1,
      color: { dark: '#1e293b', light: '#FFFFFF' },
    })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, size]);

  if (!src) {
    return (
      <div
        className={cn('animate-pulse rounded-lg bg-white/60', className)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={`QR mã ${code}`}
      width={size}
      height={size}
      className={cn('rounded-lg bg-white p-1', className)}
      style={{ width: size, height: size }}
    />
  );
}
