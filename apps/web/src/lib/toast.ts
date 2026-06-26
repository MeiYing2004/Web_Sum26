/** Toast helpers — thay thế alert() bằng react-hot-toast */

import toast from 'react-hot-toast';

export const showToast = {
  bookingSuccess: (msg = 'Đặt vé thành công!') => toast.success(msg),
  paymentSuccess: (msg = 'Thanh toán thành công!') => toast.success(msg),
  copied: (label = 'mã') => toast.success(`Đã sao chép ${label}`),
  deleted: (msg = 'Đã xóa') => toast.success(msg),
  updated: (msg = 'Đã cập nhật') => toast.success(msg),
  checkInSuccess: (msg = 'Check-in thành công!') => toast.success(msg),
  error: (msg = 'Lỗi hệ thống. Vui lòng thử lại.') => toast.error(msg),
  info: (msg: string) => toast(msg),
  success: (msg: string) => toast.success(msg),
};
