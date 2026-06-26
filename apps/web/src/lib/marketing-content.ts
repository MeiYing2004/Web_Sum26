/** Nội dung marketing tĩnh — không phụ thuộc API */

import {
  Clock,
  CreditCard,
  Headphones,
  RefreshCw,
  Ticket,
} from 'lucide-react';

/** Đánh giá mẫu khi API chưa có dữ liệu */
export type SampleReview = {
  id: string;
  reviewerName: string;
  routeLabel: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const SAMPLE_REVIEWS: SampleReview[] = [
  {
    id: 'r1',
    reviewerName: 'Nguyễn Văn A',
    routeLabel: 'TP.HCM → Đà Lạt',
    rating: 5,
    comment: 'Xe sạch, tài xế vui vẻ, đặt vé rất nhanh.',
    createdAt: '2026-06-20',
  },
  {
    id: 'r2',
    reviewerName: 'Trần Thị B',
    routeLabel: 'Hà Nội → Nha Trang',
    rating: 5,
    comment: 'Ghế thoải mái, đúng giờ, sẽ đặt lại lần sau.',
    createdAt: '2026-06-18',
  },
  {
    id: 'r3',
    reviewerName: 'Lê Minh C',
    routeLabel: 'TP.HCM → Cần Thơ',
    rating: 4,
    comment: 'Thanh toán online tiện lợi, nhận vé ngay sau khi đặt.',
    createdAt: '2026-06-15',
  },
  {
    id: 'r4',
    reviewerName: 'Phạm Thu D',
    routeLabel: 'Đà Nẵng → Huế',
    rating: 5,
    comment: 'Hỗ trợ nhiệt tình qua hotline, giải đáp nhanh mọi thắc mắc.',
    createdAt: '2026-06-12',
  },
  {
    id: 'r5',
    reviewerName: 'Hoàng Văn E',
    routeLabel: 'TP.HCM → Vũng Tàu',
    rating: 4,
    comment: 'Giá hợp lý, chọn ghế trực quan, không cần ra bến.',
    createdAt: '2026-06-10',
  },
  {
    id: 'r6',
    reviewerName: 'Võ Thị F',
    routeLabel: 'Cần Thơ → TP.HCM',
    rating: 5,
    comment: 'Xe có WiFi ổn định, chuyến đi êm ái từ đầu đến cuối.',
    createdAt: '2026-06-08',
  },
];

/** Lý do chọn Cappy Bus */
export const WHY_CHOOSE_US = [
  {
    title: 'Đặt vé nhanh',
    description: 'Tìm chuyến và hoàn tất đặt vé chỉ trong vài phút.',
    icon: Clock,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Bảo mật SSL, nhiều phương thức thanh toán tiện lợi.',
    icon: CreditCard,
  },
  {
    title: 'Hoàn vé linh hoạt',
    description: 'Chính sách hoàn vé rõ ràng, xử lý nhanh chóng.',
    icon: RefreshCw,
  },
  {
    title: 'Chọn ghế trực tiếp',
    description: 'Sơ đồ ghế trực quan, chọn vị trí yêu thích ngay trên web.',
    icon: Ticket,
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ sẵn sàng qua hotline, email và chat.',
    icon: Headphones,
  },
] as const;

/** Câu hỏi thường gặp */
export const FAQ_ITEMS = [
  {
    question: 'Làm sao hoàn vé?',
    answer:
      'Bạn có thể yêu cầu hoàn vé trong mục "Vé của tôi" hoặc liên hệ hotline. Thời gian hoàn tiền tùy theo chính sách của nhà xe và phương thức thanh toán (thường 3–7 ngày làm việc).',
  },
  {
    question: 'Có đổi giờ được không?',
    answer:
      'Tùy chính sách nhà xe, bạn có thể đổi sang chuyến khác cùng tuyến trước giờ khởi hành. Liên hệ hỗ trợ hoặc thao tác trong chi tiết vé để được hướng dẫn cụ thể.',
  },
  {
    question: 'Xe có Wifi không?',
    answer:
      'Hầu hết xe limousine và giường nằm đều có WiFi miễn phí. Thông tin tiện ích được hiển thị trên thẻ chuyến xe khi tìm kiếm.',
  },
  {
    question: 'Có xuất hóa đơn không?',
    answer:
      'Có. Sau khi thanh toán, bạn có thể yêu cầu hóa đơn VAT qua email hỗ trợ hoặc trong mục chi tiết đơn hàng.',
  },
  {
    question: 'Có thể mang thú cưng không?',
    answer:
      'Tùy quy định từng nhà xe. Vui lòng liên hệ hotline trước khi đặt để xác nhận. Một số tuyến cho phép thú cưng nhỏ trong lồng vận chuyển.',
  },
] as const;

/** Thông tin liên hệ */
export const CONTACT_INFO = {
  hotline: '0937418564',
  email: 'cappyboy2004@gmail.com',
  address: 'XXX, TP. Thủ Đức, TP.HCM',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=XXX,+TP.+Th%E1%BB%A7+%C4%90%E1%BB%A9c,+TP.HCM&hl=vi&z=14&output=embed',
} as const;

/** Tính số ngày còn lại — hỗ trợ dd/mm/yyyy hoặc ISO */
export function daysUntilExpiry(validUntil: string): number {
  let expiry: Date;
  const parts = validUntil.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number);
    expiry = new Date(y, m - 1, d, 23, 59, 59);
  } else {
    expiry = new Date(validUntil);
    if (Number.isNaN(expiry.getTime())) return 999;
    expiry.setHours(23, 59, 59, 999);
  }
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/** Phần trăm đã sử dụng voucher (mô phỏng theo mã) */
export function voucherUsagePercent(code: string): number {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash + code.charCodeAt(i) * (i + 1)) % 100;
  return 20 + (hash % 60);
}
