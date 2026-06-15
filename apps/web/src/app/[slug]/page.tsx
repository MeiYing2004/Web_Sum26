import type { Metadata } from 'next';
import { parseRouteSlug, buildSeoTitle, buildSeoDescription, SITE_URL } from '@/lib/seo';
import RouteSearchClient from '../ve-xe-[slug]/RouteSearchClient';

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
  if (!slug.startsWith('ve-xe-')) return null;
  const parsed = parseRouteSlug(slug);
  if (!parsed) return <div>URL không hợp lệ</div>;

  return (
    <RouteSearchClient
      initialOrigin={parsed.origin}
      initialDestination={parsed.destination}
      initialDate={parsed.date}
    />
  );
}
