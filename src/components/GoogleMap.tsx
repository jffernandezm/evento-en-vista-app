
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, AlertCircle } from 'lucide-react';

interface GoogleMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  editable?: boolean;
}

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  address = '',
  latitude,
  longitude,
  title = 'Ubicación del evento',
  onLocationChange,
  editable = false
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchAddress, setSearchAddress] = useState(address);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [hasError, setHasError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Coordenadas por defecto (Santiago, Chile)
  const defaultCoords = { lat: -33.4489, lng: -70.6693 };

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapLoaded && map) {
      updateMapLocation();
    }
  }, [mapLoaded, map, latitude, longitude, address]);

  const loadGoogleMaps = () => {
    try {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        setHasError(false);
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        window.initGoogleMaps = () => {
          setMapLoaded(true);
          setHasError(false);
        };
        return;
      }

      window.initGoogleMaps = () => {
        setMapLoaded(true);
        setHasError(false);
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Error loading Google Maps');
        setHasError(true);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setHasError(true);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const coords = (latitude && longitude) ? { lat: latitude, lng: longitude } : defaultCoords;
      
      const newMap = new google.maps.Map(mapRef.current, {
        center: coords,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const newMarker = new google.maps.Marker({
        position: coords,
        map: newMap,
        title: title,
        draggable: editable,
      });

      if (editable) {
        newMarker.addListener('dragend', () => {
          const position = newMarker.getPosition();
          if (position && onLocationChange) {
            reverseGeocode(position.lat(), position.lng());
          }
        });

        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            newMarker.setPosition(event.latLng);
            reverseGeocode(event.latLng.lat(), event.latLng.lng());
          }
        });
      }

      setMap(newMap);
      setMarker(newMarker);
      geocoderRef.current = new google.maps.Geocoder();
    } catch (error) {
      console.error('Error initializing map:', error);
      setHasError(true);
    }
  };

  const updateMapLocation = () => {
    if (!map || !marker || !window.google) return;

    try {
      const coords = (latitude && longitude) ? { lat: latitude, lng: longitude } : defaultCoords;
      
      map.setCenter(coords);
      marker.setPosition(coords);
      
      if (latitude && longitude) {
        map.setZoom(15);
      }
    } catch (error) {
      console.error('Error updating map location:', error);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current || !onLocationChange) return;

    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      if (results && results[0]) {
        const newAddress = results[0].formatted_address;
        setSearchAddress(newAddress);
        onLocationChange(lat, lng, newAddress);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      onLocationChange(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const searchLocation = async () => {
    if (!geocoderRef.current || !searchAddress.trim()) return;

    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode(
          { address: searchAddress },
          (results, status) => {
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error('Geocoding failed'));
            }
          }
        );
      });

      if (results && results[0] && map && marker) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        
        if (onLocationChange) {
          onLocationChange(lat, lng, results[0].formatted_address);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  useEffect(() => {
    if (mapLoaded && !map) {
      initializeMap();
    }
  }, [mapLoaded]);

  if (hasError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">No se pudo cargar el mapa</p>
              <p className="text-sm text-gray-500 mt-1">{address || 'Ubicación no disponible'}</p>
            </div>
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
          <div className="flex gap-2">
            <Input
              placeholder="Buscar dirección..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Button onClick={searchLocation} size="icon" variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        <div className="relative">
          <div 
            ref={mapRef} 
            className="w-full h-64 bg-gray-200 rounded-lg"
            style={{ minHeight: '256px' }}
          >
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-600">Cargando mapa...</p>
              </div>
            )}
          </div>
        </div>
        
        {address && (
          <p className="text-sm text-gray-600 mt-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            {address}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
