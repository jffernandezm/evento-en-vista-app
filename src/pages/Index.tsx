
import React, { useState } from 'react';
import EventCard from '@/components/EventCard';
import { mockEvents } from '@/data/mockEvents';
import { EventType } from '@/types/event';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';

const Index: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  // TODO: Implement proximity filter state and logic

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearchTerm = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              event.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    // TODO: Add proximity filtering logic
    return matchesSearchTerm && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center">Descubre Panoramas</h1>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {/* <SelectItem value="past">Pasados</SelectItem> */}
              </SelectContent>
            </Select>
          </div>

          {/* Proximity filter placeholder */}
          {/* <div>
            <label htmlFor="proximity" className="block text-sm font-medium text-foreground mb-1">Proximidad</label>
            <Select>
              <SelectTrigger id="proximity" className="w-full">
                <SelectValue placeholder="Distancia máxima" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
                <SelectItem value="all">Cualquier distancia</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">No se encontraron eventos con los filtros actuales.</p>
          </div>
        )}
      </main>
      <footer className="bg-gray-800 text-gray-300 p-4 text-center mt-8">
        <p>&copy; {new Date().getFullYear()} Panoramas App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
