export type PropertyStatus = 'available' | 'reserved' | 'sold'

export type PropertyType =
  | 'house'
  | 'villa'
  | 'apartment'
  | 'lot'
  | 'commercial'

export type AmenityKey =
  | 'ocean_view'
  | 'beach_access'
  | 'pool'
  | 'furnished'
  | 'solar'
  | 'garden'
  | 'parking'
  | 'security'
  | 'wifi'
  | 'ac'
  | 'river'
  | 'jungle'
  | 'titled'
  | 'water'
  | 'electricity'

export interface Property {
  id: string
  slug: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  type: PropertyType
  status: PropertyStatus
  /** Price in USD */
  price: number
  /** Zone / town, e.g. "Puerto Viejo", "Cocles", "Manzanillo" */
  zone: string
  /** True if the property includes a dwelling (vivienda) */
  has_dwelling: boolean
  land_size: number // m²
  construction_size: number // m² (0 if just a lot)
  bedrooms: number
  bathrooms: number
  amenities: AmenityKey[]
  images: string[]
  video_url?: string | null
  lat?: number | null
  lng?: number | null
  featured: boolean
  created_at?: string
}

export type PropertyInput = Omit<Property, 'id' | 'created_at'>

export interface Lead {
  id?: string
  name: string
  email: string
  phone?: string
  message: string
  property_id?: string | null
  property_title?: string | null
  created_at?: string
  read?: boolean
}
