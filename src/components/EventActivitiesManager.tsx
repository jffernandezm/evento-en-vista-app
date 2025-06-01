
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DatabaseEventActivity } from '@/types/event';

interface EventActivitiesManagerProps {
  eventId: string;
  canEdit: boolean;
}

const EventActivitiesManager: React.FC<EventActivitiesManagerProps> = ({ eventId, canEdit }) => {
  const [activities, setActivities] = useState<DatabaseEventActivity[]>([]);
  const [newActivity, setNewActivity] = useState({
    day_date: '',
    time_slot: '',
    activity_description: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
  }, [eventId]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('event_activities')
        .select('*')
        .eq('event_id', eventId)
        .order('day_date', { ascending: true })
        .order('time_slot', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const addActivity = async () => {
    if (!newActivity.day_date || !newActivity.time_slot || !newActivity.activity_description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_activities')
        .insert([{
          event_id: eventId,
          ...newActivity
        }]);

      if (error) {
        console.error('Error adding activity:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar la actividad",
          variant: "destructive"
        });
      } else {
        setNewActivity({ day_date: '', time_slot: '', activity_description: '' });
        fetchActivities();
        toast({
          title: "Éxito",
          description: "Actividad agregada correctamente"
        });
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Error inesperado al agregar actividad",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
      } else {
        fetchActivities();
        toast({
          title: "Éxito",
          description: "Actividad eliminada correctamente"
        });
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.day_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, DatabaseEventActivity[]>);

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
                  value={newActivity.day_date}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, day_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <Input
                  type="time"
                  value={newActivity.time_slot}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, time_slot: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción de la Actividad</label>
              <Textarea
                placeholder="Describe la actividad..."
                value={newActivity.activity_description}
                onChange={(e) => setNewActivity(prev => ({ ...prev, activity_description: e.target.value }))}
              />
            </div>
            <Button onClick={addActivity} disabled={loading} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Actividad
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.keys(groupedActivities).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedActivities).map(([date, dayActivities]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-base">
                  {new Date(date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center text-sm font-medium text-gray-600 mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {activity.time_slot}
                        </div>
                        <p className="text-gray-800">{activity.activity_description}</p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteActivity(activity.id)}
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
