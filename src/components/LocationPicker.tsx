
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Input } from '@/components/ui/input';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  onLocationChange?: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationChange }: { onLocationChange?: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLngExpression | null>(null);
  
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange?.(lat, lng);
    },
  });

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    });
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  );
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  address, 
  onAddressChange, 
  onLocationChange 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Dirección *
        </label>
        <Input
          id="address"
          type="text"
          placeholder="Escribe la dirección y selecciona en el mapa"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          required
        />
      </div>
      
      <div className="h-64 w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={[-33.4489, -70.6693] as L.LatLngExpression}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationChange={onLocationChange} />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-500">Haz clic en el mapa para seleccionar la ubicación exacta</p>
    </div>
  );
};

export default LocationPicker;
