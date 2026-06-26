import Link from 'next/link';
import { Bus, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Trang 404 — thiết kế thân thiện */
export default function NotFound() {
  return (
    <div className="mesh-bg flex min-h-[calc(100vh-80px)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 text-brand">
          <Bus className="h-10 w-10" />
        </div>
        <p className="mt-6 text-6xl font-black tracking-tight text-brand">404</p>
        <h1 className="mt-2 text-title font-semibold text-ink">Không tìm thấy trang</h1>
        <p className="mt-2 max-w-md text-body text-ink-muted">
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển. Hãy quay về trang chủ hoặc tìm
          chuyến xe.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg">
              <Home className="h-4 w-4" />
              Về trang chủ
            </Button>
          </Link>
          <Link href="/trips">
            <Button variant="secondary" size="lg">
              <Search className="h-4 w-4" />
              Tìm chuyến
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
