import Image from 'next/image';
import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  showText?: boolean;
  size?: number;
  textClassName?: string;
  className?: string;
};

export function BrandLogo({
  href = '/',
  showText = true,
  size = 44,
  textClassName = 'text-lg font-bold tracking-tight text-amber-950 sm:text-xl',
  className = '',
}: BrandLogoProps) {
  const mark = (
    <>
      <Image
        src="/images/cappy-bus-logo.png"
        alt="Cappy Bus"
        width={size}
        height={size}
        priority
        className="h-auto w-auto object-contain"
        style={{ width: size, height: size }}
      />
      {showText && <span className={textClassName}>Cappy Bus</span>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90 ${className}`}
      >
        {mark}
      </Link>
    );
  }

  return <div className={`flex items-center gap-2.5 ${className}`}>{mark}</div>;
}
