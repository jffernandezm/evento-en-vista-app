
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, MapPin, DollarSign, Image, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateEventPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    dates: '',
    price: 'Gratis',
    imageUrl: '',
    address: '',
    contactInfo: '',
    category: 'upcoming',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear eventos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Mapear los nombres de propiedades del formulario a los nombres de columnas de la base de datos
      const eventData = {
        user_id: user.id,
        title: formData.title,
        short_description: formData.shortDescription,
        full_description: formData.fullDescription,
        dates: formData.dates,
        price: formData.price,
        image_url: formData.imageUrl,
        address: formData.address,
        contact_info: formData.contactInfo,
        category: formData.category,
      };

      const { error } = await supabase
        .from('user_events')
        .insert([eventData]);

      if (error) {
        console.error('Error creating event:', error);
        toast({
          title: "Error",
          description: "No se pudo crear el evento. Intenta de nuevo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Evento creado!",
          description: "Tu evento ha sido publicado exitosamente.",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Acceso Requerido</h2>
            <p className="text-gray-600 mb-4">Debes iniciar sesión para crear eventos.</p>
            <Button asChild>
              <Link to="/auth">Iniciar Sesión</Link>
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
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Crear Nuevo Evento</h1>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dates" className="block text-sm font-medium mb-1">
                    Fechas *
                  </label>
                  <div className="relative">
                    <Input
                      id="dates"
                      type="text"
                      placeholder="ej: 15-17 Junio 2024"
                      value={formData.dates}
                      onChange={(e) => handleInputChange('dates', e.target.value)}
                      required
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
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
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Dirección *
                </label>
                <div className="relative">
                  <Input
                    id="address"
                    type="text"
                    placeholder="Dirección completa del evento"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
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

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                  URL de Imagen
                </label>
                <div className="relative">
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="pl-10"
                  />
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

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
                  {loading ? 'Creando...' : 'Crear Evento'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to="/">Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEventPage;
