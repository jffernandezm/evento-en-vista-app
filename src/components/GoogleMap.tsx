
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';
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
  const { toast } = useToast();

  // Verificar si Google Maps está disponible
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsReady(true);
      } else {
        // Cargar Google Maps script si no está disponible
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBCamCz5Qm3ZTJZ8j7kF1H_MrGq8JZzQO8&libraries=places&language=es`;
          script.async = true;
          script.defer = true;
          script.onload = () => setIsGoogleMapsReady(true);
          script.onerror = () => {
            console.error('Error loading Google Maps');
            setLoading(false);
          };
          document.head.appendChild(script);
        }
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
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoading(false);
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
    if (!newAddress) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const address = results[0].formatted_address;
          setSearchAddress(address);
          onLocationChange?.(lat, lng, address);
        }
      });
    } else {
      setSearchAddress(newAddress);
      onLocationChange?.(lat, lng, newAddress);
    }
  }, [onLocationChange]);

  const searchLocation = useCallback(() => {
    if (!searchAddress.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una dirección para buscar",
        variant: "destructive"
      });
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        updateMapPosition(lat, lng, results[0].formatted_address);
        
        toast({
          title: "Ubicación encontrada",
          description: "La ubicación ha sido actualizada en el mapa"
        });
      } else {
        toast({
          title: "Ubicación no encontrada",
          description: "No se pudo encontrar la dirección especificada",
          variant: "destructive"
        });
      }
    });
  }, [searchAddress, updateMapPosition, toast]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "La geolocalización no está disponible en tu navegador",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMapPosition(lat, lng);
        setLoading(false);
        
        toast({
          title: "Ubicación actual",
          description: "Se ha obtenido tu ubicación actual"
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        toast({
          title: "Error de ubicación",
          description: "No se pudo obtener tu ubicación actual",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [updateMapPosition, toast]);

  useEffect(() => {
    if (isGoogleMapsReady) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [isGoogleMapsReady, initializeMap]);

  if (!isGoogleMapsReady) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando mapa...</span>
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
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={searchLocation}
                disabled={loading}
                variant="outline"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button 
                type="button" 
                onClick={getCurrentLocation}
                disabled={loading}
                variant="outline"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            </div>
            {editable && (
              <p className="text-sm text-gray-600">
                💡 Haz clic en el mapa o arrastra el marcador para seleccionar una ubicación
              </p>
            )}
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
