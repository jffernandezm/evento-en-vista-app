
import { EventType } from '@/types/event';

export const mockEvents: EventType[] = [
  {
    id: '1',
    title: 'Festival de Jazz en el Parque',
    shortDescription: 'Disfruta de la mejor música jazz al aire libre.',
    fullDescription: 'El Festival de Jazz en el Parque regresa en su 10ª edición, presentando artistas nacionales e internacionales. Un evento para toda la familia con food trucks y actividades culturales.',
    dates: '10-12 Junio, 2025',
    distance: 'A 5 km de ti',
    price: 'Gratis',
    imageUrl: 'https://source.unsplash.com/random/400x300?jazz,festival',
    images: [
      'https://source.unsplash.com/random/800x600?jazz,music,event',
      'https://source.unsplash.com/random/800x600?park,people,festival',
      'https://source.unsplash.com/random/800x600?food,truck,event',
      'https://source.unsplash.com/random/800x600?saxophone,stage,music', // Nueva imagen
      'https://source.unsplash.com/random/800x600?crowd,concert,night,lights' // Nueva imagen
    ],
    address: 'Parque Metropolitano, Santiago',
    contactInfo: 'info@festivaldejazz.cl / +56987654321',
    activitiesByDay: [
      { date: '10 Junio', activities: [{ time: '18:00', description: 'Apertura con Banda Local XYZ' }, { time: '20:00', description: 'Artista Internacional Invitado A' }] },
      { date: '11 Junio', activities: [{ time: '16:00', description: 'Taller de Improvisación Jazz' }, { time: '20:00', description: 'Artista Internacional Invitado B' }] },
    ],
    category: 'upcoming',
  },
  {
    id: '2',
    title: 'Expo Arte Contemporáneo',
    shortDescription: 'Descubre las nuevas tendencias del arte actual.',
    fullDescription: 'Una exposición que reúne a más de 50 artistas emergentes y consagrados. Obras en pintura, escultura, fotografía y videoarte. Habrá charlas y visitas guiadas.',
    dates: '15-30 Junio, 2025',
    distance: 'A 12 km de ti',
    price: '$5.000 CLP',
    imageUrl: 'https://source.unsplash.com/random/400x300?art,gallery',
    images: [
        'https://source.unsplash.com/random/800x600?art,exhibition,gallery',
        'https://source.unsplash.com/random/800x600?modern,art,painting',
        'https://source.unsplash.com/random/800x600?gallery,people,museum',
        'https://source.unsplash.com/random/800x600?sculpture,art,modern', // Nueva imagen
        'https://source.unsplash.com/random/800x600?abstract,art,canvas' // Nueva imagen
    ],
    address: 'Centro Cultural GAM, Santiago',
    contactInfo: 'contacto@expoarte.com',
    category: 'upcoming',
  },
  {
    id: '3',
    title: 'Noche de Observación Astronómica',
    shortDescription: 'Contempla las estrellas y planetas desde un lugar privilegiado.',
    fullDescription: 'Únete a nosotros para una noche mágica de observación astronómica guiada por expertos. Aprende sobre constelaciones, planetas y nebulosas. Se proveerán telescopios.',
    dates: '25 Junio, 2025',
    distance: 'A 45 km de ti',
    price: '$15.000 CLP (Incluye transporte)',
    imageUrl: 'https://source.unsplash.com/random/400x300?astronomy,night,sky',
    images: [
        'https://source.unsplash.com/random/800x600?stars,telescope,night',
        'https://source.unsplash.com/random/800x600?milky,way,galaxy',
        'https://source.unsplash.com/random/800x600?mountain,night,sky,stars',
        'https://source.unsplash.com/random/800x600?moon,crater,space', // Nueva imagen
        'https://source.unsplash.com/random/800x600?nebula,cosmos,astronomy' // Nueva imagen
    ],
    address: 'Observatorio Cerro Calán',
    contactInfo: 'reservas@observacionastronomica.cl',
    category: 'upcoming',
  },
];
