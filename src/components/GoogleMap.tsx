
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, AlertCircle, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }
}

interface GoogleMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  title?: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  editable?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  // Coordenadas por defecto (Santiago, Chile)
  const defaultCoords = { lat: -33.4489, lng: -70.6693 };

  useEffect(() => {
    setSearchAddress(address);
  }, [address]);

  useEffect(() => {
    const loadGoogleMaps = () => {
      try {
        if (window.google?.maps) {
          console.log('Google Maps already loaded');
          setMapLoaded(true);
          setHasError(false);
          return;
        }

        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          console.log('Google Maps script already exists, waiting for load...');
          const checkLoaded = setInterval(() => {
            if (window.google?.maps) {
              console.log('Google Maps loaded successfully');
              setMapLoaded(true);
              setHasError(false);
              clearInterval(checkLoaded);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkLoaded);
            if (!window.google?.maps) {
              console.error('Google Maps failed to load after timeout');
              setHasError(true);
            }
          }, 10000);
          return;
        }

        console.log('Loading Google Maps script...');
        window.initGoogleMaps = () => {
          console.log('Google Maps initialized via callback');
          setMapLoaded(true);
          setHasError(false);
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWTgkNLEG8s5g&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        script.onerror = (error) => {
          console.error('Error loading Google Maps script:', error);
          setHasError(true);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setHasError(true);
      }
    };

    // Usar un timeout para evitar cargar inmediatamente
    const timer = setTimeout(() => {
      loadGoogleMaps();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mapLoaded && mapRef.current && window.google?.maps && !map) {
      console.log('Initializing map...');
      try {
        initializeMap();
      } catch (error) {
        console.error('Error in map initialization:', error);
        setHasError(true);
      }
    }
  }, [mapLoaded]);

  useEffect(() => {
    if (map && marker && (latitude !== undefined && longitude !== undefined)) {
      console.log('Updating map location:', latitude, longitude);
      updateMapLocation();
    }
  }, [latitude, longitude, map, marker]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      console.error('Map container or Google Maps not available');
      return;
    }

    try {
      const coords = (latitude && longitude) ? { lat: latitude, lng: longitude } : defaultCoords;
      console.log('Creating map with coords:', coords);
      
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
            console.log('Marker dragged to:', position.lat(), position.lng());
            reverseGeocode(position.lat(), position.lng());
          }
        });

        newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            console.log('Map clicked at:', event.latLng.lat(), event.latLng.lng());
            newMarker.setPosition(event.latLng);
            newMap.setCenter(event.latLng);
            reverseGeocode(event.latLng.lat(), event.latLng.lng());
          }
        });
      }

      setMap(newMap);
      setMarker(newMarker);
      geocoderRef.current = new google.maps.Geocoder();
      setHasError(false);
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      setHasError(true);
    }
  };

  const updateMapLocation = () => {
    if (!map || !marker || !window.google?.maps) return;

    try {
      const coords = (latitude && longitude) ? { lat: latitude, lng: longitude } : defaultCoords;
      console.log('Updating map to coords:', coords);
      
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
      console.log('Reverse geocoding:', lat, lng);
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (results && results[0]) {
        const newAddress = results[0].formatted_address;
        console.log('Reverse geocoded address:', newAddress);
        setSearchAddress(newAddress);
        onLocationChange(lat, lng, newAddress);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      const coordsAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSearchAddress(coordsAddress);
      onLocationChange(lat, lng, coordsAddress);
    }
  };

  const searchLocation = async () => {
    if (!geocoderRef.current || !searchAddress.trim() || !map || !marker) return;

    setIsLoading(true);
    try {
      console.log('Searching for address:', searchAddress);
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoderRef.current!.geocode(
          { address: searchAddress },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      if (results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        console.log('Found location:', lat, lng);
        map.setCenter({ lat, lng });
        map.setZoom(15);
        marker.setPosition({ lat, lng });
        
        if (onLocationChange) {
          onLocationChange(lat, lng, results[0].formatted_address);
          setSearchAddress(results[0].formatted_address);
        }
      }
    } catch (error) {
      console.error('Error searching location:', error);
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
          <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-gray-600 mb-2">Error al cargar el mapa</p>
              <p className="text-sm text-gray-500 mb-4">La API de Google Maps no está disponible</p>
            </div>
          </div>
          
          {address && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                <MapPin className="w-4 h-4 inline mr-1" />
                Dirección del evento:
              </p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{address}</p>
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

          {latitude && longitude && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Coordenadas:</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
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
            className="w-full h-64 bg-gray-200 rounded-lg"
            style={{ minHeight: '256px' }}
          >
            {!mapLoaded && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>
          {editable && mapLoaded && (
            <p className="text-xs text-gray-500 mt-2">
              Busca una dirección arriba o haz clic en el mapa para seleccionar la ubicación exacta
            </p>
          )}
        </div>
        
        {address && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4 inline mr-1" />
              Dirección:
            </p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{address}</p>
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

        {latitude && longitude && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Coordenadas:</p>
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
