import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

const DEFAULT_DESCRIPTION =
  'Hand-crafted flower bouquets delivered with love in Sri Lanka. Natural flowers and hand-ribbon bouquets for every occasion.'

const ROUTE_META = {
  '/': { title: 'Premium Flower Bouquets' },
  '/shop': { title: 'Shop Bouquets' },
  '/gallery': { title: 'Our Gallery' },
  '/about': { title: 'About Us' },
  '/cart': { title: 'Your Cart' },
  '/checkout': { title: 'Checkout' },
  '/login': { title: 'Sign In' },
  '/register': { title: 'Create Account' },
}

export default function SEOHead({ title, description, image }) {
  const siteName = 'Bloom & Bliss'
  const fullTitle = title
    ? `${title} | ${siteName}`
    : `${siteName} — Premium Flower Bouquets in Sri Lanka`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta
        name="description"
        content={description || DEFAULT_DESCRIPTION}
      />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESCRIPTION} />
      <meta property="og:image" content={image || '/og-image.jpg'} />
      <meta property="og:type" content="website" />
    </Helmet>
  )
}

export function RouteSEO() {
  const { pathname } = useLocation()
  const { products } = useStore()

  const productMatch = pathname.match(/^\/product\/([^/]+)$/)
  if (productMatch) {
    const product = products.find((p) => p.id === productMatch[1])
    return (
      <SEOHead
        title={product?.name || 'Product Details'}
        description={product?.shortDescription || product?.description}
      />
    )
  }

  const meta = ROUTE_META[pathname] || {}
  return <SEOHead title={meta.title} description={meta.description} />
}
