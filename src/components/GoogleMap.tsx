import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, AlertCircle, ExternalLink } from 'lucide-react';

interface GoogleMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  editable?: boolean;
}

// Mapa basado en OpenStreetMap/Leaflet (gratuito, sin API key).
// Mantiene el nombre GoogleMap para no cambiar los archivos que lo usan.
const GoogleMap: React.FC<GoogleMapProps> = ({
  address = '',
  latitude,
  longitude,
  title = 'Ubicación del evento',
  onLocationChange,
  editable = false
}) => {
  const [searchAddress, setSearchAddress] = useState(address);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  // Coordenadas por defecto (Santiago, Chile)
  const defaultCoords = { lat: -33.4489, lng: -70.6693 };

  useEffect(() => {
    setSearchAddress(address);
  }, [address]);

  // Cargar Leaflet e inicializar el mapa una sola vez
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        // Cargar CSS de Leaflet si no está
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        const leaflet = await import('leaflet');
        const L = leaflet.default;
        leafletRef.current = L;

        // Fix iconos por defecto
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (cancelled || !mapRef.current) return;

        const coords = (latitude && longitude) ? { lat: latitude, lng: longitude } : defaultCoords;

        const map = L.map(mapRef.current).setView([coords.lat, coords.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([coords.lat, coords.lng], { draggable: editable }).addTo(map);
        marker.bindPopup(`<b>${title}</b>`);

        if (editable) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            reverseGeocode(pos.lat, pos.lng);
          });

          map.on('click', (e: any) => {
            marker.setLatLng(e.latlng);
            map.setView(e.latlng, map.getZoom());
            reverseGeocode(e.latlng.lat, e.latlng.lng);
          });
        }

        mapInstance.current = map;
        markerInstance.current = marker;
        setMapReady(true);
        setHasError(false);
      } catch (error) {
        console.error('Error inicializando el mapa:', error);
        setHasError(true);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualizar posición cuando cambian lat/lng desde afuera
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !markerInstance.current) return;
    if (latitude === undefined || longitude === undefined) return;

    const current = markerInstance.current.getLatLng();
    if (current.lat !== latitude || current.lng !== longitude) {
      markerInstance.current.setLatLng([latitude, longitude]);
      mapInstance.current.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude, mapReady]);

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!onLocationChange) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const newAddress = data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSearchAddress(newAddress);
      onLocationChange(lat, lng, newAddress);
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      const coordsAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSearchAddress(coordsAddress);
      onLocationChange(lat, lng, coordsAddress);
    }
  };

  const searchLocation = async () => {
    if (!searchAddress.trim() || !mapInstance.current || !markerInstance.current) return;

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const foundAddress = data[0].display_name || searchAddress;

        markerInstance.current.setLatLng([lat, lng]);
        mapInstance.current.setView([lat, lng], 15);

        if (onLocationChange) {
          onLocationChange(lat, lng, foundAddress);
        }
        setSearchAddress(foundAddress);
      }
    } catch (error) {
      console.error('Error buscando dirección:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  const openInGoogleMaps = () => {
    // Intenta abrir la app de Google Maps; si no está instalada, abre el mapa web
    const coords = (latitude && longitude) ? `${latitude},${longitude}` : '';
    const query = coords || encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
  };

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
              <p className="text-muted-foreground mb-2">Error al cargar el mapa</p>
            </div>
          </div>

          {address && (
            <div className="space-y-2">
              <p className="text-sm font-medium">
                <MapPin className="w-4 h-4 inline mr-1" />
                Dirección del evento:
              </p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{address}</p>
              <Button
                onClick={openInGoogleMaps}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir en Google Maps
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {editable && (
          <div className="flex gap-2">
            <Input
              placeholder="Buscar dirección..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button
              onClick={searchLocation}
              size="icon"
              variant="outline"
              disabled={isLoading || !searchAddress.trim()}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}

        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-64 bg-muted rounded-lg z-0"
            style={{ minHeight: '256px' }}
          />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground">Cargando mapa...</p>
              </div>
            </div>
          )}
          {editable && mapReady && (
            <p className="text-xs text-muted-foreground mt-2">
              Busca una dirección arriba o haz clic en el mapa para seleccionar la ubicación exacta
            </p>
          )}
        </div>

        {address && (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              <MapPin className="w-4 h-4 inline mr-1" />
              Dirección:
            </p>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">{address}</p>
            <Button
              onClick={openInGoogleMaps}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver en Google Maps
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
