
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface EventMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  title: string;
}

const EventMap: React.FC<EventMapProps> = ({ address, latitude, longitude, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Usar OpenStreetMap con Leaflet como alternativa gratuita
        const leaflet = await import('leaflet');
        const L = leaflet.default;

        // Fix para los iconos por defecto de Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Determinar coordenadas
        let lat = latitude || -33.4489; // Santiago por defecto
        let lng = longitude || -70.6693;

        // Si no tenemos coordenadas pero tenemos dirección, usar geocoding
        if (!latitude || !longitude) {
          try {
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
            );
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData && geocodeData.length > 0) {
              lat = parseFloat(geocodeData[0].lat);
              lng = parseFloat(geocodeData[0].lon);
            }
          } catch (error) {
            console.error('Error geocoding address:', error);
          }
        }

        // Crear el mapa
        map.current = L.map(mapContainer.current).setView([lat, lng], 15);

        // Agregar tiles de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map.current);

        // Agregar marcador
        L.marker([lat, lng])
          .addTo(map.current)
          .bindPopup(`<b>${title}</b><br>${address}`)
          .openPopup();

      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    // Agregar CSS dinámicamente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [address, latitude, longitude, title]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground mb-4">{address}</p>
        <div ref={mapContainer} className="h-64 w-full rounded-lg border" />
      </CardContent>
    </Card>
  );
};

export default EventMap;
