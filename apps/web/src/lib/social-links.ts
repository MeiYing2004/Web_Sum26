/** Liên kết mạng xã hội chính thức — cập nhật tại đây, không hard-code trong component */

export type SocialPlatform = 'facebook' | 'zalo' | 'youtube';

export type SocialLinkConfig = {
  platform: SocialPlatform;
  /** Để trống hoặc null để ẩn icon (vd. chưa có kênh YouTube) */
  url: string | null;
  ariaLabel: string;
};

export const SOCIAL_LINKS: readonly SocialLinkConfig[] = [
  {
    platform: 'facebook',
    url: 'https://www.facebook.com/lu.hoang.99999',
    ariaLabel: 'Facebook Cappy Bus',
  },
  {
    platform: 'zalo',
    url: 'https://zalo.me/0937418564',
    ariaLabel: 'Zalo Cappy Bus',
  },
  {
    platform: 'youtube',
    url: null,
    ariaLabel: 'YouTube Cappy Bus',
  },
] as const;

/** Chỉ trả về link đang bật (có URL hợp lệ) */
export function getActiveSocialLinks(): SocialLinkConfig[] {
  return SOCIAL_LINKS.filter((link) => {
    const href = link.url?.trim();
    return !!href && href !== '#' && !href.startsWith('javascript:');
  });
}
