import { PublicLayout } from '../components/layout/PublicLayout'
import { Hero } from '../components/home/Hero'
import { Stats } from '../components/home/Stats'
import { FeaturedProperties } from '../components/home/FeaturedProperties'
import { Services } from '../components/home/Services'
import { CTASection } from '../components/home/CTASection'
import { useProperties } from '../hooks/useProperties'

export default function HomePage() {
  const { properties } = useProperties()
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
