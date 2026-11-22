
import React from 'react';
import { Link } from 'react-router-dom';
import { EventType } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, DollarSign } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

interface EventCardProps {
  event: EventType;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col relative">
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton eventId={event.id} size="sm" />
      </div>
      <img className="w-full h-48 object-cover" src={event.imageUrl} alt={event.title} />
      <CardHeader>
        <CardTitle className="text-xl font-bold">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-foreground text-sm mb-2">{event.shortDescription}</p>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <CalendarDays className="w-4 h-4 mr-2 text-primary" />
          <span>{event.dates}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-1">
          <MapPin className="w-4 h-4 mr-2 text-primary" />
          <span>{event.distance}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 mr-2 text-primary" />
          <span>{event.price}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link to={`/event/${event.id}`}>Ver Detalles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
