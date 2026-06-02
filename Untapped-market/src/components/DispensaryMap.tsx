import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import type { Dispensary } from '@/store/types'

// SSR-safe icon fix
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Props {
  dispensaries: Dispensary[]
  selectedId?: string
}

const PNW_CENTER: [number, number] = [47.0, -122.5]

export default function DispensaryMap({ dispensaries, selectedId }: Props) {
  useEffect(() => {
    // Force tile re-render after mount in some grid layouts
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60)
  }, [])

  return (
    <div className="map-wrap">
      <MapContainer
        center={PNW_CENTER}
        zoom={7}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {dispensaries.map((d) => {
          const lat = d.coordinates?.lat
          const lng = d.coordinates?.lng
          if (typeof lat !== 'number' || typeof lng !== 'number') return null
          const isSelected = d.id === selectedId
          return (
            <Marker
              key={d.id}
              position={[lat, lng]}
              opacity={selectedId && !isSelected ? 0.55 : 1}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#b09a76', marginBottom: 4 }}>
                    {d.city}{d.state ? `, ${d.state}` : ''}
                  </div>
                  {typeof d.rating === 'number' && (
                    <div style={{ fontSize: '0.78rem', color: '#c4831a', marginBottom: 6 }}>
                      ★ {d.rating.toFixed(1)}
                    </div>
                  )}
                  {d.strainIds?.[0] && (
                    <Link
                      to={`/strain/${d.strainIds[0]}`}
                      style={{ fontSize: '0.78rem', color: '#6da850' }}
                    >
                      View featured strain →
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
