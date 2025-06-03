import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, Calendar, Clock, ChevronDown, ChevronRight, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventDay, EventActivity, DatabaseEventActivity } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';
import RichTextEditor from './RichTextEditor';
import RichTextDisplay from './RichTextDisplay';

interface EventActivitiesManagerProps {
  eventId: string;
  canEdit: boolean;
  onActivitiesChange?: (activities: EventDay[]) => void;
}

const EventActivitiesManager: React.FC<EventActivitiesManagerProps> = ({ 
  eventId, 
  canEdit, 
  onActivitiesChange 
}) => {
  const [activities, setActivities] = useState<EventDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [newActivity, setNewActivity] = useState({
    date: '',
    time: '',
    description: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [eventId]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('event_activities')
        .select('*')
        .eq('event_id', eventId)
        .order('day_date', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) {
        console.error('Error loading activities:', error);
        return;
      }

      const groupedActivities = data.reduce((acc: EventDay[], activity: DatabaseEventActivity) => {
        const existingDay = acc.find(day => day.date === activity.day_date);
        
        const activityObj: EventActivity = {
          id: activity.id,
          time: activity.time_slot,
          description: activity.activity_description,
          rich_description: activity.rich_description,
          image_url: activity.image_url || undefined
        };

        if (existingDay) {
          existingDay.activities.push(activityObj);
        } else {
          acc.push({
            date: activity.day_date,
            activities: [activityObj]
          });
        }
        
        return acc;
      }, []);

      setActivities(groupedActivities);
      onActivitiesChange?.(groupedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const uploadActivityImage = async (file: File) => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `activities/${eventId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('event-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('event-media')
        .getPublicUrl(fileName);

      setNewActivity(prev => ({ ...prev, image_url: data.publicUrl }));
      
      toast({
        title: "Éxito",
        description: "Imagen subida correctamente"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no puede ser mayor a 5MB",
          variant: "destructive"
        });
        return;
      }
      uploadActivityImage(file);
    }
  };

  const addActivity = async () => {
    if (!newActivity.date || !newActivity.time || !newActivity.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Asegurar que la fecha se guarde correctamente sin problemas de zona horaria
      const selectedDate = new Date(newActivity.date + 'T00:00:00');
      const formattedDate = selectedDate.toISOString().split('T')[0];

      const activityData = {
        event_id: eventId,
        day_date: formattedDate,
        time_slot: newActivity.time,
        activity_description: newActivity.description,
        rich_description: { content: newActivity.description },
        image_url: newActivity.image_url || null
      };

      console.log('Saving activity with date:', formattedDate, 'from input:', newActivity.date);

      const { error } = await supabase
        .from('event_activities')
        .insert([activityData]);

      if (error) {
        console.error('Error adding activity:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar la actividad",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Actividad agregada correctamente"
      });
      
      setNewActivity({ date: '', time: '', description: '', image_url: '' });
      await loadActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Error inesperado al agregar la actividad",
        variant: "destructive"
      });
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      const { error } = await supabase
        .from('event_activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        console.error('Error deleting activity:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la actividad",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Actividad eliminada correctamente"
      });

      await loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar la actividad",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Actividades por Día
        </h3>
        <p className="text-center py-4">Cargando actividades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Actividades por Día
      </h3>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agregar Nueva Actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha *</label>
                <Input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora *</label>
                <Input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descripción de la Actividad *</label>
              <RichTextEditor
                value={newActivity.description}
                onChange={(value) => setNewActivity(prev => ({ ...prev, description: value }))}
                placeholder="Describe la actividad... Usa **texto** para negrita, *texto* para cursiva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Imagen Opcional</label>
              {newActivity.image_url ? (
                <div className="relative mb-2">
                  <img 
                    src={newActivity.image_url} 
                    alt="Preview actividad" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setNewActivity(prev => ({ ...prev, image_url: '' }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-2">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">Imagen opcional para la actividad</p>
                </div>
              )}
              
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
                id="activity-image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('activity-image-upload')?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
              </Button>
            </div>

            <Button onClick={addActivity} className="w-full" disabled={uploading}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Actividad
            </Button>
          </CardContent>
        </Card>
      )}

      {activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((day) => (
            <Card key={day.date}>
              <Collapsible 
                open={expandedDays.has(day.date)} 
                onOpenChange={() => toggleDay(day.date)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>
                        {new Date(day.date + 'T00:00:00').toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({day.activities.length} actividad{day.activities.length !== 1 ? 'es' : ''})
                        </span>
                      </span>
                      {expandedDays.has(day.date) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center text-sm font-medium text-gray-600 mb-2">
                              <Clock className="w-4 h-4 mr-1" />
                              {activity.time}
                            </div>
                            <RichTextDisplay 
                              content={activity.description} 
                              className="text-gray-800 mb-2"
                            />
                            {activity.image_url && (
                              <img
                                src={activity.image_url}
                                alt="Actividad"
                                className="w-full max-w-sm h-32 object-cover rounded-lg mt-2"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                            )}
                          </div>
                          {canEdit && activity.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteActivity(activity.id!)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No hay actividades programadas para este evento.</p>
      )}
    </div>
  );
};

export default EventActivitiesManager;
