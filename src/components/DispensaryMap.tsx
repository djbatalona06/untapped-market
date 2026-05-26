import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import type { Dispensary } from '../types';
import { STRAINS } from '../data/strains';

interface Props {
  dispensaries: Dispensary[];
  selectedId?: string;
  onSelect: (id: string) => void;
  height?: string;
}

const PIN_SVG = (color: string) =>
  `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <path filter="url(#g)" d="M18 2C9.7 2 3 8.7 3 17c0 11 15 25 15 25s15-14 15-25C33 8.7 26.3 2 18 2z" fill="${color}" stroke="#0e0f0d" stroke-width="1.6"/>
    <circle cx="18" cy="17" r="6" fill="#0e0f0d"/>
    <path d="M18 13 L19.2 16.2 L22.4 16.4 L19.9 18.5 L20.7 21.6 L18 19.9 L15.3 21.6 L16.1 18.5 L13.6 16.4 L16.8 16.2 Z" fill="${color}"/>
  </svg>`;

function makeIcon(color: string, selected = false): L.DivIcon {
  return L.divIcon({
    className: 'disp-pin',
    html: PIN_SVG(selected ? '#d4a853' : color),
    iconSize: [36, 44],
    iconAnchor: [18, 42],
    popupAnchor: [0, -36],
  });
}

function strainName(id: string): string {
  return STRAINS.find((s) => s.id === id)?.name ?? id;
}

export function DispensaryMap({ dispensaries, selectedId, onSelect, height = '100%' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const fallbackCenter = useMemo<[number, number]>(() => {
    if (!dispensaries.length) return [47.6062, -122.3321];
    const avg = dispensaries.reduce(
      (acc, d) => ({ lat: acc.lat + d.coordinates.lat, lng: acc.lng + d.coordinates.lng }),
      { lat: 0, lng: 0 }
    );
    return [avg.lat / dispensaries.length, avg.lng / dispensaries.length];
  }, [dispensaries]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: fallbackCenter,
      zoom: 11,
      zoomControl: true,
      preferCanvas: true,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();
    markersRef.current.clear();

    for (const d of dispensaries) {
      const isSelected = d.id === selectedId;
      const featured = d.strainIds[0];
      const stripe =
        STRAINS.find((s) => s.id === featured)?.color ?? '#7cb87a';
      const marker = L.marker([d.coordinates.lat, d.coordinates.lng], {
        icon: makeIcon(stripe, isSelected),
      });

      const featuredHtml = d.strainIds
        .slice(0, 3)
        .map((sid) => `<div>• ${strainName(sid)}</div>`)
        .join('');

      const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${d.coordinates.lat},${d.coordinates.lng}`;
      const popupHtml = `
        <div class="disp-popup">
          <div class="disp-popup-name">${d.name}</div>
          <div class="disp-popup-meta">${d.address}, ${d.city}<br/>★ ${d.rating} · ${d.reviewCount} reviews</div>
          <div class="disp-popup-meta" style="margin-bottom:8px"><strong style="color:var(--text);">Featured:</strong><br/>${featuredHtml}</div>
          <div class="disp-popup-actions">
            <a href="${dirUrl}" target="_blank" rel="noopener">Directions</a>
            <button class="ghost" data-disp-id="${d.id}">View</button>
          </div>
        </div>`;
      marker.bindPopup(popupHtml, { closeButton: true });
      marker.on('click', () => onSelect(d.id));
      marker.on('popupopen', (e) => {
        const node = (e.popup as L.Popup).getElement();
        if (!node) return;
        const btn = node.querySelector<HTMLButtonElement>(`button[data-disp-id="${d.id}"]`);
        if (btn) btn.onclick = () => onSelect(d.id);
      });
      marker.addTo(layerRef.current);
      markersRef.current.set(d.id, marker);
    }

    if (dispensaries.length > 0 && !selectedId) {
      const bounds = L.latLngBounds(
        dispensaries.map((d) => [d.coordinates.lat, d.coordinates.lng] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }, [dispensaries, selectedId, onSelect]);

  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const target = dispensaries.find((d) => d.id === selectedId);
    if (!target) return;
    mapRef.current.flyTo([target.coordinates.lat, target.coordinates.lng], 14, {
      animate: true,
      duration: 0.8,
    });
    const marker = markersRef.current.get(selectedId);
    if (marker) marker.openPopup();
  }, [selectedId, dispensaries]);

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}
