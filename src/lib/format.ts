import { siteConfig } from '../config/siteConfig'
import { getSettings } from './settings'

export function formatPrice(value: number): string {
  if (!value || value <= 0) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: siteConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatArea(m2: number): string {
  if (!m2 || m2 <= 0) return '—'
  return `${new Intl.NumberFormat('en-US').format(m2)} m²`
}

/** Build a WhatsApp deep link with a pre-filled message. Uses the live, admin-editable number. */
export function whatsappLink(message: string): string {
  const raw = getSettings().whatsapp || siteConfig.contact.whatsapp
  const num = raw.replace(/\D/g, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`
}

export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
