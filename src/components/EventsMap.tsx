import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EventType } from '@/types/event';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

interface Props { events: EventType[]; center?: { lat: number; lng: number } | null }

const EventsMap = ({ events, center }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!ref.current || map.current) return;
    map.current = L.map(ref.current).setView([-33.4489, -70.6693], 11);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    map.current.on('popupopen', (e: L.PopupEvent) => {
      const btn = e.popup.getElement()?.querySelector<HTMLButtonElement>('[data-event-id]');
      btn?.addEventListener('click', () => navigate(`/event/${btn.dataset.eventId}`));
    });
    return () => { map.current?.remove(); map.current = null; };
  }, [navigate]);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    const pts: L.LatLngExpression[] = [];
    events.forEach(e => {
      if (e.latitude == null || e.longitude == null) return;
      pts.push([e.latitude, e.longitude]);
      L.marker([e.latitude, e.longitude], { icon })
        .bindPopup(`
          <div style="min-width:180px">
            <strong style="font-size:15px">${esc(e.title)}</strong>
            <div style="margin-top:4px">📅 ${esc(e.dates || '')}</div>
            <div>📍 ${esc(e.distance || '')}</div>
            <button data-event-id="${esc(e.id)}" style="margin-top:8px;width:100%;padding:6px 8px;border-radius:6px;background:hsl(var(--primary));color:hsl(var(--primary-foreground));border:0;cursor:pointer">Ver detalles</button>
          </div>`)
        .addTo(layer.current!);
    });
    if (center) pts.push([center.lat, center.lng]);
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 14 });
  }, [events, center]);

  return <div ref={ref} className="w-full h-[60vh] min-h-[360px] rounded-lg border z-0" aria-label="Mapa de eventos" />;
};

export default EventsMap;
