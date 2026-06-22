import {
  Waves,
  Umbrella,
  Droplets,
  Sofa,
  Sun,
  Trees,
  Car,
  ShieldCheck,
  Wifi,
  Snowflake,
  Sailboat,
  Leaf,
  FileCheck2,
  Droplet,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { AmenityKey, PropertyType } from '../types/property'
import { Home, Building2, Landmark, MapPinned, Hotel } from 'lucide-react'

export const amenityIcon: Record<AmenityKey, LucideIcon> = {
  ocean_view: Waves,
  beach_access: Umbrella,
  pool: Droplets,
  furnished: Sofa,
  solar: Sun,
  garden: Trees,
  parking: Car,
  security: ShieldCheck,
  wifi: Wifi,
  ac: Snowflake,
  river: Sailboat,
  jungle: Leaf,
  titled: FileCheck2,
  water: Droplet,
  electricity: Zap,
}

export const typeIcon: Record<PropertyType, LucideIcon> = {
  house: Home,
  villa: Hotel,
  apartment: Building2,
  lot: MapPinned,
  commercial: Landmark,
}
