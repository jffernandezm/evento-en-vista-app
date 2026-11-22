
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { User, Plus, LogOut, LogIn, Heart } from 'lucide-react';

const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { logActivity } = useActivityLogger();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await logActivity('logout');
    const { error } = await signOut();
    if (error) {
      console.error("Error signing out:", error);
      alert("No se pudo cerrar sesión. Intenta de nuevo.");
    } else {
      console.log("Successfully signed out");
      alert("Has cerrado sesión exitosamente.");
    }
  };

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="text-foreground border-border hover:bg-accent hover:text-primary">
        <Link to="/auth">
          <LogIn className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Iniciar Sesión</span>
          <span className="sm:hidden">Entrar</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-foreground border-border hover:bg-accent hover:text-primary relative"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Mi Cuenta</span>
          {isOpen && (
            <span className="sm:hidden absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-foreground text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap z-50">
              Mi Cuenta
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/favorites" className="flex items-center w-full">
            <Heart className="w-4 h-4 mr-2" />
            Mis Favoritos
          </Link>
        </DropdownMenuItem>
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
