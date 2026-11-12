// Mapas y rutas reales con servicios abiertos (OpenStreetMap): sin clave, gratis.
// Nominatim ubica un sitio por su nombre; OSRM calcula la ruta por carretera (km y minutos).
// Para producción se cambia a un proveedor con cuota propia (Mapbox, Google o un OSRM propio).

export type Punto = { lat: number; lon: number; nombre: string };
export type Ruta = { km: number; min: number; linea: [number, number][] };

export const LUGARES: Record<string, Punto> = {
  "Caracas": { lat: 10.4806, lon: -66.9036, nombre: "Caracas" },
  "Valencia": { lat: 10.1620, lon: -68.0077, nombre: "Valencia" },
  "Maracay": { lat: 10.2469, lon: -67.5958, nombre: "Maracay" },
  "Barquisimeto": { lat: 10.0678, lon: -69.3474, nombre: "Barquisimeto" },
  "Maracaibo": { lat: 10.6427, lon: -71.6125, nombre: "Maracaibo" },
  "Pto. La Cruz": { lat: 10.2131, lon: -64.6327, nombre: "Puerto La Cruz" },
  "Barcelona": { lat: 10.1364, lon: -64.6863, nombre: "Barcelona" },
  "Mérida": { lat: 8.5897, lon: -71.1561, nombre: "Mérida" },
  "San Cristóbal": { lat: 7.7669, lon: -72.2250, nombre: "San Cristóbal" },
  "Pto. Ordaz": { lat: 8.2970, lon: -62.7110, nombre: "Puerto Ordaz" },
  "Cumaná": { lat: 10.4537, lon: -64.1750, nombre: "Cumaná" },
  "Guarenas": { lat: 10.4703, lon: -66.6186, nombre: "Guarenas" },
  "C.C. Sambil": { lat: 10.4890, lon: -66.8543, nombre: "C.C. Sambil, Chacao" },
  "C.C. Tolón": { lat: 10.4835, lon: -66.8580, nombre: "C.C. Tolón, Las Mercedes" },
  "Bomba PDV La Castellana": { lat: 10.4962, lon: -66.8505, nombre: "PDV La Castellana" },
  "Farmatodo Los Palos Grandes": { lat: 10.4990, lon: -66.8440, nombre: "Farmatodo Los Palos Grandes" },
  "Terminal Big Low": { lat: 10.1960, lon: -68.0010, nombre: "Terminal Big Low, Valencia" },
  "C.C. Metrópolis": { lat: 10.2250, lon: -67.9690, nombre: "C.C. Metrópolis, Valencia" },
};

// Tarifa: el carro completo cuesta una base más tanto por kilómetro; el puesto es la cuarta parte.
// Calibrada para que Caracas–Valencia (≈168 km por carretera) dé $12 el puesto. Se ajusta desde el backoffice.
export const TARIFA = { base: 2, porKm: 0.27, puestos: 4, minimo: 3 };
export function tarifaPorPuesto(km: number) {
  const carro = TARIFA.base + TARIFA.porKm * km;
  return Math.max(TARIFA.minimo, Math.round(carro / TARIFA.puestos));
}

const cacheGeo = new Map<string, Punto | null>();
export async function ubicar(texto: string): Promise<Punto | null> {
  const t = texto.trim();
  if (!t) return null;
  if (LUGARES[t]) return LUGARES[t];
  if (cacheGeo.has(t)) return cacheGeo.get(t)!;
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(t + ", Venezuela")}&format=json&limit=1&countrycodes=ve`, { headers: { "Accept-Language": "es" } });
    const d = (await r.json()) as { lat: string; lon: string; display_name: string }[];
    const p = d[0] ? { lat: Number(d[0].lat), lon: Number(d[0].lon), nombre: d[0].display_name.split(",").slice(0, 2).join(",") } : null;
    cacheGeo.set(t, p);
    return p;
  } catch { return null; }
}

const cacheRuta = new Map<string, Ruta>();
export async function rutaEntre(a: Punto, b: Punto): Promise<Ruta | null> {
  const k = `${a.lat},${a.lon}|${b.lat},${b.lon}`;
  if (cacheRuta.has(k)) return cacheRuta.get(k)!;
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=simplified&geometries=geojson`);
    const d = await r.json();
    const ruta = d.routes?.[0];
    if (!ruta) return null;
    const out: Ruta = { km: Math.round(ruta.distance / 100) / 10, min: Math.round(ruta.duration / 60), linea: (ruta.geometry.coordinates as [number, number][]).map(([lon, lat]) => [lat, lon]) };
    cacheRuta.set(k, out);
    return out;
  } catch { return null; }
}

export function horaMas(hora: string, minutos: number) {
  // "6:00 am" + 133 → "8:13 am"
  const m = hora.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!m) return hora;
  let h = Number(m[1]) % 12 + (m[3].toLowerCase() === "pm" ? 12 : 0);
  let t = h * 60 + Number(m[2]) + minutos;
  t = ((t % 1440) + 1440) % 1440;
  h = Math.floor(t / 60);
  const mm = String(t % 60).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "am" : "pm"}`;
}
