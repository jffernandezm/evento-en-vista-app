
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockEvents } from '@/data/mockEvents';
import { EventType } from '@/types/event';

interface UserEvent {
  id: string;
  title: string;
  short_description: string;
  full_description: string | null;
  dates: string;
  price: string;
  image_url: string | null;
  address: string;
  contact_info: string | null;
  category: string | null;
}

export const useEvents = () => {
  const [userEvents, setUserEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

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

      return data.map((event: UserEvent): EventType => ({
        id: event.id,
        title: event.title,
        shortDescription: event.short_description,
        fullDescription: event.full_description || '',
        dates: event.dates,
        distance: 'Evento de usuario',
        price: event.price,
        imageUrl: event.image_url || '/placeholder.svg',
        images: event.image_url ? [event.image_url] : [],
        address: event.address,
        contactInfo: event.contact_info || '',
        category: (event.category as "ongoing" | "upcoming" | "past") || 'upcoming',
      }));
    } catch (error) {
      console.error('Unexpected error fetching events:', error);
      return [];
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
  }, []);

  const getAllEvents = (): EventType[] => {
    return [...mockEvents, ...userEvents];
  };

  return {
    userEvents,
    loading,
    getAllEvents,
    refetch: fetchUserEvents,
  };
};
