# Small Property's — Real State 🏝️

Sitio web de lujo (portafolio de propiedades) + panel de administración, para una inmobiliaria del **Caribe Sur de Costa Rica**.

- **Web pública**: inicio, portafolio con filtros, detalle de propiedad (galería, amenidades, mapa, video), contacto.
- **Panel admin** (`/admin`): agregar, editar y eliminar propiedades + bandeja de mensajes. Protegido con email y contraseña.
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

## 2. Cambiar el nombre / contacto / redes

Todo está en **un solo archivo**: [`src/config/siteConfig.ts`](src/config/siteConfig.ts).

```ts
brand: "Small Property's",        // ← nombre de la marca
brandSuffix: 'Real State',
contact: {
  whatsapp: '50688887777',        // ← tu WhatsApp (internacional, sin + ni espacios)
  email: 'info@tudominio.com',
  ...
}
social: { instagram: '…', facebook: '…' }
```

Cambia esos valores y listo — se actualiza en toda la web y el admin.

---

## 3. Conectar Supabase (gratis, compartido entre tus webs)

Como usas **una sola cuenta de Supabase para varias webs**, este proyecto usa el **prefijo `sc_`** en todas sus tablas (`sc_properties`, `sc_leads`) y el bucket `sc-media`, para **no chocar** con tus otros sitios.

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

## 4. Fotos de las propiedades (2 formas, elige la que quieras)

En el panel admin, cada propiedad tiene un gestor de imágenes con dos opciones:

1. **Subir foto (PC/móvil)** → sube directo desde tu computadora o teléfono (en el celu abre la cámara/galería). La imagen se **comprime automáticamente** en el navegador antes de subir (una foto de 8 MB queda en ~300 KB), así tu **1 GB gratis de Supabase rinde para miles de fotos**.
2. **Agregar URL** → pega el link de una imagen alojada en otro lado. Recomendado: [Cloudinary](https://cloudinary.com) (free 25 GB) si quieres no usar nada del storage de Supabase.

Puedes **arrastrar** para reordenar y marcar cualquier foto como **portada** (estrella ⭐).

---

## 5. Desplegar en Netlify

1. Sube este repo a GitHub.
2. En [Netlify](https://netlify.com): **Add new site → Import from GitHub** → elige el repo.
   - Build command: `npm run build` · Publish directory: `dist` (ya está en `netlify.toml`).
3. **Site settings → Environment variables** → agrega las mismas 3 variables del `.env`:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DB_PREFIX`.
4. **Deploy**. El archivo `netlify.toml` ya incluye el redirect SPA para que rutas como `/admin` o `/propiedades/...` funcionen al recargar.

---

## 6. Estructura

```
src/
  config/siteConfig.ts      ← nombre, contacto, redes (EDITA AQUÍ)
  i18n/                     ← textos ES / EN
  lib/                      ← supabase, datos, formato, compresión de imágenes
  data/demoProperties.ts    ← propiedades de demostración
  components/               ← UI, layout, property, home, admin
  pages/                    ← Home, Properties, PropertyDetail, Contact
    admin/                  ← Login, Dashboard, Form, Leads
supabase/schema.sql         ← SQL para crear todo en Supabase
```

---

## 7. Páginas / rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio (hero, destacadas, servicios) |
| `/propiedades` | Portafolio con filtros y búsqueda |
| `/propiedades/:slug` | Detalle de propiedad |
| `/contacto` | Formulario + WhatsApp + mapa |
| `/admin/login` | Acceso administrador |
| `/admin` | Gestión de propiedades |
| `/admin/leads` | Mensajes recibidos |
| cualquier otra | Página 404 con diseño propio |

---

Hecho con detalle. 🤍
