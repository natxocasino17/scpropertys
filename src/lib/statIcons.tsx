import {
  Home, Building2, MapPin, Map, Handshake, Star, Award, BadgeCheck,
  ShieldCheck, Clock, Calendar, Globe, Key, TrendingUp, Users, Heart,
  Gem, Waves, TreePalm, Sun, ThumbsUp, Camera, Sparkles, Trophy, Eye,
  type LucideIcon,
} from 'lucide-react'

/**
 * Curated minimalist icons for the home "stats" strip.
 * 'stars' is special — it renders a 5-star rating instead of a single icon.
 */
export const STAT_ICONS: Record<string, LucideIcon> = {
  home: Home,
  building: Building2,
  pin: MapPin,
  map: Map,
  handshake: Handshake,
  award: Award,
  badge: BadgeCheck,
  shield: ShieldCheck,
  clock: Clock,
  calendar: Calendar,
  globe: Globe,
  key: Key,
  trending: TrendingUp,
  users: Users,
  heart: Heart,
  gem: Gem,
  waves: Waves,
  palm: TreePalm,
  sun: Sun,
  thumbs: ThumbsUp,
  camera: Camera,
  sparkles: Sparkles,
  trophy: Trophy,
  star: Star,
  eye: Eye,
}

/** All selectable icon keys for the admin picker ('stars' = 5-star rating). */
export const STAT_ICON_KEYS = ['stars', ...Object.keys(STAT_ICONS)]
