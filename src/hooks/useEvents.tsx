
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventType, UserEvent } from '@/types/event';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useSelectedComuna } from '@/hooks/useConsent';
import { findComuna } from '@/lib/comunas';

export const useEvents = () => {
  const [userEvents, setUserEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const geo = useGeolocation();
  const { calculateDistance } = geo;
  const { comuna } = useSelectedComuna();
  const comunaPoint = findComuna(comuna);
  // Usa la ubicación del dispositivo; si no hay, el centro de la comuna elegida.
  const latitude = geo.latitude ?? comunaPoint?.lat ?? null;
  const longitude = geo.longitude ?? comunaPoint?.lng ?? null;
  const locationSource: 'device' | 'comuna' | 'none' = geo.latitude != null ? 'device' : comunaPoint ? 'comuna' : 'none';

  const fetchUserEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user events:', error);
        return [];
      }

      const eventsWithDistance = data.map((event: UserEvent): EventType => {
        let distance = locationSource === 'none' ? 'Ubicación no disponible' : 'Evento sin ubicación en el mapa';
        let distanceKm = Infinity;
        
        // Calcular distancia real si tenemos coordenadas del evento y del usuario
        if (event.latitude && event.longitude && latitude && longitude) {
          distanceKm = calculateDistance(latitude, longitude, event.latitude, event.longitude);
          distance = (locationSource === 'comuna' ? `A ${distanceKm.toFixed(1)} km de ${comuna}` : `A ${distanceKm.toFixed(1)} km de ti`);
        }

        return {
          id: event.id,
          title: event.title,
          shortDescription: event.short_description,
          fullDescription: event.full_description || '',
          dates: event.dates,
          distance,
          price: event.price,
          imageUrl: event.image_url || '/placeholder.svg',
          images: event.image_url ? [event.image_url] : [],
          address: event.address,
          contactInfo: event.contact_info || '',
          category: (event.category as "ongoing" | "upcoming" | "past") || 'upcoming',
          user_id: event.user_id,
          latitude: event.latitude || undefined,
          longitude: event.longitude || undefined,
          is_published: event.is_published,
          start_date: event.start_date,
          end_date: event.end_date,
          distanceKm: distanceKm !== Infinity ? distanceKm : undefined,
        };
      });

      // Ordenar: por proximidad (en tramos de 5 km) y luego por fecha más próxima
      const today = new Date(new Date().toDateString()).getTime();
      const dateKey = (e: EventType) => {
        if (!e.start_date) return Number.MAX_SAFE_INTEGER;
        const start = new Date(e.start_date + 'T00:00:00').getTime();
        const end = e.end_date ? new Date(e.end_date + 'T00:00:00').getTime() : start;
        if (end < today) return Number.MAX_SAFE_INTEGER - 1; // pasados al final
        return Math.max(start, today); // en curso cuenta como hoy
      };
      const bucket = (e: EventType) =>
        e.distanceKm !== undefined ? Math.floor(e.distanceKm / 5) : Number.MAX_SAFE_INTEGER;
      eventsWithDistance.sort((a, b) => {
        const ba = bucket(a), bb = bucket(b);
        if (ba !== bb) return ba - bb;
        const da = dateKey(a), db = dateKey(b);
        if (da !== db) return da - db;
        return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
      });

      return eventsWithDistance;
    } catch (error) {
      console.error('Unexpected error fetching events:', error);
      return [];
    }
  };

  const getEventById = async (id: string): Promise<EventType | null> => {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      let distance = locationSource === 'none' ? 'Ubicación no disponible' : 'Evento sin ubicación en el mapa';
      
      // Calcular distancia real si tenemos coordenadas
      if (data.latitude && data.longitude && latitude && longitude) {
        const distanceKm = calculateDistance(latitude, longitude, data.latitude, data.longitude);
        distance = (locationSource === 'comuna' ? `A ${distanceKm.toFixed(1)} km de ${comuna}` : `A ${distanceKm.toFixed(1)} km de ti`);
      }

      return {
        id: data.id,
        title: data.title,
        shortDescription: data.short_description,
        fullDescription: data.full_description || '',
        dates: data.dates,
        distance,
        price: data.price,
        imageUrl: data.image_url || '/placeholder.svg',
        images: data.image_url ? [data.image_url] : [],
        address: data.address,
        contactInfo: data.contact_info || '',
        category: (data.category as "ongoing" | "upcoming" | "past") || 'upcoming',
        user_id: data.user_id,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        is_published: data.is_published,
        start_date: data.start_date,
        end_date: data.end_date,
        distanceKm: data.latitude && data.longitude && latitude && longitude ? calculateDistance(latitude, longitude, data.latitude, data.longitude) : undefined,
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const events = await fetchUserEvents();
      setUserEvents(events);
      setLoading(false);
    };

    loadEvents();
  }, [latitude, longitude]);

  const getAllEvents = (): EventType[] => {
    return userEvents;
  };

  return {
    userEvents,
    loading,
    locationSource,
    geoLoading: geo.loading,
    getAllEvents,
    getEventById,
    refetch: fetchUserEvents,
  };
};
