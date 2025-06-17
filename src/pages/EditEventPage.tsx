
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { LocationPicker } from '@/components/LocationPicker';
import { ImageUploader } from '@/components/ImageUploader';
import { EventMediaManager } from '@/components/EventMediaManager';
import { EventActivitiesManager } from '@/components/EventActivitiesManager';
import { EventRecurrence } from '@/components/EventRecurrence';
import type { UserEvent, EventDay } from '@/types/event';

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [dates, setDates] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activitiesByDay, setActivitiesByDay] = useState<EventDay[]>([]);
  
  // Recurrence state
  const [recurrenceTypeId, setRecurrenceTypeId] = useState<string | null>(null);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();

  // Fetch event data
  const { data: event, isLoading } = useQuery({
    queryKey: ['user-event', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required');
      
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as UserEvent;
    },
    enabled: !!id,
  });

  // Fetch event activities
  const { data: activities = [] } = useQuery({
    queryKey: ['event-activities', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('event_activities')
        .select('*')
        .eq('event_id', id)
        .order('day_date', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Load form data when event is fetched
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setShortDescription(event.short_description);
      setFullDescription(event.full_description || '');
      setDates(event.dates);
      setPrice(event.price);
      setImageUrl(event.image_url || '');
      setAddress(event.address);
      setContactInfo(event.contact_info || '');
      setLatitude(event.latitude || null);
      setLongitude(event.longitude || null);
      setIsPublished(event.is_published);
      setStartDate(event.start_date || '');
      setEndDate(event.end_date || '');
      
      // Load recurrence data
      setRecurrenceTypeId(event.recurrence_type_id || null);
      setRecurrenceDays(event.recurrence_days || []);
      if (event.recurrence_end_date) {
        setRecurrenceEndDate(new Date(event.recurrence_end_date));
      }
    }
  }, [event]);

  // Group activities by day
  useEffect(() => {
    if (activities.length > 0) {
      const groupedActivities = activities.reduce((acc, activity) => {
        const dayDate = activity.day_date;
        const existingDay = acc.find(day => day.day_date === dayDate);
        
        if (existingDay) {
          existingDay.activities.push(activity);
        } else {
          acc.push({
            day_date: dayDate,
            activities: [activity]
          });
        }
        
        return acc;
      }, [] as EventDay[]);
      
      setActivitiesByDay(groupedActivities);
    }
  }, [activities]);

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Partial<UserEvent>) => {
      if (!id) throw new Error('Event ID is required');
      
      const { data, error } = await supabase
        .from('user_events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Evento actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['user-event', id] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast.error('Error al actualizar el evento');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!shortDescription.trim()) {
      toast.error('La descripción corta es requerida');
      return;
    }

    if (!address.trim()) {
      toast.error('La dirección es requerida');
      return;
    }

    const eventData: Partial<UserEvent> = {
      title: title.trim(),
      short_description: shortDescription.trim(),
      full_description: fullDescription.trim(),
      dates: dates.trim(),
      price: price.trim(),
      image_url: imageUrl.trim() || null,
      address: address.trim(),
      contact_info: contactInfo.trim() || null,
      latitude,
      longitude,
      is_published: isPublished,
      start_date: startDate || null,
      end_date: endDate || null,
      recurrence_type_id: recurrenceTypeId,
      recurrence_days: recurrenceDays.length > 0 ? recurrenceDays : null,
      recurrence_end_date: recurrenceEndDate ? recurrenceEndDate.toISOString() : null,
    };

    updateEventMutation.mutate(eventData);
  };

  const handleLocationSelect = (lat: number, lng: number, selectedAddress: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(selectedAddress);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Evento no encontrado</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold">Editar Evento</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="text-sm">
              {isPublished ? 'Publicado' : 'Borrador'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Evento *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nombre del evento"
                  required
                />
              </div>

              <div>
                <Label htmlFor="short-description">Descripción Corta *</Label>
                <Textarea
                  id="short-description"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Una breve descripción del evento"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="full-description">Descripción Completa</Label>
                <Textarea
                  id="full-description"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Descripción detallada del evento"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dates">Fechas</Label>
                  <Input
                    id="dates"
                    value={dates}
                    onChange={(e) => setDates(e.target.value)}
                    placeholder="Ej: 15-20 de Marzo, 2024"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ej: Gratis, $50, $20-$100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Fecha de Inicio</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">Fecha de Fin</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-info">Información de Contacto</Label>
                <Textarea
                  id="contact-info"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Teléfono, email, redes sociales, etc."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Imagen Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                currentImageUrl={imageUrl}
                onImageUploaded={(url) => setImageUrl(url)}
                onImageRemoved={() => setImageUrl('')}
              />
            </CardContent>
          </Card>

          {/* Event Media */}
          <EventMediaManager eventId={id!} />

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationPicker
                address={address}
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={handleLocationSelect}
                onAddressChange={setAddress}
              />
            </CardContent>
          </Card>

          {/* Event Recurrence */}
          <EventRecurrence
            recurrenceTypeId={recurrenceTypeId}
            recurrenceDays={recurrenceDays}
            recurrenceEndDate={recurrenceEndDate}
            onRecurrenceTypeIdChange={setRecurrenceTypeId}
            onRecurrenceDaysChange={setRecurrenceDays}
            onRecurrenceEndDateChange={setRecurrenceEndDate}
          />

          {/* Event Activities */}
          <EventActivitiesManager
            eventId={id!}
            activitiesByDay={activitiesByDay}
            onActivitiesChange={setActivitiesByDay}
          />

          {/* Publish Options */}
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Publicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="is-published">
                  {isPublished ? 'Publicado (visible para todos)' : 'Borrador (solo visible para ti)'}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateEventMutation.isPending}
              className="min-w-[120px]"
            >
              {updateEventMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
