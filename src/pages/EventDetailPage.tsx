
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { EventType, EventDay } from '@/types/event';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, DollarSign, Info, Phone, Edit, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleMap from '@/components/GoogleMap';
import EventActivitiesManager from '@/components/EventActivitiesManager';
import EventMediaManager from '@/components/EventMediaManager';
import FavoriteButton from '@/components/FavoriteButton';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const { getEventById } = useEvents();
  const { logActivity } = useActivityLogger();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvent();
      // Log event view
      logActivity('event_view', id);
    }
  }, [id, logActivity]);

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

  // Asegurar que los textos sean cadenas válidas
  const safeTitle = event.title || 'Sin título';
  const safeDates = event.dates || 'Fechas no especificadas';
  const safeDistance = event.distance || 'Ubicación no disponible';
  const safePrice = event.price || 'Precio no especificado';
  const safeDescription = event.fullDescription || 'Descripción no disponible';
  const safeContactInfo = event.contactInfo || 'Información de contacto no disponible';
  const safeAddress = event.address || 'Dirección no disponible';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={safeTitle} 
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
        <div className="absolute top-4 right-4 flex gap-2">
          <FavoriteButton eventId={id!} size="md" />
          {canEdit && (
            <Button asChild variant="outline" size="icon" className="rounded-full bg-white/70 hover:bg-white">
              <Link to={`/edit-event/${id}`}>
                <Edit className="w-5 h-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4 -mt-12">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">{safeTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <CalendarDays className="w-5 h-5 mr-3 text-primary" />
                <span>{safeDates}</span>
              </div>
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <div className="flex flex-col">
                  <span className="font-medium">{safeAddress}</span>
                  <span className="text-xs text-gray-500">{safeDistance}</span>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <DollarSign className="w-5 h-5 mr-3 text-primary" />
                <span>{safePrice}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2 text-primary"/>
                Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed">{safeDescription}</p>
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
              address={safeAddress}
              latitude={event.latitude}
              longitude={event.longitude}
              title={safeTitle}
            />

            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary"/>
                Contacto
              </h2>
              <p className="text-gray-700">{safeContactInfo}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;
