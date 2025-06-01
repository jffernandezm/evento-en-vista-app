
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockEvents } from '@/data/mockEvents';
import { EventType, UserEvent } from '@/types/event';
import { useGeolocation } from '@/hooks/useGeolocation';

export const useEvents = () => {
  const [userEvents, setUserEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const { latitude, longitude, calculateDistance } = useGeolocation();

  const fetchUserEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user events:', error);
        return [];
      }

      return data.map((event: UserEvent): EventType => {
        let distance = 'Ubicación no disponible';
        
        // Calcular distancia real si tenemos coordenadas del evento y del usuario
        if (event.latitude && event.longitude && latitude && longitude) {
          const distanceKm = calculateDistance(latitude, longitude, event.latitude, event.longitude);
          distance = `A ${distanceKm.toFixed(1)}km de ti`;
        } else {
          // Usar distancia simulada si no tenemos coordenadas
          const distances = ['A 2.5km de ti', 'A 1.2km de ti', 'A 850m de ti', 'A 3.1km de ti'];
          distance = distances[Math.floor(Math.random() * distances.length)];
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
        };
      });
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

      let distance = 'Ubicación no disponible';
      
      // Calcular distancia real si tenemos coordenadas
      if (data.latitude && data.longitude && latitude && longitude) {
        const distanceKm = calculateDistance(latitude, longitude, data.latitude, data.longitude);
        distance = `A ${distanceKm.toFixed(1)}km de ti`;
      } else {
        // Usar distancia simulada
        const distances = ['A 2.5km de ti', 'A 1.2km de ti', 'A 850m de ti', 'A 3.1km de ti'];
        distance = distances[Math.floor(Math.random() * distances.length)];
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
    return [...mockEvents, ...userEvents];
  };

  return {
    userEvents,
    loading,
    getAllEvents,
    getEventById,
    refetch: fetchUserEvents,
  };
};
