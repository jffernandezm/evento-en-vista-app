
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, CalendarDays } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface EventRecurrenceProps {
  recurrenceType: string;
  recurrenceDays: number[];
  recurrenceEndDate: Date | undefined;
  onRecurrenceTypeChange: (type: string) => void;
  onRecurrenceDaysChange: (days: number[]) => void;
  onRecurrenceEndDateChange: (date: Date | undefined) => void;
}

const EventRecurrence: React.FC<EventRecurrenceProps> = ({
  recurrenceType,
  recurrenceDays,
  recurrenceEndDate,
  onRecurrenceTypeChange,
  onRecurrenceDaysChange,
  onRecurrenceEndDateChange,
}) => {
  const weekdays = [
    { label: 'Domingo', value: 0 },
    { label: 'Lunes', value: 1 },
    { label: 'Martes', value: 2 },
    { label: 'Miércoles', value: 3 },
    { label: 'Jueves', value: 4 },
    { label: 'Viernes', value: 5 },
    { label: 'Sábado', value: 6 },
  ];

  const handleDayToggle = (dayValue: number, checked: boolean) => {
    if (checked) {
      onRecurrenceDaysChange([...recurrenceDays, dayValue].sort());
    } else {
      onRecurrenceDaysChange(recurrenceDays.filter(d => d !== dayValue));
    }
  };

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
          <Select value={recurrenceType} onValueChange={onRecurrenceTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tipo de repetición" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No repetir</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {recurrenceType === 'weekly' && (
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

        {recurrenceType !== 'none' && (
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

        {recurrenceType !== 'none' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <Calendar className="w-4 h-4 inline mr-1" />
              {recurrenceType === 'weekly' && recurrenceDays.length > 0 && (
                <>El evento se repetirá cada {weekdays.filter(d => recurrenceDays.includes(d.value)).map(d => d.label).join(', ')}</>
              )}
              {recurrenceType === 'monthly' && <>El evento se repetirá mensualmente</>}
              {recurrenceEndDate && <> hasta el {recurrenceEndDate.toLocaleDateString()}</>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventRecurrence;
