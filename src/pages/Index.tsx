import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '@/components/EventCard';
import EventsMap from '@/components/EventsMap';
import UserMenu from '@/components/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { useEvents } from '@/hooks/useEvents';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useSelectedComuna } from '@/hooks/useConsent';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, List, Map as MapIcon, MapPinOff } from 'lucide-react';
import { COMUNAS, findComuna } from '@/lib/comunas';
import { DATE_CHIPS, THEMES, DISTANCES, DateChip, Theme, matchesDate, matchesTheme } from '@/lib/eventFilters';
import { cn } from '@/lib/utils';

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors',
      active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground hover:bg-accent'
    )}
  >
    {children}
  </button>
);

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateChip, setDateChip] = useState<DateChip | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [maxKm, setMaxKm] = useState<string>('all');
  const [view, setView] = useState<'list' | 'map'>('list');
  const { getAllEvents, loading, locationSource, geoLoading } = useEvents();
  const { comuna, setComuna } = useSelectedComuna();
  const { logActivity } = useActivityLogger();

  useEffect(() => { logActivity('app_open'); }, [logActivity]);

  const allEvents = getAllEvents();
  const hasLocation = locationSource !== 'none';

  const filteredEvents = useMemo(() => allEvents.filter(event => {
    const q = searchTerm.toLowerCase();
    if (q && !(event.title.toLowerCase().includes(q) || event.shortDescription.toLowerCase().includes(q))) return false;
    if (dateChip && !matchesDate(event, dateChip)) return false;
    if (themes.length && !themes.some(t => matchesTheme(event, t))) return false;
    if (maxKm !== 'all' && hasLocation && (event.distanceKm === undefined || event.distanceKm > Number(maxKm))) return false;
    return true;
  }), [allEvents, searchTerm, dateChip, themes, maxKm, hasLocation]);

  const comunaPoint = findComuna(comuna);
  const toggleTheme = (t: Theme) => setThemes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panoramas</h1>
          <div className="flex items-center gap-2"><ThemeToggle /><UserMenu /></div>
        </div>
      </header>

      <main className="container mx-auto p-4 text-left">
        <div className="mb-6 p-4 bg-card rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Buscar evento</label>
              <div className="relative">
                <Input id="search" type="text" placeholder="Nombre del evento, descripción..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-foreground mb-1">Distancia</label>
              <Select value={maxKm} onValueChange={setMaxKm} disabled={!hasLocation}>
                <SelectTrigger id="distance"><SelectValue placeholder="Cualquier distancia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Cualquier distancia</SelectItem>
                  {DISTANCES.map(d => <SelectItem key={d} value={String(d)}>Hasta {d} km</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {locationSource !== 'device' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="comuna" className="block text-sm font-medium text-foreground mb-1">Tu comuna</label>
                <Select value={comuna ?? ''} onValueChange={v => setComuna(v || null)}>
                  <SelectTrigger id="comuna"><SelectValue placeholder="Elige tu comuna" /></SelectTrigger>
                  <SelectContent>
                    {COMUNAS.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {!comuna && !geoLoading && (
                <p className="md:col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinOff className="w-4 h-4" /> Ubicación no disponible. Elige tu comuna para ver distancias.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Fecha">
            {DATE_CHIPS.map(c => (
              <Chip key={c.value} active={dateChip === c.value} onClick={() => setDateChip(dateChip === c.value ? null : c.value)}>{c.label}</Chip>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Categorías">
            {THEMES.map(t => (
              <Chip key={t.value} active={themes.includes(t.value)} onClick={() => toggleTheme(t.value)}>{t.label}</Chip>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">{filteredEvents.length} evento(s)</p>
          <div className="inline-flex rounded-md border overflow-hidden" role="group" aria-label="Vista">
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setView('list')} aria-pressed={view === 'list'}>
              <List className="w-4 h-4 mr-1" /> Lista
            </Button>
            <Button variant={view === 'map' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setView('map')} aria-pressed={view === 'map'}>
              <MapIcon className="w-4 h-4 mr-1" /> Mapa
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-xl text-muted-foreground text-center py-10">Cargando eventos...</p>
        ) : view === 'map' ? (
          <EventsMap events={filteredEvents} center={comunaPoint ? { lat: comunaPoint.lat, lng: comunaPoint.lng } : null} />
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {filteredEvents.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        ) : (
          <p className="text-xl text-muted-foreground text-center py-10">No se encontraron eventos con los filtros actuales.</p>
        )}
      </main>

      <footer className="bg-secondary text-muted-foreground p-4 text-center mt-8 space-y-1">
        <p>&copy; {new Date().getFullYear()} Panoramas App. Todos los derechos reservados.</p>
        <Link to="/privacidad" className="underline text-sm">Política de privacidad</Link>
      </footer>
    </div>
  );
};

export default Index;
