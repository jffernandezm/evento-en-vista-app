
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, DollarSign, Phone, MapPin, Save } from 'lucide-react';
import DateRangePicker from '@/components/DateRangePicker';
import ImageUploader from '@/components/ImageUploader';
import EventActivitiesManager from '@/components/EventActivitiesManager';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    price: 'Gratis',
    imageUrl: '',
    address: '',
    contactInfo: '',
    category: 'upcoming',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id, user, isAdmin]);

  const loadEvent = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error loading event:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el evento",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Verificar permisos
      const userCanEdit = user && (data.user_id === user.id || isAdmin);
      setCanEdit(userCanEdit || false);

      if (!userCanEdit) {
        toast({
          title: "Sin permisos",
          description: "No tienes permisos para editar este evento",
          variant: "destructive"
        });
        navigate(`/event/${id}`);
        return;
      }

      setFormData({
        title: data.title,
        shortDescription: data.short_description,
        fullDescription: data.full_description || '',
        price: data.price,
        imageUrl: data.image_url || '',
        address: data.address,
        contactInfo: data.contact_info || '',
        category: data.category || 'upcoming',
        latitude: data.latitude,
        longitude: data.longitude,
      });

      if (data.start_date) {
        setStartDate(new Date(data.start_date));
      }
      if (data.end_date) {
        setEndDate(new Date(data.end_date));
      }

    } catch (error) {
      console.error('Error loading event:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar el evento",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateDatesString = () => {
    if (!startDate) return '';
    
    if (endDate && startDate.getTime() !== endDate.getTime()) {
      return `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;
    }
    
    return format(startDate, 'dd/MM/yyyy');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    if (!startDate) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos la fecha de inicio",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Geocodificar la dirección si ha cambiado
      let lat = formData.latitude;
      let lng = formData.longitude;

      if (formData.address && (!lat || !lng)) {
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address)}&limit=1`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.length > 0) {
            lat = parseFloat(geocodeData[0].lat);
            lng = parseFloat(geocodeData[0].lon);
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        }
      }

      const eventData = {
        title: formData.title,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription,
        dates: generateDatesString(),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : startDate.toISOString().split('T')[0],
        price: formData.price,
        image_url: formData.imageUrl,
        address: formData.address,
        contact_info: formData.contactInfo,
        category: formData.category,
        latitude: lat,
        longitude: lng,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('user_events')
        .update(eventData)
        .eq('id', id);

      if (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar el evento",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: "¡Evento actualizado exitosamente!"
        });
        navigate(`/event/${id}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Sin Permisos</h2>
            <p className="text-gray-600 mb-4">No tienes permisos para editar este evento.</p>
            <Button asChild>
              <Link to={`/event/${id}`}>Volver al Evento</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <Button asChild variant="ghost" size="icon" className="mr-4">
            <Link to={`/event/${id}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Editar Evento</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Título del Evento *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Nombre del evento"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="shortDescription" className="block text-sm font-medium mb-1">
                    Descripción Corta *
                  </label>
                  <Input
                    id="shortDescription"
                    type="text"
                    placeholder="Descripción breve del evento"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="fullDescription" className="block text-sm font-medium mb-1">
                    Descripción Completa
                  </label>
                  <Textarea
                    id="fullDescription"
                    placeholder="Descripción detallada del evento..."
                    value={formData.fullDescription}
                    onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fechas del Evento *
                  </label>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="text"
                      placeholder="ej: Gratis, $10.000 CLP"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="pl-10"
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Dirección del Evento
                  </label>
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder="Dirección completa del evento"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="contactInfo" className="block text-sm font-medium mb-1">
                    Información de Contacto
                  </label>
                  <div className="relative">
                    <Input
                      id="contactInfo"
                      type="text"
                      placeholder="Email, teléfono, etc."
                      value={formData.contactInfo}
                      onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <ImageUploader
                  imageUrl={formData.imageUrl}
                  onImageChange={(url) => handleInputChange('imageUrl', url)}
                  onMessage={(msg, isError) => toast({
                    title: isError ? "Error" : "Éxito",
                    description: msg,
                    variant: isError ? "destructive" : "default"
                  })}
                />

                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    Categoría
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Próximos</SelectItem>
                      <SelectItem value="ongoing">En Curso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link to={`/event/${id}`}>Cancelar</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <EventActivitiesManager eventId={id!} canEdit={canEdit} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditEventPage;
