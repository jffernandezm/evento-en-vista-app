
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Play, Image as ImageIcon, Film } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventMedia } from '@/types/event';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface EventMediaManagerProps {
  eventId: string;
  canEdit: boolean;
  onMediaChange?: (media: EventMedia[]) => void;
}

// Type for database response
interface DatabaseEventMedia {
  id: string;
  event_id: string;
  media_url: string;
  media_type: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const EventMediaManager: React.FC<EventMediaManagerProps> = ({ 
  eventId, 
  canEdit, 
  onMediaChange 
}) => {
  const [media, setMedia] = useState<EventMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMedia();
  }, [eventId]);

  const loadMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('event_media')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading media:', error);
        return;
      }

      // Transform database response to match our interface
      const transformedMedia: EventMedia[] = (data as DatabaseEventMedia[] || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      }));

      setMedia(transformedMedia);
      onMediaChange?.(transformedMedia);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, mediaType: 'image' | 'video') => {
    if (!canEdit) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-media')
        .getPublicUrl(fileName);

      // Guardar en la base de datos
      const { error: dbError } = await supabase
        .from('event_media')
        .insert({
          event_id: eventId,
          media_url: data.publicUrl,
          media_type: mediaType,
          display_order: media.length
        });

      if (dbError) throw dbError;

      toast({
        title: "Éxito",
        description: `${mediaType === 'image' ? 'Imagen' : 'Video'} subido correctamente`
      });

      await loadMedia();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (mediaId: string, mediaUrl: string) => {
    if (!canEdit) return;

    try {
      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from('event_media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      // Eliminar del storage
      const fileName = mediaUrl.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('event-media')
          .remove([`${eventId}/${fileName}`]);
      }

      toast({
        title: "Éxito",
        description: "Archivo eliminado correctamente"
      });

      await loadMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, mediaType: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = mediaType === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB para imágenes, 50MB para videos
      if (file.size > maxSize) {
        toast({
          title: "Error",
          description: `El archivo no puede ser mayor a ${mediaType === 'image' ? '5MB' : '50MB'}`,
          variant: "destructive"
        });
        return;
      }
      uploadFile(file, mediaType);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Multimedia del Evento</h3>
        <p className="text-center py-4">Cargando archivos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Film className="w-5 h-5 mr-2" />
        Multimedia del Evento
      </h3>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agregar Archivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subir Imagen</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'image')}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                </Button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subir Video</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  disabled={uploading}
                  className="hidden"
                  id="video-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Film className="mr-2 h-4 w-4" />
                  {uploading ? 'Subiendo...' : 'Seleccionar Video'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {media.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {media.map((item) => (
              <CarouselItem key={item.id}>
                <Card>
                  <CardContent className="p-0 relative">
                    {item.media_type === 'image' ? (
                      <img
                        src={item.media_url}
                        alt="Evento"
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <video
                        src={item.media_url}
                        controls
                        className="w-full h-64 object-cover rounded-lg"
                      >
                        Tu navegador no soporta el elemento video.
                      </video>
                    )}
                    {canEdit && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => deleteMedia(item.id, item.media_url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {media.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
      ) : (
        <p className="text-gray-500 text-center py-8">No hay archivos multimedia para este evento.</p>
      )}
    </div>
  );
};

export default EventMediaManager;
