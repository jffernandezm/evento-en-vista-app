
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, CalendarDays } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useRecurrenceTypes } from '@/hooks/useRecurrenceTypes';

interface EventRecurrenceProps {
  recurrenceTypeId: string | null;
  recurrenceDays: number[];
  recurrenceEndDate: Date | undefined;
  onRecurrenceTypeIdChange: (typeId: string | null) => void;
  onRecurrenceDaysChange: (days: number[]) => void;
  onRecurrenceEndDateChange: (date: Date | undefined) => void;
}

const EventRecurrence: React.FC<EventRecurrenceProps> = ({
  recurrenceTypeId,
  recurrenceDays,
  recurrenceEndDate,
  onRecurrenceTypeIdChange,
  onRecurrenceDaysChange,
  onRecurrenceEndDateChange,
}) => {
  const { recurrenceTypes, loading } = useRecurrenceTypes();

  const weekdays = [
    { label: 'Domingo', value: 0 },
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
  ];

  const selectedRecurrenceType = recurrenceTypes.find(type => type.id === recurrenceTypeId);
  const isWeeklyType = selectedRecurrenceType?.value === 'weekly';

  const handleDayToggle = (dayValue: number, checked: boolean) => {
    if (checked) {
      onRecurrenceDaysChange([...recurrenceDays, dayValue].sort());
    } else {
      onRecurrenceDaysChange(recurrenceDays.filter(d => d !== dayValue));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="w-5 h-5 mr-2" />
            Periodicidad del Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cargando tipos de periodicidad...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="w-5 h-5 mr-2" />
          Periodicidad del Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="recurrence-type" className="block text-sm font-medium mb-2">
            Tipo de Repetición
          </Label>
          <Select 
            value={recurrenceTypeId || ''} 
            onValueChange={(value) => onRecurrenceTypeIdChange(value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo de repetición" />
            </SelectTrigger>
            <SelectContent>
              {recurrenceTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                  {type.description && (
                    <span className="text-sm text-gray-500 ml-2">- {type.description}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isWeeklyType && (
          <div>
            <Label className="block text-sm font-medium mb-2">
              Días de la Semana
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {weekdays.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={recurrenceDays.includes(day.value)}
                    onCheckedChange={(checked) => 
                      handleDayToggle(day.value, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`day-${day.value}`} 
                    className="text-sm font-normal"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedRecurrenceType && selectedRecurrenceType.value !== 'none' && (
          <div>
            <Label className="block text-sm font-medium mb-2">
              Fecha de Finalización
            </Label>
            <DatePicker
              date={recurrenceEndDate}
              onDateChange={onRecurrenceEndDateChange}
              placeholder="Selecciona fecha final"
            />
            <p className="text-xs text-gray-500 mt-1">
              Opcional: Si no se especifica, el evento se repetirá indefinidamente
            </p>
          </div>
        )}

        {selectedRecurrenceType && selectedRecurrenceType.value !== 'none' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <Calendar className="w-4 h-4 inline mr-1" />
              {isWeeklyType && recurrenceDays.length > 0 && (
                <>El evento se repetirá cada {weekdays.filter(d => recurrenceDays.includes(d.value)).map(d => d.label).join(', ')}</>
              )}
              {selectedRecurrenceType.value !== 'weekly' && (
                <>El evento se repetirá {selectedRecurrenceType.name.toLowerCase()}</>
              )}
              {recurrenceEndDate && <> hasta el {recurrenceEndDate.toLocaleDateString()}</>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventRecurrence;
