import { getActiveSocialLinks, type SocialPlatform } from '@/lib/social-links';
import { cn } from '@/lib/cn';

const HOVER_STYLES: Record<SocialPlatform, string> = {
  facebook: 'hover:border-[#1877F2]/40 hover:bg-[#1877F2]/10 hover:text-[#1877F2]',
  zalo: 'hover:border-[#0068FF]/40 hover:bg-[#0068FF]/10 hover:text-[#0068FF]',
  youtube: 'hover:border-[#FF0000]/40 hover:bg-[#FF0000]/10 hover:text-[#FF0000]',
};

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === 'facebook') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (platform === 'zalo') {
    return <span className="text-sm font-bold leading-none">Z</span>;
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

type SocialLinksProps = {
  className?: string;
};

/** Icon mạng xã hội — đọc URL từ config, ẩn link chưa có */
export function SocialLinks({ className }: SocialLinksProps) {
  const links = getActiveSocialLinks();

  if (links.length === 0) return null;

  return (
    <div className={cn('flex gap-3', className)}>
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.ariaLabel}
          className={cn(
            'flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border text-ink-muted transition-all duration-200 hover:scale-105',
            HOVER_STYLES[link.platform]
          )}
        >
          <SocialIcon platform={link.platform} />
        </a>
      ))}
    </div>
  );
}
