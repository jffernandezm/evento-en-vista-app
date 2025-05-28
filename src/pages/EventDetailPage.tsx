
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockEvents } from '@/data/mockEvents';
import { EventType, EventDay } from '@/types/event';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, MapPin, DollarSign, Info, Users, Phone } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const event = mockEvents.find(e => e.id === id);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="relative">
        {event.images && event.images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {event.images.map((img, index) => (
                <CarouselItem key={index}>
                  <img src={img} alt={`${event.title} - Imagen ${index + 1}`} className="w-full h-64 md:h-96 object-cover" />
                </CarouselItem>
              ))}
            </CarouselContent>
            {event.images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white" />
              </>
            )}
          </Carousel>
        ) : (
          <img src={event.imageUrl} alt={event.title} className="w-full h-64 md:h-96 object-cover" />
        )}
        <div className="absolute top-4 left-4">
          <Button asChild variant="outline" size="icon" className="rounded-full bg-white/70 hover:bg-white">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
        </div>
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
                <MapPin className="w-5 h-5 mr-3 text-primary" />
                <span>{event.distance} (Desde: {event.address})</span>
              </div>
              <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                <DollarSign className="w-5 h-5 mr-3 text-primary" />
                <span>{event.price}</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center"><Info className="w-5 h-5 mr-2 text-primary"/>Descripción</h2>
              <p className="text-gray-700 leading-relaxed">{event.fullDescription}</p>
            </div>

            {event.activitiesByDay && event.activitiesByDay.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center"><Users className="w-5 h-5 mr-2 text-primary"/>Actividades por Día</h2>
                <Accordion type="single" collapsible className="w-full">
                  {event.activitiesByDay.map((day, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="font-medium">{day.date}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                          {day.activities.map((activity, actIndex) => (
                            <li key={actIndex}><strong>{activity.time}:</strong> {activity.description}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center"><MapPin className="w-5 h-5 mr-2 text-primary"/>Ubicación</h2>
              <p className="text-gray-700">{event.address}</p>
              <div className="mt-2">
                {/* Placeholder for map integration */}
                <Button variant="outline">Ver en Mapa (Próximamente)</Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center"><Phone className="w-5 h-5 mr-2 text-primary"/>Contacto</h2>
              <p className="text-gray-700">{event.contactInfo}</p>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;
