import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock, ShieldAlert, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const params = new URLSearchParams(hash);
    const cameFromRecoveryLink =
      params.get('type') === 'recovery' || (params.has('access_token') && params.has('refresh_token'));

    if (cameFromRecoveryLink) {
      // Keep the token out of the address bar; the client already picked it up.
      window.history.replaceState(null, '', window.location.pathname);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: 'Contraseña muy corta',
        description: 'Usa al menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Vuelve a escribirla igual en los dos campos.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        title: 'No se pudo cambiar la contraseña',
        description:
          /invalid or expired/i.test(error.message)
            ? 'El enlace ya no sirve. Solicita uno nuevo desde la pantalla de inicio de sesión.'
            : error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Contraseña actualizada',
      description: 'Tu nueva contraseña ya está activa. Guárdala en un lugar seguro.',
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Nueva contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            {checking ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Verificando el enlace de recuperación...
              </p>
            ) : ready ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Repetir nueva contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10"
                    />
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4">
                <ShieldAlert className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Este enlace de recuperación ya no es válido o venció. Solicita uno nuevo y úsalo
                  dentro de la app.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Volver a iniciar sesión</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
