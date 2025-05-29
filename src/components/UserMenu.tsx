
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, Plus, LogOut, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      });
    }
  };

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to="/auth">
          <LogIn className="w-4 h-4 mr-2" />
          Iniciar Sesión
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Mi Cuenta
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/create-event" className="flex items-center w-full">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
