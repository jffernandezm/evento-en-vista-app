
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface GoogleMapProps {
  address: string;
  latitude?: number;
  longitude?: number;
  title: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  editable?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  address, 
  latitude, 
  longitude, 
  title, 
  onLocationChange,
  editable = false 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [addressInput, setAddressInput] = useState(address);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        existingScript.addEventListener('error', () => setLoadError(true));
        return;
      }

      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO6BIpn86xIcOU&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        console.log('Google Maps API loaded successfully');
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('Error loading Google Maps API');
        setLoadError(true);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (isLoaded && mapContainer.current && !map.current) {
      try {
        initializeMap();
      } catch (error) {
        console.error('Error initializing map:', error);
        setLoadError(true);
      }
    }
  }, [isLoaded]);

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  const initializeMap = () => {
    if (!window.google || !window.google.maps || !mapContainer.current) {
      console.error('Google Maps not available');
      return;
    }

    const initialLat = latitude || -33.4489; // Santiago por defecto
    const initialLng = longitude || -70.6693;

    try {
      // Crear el mapa
      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Crear marcador
      marker.current = new window.google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map.current,
        title: title,
        draggable: editable,
      });

      // Crear InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${title}</h3>
            <p style="margin: 0; color: #666;">${address}</p>
            ${!editable ? `
              <div style="margin-top: 8px;">
                <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}', '_blank')" 
                        style="background: #4285f4; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 14px;">
                  Cómo llegar
                </button>
              </div>
            ` : ''}
          </div>
        `
      });

      marker.current.addListener('click', () => {
        infoWindow.open(map.current, marker.current);
      });

      // Si es editable, permitir arrastrar el marcador
      if (editable) {
        marker.current.addListener('dragend', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          // Geocodificación inversa para obtener la dirección
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              const newAddress = results[0].formatted_address;
              setAddressInput(newAddress);
              onLocationChange?.(lat, lng, newAddress);
            } else {
              onLocationChange?.(lat, lng, addressInput);
            }
          });
        });
      }

      // Geocodificar la dirección si no tenemos coordenadas exactas
      if ((!latitude || !longitude) && address) {
        geocodeAddress(address);
      }
    } catch (error) {
      console.error('Error creating map:', error);
      setLoadError(true);
    }
  };

  const geocodeAddress = (addressToGeocode: string) => {
    if (!window.google || !window.google.maps || !addressToGeocode) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addressToGeocode }, (results: any[], status: string) => {
        if (status === 'OK' && results[0] && map.current && marker.current) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          map.current.setCenter({ lat, lng });
          marker.current.setPosition({ lat, lng });
          
          if (editable && onLocationChange) {
            onLocationChange(lat, lng, results[0].formatted_address);
          }
        } else {
          console.error('Geocoding failed:', status);
        }
      });
    } catch (error) {
      console.error('Error in geocoding:', error);
    }
  };

  const handleAddressSubmit = () => {
    if (addressInput.trim()) {
      geocodeAddress(addressInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSubmit();
    }
  };

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full rounded-lg border flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Error al cargar el mapa</p>
              <p className="text-sm text-gray-500">{address}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full rounded-lg border flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Cargando mapa...</p>
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
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa una dirección"
              className="flex-1"
            />
            <Button onClick={handleAddressSubmit} size="sm">
              <Navigation className="w-4 h-4 mr-1" />
              Buscar
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-gray-700">{addressInput}</p>
          <div ref={mapContainer} className="h-64 w-full rounded-lg border" />
          {editable && (
            <p className="text-xs text-gray-500">
              Puedes arrastrar el marcador para ajustar la ubicación exacta
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMap;
