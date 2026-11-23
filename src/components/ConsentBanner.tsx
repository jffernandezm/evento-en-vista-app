import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/hooks/useConsent';

const ConsentBanner = () => {
  const { consent, accept, reject } = useConsent();
  if (consent) return null;
  return (
    <div role="dialog" aria-label="Aviso de privacidad" className="fixed inset-x-0 bottom-0 z-[1000] p-3">
      <div className="mx-auto max-w-2xl rounded-lg border bg-card text-card-foreground shadow-xl p-4 text-left">
        <div className="flex gap-3">
          <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-3 text-sm">
            <p>
              Para mostrarte eventos cercanos, ¿nos permites usar tu ubicación? Si tienes cuenta, también
              guardaremos qué eventos ves y desde qué <strong>comuna</strong> (nunca tu ubicación exacta).
              Puedes rechazarlo y elegir tu comuna a mano.{' '}
              <Link to="/privacidad" className="underline text-primary">Política de privacidad</Link>
            </p>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={reject}>Rechazar</Button>
              <Button size="sm" onClick={accept}>Aceptar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
