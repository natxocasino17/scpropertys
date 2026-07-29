# Puerto Viejo Properties 🏝️

Sitio web de lujo (portafolio de propiedades) + panel de administración, para una inmobiliaria del **Caribe Sur de Costa Rica**.

- **Web pública**: inicio, portafolio con filtros, detalle de propiedad (galería, amenidades, mapa, video), nosotros, contacto.
- **Panel admin** (`/admin`): propiedades, mensajes recibidos, **ajustes del sitio** (todos los textos e imágenes) e historial de cambios. Protegido con email y contraseña.
- **Bilingüe** Español / Inglés · **Diseño** fondo negro + dorado champán · **100% responsive** (PC, tablet y móvil).

Stack: **React + Vite + TypeScript + Tailwind + Framer Motion**, datos con **Supabase**, mapas con **Leaflet/OpenStreetMap** (gratis), deploy en **Netlify**.

> 💡 El sitio funciona **sin configurar nada** mostrando propiedades de demostración. Para administrar tus propias propiedades, conecta Supabase (abajo).

---

## 1. Desarrollo local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera /dist
```

---

## 2. Cambiar textos, nombre, contacto y redes

Hay **dos niveles**, y casi siempre querrás el primero:

### a) Desde la web — `/admin/settings` ✅ recomendado

Con Supabase conectado, entra al panel y edita **desde el navegador, sin tocar código**:

- **Marca**: nombre y apellido de la marca.
- **Inicio**: imagen del hero, textos del hero, tira de estadísticas (con selector de iconos), sección de destacadas, servicios y el CTA final.
- **Títulos y subtítulos** de todas las secciones (portafolio, contacto, nosotros, footer).
- **Agentes**: foto, nombre, bio, WhatsApp, teléfono, Instagram, Facebook, TikTok y el email con el que entran al panel.
- **Zonas** de las propiedades (Puerto Viejo, Cocles, Manzanillo…).
- **Contacto**: WhatsApp, teléfono, email y ubicación.
- **Redes** del sitio y **coordenadas del mapa**.

Los cambios se guardan en Supabase y se ven al instante en la web pública.

### b) Valores por defecto — `src/config/siteConfig.ts`

Es el **fallback** que se usa cuando Supabase no está conectado (o antes de guardar ajustes por primera vez). También define el dominio para SEO:

```ts
brand: 'Puerto Viejo',
brandSuffix: 'Properties',
siteUrl: 'https://puertoviejo-properties.com',   // ← canónicos, sitemap, redes
contact: { whatsapp: '50600000000', email: 'info@…', … }
```

> ℹ️ `index.html` tiene los meta tags de arranque que leen WhatsApp y Facebook. Si cambias el nombre de la marca de verdad, cámbialo también ahí. Las vistas previas de cada propiedad se generan aparte (ver [§6](#6-vistas-previas-al-compartir-el-enlace-whatsapp-facebook)).

---

## 3. Conectar Supabase (gratis, compartido entre tus webs)

Como usas **una sola cuenta de Supabase para varias webs**, este proyecto usa el **prefijo `sc_`** en todas sus tablas (`sc_properties`, `sc_property_notes`, `sc_activity_log`, `sc_leads`, `sc_settings`) y el bucket `sc-media`, para **no chocar** con tus otros sitios.

1. Entra a tu proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**. Esto crea las tablas y la seguridad (RLS).
3. **Storage → New bucket** → nombre **`sc-media`** → activa **"Public bucket"**. (Las políticas de storage ya van incluidas en el SQL.)
4. **Authentication → Users → Add user** → crea tu usuario admin con **email y contraseña**. Ese será tu login del panel `/admin`.
5. **Project Settings → API** → copia `Project URL` y la `anon public key`.

Crea un archivo **`.env`** (copia de `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_DB_PREFIX=sc_
```

Reinicia `npm run dev`. Entra a `http://localhost:5173/admin` y haz login.

> ⚠️ Si **otra** de tus webs ya usa el prefijo `sc_`, cámbialo aquí (p. ej. `VITE_DB_PREFIX=sp_`) y ajusta los nombres en `schema.sql` antes de correrlo.

---

## 4. Agentes: quién aparece en cada propiedad

En `/admin/settings → Agentes` defines los agentes con su **email de login**. Cuando un agente entra al panel y crea una propiedad, **se le asigna automáticamente** (por coincidencia de email) y en la ficha pública se muestra **su** WhatsApp junto al de la agencia. También puedes reasignar la propiedad a mano desde el formulario.

Cada propiedad admite además **notas privadas**, visibles solo dentro del panel.

---

## 5. Fotos y video de las propiedades

En el panel admin, cada propiedad tiene un gestor de imágenes con dos opciones:

1. **Subir foto (PC/móvil)** → sube directo desde tu computadora o teléfono (en el celu abre la cámara/galería). La imagen se **comprime automáticamente** en el navegador antes de subir (una foto de 8 MB queda en ~300 KB), así tu **1 GB gratis de Supabase rinde para miles de fotos**. Las fotos de iPhone (**HEIC/HEIF**) se convierten a JPEG solas.
2. **Agregar URL** → pega el link de una imagen alojada en otro lado. Recomendado: [Cloudinary](https://cloudinary.com) (free 25 GB) si quieres no usar nada del storage de Supabase.

Puedes **arrastrar** para reordenar y marcar cualquier foto como **portada** (estrella ⭐).

Para **video**, pega el enlace de **YouTube o Vimeo** en el formulario: se valida al pegarlo, se ve una previsualización y en la web pública aparece justo debajo de las fotos.

---

## 6. Vistas previas al compartir el enlace (WhatsApp, Facebook…)

Al pegar el link de una propiedad en un grupo de WhatsApp se ve **la foto de portada, el título y el precio**:

> **Casa Vishram, Playa Chiquita — US$355,000**
> En un espacioso lote de 770m2 se encuentran dos casas independientes…
> 🔗 puertoviejo-properties.com

Esto **no funciona solo** en una web hecha con React: los rastreadores de WhatsApp y Facebook **no ejecutan JavaScript**, así que veían siempre los meta tags genéricos de `index.html` (nombre del sitio y ninguna foto). Lo resuelve [`netlify/edge-functions/og-preview.ts`](netlify/edge-functions/og-preview.ts): se ejecuta en el CDN de Netlify, busca la propiedad en Supabase por su `slug` y **reescribe el `<head>` antes de enviar el HTML**.

- **No hay que volver a desplegar** al agregar una propiedad o cambiar sus fotos: se lee en cada visita.
- Si Supabase no responde en 2,5 s, la página se sirve igual (nunca bloquea).
- Las páginas fijas (`/`, `/propiedades`, `/nosotros`, `/contacto`) usan la **imagen del hero** de `/admin/settings`.
- El panel `/admin` queda fuera.

**Para que la miniatura salga siempre:**

- La **primera foto** (la marcada con ⭐) es la que se ve — elegí una **horizontal**, se recorta mejor.
- WhatsApp ignora imágenes de **más de ~600 KB**. Las fotos subidas por el panel se comprimen a ~300 KB, así que no hay problema; si pegás una **URL** externa, que no sea enorme.
- WhatsApp **cachea** la vista previa de cada enlace por varias horas. Si cambiaste la foto y seguís viendo la vieja, probá agregando `?v=2` al final del link para forzar una nueva lectura.
- Para depurar Facebook/Instagram: [Sharing Debugger](https://developers.facebook.com/tools/debug/).

---

## 7. Desplegar en Netlify

1. Sube este repo a GitHub.
2. En [Netlify](https://netlify.com): **Add new site → Import from GitHub** → elige el repo.
   - Build command: `npm run build` · Publish directory: `dist` (ya está en `netlify.toml`).
3. **Site settings → Environment variables** → agrega las mismas 3 variables del `.env`:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DB_PREFIX`.
   > ⚠️ Son **obligatorias en Netlify**: además del build, la edge function de las vistas previas (§6) las lee **en cada visita** para buscar la propiedad. Sin ellas la web funciona, pero los links compartidos vuelven a salir sin foto.
4. **Deploy**. El archivo `netlify.toml` ya incluye el redirect SPA para que rutas como `/admin` o `/propiedades/...` funcionen al recargar, y registra la edge function `og-preview`.

---

## 8. Estructura

```
src/
  config/siteConfig.ts      ← valores por defecto (marca, contacto, dominio)
  i18n/                     ← textos ES / EN
  lib/                      ← supabase, propiedades, ajustes, formato, imágenes, video, SEO
  data/demoProperties.ts    ← propiedades de demostración
  context/                  ← Auth (login) y Settings (ajustes del sitio)
  components/               ← ui, layout, property, home, admin
  pages/                    ← Home, Properties, PropertyDetail, About, Contact, 404
    admin/                  ← Login, Dashboard, Form, Leads, Settings, History
supabase/schema.sql         ← SQL para crear todo en Supabase
```

---

## 9. Páginas / rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (hero, destacadas, servicios, CTA) |
| `/propiedades` | Portafolio con filtros y búsqueda |
| `/propiedades/:slug` | Detalle de propiedad (galería, video, amenidades, mapa) |
| `/nosotros` | Sobre la agencia y los agentes |
| `/contacto` | Formulario + WhatsApp + mapa |
| `/admin/login` | Acceso administrador |
| `/admin` | Gestión de propiedades (orden, estado, destacadas) |
| `/admin/properties/new` · `/admin/properties/:id` | Crear / editar propiedad |
| `/admin/leads` | Mensajes recibidos |
| `/admin/settings` | Ajustes del sitio (textos, imágenes, agentes, zonas, contacto) |
| `/admin/history` | Historial de cambios |
| cualquier otra | Página 404 con diseño propio |

Las rutas `/admin` no se indexan (`noindex`) y no se anuncian en `robots.txt`.

---

Hecho con detalle. 🤍
