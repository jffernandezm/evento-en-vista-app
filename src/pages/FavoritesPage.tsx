
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { EventType } from '@/types/event';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import EventCard from '@/components/EventCard';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const { getFavoriteEvents } = useFavorites();
  const [favoriteEvents, setFavoriteEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const events = await getFavoriteEvents();
      setFavoriteEvents(events);
      console.log('Loaded favorite events:', events);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4">Inicia sesión para ver tus favoritos</h1>
          <Button asChild>
            <Link to="/auth">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center">
          <Button asChild variant="ghost" size="icon" className="mr-3 text-white hover:bg-white/20">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <Heart className="w-6 h-6 mr-2" />
            Mis Favoritos
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {loading ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">Cargando favoritos...</p>
          </div>
        ) : favoriteEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No tienes eventos favoritos</h2>
            <p className="text-gray-600 mb-4">
              Explora eventos y marca los que te gusten como favoritos
            </p>
            <Button asChild>
              <Link to="/">Explorar Eventos</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
