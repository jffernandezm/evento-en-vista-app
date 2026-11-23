import { MessageCircle, Link2, CalendarPlus, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EventType } from '@/types/event';

const icsDate = (d: string) => d.replace(/-/g, '');
const icsEsc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

export const buildIcs = (e: EventType, url: string) => {
  const start = e.start_date || new Date().toISOString().slice(0, 10);
  const endBase = new Date((e.end_date || start) + 'T00:00:00');
  endBase.setDate(endBase.getDate() + 1); // DTEND exclusivo en eventos de día completo
  const end = `${endBase.getFullYear()}${String(endBase.getMonth() + 1).padStart(2, '0')}${String(endBase.getDate()).padStart(2, '0')}`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Panoramas//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${e.id}@panoramas`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${icsDate(start)}`, `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${icsEsc(e.title)}`, `DESCRIPTION:${icsEsc(`${e.shortDescription}\n${url}`)}`,
    `LOCATION:${icsEsc(e.address || '')}`,
    ...(e.latitude != null && e.longitude != null ? [`GEO:${e.latitude};${e.longitude}`] : []),
    `URL:${url}`, 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
};

const EventShareActions = ({ event }: { event: EventType }) => {
  const { toast } = useToast();
  const url = `${window.location.origin}/event/${event.id}`;
  const hasCoords = event.latitude != null && event.longitude != null;
  const directions = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address || '')}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Enlace copiado' });
    } catch {
      toast({ title: 'No se pudo copiar', description: url });
    }
  };

  const calendar = () => {
    const blob = new Blob([buildIcs(event, url)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${event.title.replace(/[^\w\-]+/g, '_').slice(0, 50) || 'evento'}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <Button asChild variant="outline">
        <a href={`https://wa.me/?text=${encodeURIComponent(`${event.title} – ${url}`)}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="w-4 h-4 mr-2" /> Compartir por WhatsApp
        </a>
      </Button>
      <Button variant="outline" onClick={copy}><Link2 className="w-4 h-4 mr-2" /> Copiar enlace</Button>
      <Button variant="outline" onClick={calendar}><CalendarPlus className="w-4 h-4 mr-2" /> Agregar al calendario</Button>
      <Button asChild>
        <a href={directions} target="_blank" rel="noopener noreferrer"><Navigation className="w-4 h-4 mr-2" /> Cómo llegar</a>
      </Button>
    </div>
  );
};

export default EventShareActions;
