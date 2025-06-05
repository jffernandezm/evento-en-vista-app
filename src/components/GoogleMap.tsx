
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, AlertCircle } from 'lucide-react';

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
          }, 15000);
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

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapLoaded && !map && mapRef.current && window.google?.maps) {
      console.log('Initializing map...');
      initializeMap();
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
    if (!geocoderRef.current || !searchAddress.trim()) return;

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

      if (results && results[0] && map && marker) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        console.log('Found location:', lat, lng);
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
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-gray-600">Error al cargar el mapa</p>
              {address && (
                <p className="text-sm text-gray-500 mt-1">{address}</p>
              )}
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
            {!mapLoaded && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>
          {editable && (
            <p className="text-xs text-gray-500 mt-2">
              Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta
            </p>
          )}
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
