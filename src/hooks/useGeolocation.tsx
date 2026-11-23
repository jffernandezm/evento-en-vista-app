import { useState, useEffect } from 'react';
import { useConsent } from '@/hooks/useConsent';
import { distanceKm } from '@/lib/comunas';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

// Solo pide la ubicación del dispositivo cuando el usuario aceptó el aviso de privacidad.
export const useGeolocation = () => {
  const { consent } = useConsent();
  const [state, setState] = useState<GeolocationState>({ latitude: null, longitude: null, error: null, loading: true });

  useEffect(() => {
    if (consent !== 'accepted') {
      setState({ latitude: null, longitude: null, error: 'Sin permiso', loading: false });
      return;
    }
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocalización no soportada', loading: false }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      p => setState({ latitude: p.coords.latitude, longitude: p.coords.longitude, error: null, loading: false }),
      e => setState(prev => ({ ...prev, error: e.message, loading: false }))
    );
  }, [consent]);

  return { ...state, calculateDistance: distanceKm };
};
