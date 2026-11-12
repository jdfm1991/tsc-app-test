// Modelos por marca, los que ruedan en Venezuela. Si no está, «Otro» y se escribe.
export const MODELOS: Record<string, string[]> = {
  "Toyota": ["Corolla", "Yaris", "Camry", "Fortuner", "Hilux", "4Runner", "Prado", "Land Cruiser", "Terios", "Starlet", "Sienna", "RAV4", "Etios"],
  "Chevrolet": ["Aveo", "Optra", "Spark", "Cruze", "Captiva", "Grand Vitara", "Tahoe", "Silverado", "Luv D-Max", "Orlando", "Epica", "Corsa", "Astra", "Malibu"],
  "Hyundai": ["Accent", "Elantra", "Tucson", "Santa Fe", "Getz", "Sonata", "Creta", "H1", "Veloster", "i10", "Grand i10"],
  "Renault": ["Logan", "Sandero", "Symbol", "Duster", "Clio", "Megane", "Twingo", "Koleos", "Kwid", "Stepway"],
  "Kia": ["Rio", "Cerato", "Sportage", "Sorento", "Picanto", "Soul", "Optima", "Carnival", "Seltos"],
  "Ford": ["Fiesta", "Focus", "Explorer", "Escape", "Fusion", "Ecosport", "Ranger", "Ka", "Territory", "Laser"],
  "Chery": ["Arauca", "Orinoco", "Tiggo", "Grand Tiggo", "X1", "Tiggo 2", "Tiggo 7", "QQ"],
  "Suzuki": ["Grand Vitara", "Swift", "Vitara", "Baleno", "Ertiga", "Ciaz", "Jimny", "S-Cross"],
  "Nissan": ["Sentra", "Tiida", "Versa", "X-Trail", "Pathfinder", "Frontier", "Kicks", "Qashqai", "Altima"],
  "Mitsubishi": ["Lancer", "Montero", "Outlander", "L200", "Signo", "Panel", "ASX", "Touring"],
  "Honda": ["Civic", "Accord", "CR-V", "Fit", "Pilot", "HR-V", "City"],
  "Mazda": ["3", "6", "CX-5", "CX-3", "BT-50", "Allegro", "Demio", "CX-30"],
  "Volkswagen": ["Gol", "Polo", "Jetta", "Bora", "Fox", "Tiguan", "Amarok", "Vento", "Golf", "Voyage", "Saveiro"],
  "Fiat": ["Palio", "Siena", "Uno", "Punto", "Strada", "Argo", "Cronos", "Mobi"],
  "Dongfeng": ["S30", "AX7", "Rich", "Joyear", "AX4", "SX6", "H30"],
  "Peugeot": ["206", "207", "307", "308", "3008", "Partner", "2008"],
  "Jeep": ["Grand Cherokee", "Cherokee", "Compass", "Wrangler", "Renegade"],
  "Otra": [],
};
export const MARCAS = Object.keys(MODELOS);
export const PESOS = ["Hasta 350 kg", "Hasta 400 kg", "Hasta 450 kg", "Hasta 500 kg", "Hasta 550 kg", "Hasta 600 kg", "Hasta 700 kg", "Más de 700 kg"];
export const ANIOS = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => String(2026 - i)); // desde 2005
export const SEDES: Record<string, { direccion: string; telefono: string; mapa: string; horario: string }> = {
  "Caracas · La Castellana": { direccion: "Av. Principal de La Castellana, C.C. Centro Plaza, nivel Estacionamiento 2, Chacao", telefono: "0212-263-4410", mapa: "https://maps.app.goo.gl/xpuesto-castellana", horario: "Lun a sáb · 8 am a 5 pm" },
  "Caracas · Las Mercedes": { direccion: "Calle París con Calle Nueva York, Estacionamiento Tolón, nivel PB, Las Mercedes", telefono: "0212-993-2200", mapa: "https://maps.app.goo.gl/xpuesto-mercedes", horario: "Lun a vie · 8 am a 4 pm" },
  "Valencia · Big Low": { direccion: "Terminal Big Low Center, Av. Bolívar Norte, área de talleres, Valencia", telefono: "0241-823-7711", mapa: "https://maps.app.goo.gl/xpuesto-biglow", horario: "Lun a sáb · 7 am a 4 pm" },
  "Maracay · Las Delicias": { direccion: "Av. Las Delicias, C.C. Las Américas, estacionamiento sótano 1, Maracay", telefono: "0243-232-5580", mapa: "https://maps.app.goo.gl/xpuesto-delicias", horario: "Lun a vie · 8 am a 4 pm" },
};
