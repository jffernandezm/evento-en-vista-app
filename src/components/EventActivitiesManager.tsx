
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventDay, EventActivity, DatabaseEventActivity } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';

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
  const [newActivity, setNewActivity] = useState({
    date: '',
    time: '',
    description: ''
  });
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

      // Convertir datos de la BD al formato de la UI
      const groupedActivities = data.reduce((acc: EventDay[], activity: DatabaseEventActivity) => {
        const existingDay = acc.find(day => day.date === activity.day_date);
        
        const activityObj: EventActivity = {
          id: activity.id,
          time: activity.time_slot,
          description: activity.activity_description
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

  const addActivity = async () => {
    if (!newActivity.date || !newActivity.time || !newActivity.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    try {
      const activityData = {
        event_id: eventId,
        day_date: newActivity.date,
        time_slot: newActivity.time,
        activity_description: newActivity.description
      };

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
      
      setNewActivity({ date: '', time: '', description: '' });
      await loadActivities(); // Recargar actividades
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

      await loadActivities(); // Recargar actividades
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
                <label className="block text-sm font-medium mb-1">Fecha</label>
                <Input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <Input
                  type="time"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción de la Actividad</label>
              <Textarea
                placeholder="Describe la actividad..."
                value={newActivity.description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <Button onClick={addActivity} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Actividad
            </Button>
          </CardContent>
        </Card>
      )}

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((day, dayIndex) => (
            <Card key={day.date}>
              <CardHeader>
                <CardTitle className="text-base">
                  {new Date(day.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center text-sm font-medium text-gray-600 mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {activity.time}
                        </div>
                        <p className="text-gray-800">{activity.description}</p>
                      </div>
                      {canEdit && activity.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteActivity(activity.id!)}
                          className="ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
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
