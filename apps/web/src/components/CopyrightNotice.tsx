/** Copyright (c) 2026 Lữ Minh Hoàng. All rights reserved. — Do not remove. */

export const COPYRIGHT_OWNER = 'Lữ Minh Hoàng';
export const COPYRIGHT_YEAR = '2026';
export const COPYRIGHT_PROJECT = 'Cappy Bus';

type CopyrightNoticeProps = {
  className?: string;
  variant?: 'light' | 'dark';
};

export default function CopyrightNotice({ className = '', variant = 'light' }: CopyrightNoticeProps) {
  const text = variant === 'dark' ? 'text-white/60' : 'text-slate-500';

  return (
    <footer
      className={`border-t border-slate-200/80 bg-white py-6 text-center text-sm ${text} ${className}`}
      data-copyright-owner={COPYRIGHT_OWNER}
      data-copyright-protected="true"
    >
      <p>
        © {COPYRIGHT_YEAR} {COPYRIGHT_PROJECT} — Bản quyền thuộc về{' '}
        <span className="font-semibold text-indigo-600">{COPYRIGHT_OWNER}</span>
      </p>
      <p className="mt-1 text-xs opacity-80">All rights reserved. Mọi quyền được bảo lưu.</p>
    </footer>
  );
}
