
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { EventType } from '@/types/event';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      const favoriteIds = data.map(fav => fav.event_id);
      setFavorites(favoriteIds);
      console.log('Fetched favorite IDs:', favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (eventId: string) => {
    if (!user) return;

    setLoading(true);
    const isFavorite = favorites.includes(eventId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== eventId));
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert([{
            user_id: user.id,
            event_id: eventId
          }]);

        if (error) throw error;
        setFavorites(prev => [...prev, eventId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFavoriteEvents = async (): Promise<EventType[]> => {
    if (!user) return [];

    try {
      // Obtener los IDs de favoritos actuales directamente
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        return [];
      }

      if (!favoritesData || favoritesData.length === 0) {
        console.log('No favorites found for user');
        return [];
      }

      const favoriteIds = favoritesData.map(fav => fav.event_id);
      console.log('Favorite IDs to fetch:', favoriteIds);

      // Buscar los eventos usando esos IDs - verificar que existan y estén publicados
      const { data: eventsData, error: eventsError } = await supabase
        .from('user_events')
        .select('*')
        .in('id', favoriteIds)
        .eq('is_published', true);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        return [];
      }

      console.log('Found favorite events in database:', eventsData);

      // Si no se encuentran eventos, revisar si el problema es que no están publicados
      if (!eventsData || eventsData.length === 0) {
        const { data: allEventsData, error: allEventsError } = await supabase
          .from('user_events')
          .select('*')
          .in('id', favoriteIds);

        if (allEventsError) {
          console.error('Error fetching all events:', allEventsError);
        } else {
          console.log('All events with favorite IDs (including unpublished):', allEventsData);
        }
        return [];
      }

      // Convertir los datos a formato EventType
      const events = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        shortDescription: event.short_description,
        fullDescription: event.full_description || '',
        dates: event.dates,
        distance: 'Ubicación no disponible',
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
      }));

      console.log('Converted favorite events:', events);
      return events;
    } catch (error) {
      console.error('Error in getFavoriteEvents:', error);
      return [];
    }
  };

  const isFavorite = (eventId: string) => favorites.includes(eventId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    getFavoriteEvents,
    refetch: fetchFavorites
  };
};
