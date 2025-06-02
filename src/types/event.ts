
export interface EventActivity {
  id?: string;
  time: string;
  description: string;
  rich_description?: any; // JSON para texto enriquecido
  image_url?: string; // Nueva imagen opcional para actividad
}

export interface EventDay {
  date: string;
  activities: EventActivity[];
}

// Tipo para los medios de eventos
export interface EventMedia {
  id: string;
  event_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Tipo para las actividades en la base de datos
export interface DatabaseEventActivity {
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
  mediaFiles?: EventMedia[]; // Nueva propiedad para múltiples medios
  address: string;
  contactInfo: string;
  activitiesByDay?: EventDay[];
  category?: "ongoing" | "upcoming" | "past";
  user_id?: string;
  latitude?: number;
  longitude?: number;
  is_published?: boolean;
}

export interface UserEvent {
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
  user_id: string;
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  latitude: number | null;
  longitude: number | null;
  is_published: boolean;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}
