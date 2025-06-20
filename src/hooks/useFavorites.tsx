
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

      setFavorites(data.map(fav => fav.event_id));
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
      // Primero obtenemos los IDs de los favoritos
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('user_favorites')
        .select('event_id')
        .eq('user_id', user.id);

      if (favoritesError) throw favoritesError;

      if (!favoritesData || favoritesData.length === 0) return [];

      const favoriteIds = favoritesData.map(fav => fav.event_id);

      // Luego obtenemos los eventos usando esos IDs
      const { data: eventsData, error: eventsError } = await supabase
        .from('user_events')
        .select('*')
        .in('id', favoriteIds)
        .eq('is_published', true);

      if (eventsError) throw eventsError;

      return eventsData.map(event => ({
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
    } catch (error) {
      console.error('Error fetching favorite events:', error);
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
