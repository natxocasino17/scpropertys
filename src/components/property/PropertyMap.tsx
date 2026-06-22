import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

/** Custom gold pin (avoids Leaflet's broken default marker image paths). */
const goldPin = L.divIcon({
  className: '',
  html: `<div style="position:relative;transform:translate(-50%,-100%)">
    <svg width="34" height="46" viewBox="0 0 34 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.6 0 0 7.6 0 17c0 11.9 17 29 17 29s17-17.1 17-29C34 7.6 26.4 0 17 0z" fill="#0A0A0B" stroke="#C8A45D" stroke-width="1.5"/>
      <circle cx="17" cy="17" r="6" fill="#C8A45D"/>
    </svg>
  </div>`,
  iconSize: [34, 46],
  iconAnchor: [0, 0],
})

interface PropertyMapProps {
  lat: number
  lng: number
  label?: string
  zoom?: number
  className?: string
}

export function PropertyMap({ lat, lng, label, zoom = 14, className = '' }: PropertyMapProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 ${className}`}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', minHeight: 320 }}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, lng]} icon={goldPin}>
          {label && <Popup>{label}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  )
}
