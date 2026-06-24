'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type Props = {
  value: string;
  size?: number;
  elevated?: boolean;
};

export function TicketQRCode({ value, size = 160, elevated = false }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#FFFFFF' },
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
  }, [value, size]);

  if (!src) {
    return (
      <div
        className={`animate-pulse bg-slate-100 ${elevated ? 'rounded-xl' : 'rounded-xl'}`}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <div className={elevated ? 'flex justify-center' : undefined}>
      <img
        src={src}
        alt="Mã QR vé"
        width={size}
        height={size}
        className={`bg-white ${
          elevated
            ? 'rounded-xl'
            : 'rounded-xl border border-slate-100 p-1 shadow-sm'
        }`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
