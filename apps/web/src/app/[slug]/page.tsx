import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { parseRouteSlug, buildSeoTitle, buildSeoDescription, SITE_URL } from '@/lib/seo';
import { buildTripsSearchUrl } from '@/lib/trip-search';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug.startsWith('ve-xe-')) return { title: 'Cappy Bus' };
  const parsed = parseRouteSlug(slug);
  if (!parsed) return { title: 'Tìm chuyến xe' };

  const title = buildSeoTitle(parsed.origin, parsed.destination, parsed.date);
  const description = buildSeoDescription(parsed.origin, parsed.destination);
  const canonical = `${SITE_URL}/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website', locale: 'vi_VN' },
  };
}

export const revalidate = 300;

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  if (!slug.startsWith('ve-xe-')) {
    redirect('/trips');
  }
  const parsed = parseRouteSlug(slug);
  if (!parsed) {
    redirect('/trips');
  }

  redirect(buildTripsSearchUrl(parsed.origin, parsed.destination, parsed.date));
}
