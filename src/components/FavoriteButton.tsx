
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useAuth } from '@/hooks/useAuth';

interface FavoriteButtonProps {
  eventId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  eventId, 
  size = 'md', 
  className = '' 
}) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, loading } = useFavorites();
  const { logActivity } = useActivityLogger();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;

    const wasFavorite = isFavorite(eventId);
    await toggleFavorite(eventId);
    
    // Log the activity
    await logActivity(
      wasFavorite ? 'favorite_remove' : 'favorite_add',
      eventId
    );
  };

  if (!user) return null;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={loading}
      variant="outline"
      size="icon"
      className={`${sizeClasses[size]} rounded-full bg-white/90 hover:bg-white border-gray-200 shadow-md ${className}`}
    >
      <Heart 
        className={`${iconSizes[size]} transition-colors ${
          isFavorite(eventId) 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-red-400'
        }`}
      />
    </Button>
  );
};

export default FavoriteButton;
