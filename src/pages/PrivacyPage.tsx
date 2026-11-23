import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/hooks/useConsent';

const PrivacyPage = () => {
  const { consent, accept, reject } = useConsent();
  return (
    <div className="min-h-screen bg-background text-left">
      <div className="container mx-auto max-w-3xl p-4 space-y-6">
        <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="w-4 h-4 mr-2" />Volver</Link></Button>
        <h1 className="text-3xl font-bold">Política de privacidad</h1>
        <p className="text-muted-foreground">Panoramas – Eventos cerca de ti en Chile.</p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Tu ubicación</h2>
          <p>Solo pedimos la ubicación de tu dispositivo si aceptas el aviso de privacidad. La usamos en tu propio dispositivo para calcular la distancia a los eventos y no guardamos tus coordenadas exactas. Si no aceptas, puedes elegir tu comuna a mano.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Registro de actividad</h2>
          <p>Si tienes cuenta y aceptas el aviso, guardamos cuándo abres la app, qué eventos ves, tus favoritos, cuándo inicias o cierras sesión, datos técnicos del dispositivo (navegador, sistema, idioma, tamaño de pantalla) y la <strong>comuna</strong> desde donde entras. Nunca guardamos coordenadas exactas. Si no aceptas, no guardamos este registro.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Cuenta, eventos y favoritos</h2>
          <p>Si te registras guardamos tu correo y nombre. También guardamos los eventos, imágenes y favoritos que creas. Estos datos se almacenan en Supabase, nuestro proveedor de base de datos y cuentas.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Estadísticas de visitas</h2>
          <p>Lovable, la plataforma donde está alojada la app, registra estadísticas anónimas de uso: páginas visitadas, de dónde llegan los visitantes, país, navegador, sistema operativo y tipo de dispositivo, tiempo en la página, velocidad de carga, errores y los clics en botones y enlaces. No usa cookies, no guarda nada en tu dispositivo, no conserva direcciones IP y no identifica a los visitantes. Se registra para todos los visitantes, sin depender del aviso de privacidad. Los datos detallados se guardan 90 días y los resúmenes diarios, un año. Lovable recopila estos datos para nosotros. <a className="underline text-primary" href="https://lovable.dev/privacy" target="_blank" rel="noopener noreferrer">La política de privacidad de Lovable</a> explica cómo los trata.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Mapas y otros servicios</h2>
          <p>Los mapas se cargan desde OpenStreetMap y la búsqueda de direcciones usa Nominatim (OpenStreetMap); estos servicios reciben tu dirección IP y la zona del mapa que ves. Los botones "Compartir por WhatsApp" y "Cómo llegar" abren WhatsApp y Google Maps, que aplican sus propias políticas.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Datos guardados en tu dispositivo</h2>
          <p>Guardamos en tu navegador tu respuesta al aviso de privacidad, la comuna elegida, el modo claro u oscuro y tu sesión iniciada.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Cambiar tu decisión</h2>
          <p>Estado actual: <strong>{consent === 'accepted' ? 'aceptado' : consent === 'rejected' ? 'rechazado' : 'sin responder'}</strong>.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reject}>Rechazar</Button>
            <Button onClick={accept}>Aceptar</Button>
          </div>
          <p className="text-sm text-muted-foreground">Para pedir que borremos tus datos, escríbenos desde el correo de tu cuenta.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
