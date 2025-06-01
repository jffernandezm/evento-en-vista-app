
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EventDay, EventActivity } from '@/types/event';

interface EventActivitiesManagerProps {
  eventId: string;
  canEdit: boolean;
  initialActivities?: EventDay[];
  onActivitiesChange?: (activities: EventDay[]) => void;
}

const EventActivitiesManager: React.FC<EventActivitiesManagerProps> = ({ 
  eventId, 
  canEdit, 
  initialActivities = [],
  onActivitiesChange 
}) => {
  const [activities, setActivities] = useState<EventDay[]>(initialActivities);
  const [newActivity, setNewActivity] = useState({
    date: '',
    time: '',
    description: ''
  });
  const { toast } = useToast();

  const addActivity = () => {
    if (!newActivity.date || !newActivity.time || !newActivity.description) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const existingDayIndex = activities.findIndex(day => day.date === newActivity.date);
    
    const newActivityObj: EventActivity = {
      id: Date.now().toString(),
      time: newActivity.time,
      description: newActivity.description
    };

    let updatedActivities: EventDay[];

    if (existingDayIndex >= 0) {
      // Agregar a día existente
      updatedActivities = activities.map((day, index) => 
        index === existingDayIndex 
          ? { ...day, activities: [...day.activities, newActivityObj].sort((a, b) => a.time.localeCompare(b.time)) }
          : day
      );
    } else {
      // Crear nuevo día
      const newDay: EventDay = {
        date: newActivity.date,
        activities: [newActivityObj]
      };
      updatedActivities = [...activities, newDay].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    setActivities(updatedActivities);
    onActivitiesChange?.(updatedActivities);
    setNewActivity({ date: '', time: '', description: '' });
    
    toast({
      title: "Éxito",
      description: "Actividad agregada correctamente"
    });
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    const updatedActivities = activities.map((day, dIndex) => {
      if (dIndex === dayIndex) {
        const updatedDay = {
          ...day,
          activities: day.activities.filter((_, aIndex) => aIndex !== activityIndex)
        };
        return updatedDay;
      }
      return day;
    }).filter(day => day.activities.length > 0); // Remover días sin actividades

    setActivities(updatedActivities);
    onActivitiesChange?.(updatedActivities);
    
    toast({
      title: "Éxito",
      description: "Actividad eliminada correctamente"
    });
  };

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
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center text-sm font-medium text-gray-600 mb-1">
                          <Clock className="w-4 h-4 mr-1" />
                          {activity.time}
                        </div>
                        <p className="text-gray-800">{activity.description}</p>
                      </div>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteActivity(dayIndex, activityIndex)}
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
