export interface Comuna { name: string; lat: number; lng: number }

// Comunas principales de Chile con su punto central aproximado.
export const COMUNAS: Comuna[] = [
  { name: 'Arica', lat: -18.4783, lng: -70.3126 },
  { name: 'Iquique', lat: -20.2307, lng: -70.1357 },
  { name: 'Antofagasta', lat: -23.6509, lng: -70.3975 },
  { name: 'Calama', lat: -22.4544, lng: -68.9294 },
  { name: 'Copiapó', lat: -27.3668, lng: -70.3314 },
  { name: 'La Serena', lat: -29.9027, lng: -71.2519 },
  { name: 'Coquimbo', lat: -29.9533, lng: -71.3395 },
  { name: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
  { name: 'Viña del Mar', lat: -33.0245, lng: -71.5518 },
  { name: 'San Antonio', lat: -33.5933, lng: -71.6217 },
  { name: 'Santiago', lat: -33.4489, lng: -70.6693 },
  { name: 'Providencia', lat: -33.4314, lng: -70.6093 },
  { name: 'Las Condes', lat: -33.4080, lng: -70.5670 },
  { name: 'Ñuñoa', lat: -33.4569, lng: -70.5976 },
  { name: 'Maipú', lat: -33.5110, lng: -70.7580 },
  { name: 'Puente Alto', lat: -33.6117, lng: -70.5758 },
  { name: 'La Florida', lat: -33.5227, lng: -70.5980 },
  { name: 'Rancagua', lat: -34.1708, lng: -70.7444 },
  { name: 'Talca', lat: -35.4264, lng: -71.6554 },
  { name: 'Curicó', lat: -34.9828, lng: -71.2394 },
  { name: 'Chillán', lat: -36.6066, lng: -72.1034 },
  { name: 'Concepción', lat: -36.8270, lng: -73.0503 },
  { name: 'Talcahuano', lat: -36.7249, lng: -73.1168 },
  { name: 'Los Ángeles', lat: -37.4697, lng: -72.3537 },
  { name: 'Cañete', lat: -37.8007, lng: -73.3964 },
  { name: 'Lebu', lat: -37.6083, lng: -73.6500 },
  { name: 'Temuco', lat: -38.7359, lng: -72.5904 },
  { name: 'Pucón', lat: -39.2823, lng: -71.9544 },
  { name: 'Valdivia', lat: -39.8142, lng: -73.2459 },
  { name: 'Osorno', lat: -40.5739, lng: -73.1335 },
  { name: 'Puerto Varas', lat: -41.3195, lng: -72.9854 },
  { name: 'Puerto Montt', lat: -41.4693, lng: -72.9424 },
  { name: 'Castro', lat: -42.4800, lng: -73.7624 },
  { name: 'Coyhaique', lat: -45.5712, lng: -72.0685 },
  { name: 'Punta Arenas', lat: -53.1638, lng: -70.9171 },
];

export const findComuna = (name: string | null | undefined) =>
  COMUNAS.find(c => c.name === name) || null;

export const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const nearestComuna = (lat: number, lng: number): string => {
  let best = COMUNAS[0], bestD = Infinity;
  for (const c of COMUNAS) {
    const d = distanceKm(lat, lng, c.lat, c.lng);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best.name;
};
