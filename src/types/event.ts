
export interface EventType {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  dates: string;
  distance: string;
  price: string;
  imageUrl: string;
  images: string[];
  address: string;
  contactInfo: string;
  category: 'upcoming' | 'ongoing' | 'past';
  user_id?: string;
  latitude?: number;
  longitude?: number;
  is_published?: boolean;
  start_date?: string;
  end_date?: string;
  distanceKm?: number;
  activitiesByDay?: EventDay[];
}

export interface UserEvent {
  id: string;
  user_id: string;
  title: string;
  short_description: string;
  full_description?: string;
  dates: string;
  price: string;
  image_url?: string;
  address: string;
  contact_info?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  is_published: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EventDay {
  id: string;
  event_id: string;
  day_date: string;
  activities: EventActivity[];
}

export interface EventActivity {
  id: string;
  event_id: string;
  day_date: string;
  time_slot: string;
  activity_description: string;
  rich_description?: any;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventMedia {
  id: string;
  event_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
  created_at: string;
  updated_at: string;
}
