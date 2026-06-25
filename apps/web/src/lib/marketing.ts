/** Static marketing content for homepage — no API dependency */

export const FEATURED_OPERATORS = [
  { name: 'Phương Trang', rating: 4.8, trips: '120+ chuyến/ngày', badge: 'Bán chạy' },
  { name: 'Thành Bưởi', rating: 4.7, trips: '80+ chuyến/ngày', badge: 'Uy tín' },
  { name: 'Hoàng Long', rating: 4.6, trips: '60+ chuyến/ngày', badge: 'Giá tốt' },
  { name: 'Mai Linh Express', rating: 4.9, trips: '45+ chuyến/ngày', badge: 'Premium' },
] as const;

export const FEATURED_DESTINATIONS = [
  { city: 'Đà Lạt', tagline: 'Thành phố ngàn hoa', deals: 12 },
  { city: 'Nha Trang', tagline: 'Biển xanh cát trắng', deals: 8 },
  { city: 'Đà Nẵng', tagline: 'Cầu Vàng & biển Mỹ Khê', deals: 15 },
  { city: 'Hà Nội', tagline: '36 phố phường', deals: 20 },
  { city: 'Cần Thơ', tagline: 'Chợ nổi Cái Răng', deals: 6 },
  { city: 'TP.HCM', tagline: 'Sài Gòn không ngủ', deals: 25 },
] as const;

export const PROMOTIONS = [
  {
    kind: 'new-user' as const,
    eyebrow: 'Khách hàng mới',
    title: 'Giảm 15% chuyến đầu',
    desc: 'Áp dụng cho khách hàng mới đặt vé lần đầu trên Cappy Bus.',
    code: 'CAPPY15',
    discountValue: 'Giảm 15%',
    validUntil: '31/12/2026',
    condition: 'Đơn từ 200.000đ, áp dụng 1 lần/tài khoản.',
    maxDiscount: 'Tối đa 120.000đ',
  },
  {
    kind: 'round-trip' as const,
    eyebrow: 'Combo khứ hồi',
    title: 'Đặt đi về tiết kiệm hơn',
    desc: 'Giảm thêm khi đặt vé chiều đi và chiều về trong cùng một đơn.',
    code: 'ROUND10',
    discountValue: 'Giảm 10%',
    validUntil: '15/01/2027',
    condition: 'Áp dụng cho tuyến khứ hồi cùng nhà xe.',
    maxDiscount: 'Tối đa 180.000đ',
  },
  {
    kind: 'weekend' as const,
    eyebrow: 'Ưu đãi cuối tuần',
    title: 'Vi vu cuối tuần giá tốt',
    desc: 'Hàng trăm chuyến từ Thứ 6 đến Chủ nhật có giá ưu đãi riêng.',
    code: 'WEEKEND',
    discountValue: 'Giảm 80.000đ',
    validUntil: '31/12/2026',
    condition: 'Áp dụng cho một số tuyến chọn lọc vào cuối tuần.',
    maxDiscount: 'Tối đa 80.000đ',
  },
] as const;

export type Promotion = (typeof PROMOTIONS)[number];

export const TESTIMONIALS = [
  {
    name: 'Minh Anh',
    route: 'TP.HCM → Đà Lạt',
    rating: 5,
    text: 'Đặt vé nhanh, ghế đúng như sơ đồ. QR lên xe rất tiện, không cần in vé.',
    avatar: 'MA',
  },
  {
    name: 'Tuấn Kiệt',
    route: 'Hà Nội → Đà Nẵng',
    rating: 5,
    text: 'Giao diện rõ ràng, so sánh giá nhiều nhà xe. Thanh toán xong có vé ngay trong app.',
    avatar: 'TK',
  },
  {
    name: 'Lan Phương',
    route: 'TP.HCM → Nha Trang',
    rating: 4,
    text: 'Hỗ trợ tra cứu vé bằng mã rất nhanh. cappy gợi ý chuyến phù hợp buổi tối.',
    avatar: 'LP',
  },
] as const;

export const BUS_AMENITIES = ['WiFi', 'Nước uống', 'Chăn gối', 'USB', 'WC', 'TV'] as const;

/** Deterministic rating from operator name for display */
export function operatorRating(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % 100;
  return 4.3 + (hash % 7) / 10;
}
