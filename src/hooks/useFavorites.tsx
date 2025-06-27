
import { useState, useEffect, useCallback } from 'react';
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

  const getFavoriteEvents = useCallback(async (): Promise<EventType[]> => {
    if (!user) {
      console.log('No user found');
      return [];
    }

    try {
      console.log('Starting to fetch favorite events for user:', user.id);
      
      // Obtener los IDs de favoritos más recientes
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (favoritesError) {
        console.error('Error fetching favorites:', favoritesError);
        return [];
      }

      console.log('Fresh favorites data:', favoritesData);

      if (!favoritesData || favoritesData.length === 0) {
        console.log('No favorites found for user');
        return [];
      }

      const favoriteIds = favoritesData.map(fav => fav.event_id);
      console.log('Favorite IDs to fetch events for:', favoriteIds);

      // Obtener todos los eventos favoritos
      const { data: eventsData, error: eventsError } = await supabase
        .from('user_events')
        .select('*')
        .in('id', favoriteIds)
        .eq('is_published', true);

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        return [];
      }

      console.log('Published events found:', eventsData);

      if (!eventsData || eventsData.length === 0) {
        console.log('No published events found with those IDs');
        return [];
      }

      // Convertir al formato EventType
      const events: EventType[] = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        shortDescription: event.short_description,
        fullDescription: event.full_description || '',
        dates: event.dates,
        distance: event.address || 'Ubicación no disponible',
        price: event.price || 'Gratis',
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

      console.log('Final converted events:', events);
      return events;
    } catch (error) {
      console.error('Error in getFavoriteEvents:', error);
      return [];
    }
  }, [user]);

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
