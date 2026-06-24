'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, QrCode, ScanLine, TicketCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  onSuccess?: () => void;
};

function parseBookingCode(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get('bookingCode') || url.searchParams.get('code');
    if (fromQuery) return fromQuery.trim();
  } catch {
    /* not a URL */
  }
  const jsonMatch = trimmed.match(/"bookingCode"\s*:\s*"([^"]+)"/i);
  if (jsonMatch) return jsonMatch[1];
  if (trimmed.includes('|')) return trimmed.split('|')[0].trim();
  return trimmed;
}

export default function CheckInCard({ onSuccess }: Props) {
  const { getToken } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanSupported, setScanSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setScanSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  const stopScan = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopScan(), [stopScan]);

  async function submitCheckIn(bookingCode: string) {
    const normalized = parseBookingCode(bookingCode);
    if (!normalized) {
      toast.error('Vui lòng nhập mã booking');
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error('Phiên đăng nhập hết hạn');
      return;
    }

    setLoading(true);
    try {
      const data = await gql<{ checkIn: { success: boolean; message: string } }>(
        `mutation($bookingCode:String!){checkIn(bookingCode:$bookingCode){success message}}`,
        { bookingCode: normalized },
        { token }
      );
      if (data.checkIn.success) {
        toast.success(data.checkIn.message);
        setCode('');
        onSuccess?.();
      } else {
        toast.error(data.checkIn.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Check-in thất bại');
    } finally {
      setLoading(false);
    }
  }

  async function startScan() {
    if (!scanSupported) {
      toast.error('Trình duyệt không hỗ trợ quét QR. Vui lòng nhập mã thủ công.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      setScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // @ts-expect-error BarcodeDetector is not in all TS libs
      const detector = new BarcodeDetector({ formats: ['qr_code'] });

      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const value = codes[0].rawValue as string;
            stopScan();
            setCode(parseBookingCode(value));
            await submitCheckIn(value);
            return;
          }
        } catch {
          /* frame skip */
        }
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    } catch {
      toast.error('Không thể mở camera. Kiểm tra quyền truy cập.');
      stopScan();
    }
  }

  return (
    <Card variant="glass" padding="md">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg">
          <TicketCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Check-in hành khách</h3>
          <p className="text-xs text-slate-500">Nhập Booking ID hoặc quét mã QR trên vé</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-600">Mã booking / vé</label>
        <div className="relative">
          <QrCode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCheckIn(code)}
            placeholder="VD: BK1A2B3C4D"
            className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-indigo-200 transition focus:border-indigo-300 focus:ring-2"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => submitCheckIn(code)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-60"
          >
            <ScanLine className="h-4 w-4" />
            {loading ? 'Đang xử lý...' : 'Check-in'}
          </button>

          {scanSupported ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => (scanning ? stopScan() : startScan())}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
              {scanning ? 'Dừng quét' : 'Quét QR'}
            </button>
          ) : null}
        </div>

        {scanning ? (
          <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-slate-900">
            <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
            <p className="bg-indigo-950/80 px-3 py-2 text-center text-xs text-indigo-100">
              Đưa mã QR vé vào khung hình
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
