
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      const tooMany = (error as any).status === 429 || /rate limit/i.test(error.message);
      toast({
        title: 'No se pudo enviar el enlace',
        description: tooMany
          ? 'Hiciste muchas solicitudes seguidas. Espera unos minutos e inténtalo de nuevo.'
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Revisa tu correo',
      description: `Si ${email} está registrado, te enviamos un enlace para crear una nueva contraseña. Revisa también la carpeta de spam.`,
    });
    setMode('login');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      await handleForgot(e);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          const code = (error as any).code || '';
          let description = error.message;
          if (code === 'email_not_confirmed' || /not confirmed/i.test(error.message)) {
            description = 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada (y spam) y haz clic en el enlace de confirmación.';
          } else if (code === 'invalid_credentials' || /invalid login/i.test(error.message)) {
            description = 'Email o contraseña incorrectos. Si no la recuerdas, usa "¿Olvidaste tu contraseña?".';
          }
          toast({ title: "No se pudo iniciar sesión", description, variant: "destructive" });
        } else {
          toast({ title: "¡Bienvenido!", description: "Has iniciado sesión exitosamente." });
          navigate('/');
        }
      } else {
        const { data, error } = await signUp(email, password, fullName);
        if (error) {
          toast({ title: "Error de registro", description: error.message, variant: "destructive" });
        } else if (data?.user && (data.user.identities?.length ?? 0) === 0) {
          toast({
            title: "Este email ya está registrado",
            description: "Inicia sesión con tu contraseña o usa otro correo.",
            variant: "destructive",
          });
          setMode('login');
        } else if (data?.session) {
          toast({ title: "¡Registro exitoso!", description: "Ya puedes crear eventos." });
          navigate('/');
        } else {
          toast({
            title: "Revisa tu correo",
            description: `Te enviamos un enlace de confirmación a ${email}. Confírmalo y luego inicia sesión.`,
          });
          setMode('login');
          setPassword('');
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'login' ? 'Iniciar Sesión' : mode === 'signup' ? 'Registrarse' : 'Recuperar contraseña';

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
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
            <CardTitle className="text-2xl text-center">{title}</CardTitle>
            {mode === 'forgot' && (
              <p className="text-sm text-muted-foreground text-center">
                Te enviamos un enlace a tu correo para que elijas una nueva contraseña.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
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
              )}

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : mode === 'login'
                    ? 'Iniciar Sesión'
                    : mode === 'signup'
                      ? 'Registrarse'
                      : 'Enviar enlace'}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              {mode === 'login' && (
                <Button
                  variant="ghost"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-primary hover:text-primary/80 hover:bg-primary/10 block mx-auto"
              >
                {mode === 'login'
                  ? '¿No tienes cuenta? Regístrate aquí'
                  : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
