
export interface EventActivity {
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
}
