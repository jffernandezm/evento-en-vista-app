
import React, { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import UserMenu from '@/components/UserMenu';
import ThemeToggle from "@/components/ThemeToggle";
import { useEvents } from '@/hooks/useEvents';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { getAllEvents, loading } = useEvents();
  const { logActivity } = useActivityLogger();

  useEffect(() => {
    // Log app open
    logActivity('app_open');
  }, [logActivity]);

  const allEvents = getAllEvents();
  
  const filteredEvents = allEvents.filter(event => {
    const matchesSearchTerm = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Panoramas</h1>
          <div className="flex items-center gap-2"><ThemeToggle /><UserMenu /></div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-6 p-4 bg-card rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Buscar Evento</label>
            <div className="relative">
              <Input 
                id="search" 
                type="text" 
                placeholder="Nombre del evento, descripción..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="pl-10" 
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Categoría</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="upcoming">Próximos</SelectItem>
                <SelectItem value="ongoing">En Curso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">Cargando eventos...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">No se encontraron eventos con los filtros actuales.</p>
          </div>
        )}
      </main>
      
      <footer className="bg-secondary text-muted-foreground p-4 text-center mt-8">
        <p>&copy; {new Date().getFullYear()} Panoramas App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
