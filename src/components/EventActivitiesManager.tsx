
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Calendar, Clock, Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { EventDay, EventActivity } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import ImageUploader from '@/components/ImageUploader';
import RichTextEditor from '@/components/RichTextEditor';
import RichTextDisplay from '@/components/RichTextDisplay';

interface EventActivitiesManagerProps {
  eventId: string;
  canEdit: boolean;
}

const EventActivitiesManager: React.FC<EventActivitiesManagerProps> = ({ eventId, canEdit }) => {
  const { toast } = useToast();
  const [activitiesByDay, setActivitiesByDay] = useState<EventDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({
    day_date: '',
    time_slot: '',
    activity_description: '',
    rich_description: '',
    image_url: ''
  });
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [editActivityData, setEditActivityData] = useState<EventActivity | null>(null);

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
        toast({
          title: "Error",
          description: "No se pudieron cargar las actividades",
          variant: "destructive"
        });
        return;
      }

      // Agrupar actividades por día
      const groupedActivities: EventDay[] = [];
      data?.forEach((activity) => {
        const dayDate = activity.day_date;
        let dayGroup = groupedActivities.find(day => day.day_date === dayDate);
        
        if (!dayGroup) {
          dayGroup = {
            day_date: dayDate,
            activities: []
          };
          groupedActivities.push(dayGroup);
        }
        
        dayGroup.activities.push({
          id: activity.id,
          event_id: activity.event_id,
          day_date: activity.day_date,
          time_slot: activity.time_slot,
          activity_description: activity.activity_description,
          rich_description: activity.rich_description,
          image_url: activity.image_url,
          created_at: activity.created_at,
          updated_at: activity.updated_at
        });
      });

      setActivitiesByDay(groupedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: "Error",
        description: "Error inesperado al cargar actividades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.day_date || !newActivity.time_slot || !newActivity.activity_description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_activities')
        .insert([{
          event_id: eventId,
          day_date: newActivity.day_date,
          time_slot: newActivity.time_slot,
          activity_description: newActivity.activity_description,
          rich_description: newActivity.rich_description ? JSON.parse(newActivity.rich_description) : null,
          image_url: newActivity.image_url || null
        }]);

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

      setNewActivity({
        day_date: '',
        time_slot: '',
        activity_description: '',
        rich_description: '',
        image_url: ''
      });

      loadActivities();
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Error inesperado al agregar actividad",
        variant: "destructive"
      });
    }
  };

  const handleEditActivity = (activity: EventActivity) => {
    setEditingActivity(activity.id || '');
    setEditActivityData({
      ...activity,
      rich_description: activity.rich_description ? JSON.stringify(activity.rich_description) : ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editActivityData || !editActivityData.id) return;

    try {
      const { error } = await supabase
        .from('event_activities')
        .update({
          day_date: editActivityData.day_date,
          time_slot: editActivityData.time_slot,
          activity_description: editActivityData.activity_description,
          rich_description: editActivityData.rich_description ? JSON.parse(editActivityData.rich_description as string) : null,
          image_url: editActivityData.image_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editActivityData.id);

      if (error) {
        console.error('Error updating activity:', error);
        toast({
          title: "Error",
          description: "No se pudo actualizar la actividad",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Actividad actualizada correctamente"
      });

      setEditingActivity(null);
      setEditActivityData(null);
      loadActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Error",
        description: "Error inesperado al actualizar actividad",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditActivityData(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return;
    }

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

      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar actividad",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividades del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando actividades...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Actividades del Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canEdit && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Nueva Actividad
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha *</label>
                <Input
                  type="date"
                  value={newActivity.day_date}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, day_date: e.target.value }))}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hora *</label>
                <Input
                  type="time"
                  value={newActivity.time_slot}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time_slot: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Descripción Breve *</label>
              <Textarea
                placeholder="Describe brevemente la actividad..."
                value={newActivity.activity_description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, activity_description: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción Detallada</label>
              <RichTextEditor
                value={newActivity.rich_description}
                onChange={(value) => setNewActivity(prev => ({ ...prev, rich_description: value }))}
                placeholder="Descripción detallada con formato..."
              />
            </div>

            <ImageUploader
              imageUrl={newActivity.image_url}
              onImageChange={(url) => setNewActivity(prev => ({ ...prev, image_url: url }))}
              onMessage={(msg, isError) => toast({
                title: isError ? "Error" : "Éxito",
                description: msg,
                variant: isError ? "destructive" : "default"
              })}
            />
            
            <Button onClick={handleAddActivity} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Actividad
            </Button>
          </div>
        )}

        {activitiesByDay.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay actividades programadas para este evento.
          </p>
        ) : (
          <div className="space-y-6">
            {activitiesByDay.map((day, dayIndex) => (
              <div key={day.day_date} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {format(parseISO(day.day_date), 'EEEE, dd MMMM yyyy', { locale: es })}
                  </h3>
                  <Badge variant="outline">
                    {day.activities.length} actividad{day.activities.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-3 ml-7">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 bg-white">
                      {editingActivity === activity.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Fecha *</label>
                              <Input
                                type="date"
                                value={editActivityData?.day_date || ''}
                                onChange={(e) => setEditActivityData(prev => 
                                  prev ? { ...prev, day_date: e.target.value } : null
                                )}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1">Hora *</label>
                              <Input
                                type="time"
                                value={editActivityData?.time_slot || ''}
                                onChange={(e) => setEditActivityData(prev => 
                                  prev ? { ...prev, time_slot: e.target.value } : null
                                )}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1">Descripción Breve *</label>
                            <Textarea
                              value={editActivityData?.activity_description || ''}
                              onChange={(e) => setEditActivityData(prev => 
                                prev ? { ...prev, activity_description: e.target.value } : null
                              )}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">Descripción Detallada</label>
                            <RichTextEditor
                              value={editActivityData?.rich_description as string || ''}
                              onChange={(value) => setEditActivityData(prev => 
                                prev ? { ...prev, rich_description: value } : null
                              )}
                              placeholder="Descripción detallada con formato..."
                            />
                          </div>

                          <ImageUploader
                            imageUrl={editActivityData?.image_url || ''}
                            onImageChange={(url) => setEditActivityData(prev => 
                              prev ? { ...prev, image_url: url } : null
                            )}
                            onMessage={(msg, isError) => toast({
                              title: isError ? "Error" : "Éxito",
                              description: msg,
                              variant: isError ? "destructive" : "default"
                            })}
                          />
                          
                          <div className="flex space-x-2">
                            <Button onClick={handleSaveEdit} size="sm">
                              <Save className="w-4 h-4 mr-1" />
                              Guardar
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">{activity.time_slot}</span>
                              </div>
                              <h4 className="font-medium mb-2">{activity.activity_description}</h4>
                              
                              {activity.rich_description && (
                                <div className="mb-3">
                                  <RichTextDisplay content={activity.rich_description} />
                                </div>
                              )}
                              
                              {activity.image_url && (
                                <div className="mt-3">
                                  <img 
                                    src={activity.image_url} 
                                    alt="Actividad" 
                                    className="max-w-xs rounded-lg shadow-sm"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {canEdit && (
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  onClick={() => handleEditActivity(activity)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteActivity(activity.id || '')}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                {dayIndex < activitiesByDay.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventActivitiesManager;
