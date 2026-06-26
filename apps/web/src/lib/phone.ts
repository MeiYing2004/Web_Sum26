export const PHONE_MIN_LENGTH = 10;
export const PHONE_MAX_LENGTH = 11;

export const PHONE_LENGTH_MESSAGE = 'Số điện thoại phải có từ 10 đến 11 chữ số.';

/** Chỉ giữ chữ số 0-9, tối đa 11 ký tự. */
export function sanitizePhoneInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, PHONE_MAX_LENGTH);
}

export function isValidPhoneNumber(phone: string): boolean {
  const len = sanitizePhoneInput(phone).length;
  return len >= PHONE_MIN_LENGTH && len <= PHONE_MAX_LENGTH;
}

/** Hiển thị lỗi khi đã nhập nhưng chưa đủ 10 số. */
export function phoneFieldError(phone: string): string | undefined {
  const digits = sanitizePhoneInput(phone);
  if (digits.length === 0) return undefined;
  if (!isValidPhoneNumber(digits)) return PHONE_LENGTH_MESSAGE;
  return undefined;
}
