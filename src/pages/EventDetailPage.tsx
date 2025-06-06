
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { EventType, EventDay } from '@/types/event';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, DollarSign, Info, Phone, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleMap from '@/components/GoogleMap';
import EventActivitiesManager from '@/components/EventActivitiesManager';
import EventMediaManager from '@/components/EventMediaManager';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const { getEventById } = useEvents();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const userEvent = await getEventById(id);
      if (userEvent) {
        setEvent(userEvent);
      } else {
        setEvent(null);
      }
    } catch (error) {
      console.error('Error loading event:', error);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl">Cargando evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
        <Button asChild>
          <Link to="/">Volver a la lista</Link>
        </Button>
      </div>
    );
  }

  // Verificar permisos: el usuario debe ser el creador del evento o admin
  const canEdit = user && event.user_id && (event.user_id === user.id || isAdmin);
  const isUserEvent = !!event.user_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-64 md:h-96 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-4 left-4">
          <Button asChild variant="outline" size="icon" className="rounded-full bg-white/70 hover:bg-white">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
        </div>
        {canEdit && (
          <div className="absolute top-4 right-4">
            <Button asChild variant="outline" size="icon" className="rounded-full bg-white/70 hover:bg-white">
              <Link to={`/edit-event/${id}`}>
                <Edit className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="container mx-auto p-4 -mt-12">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <CalendarDays className="w-5 h-5 mr-3 text-primary" />
                <span>{event.dates}</span>
              </div>
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <span className="w-5 h-5 mr-3 text-primary flex items-center justify-center text-xs">📍</span>
                <span>{event.distance}</span>
              </div>
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <DollarSign className="w-5 h-5 mr-3 text-primary" />
                <span>{event.price}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary"/>
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed">{event.fullDescription}</p>
            </div>

            {isUserEvent && (
              <EventMediaManager 
                eventId={id!} 
                canEdit={canEdit || false} 
              />
            )}

            <EventActivitiesManager 
              eventId={id!} 
              canEdit={canEdit || false} 
            />
            
            <GoogleMap 
              address={event.address}
              latitude={event.latitude}
              longitude={event.longitude}
              title={event.title}
            />

            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary"/>
                Contacto
              </h2>
              <p className="text-gray-700">{event.contactInfo}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;
