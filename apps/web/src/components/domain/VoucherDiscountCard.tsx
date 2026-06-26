'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BadgePercent, CheckCircle2, Clock, Gift, Loader2, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { gql } from '@/lib/graphql';
import { formatVnd } from '@/lib/booking-pricing';
import { daysUntilExpiry } from '@/lib/marketing-content';
import { isValidPhoneNumber, sanitizePhoneInput } from '@/lib/phone';
import { isValidOptionalEmail } from '@/lib/email';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

export type VoucherPricing = {
  ticketSubtotal: number;
  serviceFee: number;
  discountAmount: number;
  finalAmount: number;
  voucherCode: string;
  voucherName: string;
};

type AvailableVoucher = {
  code: string;
  name: string;
  description: string;
  discountLabel: string;
  minOrderValue: number;
  maxDiscount: number | null;
  validUntil: string;
};

type Props = {
  bookingId: string;
  guestEmail: string;
  guestPhone?: string;
  isLoggedIn: boolean;
  initialCode?: string;
  onPricingChange: (pricing: VoucherPricing) => void;
  className?: string;
};

const VOUCHER_FIELDS = `
  valid message discountAmount ticketSubtotal serviceFee finalAmount voucherCode voucherName
`;

function hasVerificationContact(email: string, phone: string, isLoggedIn: boolean): boolean {
  if (isLoggedIn) return true;
  if (email && isValidOptionalEmail(email)) return true;
  return !!phone && isValidPhoneNumber(phone);
}

export function VoucherDiscountCard({
  bookingId,
  guestEmail,
  guestPhone = '',
  isLoggedIn,
  initialCode = '',
  onPricingChange,
  className,
}: Props) {
  const [codeInput, setCodeInput] = useState(initialCode);
  const [appliedCode, setAppliedCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [available, setAvailable] = useState<AvailableVoucher[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const autoApplyAttemptedRef = useRef(false);

  const verificationEmail = guestEmail.trim();
  const verificationPhone = sanitizePhoneInput(guestPhone);
  const canVerify = hasVerificationContact(verificationEmail, verificationPhone, isLoggedIn);

  const syncPricing = useCallback(
    (res: {
      ticketSubtotal: number;
      serviceFee: number;
      discountAmount: number;
      finalAmount: number;
      voucherCode?: string | null;
      voucherName?: string | null;
    }) => {
      onPricingChange({
        ticketSubtotal: res.ticketSubtotal,
        serviceFee: res.serviceFee,
        discountAmount: res.discountAmount,
        finalAmount: res.finalAmount,
        voucherCode: res.voucherCode ?? '',
        voucherName: res.voucherName ?? '',
      });
    },
    [onPricingChange]
  );

  const loadAvailable = useCallback(async () => {
    if (!isLoggedIn || !bookingId) return;
    setLoadingAvailable(true);
    try {
      const data = await gql<{ availableVouchers: AvailableVoucher[] }>(
        `query($bookingId:ID!){
          availableVouchers(bookingId:$bookingId){
            code name description discountLabel minOrderValue maxDiscount validUntil
          }
        }`,
        { bookingId }
      );
      setAvailable(data.availableVouchers ?? []);
    } catch {
      setAvailable([]);
    } finally {
      setLoadingAvailable(false);
    }
  }, [bookingId, isLoggedIn]);

  useEffect(() => {
    void loadAvailable();
  }, [loadAvailable]);

  const applyCode = useCallback(
    async (code: string, options?: { silent?: boolean }) => {
      if (!bookingId) return;
      const normalized = code.trim().toUpperCase();
      if (!normalized) {
        setError('Vui lòng nhập mã giảm giá');
        return;
      }
      if (!canVerify) {
        const msg = 'Vui lòng nhập số điện thoại đặt vé trước khi áp dụng voucher';
        setError(msg);
        if (!options?.silent) toast.error(msg);
        return;
      }
      setApplying(true);
      setError('');
      try {
        const data = await gql<{ applyVoucher: VoucherPricing & { valid: boolean; message: string } }>(
          `mutation($bookingId:ID!,$code:String!,$guestEmail:String,$guestPhone:String){
            applyVoucher(bookingId:$bookingId,code:$code,guestEmail:$guestEmail,guestPhone:$guestPhone){${VOUCHER_FIELDS} valid message}
          }`,
          {
            bookingId,
            code: normalized,
            guestEmail: verificationEmail || null,
            guestPhone: verificationPhone || null,
          }
        );
        const res = data.applyVoucher;
        if (!res.valid) {
          setError(res.message);
          if (!options?.silent) toast.error(res.message);
          return;
        }
        setAppliedCode(res.voucherCode ?? normalized);
        setCodeInput(res.voucherCode ?? normalized);
        syncPricing(res);
        if (!options?.silent) {
          toast.success(res.message || 'Áp dụng voucher thành công');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Không thể áp dụng voucher';
        setError(msg);
        if (!options?.silent) toast.error(msg);
      } finally {
        setApplying(false);
      }
    },
    [bookingId, canVerify, syncPricing, verificationEmail, verificationPhone]
  );

  const removeVoucher = useCallback(async () => {
    if (!bookingId) return;
    if (!canVerify) {
      toast.error('Vui lòng nhập số điện thoại đặt vé');
      return;
    }
    setApplying(true);
    setError('');
    try {
      const data = await gql<{ removeVoucher: VoucherPricing & { valid: boolean; message: string } }>(
        `mutation($bookingId:ID!,$guestEmail:String,$guestPhone:String){
          removeVoucher(bookingId:$bookingId,guestEmail:$guestEmail,guestPhone:$guestPhone){${VOUCHER_FIELDS} valid message}
        }`,
        {
          bookingId,
          guestEmail: verificationEmail || null,
          guestPhone: verificationPhone || null,
        }
      );
      const res = data.removeVoucher;
      setAppliedCode('');
      setCodeInput('');
      syncPricing(res);
      toast.success('Đã bỏ áp dụng mã giảm giá');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể bỏ áp dụng voucher';
      setError(msg);
      toast.error(msg);
    } finally {
      setApplying(false);
    }
  }, [bookingId, canVerify, syncPricing, verificationEmail, verificationPhone]);

  useEffect(() => {
    autoApplyAttemptedRef.current = false;
  }, [bookingId, initialCode]);

  useEffect(() => {
    if (!bookingId || !initialCode.trim() || appliedCode || autoApplyAttemptedRef.current) return;
    if (!canVerify) return;
    autoApplyAttemptedRef.current = true;
    void applyCode(initialCode, { silent: true });
  }, [bookingId, initialCode, appliedCode, canVerify, applyCode]);

  return (
    <Card variant="solid" padding="md" className={cn('rounded-2xl', className)}>
      <div className="flex items-center gap-2">
        <BadgePercent className="h-5 w-5 text-brand" />
        <h2 className="text-subtitle font-semibold text-ink">Mã giảm giá</h2>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Field label="Nhập mã voucher" htmlFor="voucherCode" className="flex-1">
          <Input
            id="voucherCode"
            placeholder="VD: CAPPY15"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            disabled={applying || !!appliedCode}
            className="h-11 font-mono uppercase"
          />
        </Field>
        <div className="flex shrink-0 items-end gap-2">
          {appliedCode ? (
            <Button type="button" variant="secondary" onClick={() => void removeVoucher()} disabled={applying}>
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Bỏ áp dụng
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void applyCode(codeInput)}
              disabled={applying || !codeInput.trim()}
            >
              {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
              Áp dụng
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-danger/20 bg-danger-light px-3 py-2 text-caption text-danger">
          {error}
        </p>
      )}

      {appliedCode && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-caption font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Đã áp dụng mã <span className="font-mono font-bold">{appliedCode}</span>
        </div>
      )}

      {isLoggedIn && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-caption font-semibold text-ink">Voucher khả dụng</p>
            {loadingAvailable && <Loader2 className="h-4 w-4 animate-spin text-brand" />}
          </div>
          {available.length === 0 && !loadingAvailable ? (
            <EmptyState
              icon={Gift}
              title="Không có voucher"
              description="Không có voucher phù hợp cho đơn này."
              className="border-0 bg-transparent shadow-none"
            />
          ) : (
            <ul className="space-y-2">
              {available.map((v) => {
                const daysLeft = daysUntilExpiry(v.validUntil);
                const expiringSoon = daysLeft > 0 && daysLeft <= 7;
                const isApplied = appliedCode === v.code;
                return (
                <li
                  key={v.code}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-3',
                    isApplied ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-surface-sunken'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Gift className="h-4 w-4 text-brand" />
                      <span className="font-mono text-caption font-bold text-brand">{v.code}</span>
                      <span className="text-caption font-semibold text-ink">{v.discountLabel}</span>
                      {isApplied && (
                        <Badge variant="success" size="sm">Đã dùng</Badge>
                      )}
                      {expiringSoon && !isApplied && (
                        <Badge variant="warning" size="sm">Sắp hết hạn</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-micro text-ink-muted">{v.name}</p>
                    {v.minOrderValue > 0 && (
                      <p className="text-micro text-ink-subtle">Đơn từ {formatVnd(v.minOrderValue)}</p>
                    )}
                    {daysLeft > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-micro text-ink-subtle">
                        <Clock className="h-3 w-3" />
                        Còn {daysLeft} ngày
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={applying || isApplied}
                    onClick={() => {
                      setCodeInput(v.code);
                      void applyCode(v.code);
                    }}
                  >
                    {isApplied ? 'Đã áp dụng' : 'Áp dụng'}
                  </Button>
                </li>
              );
              })}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
