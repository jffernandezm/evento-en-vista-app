
export interface EventActivity {
  id?: string;
  time: string;
  description: string;
}

export interface EventDay {
  date: string;
  activities: EventActivity[];
}

export interface EventType {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  dates: string; // Could be a single date or a range
  distance: string; // e.g., "A 5km de ti" (simulated for now)
  price: string; // e.g., "Gratis" or "$10.000 CLP"
  imageUrl: string;
  images: string[]; // For event detail page
  address: string;
  contactInfo: string;
  activitiesByDay?: EventDay[]; // Optional for multi-day events
  category?: "ongoing" | "upcoming" | "past";
  user_id?: string;
  latitude?: number;
  longitude?: number;
}

// Usar la estructura actual de la base de datos
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
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}
