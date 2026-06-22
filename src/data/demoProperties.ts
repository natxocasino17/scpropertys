import type { Property } from '../types/property'

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`

/**
 * Demo properties (South Caribbean, Costa Rica).
 * Shown when Supabase is empty / not configured, so the site always looks alive.
 * Replace or delete them from the /admin panel once your real listings are loaded.
 */
export const demoProperties: Property[] = [
  {
    id: 'demo-1',
    slug: 'villa-azur-cocles',
    title_es: 'Villa Azur frente al mar',
    title_en: 'Villa Azur Oceanfront',
    description_es:
      'Una villa contemporánea de líneas limpias suspendida sobre la selva de Cocles, con vistas infinitas al mar Caribe. Grandes ventanales de piso a techo difuminan la frontera entre el interior y la naturaleza. Piscina de borde infinito, terrazas de madera tropical y acabados de autor. A pocos minutos de las mejores playas y restaurantes de Puerto Viejo.',
    description_en:
      'A contemporary villa with clean lines suspended over the Cocles jungle, with infinite views of the Caribbean sea. Floor-to-ceiling windows blur the line between indoors and nature. Infinity pool, tropical wood terraces and designer finishes. Minutes from the best beaches and restaurants of Puerto Viejo.',
    type: 'villa',
    status: 'available',
    price: 895000,
    zone: 'Cocles',
    has_dwelling: true,
    land_size: 2100,
    construction_size: 340,
    bedrooms: 4,
    bathrooms: 4,
    amenities: ['ocean_view', 'pool', 'furnished', 'solar', 'garden', 'parking', 'security', 'wifi', 'ac', 'titled'],
    images: [
      img('photo-1613490493576-7fde63acd811'),
      img('photo-1600585154340-be6161a56a0c'),
      img('photo-1582268611958-ebfd161ef9cf'),
      img('photo-1600607687939-ce8a6c25118c'),
    ],
    video_url: null,
    lat: 9.6447,
    lng: -82.7385,
    featured: true,
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'demo-2',
    slug: 'lote-playa-manzanillo',
    title_es: 'Lote frente a la playa de Manzanillo',
    title_en: 'Beachfront Lot in Manzanillo',
    description_es:
      'Una rara oportunidad: terreno titulado a pasos de la arena blanca de Manzanillo, dentro de un entorno de selva protegida. Ideal para construir la casa de tus sueños o un proyecto boutique. Con acceso a agua y electricidad en lindero. Atardeceres y biodiversidad únicos del Refugio Gandoca-Manzanillo.',
    description_en:
      'A rare opportunity: titled land steps from the white sand of Manzanillo, within a protected jungle setting. Ideal to build your dream home or a boutique project. Water and electricity access at the property line. Unique sunsets and biodiversity of the Gandoca-Manzanillo Refuge.',
    type: 'lot',
    status: 'available',
    price: 320000,
    zone: 'Manzanillo',
    has_dwelling: false,
    land_size: 3500,
    construction_size: 0,
    bedrooms: 0,
    bathrooms: 0,
    amenities: ['beach_access', 'ocean_view', 'jungle', 'titled', 'water', 'electricity'],
    images: [
      img('photo-1505228395891-9a51e7e86bf6'),
      img('photo-1507525428034-b723cf961d3e'),
      img('photo-1441974231531-c6227db76b6e'),
    ],
    video_url: null,
    lat: 9.6314,
    lng: -82.6553,
    featured: true,
    created_at: '2026-05-12T10:00:00Z',
  },
  {
    id: 'demo-3',
    slug: 'casa-selva-puerto-viejo',
    title_es: 'Casa de la Selva',
    title_en: 'Jungle House',
    description_es:
      'Refugio de madera y cristal inmerso en la selva de Puerto Viejo, a 5 minutos en bicicleta de la playa. Diseño bioclimático con energía solar, jardín tropical maduro y un río natural en la propiedad. Perfecta como residencia, alquiler vacacional de alto valor o eco-retiro.',
    description_en:
      'A wood-and-glass retreat immersed in the Puerto Viejo jungle, a 5-minute bike ride from the beach. Bioclimatic design with solar power, a mature tropical garden and a natural river on the property. Perfect as a residence, high-value vacation rental or eco-retreat.',
    type: 'house',
    status: 'reserved',
    price: 465000,
    zone: 'Puerto Viejo',
    has_dwelling: true,
    land_size: 1800,
    construction_size: 210,
    bedrooms: 3,
    bathrooms: 2,
    amenities: ['jungle', 'river', 'solar', 'furnished', 'garden', 'parking', 'wifi', 'titled'],
    images: [
      img('photo-1512917774080-9991f1c4c750'),
      img('photo-1600596542815-ffad4c1539a9'),
      img('photo-1449844908441-8829872d2607'),
    ],
    video_url: null,
    lat: 9.6553,
    lng: -82.7541,
    featured: true,
    created_at: '2026-04-28T10:00:00Z',
  },
]
