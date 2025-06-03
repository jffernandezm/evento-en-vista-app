
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Navigation, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  editable?: boolean;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  address,
  latitude,
  longitude,
  title = 'Evento',
  editable = false,
  onLocationChange
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [searchAddress, setSearchAddress] = useState(address);
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);
  const [loading, setLoading] = useState(true);
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Verificar si Google Maps está disponible
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsReady(true);
        setHasError(false);
      } else {
        // Por ahora no cargar Google Maps automáticamente para evitar errores de API key
        setLoading(false);
        setHasError(true);
      }
    };

    checkGoogleMaps();
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) return;

    try {
      // Coordenadas por defecto (centro de Chile)
      const defaultLat = currentLat || -33.4489;
      const defaultLng = currentLng || -70.6693;

      const mapOptions: google.maps.MapOptions = {
        center: { lat: defaultLat, lng: defaultLng },
        zoom: currentLat && currentLng ? 15 : 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'auto',
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      };

      mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Crear marcador
      markerRef.current = new google.maps.Marker({
        position: { lat: defaultLat, lng: defaultLng },
        map: mapInstanceRef.current,
        title: title,
        draggable: editable,
        animation: google.maps.Animation.DROP
      });

      // Configurar autocomplete si es editable
      if (editable && searchInputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            types: ['address'],
            componentRestrictions: { country: 'CL' }
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            updateMapPosition(lat, lng, place.formatted_address || '');
          }
        });
      }

      // Listener para cuando se arrastra el marcador
      if (editable && markerRef.current) {
        markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            
            // Geocodificación inversa para obtener la dirección
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat, lng } },
              (results, status) => {
                if (status === 'OK' && results?.[0]) {
                  const newAddress = results[0].formatted_address;
                  setSearchAddress(newAddress);
                  onLocationChange?.(lat, lng, newAddress);
                } else {
                  onLocationChange?.(lat, lng, `${lat}, ${lng}`);
                }
              }
            );
          }
        });
      }

      // Listener para clicks en el mapa
      if (editable) {
        mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            updateMapPosition(lat, lng);
          }
        });
      }

      setLoading(false);
      setHasError(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
      setHasError(true);
    }
  }, [currentLat, currentLng, title, editable, onLocationChange]);

  const updateMapPosition = useCallback((lat: number, lng: number, newAddress?: string) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const position = { lat, lng };
    
    // Actualizar mapa y marcador
    mapInstanceRef.current.setCenter(position);
    mapInstanceRef.current.setZoom(15);
    markerRef.current.setPosition(position);
    
    // Actualizar estado
    setCurrentLat(lat);
    setCurrentLng(lng);
    
    // Si no hay dirección, hacer geocodificación inversa
    if (!newAddress && window.google?.maps) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const address = results[0].formatted_address;
          setSearchAddress(address);
          onLocationChange?.(lat, lng, address);
        }
      });
    } else if (newAddress) {
      setSearchAddress(newAddress);
      onLocationChange?.(lat, lng, newAddress);
    }
  }, [onLocationChange]);

  useEffect(() => {
    if (isGoogleMapsReady) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [isGoogleMapsReady, initializeMap]);

  // Si hay error con Google Maps, mostrar información básica
  if (hasError || !isGoogleMapsReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasError && (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Mapa no disponible</p>
                <p className="text-sm text-gray-500">
                  Configuración de Google Maps requerida
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600">
              <p><strong>Dirección:</strong> {searchAddress || address}</p>
              {currentLat && currentLng && (
                <p><strong>Coordenadas:</strong> {currentLat.toFixed(6)}, {currentLng.toFixed(6)}</p>
              )}
            </div>
            
            {editable && (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Dirección del evento"
                  value={searchAddress}
                  onChange={(e) => {
                    setSearchAddress(e.target.value);
                    onLocationChange?.(currentLat || 0, currentLng || 0, e.target.value);
                  }}
                />
                <p className="text-xs text-gray-500">
                  💡 Ingresa la dirección manualmente mientras se configura Google Maps
                </p>
              </div>
            )}
          </div>
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar dirección..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-600">
              💡 Haz clic en el mapa o arrastra el marcador para seleccionar una ubicación
            </p>
          </div>
        )}
        
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-64 rounded-lg border"
          />
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <p><strong>Dirección:</strong> {searchAddress || address}</p>
          {currentLat && currentLng && (
            <p><strong>Coordenadas:</strong> {currentLat.toFixed(6)}, {currentLng.toFixed(6)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
