import { EventType } from '@/types/event';

export type DateChip = 'today' | 'tomorrow' | 'weekend' | 'week';
export type Theme = 'musica' | 'familia' | 'deportes' | 'cultura' | 'gastronomia' | 'gratis';

export const DATE_CHIPS: { value: DateChip; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'tomorrow', label: 'Mañana' },
  { value: 'weekend', label: 'Este fin de semana' },
  { value: 'week', label: 'Esta semana' },
];

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'musica', label: 'Música' },
  { value: 'familia', label: 'Familia' },
  { value: 'deportes', label: 'Deportes' },
  { value: 'cultura', label: 'Cultura' },
  { value: 'gastronomia', label: 'Gastronomía' },
  { value: 'gratis', label: 'Gratis' },
];

export const DISTANCES = [5, 10, 25, 50];

const KEYWORDS: Record<Exclude<Theme, 'gratis'>, string[]> = {
  musica: ['música', 'musica', 'concierto', 'banda', 'festival', 'tocata', 'dj', 'rock', 'cumbia', 'jazz', 'coro', 'orquesta'],
  familia: ['familia', 'niños', 'ninos', 'infantil', 'kids', 'títeres', 'titeres', 'circo'],
  deportes: ['deporte', 'corrida', 'maratón', 'maraton', 'fútbol', 'futbol', 'trekking', 'bicicleta', 'cicl', 'surf', 'running', 'torneo'],
  cultura: ['cultura', 'teatro', 'museo', 'exposición', 'exposicion', 'arte', 'cine', 'danza', 'feria', 'literat', 'patrimonio', 'fiesta'],
  gastronomia: ['gastronom', 'comida', 'vino', 'cerveza', 'food', 'cocina', 'empanada', 'degustación', 'degustacion', 'mariscos'],
};

const norm = (s: string) => s.toLowerCase();

export const isFree = (e: EventType) => /gratis|libre|free|^\s*\$?\s*0\s*$/i.test(e.price || '');

export const matchesTheme = (e: EventType, theme: Theme) => {
  if (theme === 'gratis') return isFree(e);
  const text = norm(`${e.title} ${e.shortDescription} ${e.fullDescription}`);
  return KEYWORDS[theme].some(k => text.includes(k));
};

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const parse = (s?: string) => (s ? new Date(s + 'T00:00:00') : null);

export const dateRange = (chip: DateChip, now = new Date()): [Date, Date] => {
  const today = day(now);
  const add = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
  const dow = today.getDay(); // 0 domingo
  switch (chip) {
    case 'today': return [today, today];
    case 'tomorrow': return [add(1), add(1)];
    case 'weekend':
      if (dow === 0) return [today, today];
      return [dow === 6 ? today : add(6 - dow), add(7 - dow)];
    case 'week': return [today, dow === 0 ? today : add(7 - dow)];
  }
};

export const matchesDate = (e: EventType, chip: DateChip, now = new Date()) => {
  const start = parse(e.start_date);
  if (!start) return false;
  const end = parse(e.end_date) || start;
  const [from, to] = dateRange(chip, now);
  return start <= to && end >= from;
};
