// Datos de mentira para el prototipo. Todo lo que se ve sale de aquí.

export const TASA_BS = 190; // supuesto para mostrar el monto en bolívares

export type Categoria = "Clásico" | "Compartido" | "Premium" | "VIP";
export const CATEGORIAS: Categoria[] = ["Clásico", "Compartido", "Premium", "VIP"];

export type Puesto = "copiloto" | "tras-izq" | "tras-centro" | "tras-der";
export const PUESTOS: { id: Puesto; nombre: string }[] = [
  { id: "copiloto", nombre: "Copiloto" },
  { id: "tras-izq", nombre: "Trasero izquierdo" },
  { id: "tras-centro", nombre: "Trasero centro" },
  { id: "tras-der", nombre: "Trasero derecho" },
];

export type Salida = {
  id: string;
  chofer: string;
  foto: string;
  estrellas: number;
  viajes: number;
  carro: string;
  color: string;
  placa: string;
  hora: string;
  llegada: string;
  parada: string;
  paradaDetalle: string;
  categoria: Categoria;
  precio: number;
  ocupados: Partial<Record<Puesto, string>>; // inicial del pasajero que ya apartó
  maletero: { capacidad: number; ocupado: number }; // en maletas grandes
};

export const SALIDAS: Salida[] = [
  {
    id: "s1", chofer: "José R.", foto: "./chofer-jose.jpg", estrellas: 4.9, viajes: 312,
    carro: "Toyota Corolla", color: "azul", placa: "AB1•••", hora: "6:00 am", llegada: "8:15 am",
    parada: "C.C. Sambil", paradaDetalle: "Estacionamiento nivel Feria, Chacao",
    categoria: "Compartido", precio: 12,
    ocupados: { "tras-izq": "M", "tras-der": "K" }, maletero: { capacidad: 3, ocupado: 2 },
  },
  {
    id: "s2", chofer: "Luis M.", foto: "./chofer-luis.jpg", estrellas: 4.7, viajes: 148,
    carro: "Renault Logan", color: "gris", placa: "AC7•••", hora: "7:30 am", llegada: "9:50 am",
    parada: "Bomba PDV La Castellana", paradaDetalle: "Frente a la tienda, Av. Principal",
    categoria: "Compartido", precio: 12,
    ocupados: { "copiloto": "D" }, maletero: { capacidad: 3, ocupado: 1 },
  },
  {
    id: "s3", chofer: "Ana G.", foto: "./chofer-ana.jpg", estrellas: 5.0, viajes: 97,
    carro: "Hyundai Tucson", color: "rojo", placa: "AE2•••", hora: "9:00 am", llegada: "11:10 am",
    parada: "C.C. Tolón", paradaDetalle: "Entrada principal, Las Mercedes",
    categoria: "VIP", precio: 15,
    ocupados: { "tras-centro": "P" }, maletero: { capacidad: 4, ocupado: 1 },
  },
  {
    id: "s4", chofer: "Carlos P.", foto: "./chofer-carlos.jpg", estrellas: 4.8, viajes: 521,
    carro: "Chevrolet Aveo", color: "plata", placa: "AA9•••", hora: "10:30 am", llegada: "12:50 pm",
    parada: "Farmatodo Los Palos Grandes", paradaDetalle: "Estacionamiento, 2da Av.",
    categoria: "Clásico", precio: 10,
    ocupados: {}, maletero: { capacidad: 2, ocupado: 0 },
  },
  {
    id: "s5", chofer: "José R.", foto: "./chofer-jose.jpg", estrellas: 4.9, viajes: 312,
    carro: "Toyota Corolla", color: "azul", placa: "AB1•••", hora: "2:00 pm", llegada: "4:20 pm",
    parada: "C.C. Sambil", paradaDetalle: "Estacionamiento nivel Feria, Chacao",
    categoria: "Premium", precio: 14,
    ocupados: { "copiloto": "R", "tras-izq": "S", "tras-der": "J" }, maletero: { capacidad: 3, ocupado: 3 },
  },
  {
    id: "s6", chofer: "Ana G.", foto: "./chofer-ana.jpg", estrellas: 5.0, viajes: 97,
    carro: "Hyundai Tucson", color: "rojo", placa: "AE2•••", hora: "5:00 pm", llegada: "7:15 pm",
    parada: "C.C. Tolón", paradaDetalle: "Entrada principal, Las Mercedes",
    categoria: "Compartido", precio: 12,
    ocupados: {}, maletero: { capacidad: 4, ocupado: 0 },
  },
];

export type TipoEquipaje = "A" | "B" | "C" | "D";
export const EQUIPAJES: { id: TipoEquipaje; nombre: string; detalle: string; maletero: number }[] = [
  { id: "A", nombre: "Bolso de mano", detalle: "Morral o cartera. Va contigo en cabina.", maletero: 0 },
  { id: "B", nombre: "Maleta mediana", detalle: "Hasta 15 kg. Va en el maletero.", maletero: 0.5 },
  { id: "C", nombre: "Maleta grande", detalle: "Hasta 25 kg. Ocupa un puesto del maletero.", maletero: 1 },
  { id: "D", nombre: "Carga especial", detalle: "Caja, equipo, bicicleta. El chofer confirma.", maletero: 1 },
];

export const RUTAS_POPULARES = [
  { de: "Caracas", a: "Valencia", desde: 12 },
  { de: "Caracas", a: "Maracay", desde: 8 },
  { de: "Valencia", a: "Barquisimeto", desde: 10 },
  { de: "Caracas", a: "Pto. La Cruz", desde: 18 },
  { de: "Caracas", a: "Maracaibo", desde: 30 },
];

export const CIUDADES = ["Caracas", "Valencia", "Maracay", "Barquisimeto", "Maracaibo", "Pto. La Cruz", "Barcelona", "Mérida", "San Cristóbal", "Pto. Ordaz", "Cumaná", "Guarenas"];

export function bs(usd: number) {
  return "Bs " + Math.round(usd * TASA_BS).toLocaleString("es-VE");
}
