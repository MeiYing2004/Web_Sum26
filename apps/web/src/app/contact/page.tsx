'use client';

import { useState } from 'react';
import { Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { PageShell, PageHeader } from '@/components/ui/PageShell';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { CONTACT_INFO } from '@/lib/marketing-content';
import { showToast } from '@/lib/toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setSending(true);
    // Mô phỏng gửi form — không gọi API backend
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    showToast.success('Đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất.');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
  }

  return (
    <div className="mesh-bg min-h-screen">
      <PageShell>
        <PageHeader title="Liên hệ" description="Chúng tôi luôn sẵn sàng hỗ trợ bạn" />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Thông tin liên hệ */}
          <div className="space-y-4">
            <Card variant="solid" padding="md" className="card-hover-lift">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-micro font-semibold uppercase text-ink-subtle">Hotline</p>
                  <a
                    href={`tel:${CONTACT_INFO.hotline.replace(/\s/g, '')}`}
                    className="text-subtitle font-bold text-brand hover:underline"
                  >
                    {CONTACT_INFO.hotline}
                  </a>
                </div>
              </div>
            </Card>

            <Card variant="solid" padding="md" className="card-hover-lift">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-micro font-semibold uppercase text-ink-subtle">Email</p>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-body font-semibold text-brand hover:underline"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </div>
            </Card>

            <Card variant="solid" padding="md" className="card-hover-lift">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-micro font-semibold uppercase text-ink-subtle">Địa chỉ</p>
                  <p className="text-body text-ink-muted">{CONTACT_INFO.address}</p>
                </div>
              </div>
            </Card>

            {/* Google Map */}
            <Card variant="solid" padding="none" className="overflow-hidden">
              <iframe
                title="Vị trí Cappy Bus"
                src={CONTACT_INFO.mapEmbedUrl}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </Card>
          </div>

          {/* Form liên hệ */}
          <Card variant="solid" padding="lg">
            <h2 className="text-subtitle font-semibold text-ink">Gửi tin nhắn</h2>
            <p className="mt-1 text-caption text-ink-muted">Chúng tôi phản hồi trong vòng 24 giờ</p>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
              <Field label="Họ và tên *" htmlFor="contactName">
                <Input
                  id="contactName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </Field>
              <Field label="Email *" htmlFor="contactEmail">
                <Input
                  id="contactEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </Field>
              <Field label="Số điện thoại" htmlFor="contactPhone">
                <Input
                  id="contactPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                />
              </Field>
              <Field label="Nội dung *" htmlFor="contactMessage">
                <Textarea
                  id="contactMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nội dung cần hỗ trợ..."
                  rows={4}
                  required
                />
              </Field>
              <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Gửi tin nhắn
              </Button>
            </form>
          </Card>
        </div>
      </PageShell>
    </div>
  );
}
