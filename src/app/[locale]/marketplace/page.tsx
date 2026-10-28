import { getTranslations } from 'next-intl/server';
import { type Metadata } from 'next';
import MarketplaceClient from './MarketplaceClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('VisualIdentitiesForSale');
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  };
}

export default function MarketplacePage() {
  return <MarketplaceClient />;
}
