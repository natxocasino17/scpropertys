import { PublicLayout } from '../components/layout/PublicLayout'
import { Hero } from '../components/home/Hero'
import { Stats } from '../components/home/Stats'
import { FeaturedProperties } from '../components/home/FeaturedProperties'
import { Services } from '../components/home/Services'
import { CTASection } from '../components/home/CTASection'
import { useProperties } from '../hooks/useProperties'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useSeo } from '../lib/seo'

export default function HomePage() {
  const { properties } = useProperties()
  const { settings } = useSettings()
  const { lang } = useLanguage()

  useSeo({
    title: `${settings.brand} ${settings.brandSuffix} — ${
      lang === 'es' ? 'Propiedades en el Caribe Sur, Costa Rica' : 'Properties in the South Caribbean, Costa Rica'
    }`,
    description: lang === 'es' ? settings.heroSubtitleEs : settings.heroSubtitleEn,
    image: settings.heroImage,
  })

  return (
    <PublicLayout>
      <Hero />
      <Stats count={properties.length} />
      <FeaturedProperties properties={properties} />
      <Services />
      <CTASection />
    </PublicLayout>
  )
}
