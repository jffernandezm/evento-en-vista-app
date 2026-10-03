import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Handles errors returned by Supabase email links (e.g. expired confirmation links)
const AuthHashHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const errorCode = params.get('error_code');
    if (!params.get('error') && !errorCode) return;

    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    toast({
      title: errorCode === 'otp_expired' ? 'Enlace vencido o ya usado' : 'No se pudo confirmar',
      description:
        errorCode === 'otp_expired'
          ? 'Si ya confirmaste tu correo, simplemente inicia sesión. Si no, regístrate de nuevo para recibir un enlace nuevo.'
          : params.get('error_description')?.replace(/\+/g, ' ') ?? 'Intenta nuevamente.',
      variant: 'destructive',
    });
    navigate('/auth');
  }, [navigate, toast]);

  return null;
};

export default AuthHashHandler;
