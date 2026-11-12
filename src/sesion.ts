// Sesión del prototipo: vive en localStorage del teléfono. No hay servidor.
export type Rol = "pasajero" | "chofer";
export type Nivel = "Evaluación" | "Impulso" | "Líder";
// Comisión de XPuesto según el nivel del chofer (rango del informe: 10 % a 20 %)
export const COMISION_POR_NIVEL: Record<Nivel, number> = { "Evaluación": 0.20, "Impulso": 0.15, "Líder": 0.10 };
export const FONDO_VUELTOS = 30; // dólares que la app le presta al chofer para dar vueltos en efectivo

export type Usuario = {
  nombre: string;
  correo: string;
  telefono: string;
  cedula: string;
  genero?: string;
  estado?: string;
  ciudad?: string;
  rol: Rol;
  invitado?: boolean;
  puntos: number;
  referido: string;
  permisos?: Record<string, boolean>;
  favoritos?: string[];            // choferes favoritos (nombre)
  // sólo choferes
  choferEstado?: "sin-registro" | "en-revision" | "aprobado";
  nivel?: Nivel;
  chofer?: RegistroChofer;
};

export type Doc = { numero?: string; vence?: string; foto: boolean };
export type RegistroChofer = {
  apellido: string; genero: string; nacimiento: string; estado: string; municipio: string; parroquia: string;
  tipoPago: "" | "Pago Móvil" | "Cuenta bancaria"; banco: string; cuenta: string;
  fotoFondo: boolean;
  docs: Record<string, Doc>;
  carro: { marca: string; modelo: string; anio: string; color: string; placa: string; caja: string; peso: string; carnetNumero: string; carnetSerial: string; carnetFoto: boolean };
  virtual: { fotos: number };
  inspeccion: string; entrevista: string;
  respuestas: string[]; puntaje: number;
  induccion: boolean;
  rcvVence: string; etiquetas: boolean;
};

const LLAVE = "xpuesto.sesion";

export function leerSesion(): Usuario | null {
  try { const s = localStorage.getItem(LLAVE); return s ? (JSON.parse(s) as Usuario) : null; } catch { return null; }
}
export function guardarSesion(u: Usuario | null) {
  try { if (u) localStorage.setItem(LLAVE, JSON.stringify(u)); else localStorage.removeItem(LLAVE); } catch { /* sin storage: sigue en memoria */ }
}
export function codigoReferido(nombre: string) {
  const base = (nombre.split(" ")[0] || "XP").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5) || "XP";
  return "XP-" + base + Math.floor(100 + Math.random() * 900);
}
export const DOCS_CHOFER = ["Cédula de identidad", "Licencia de conducir", "Certificado médico"] as const;
export const REGISTRO_CHOFER_VACIO: RegistroChofer = {
  apellido: "", genero: "", nacimiento: "", estado: "", municipio: "", parroquia: "", tipoPago: "", banco: "", cuenta: "",
  fotoFondo: false,
  docs: { "Cédula de identidad": { foto: false }, "Licencia de conducir": { foto: false }, "Certificado médico": { foto: false } },
  carro: { marca: "", modelo: "", anio: "", color: "", placa: "", caja: "", peso: "", carnetNumero: "", carnetSerial: "", carnetFoto: false },
  virtual: { fotos: 0 },
  inspeccion: "", entrevista: "",
  respuestas: ["", "", "", "", "", "", "", ""], puntaje: 0,
  induccion: false,
  rcvVence: "", etiquetas: false,
};
// Ocho preguntas pensadas para detectar al chofer que NO conviene: alcohol, trato, honestidad, cobro por fuera, desvíos, puntualidad.
export const PREGUNTAS_ENTREVISTA = [
  "¿Manejarías después de tomar alcohol, aunque sea «una sola»?",
  "Hay una tranca larga y un pasajero se molesta y te grita. ¿Qué haces?",
  "Una persona mayor no puede subir su maleta al carro. ¿Qué haces?",
  "Al final del viaje un pasajero te hace una queja directa. ¿Cómo respondes?",
  "Un pasajero te ofrece pagarte por fuera de la app para «ahorrarse la comisión». ¿Qué haces?",
  "Vas 15 minutos tarde a la parada y un pasajero te escribe. ¿Qué haces?",
  "Llevas 3 pasajeros y uno te pide desviarte para dejarlo en otro sitio. ¿Qué haces?",
  "Un pasajero deja dinero o un teléfono en el carro. ¿Qué haces?",
];
// Palabras que delatan una mala respuesta en cada pregunta. Si aparecen, esa pregunta pierde casi todo el puntaje.
const ALERTAS: string[][] = [
  ["sí manej", "si manej", "una sola", "puedo manejar", "depende", "un poquito", "no pasa nada", "tolero", "aguanto"],
  ["le grito", "lo bajo", "lo saco", "me da igual", "que se aguante", "lo ignoro", "le respondo igual", "se calla"],
  ["no es mi trabajo", "no me toca", "que la suba", "no puedo ayudar", "me quedo en el carro", "no bajo"],
  ["me da igual", "no es mi problema", "lo ignoro", "que reclame", "le digo que no", "me molesto", "lo bloqueo"],
  ["acepto", "sí lo hago", "si lo hago", "claro que sí", "claro que si", "por fuera sí", "más para mí", "mejor para mí", "de una", "lo tomo", "sin problema"],
  ["lo ignoro", "no contesto", "que espere", "no respondo", "no aviso", "no le escribo"],
  ["me desvío sin", "sin preguntar", "cobro extra", "por fuera", "cobro más", "que los demás esperen", "los otros esperan"],
  ["me lo quedo", "es mío", "lo vendo", "me lo guardo", "nadie lo reclam", "lo gasto"],
];
export function evaluarEntrevista(r: string[]) {
  // Cada respuesta con sentido (15+ letras) vale 12,5. Una respuesta con alerta resta 12,5: una sola basta para no pasar del 76 %.
  let total = 0;
  r.forEach((t, i) => {
    const s = t.toLowerCase().trim();
    if (s.length < 15) return;
    total += ALERTAS[i].some((k) => s.includes(k)) ? -12.5 : 12.5;
  });
  return Math.max(0, Math.min(100, Math.round(total)));
}
export function alertasEntrevista(r: string[]) {
  return r.map((t, i) => ALERTAS[i].some((k) => t.toLowerCase().includes(k)));
}
