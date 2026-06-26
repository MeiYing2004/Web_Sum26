import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Bus,
  CreditCard,
  Search,
  Shield,
  Target,
  Ticket,
  Users,
} from 'lucide-react';
import { PageShell, PageHeader } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CONTACT_INFO } from '@/lib/marketing-content';

export const metadata: Metadata = {
  title: 'Giới thiệu — Cappy Bus',
  description:
    'Tìm hiểu về Cappy Bus — sứ mệnh, tầm nhìn, đội ngũ và quy trình đặt vé xe khách liên tỉnh.',
};

const TEAM = [
  { name: 'Lữ Minh Hoàng', role: 'Founder & CEO', desc: 'Định hướng chiến lược và phát triển sản phẩm' },
  { name: 'Nguyễn Thị Lan', role: 'Head of Operations', desc: 'Vận hành và đối tác nhà xe' },
  { name: 'Trần Văn Đức', role: 'Tech Lead', desc: 'Kiến trúc hệ thống và trải nghiệm người dùng' },
  { name: 'Phạm Minh Anh', role: 'Customer Success', desc: 'Hỗ trợ khách hàng 24/7' },
];

const BOOKING_STEPS = [
  { step: 1, title: 'Tìm chuyến', desc: 'Nhập điểm đi, điểm đến và ngày khởi hành', icon: Search },
  { step: 2, title: 'Chọn ghế', desc: 'Xem sơ đồ ghế và chọn vị trí yêu thích', icon: Bus },
  { step: 3, title: 'Nhập thông tin', desc: 'Điền thông tin hành khách và liên hệ', icon: Users },
  { step: 4, title: 'Thanh toán', desc: 'Thanh toán an toàn và nhận vé điện tử', icon: CreditCard },
  { step: 5, title: 'Nhận vé', desc: 'Vé gửi qua email/SMS, check-in tại bến', icon: Ticket },
];

export default function AboutPage() {
  return (
    <div className="mesh-bg min-h-screen">
      <PageShell>
        <PageHeader
          title="Giới thiệu Cappy Bus"
          description="Nền tảng đặt vé xe khách liên tỉnh — nhanh chóng, an tâm, minh bạch"
        />

        {/* Giới thiệu hệ thống */}
        <Card variant="solid" padding="lg" className="mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-subtitle font-semibold text-ink">Giới thiệu hệ thống</h2>
              <p className="mt-2 text-body leading-relaxed text-ink-muted">
                Cappy Bus kết nối hành khách với hàng trăm nhà xe uy tín trên toàn quốc. Hệ thống cho
                phép so sánh giá, chọn ghế trực quan, thanh toán online và nhận vé điện tử ngay lập tức —
                tất cả trên một nền tảng duy nhất.
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Sứ mệnh */}
          <Card variant="solid" padding="lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-subtitle font-semibold text-ink">Sứ mệnh</h2>
            <p className="mt-2 text-body leading-relaxed text-ink-muted">
              Mang đến trải nghiệm đặt vé xe khách hiện đại, minh bạch và tiện lợi cho mọi người Việt
              Nam — giúp hành trình bắt đầu từ việc chọn chuyến xe.
            </p>
          </Card>

          {/* Tầm nhìn */}
          <Card variant="solid" padding="lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-subtitle font-semibold text-ink">Tầm nhìn</h2>
            <p className="mt-2 text-body leading-relaxed text-ink-muted">
              Trở thành nền tảng đặt vé xe khách số 1 Việt Nam, kết nối 63 tỉnh thành với công nghệ
              tiên tiến và dịch vụ khách hàng xuất sắc.
            </p>
          </Card>
        </div>

        {/* Đội ngũ */}
        <section className="mb-8">
          <h2 className="section-heading mb-6">Đội ngũ</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <Card key={member.name} variant="solid" padding="md" className="card-hover-lift">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
                  {member.name.charAt(0)}
                </div>
                <h3 className="mt-3 font-semibold text-ink">{member.name}</h3>
                <p className="text-caption font-medium text-brand">{member.role}</p>
                <p className="mt-1 text-micro text-ink-muted">{member.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Quy trình đặt vé */}
        <section className="mb-8">
          <h2 className="section-heading mb-6">Quy trình đặt vé</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BOOKING_STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.step} variant="solid" padding="md" className="card-hover-lift text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {s.step}
                  </div>
                  <Icon className="mx-auto mt-3 h-5 w-5 text-brand" />
                  <h3 className="mt-2 font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1 text-micro text-ink-muted">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Chính sách */}
        <section id="refund" className="mb-6 scroll-mt-24">
          <Card variant="flat" padding="lg" className="mb-4">
            <h2 className="text-subtitle font-semibold text-ink">Chính sách hoàn vé</h2>
            <p className="mt-2 text-body text-ink-muted">
              Hoàn vé theo quy định của từng nhà xe. Thường hoàn 50–100% nếu hủy trước 24h. Liên hệ
              hotline {CONTACT_INFO.hotline} để được hỗ trợ.
            </p>
          </Card>
        </section>
        <section id="terms" className="mb-6 scroll-mt-24">
          <Card variant="flat" padding="lg" className="mb-4">
            <h2 className="text-subtitle font-semibold text-ink">Điều khoản sử dụng</h2>
            <p className="mt-2 text-body text-ink-muted">
              Bằng việc sử dụng Cappy Bus, bạn đồng ý với điều khoản dịch vụ, chính sách bảo mật và
              quy định của nhà xe liên quan.
            </p>
          </Card>
        </section>
        <section id="privacy" className="mb-8 scroll-mt-24">
          <Card variant="flat" padding="lg">
            <h2 className="text-subtitle font-semibold text-ink">Chính sách bảo mật</h2>
            <p className="mt-2 text-body text-ink-muted">
              Chúng tôi bảo vệ thông tin cá nhân của bạn theo tiêu chuẩn bảo mật cao nhất. Dữ liệu chỉ
              được sử dụng cho mục đích đặt vé và hỗ trợ khách hàng.
            </p>
          </Card>
        </section>

        <div className="text-center">
          <Link href="/">
            <Button>
              Tìm chuyến ngay
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </PageShell>
    </div>
  );
}
