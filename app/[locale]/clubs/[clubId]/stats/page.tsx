import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { StatsPageClient } from './stats-page-client'

interface StatsPageProps {
  params: Promise<{
    locale: string
    clubId: string
  }>
}

export async function generateMetadata({
  params,
}: StatsPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'statistics' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function StatsPage({ params }: StatsPageProps) {
  const { locale, clubId } = await params

  return <StatsPageClient locale={locale} clubId={clubId} />
}
