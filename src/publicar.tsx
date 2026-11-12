// Publicar una salida con ruta real y tarifa calculada (chofer), y el mapa de la ruta (pasajero).
import { useEffect, useState } from "react";
import { Hoja } from "./viaje";
import { Ic, Mapa } from "./ui";
import { MapaReal } from "./MapaReal";
import { horaMas, LUGARES, rutaEntre, tarifaPorPuesto, TARIFA, ubicar, type Punto, type Ruta } from "./mapa";
import { CIUDADES } from "./data";
import type { Salida } from "./data";

const PARADAS = ["C.C. Sambil", "C.C. Tolón", "Bomba PDV La Castellana", "Farmatodo Los Palos Grandes", "Terminal Big Low", "C.C. Metrópolis"];
const HORAS = ["4:30 am", "5:00 am", "6:00 am", "7:00 am", "8:00 am", "9:00 am", "10:00 am", "12:00 pm", "2:00 pm", "3:00 pm", "5:00 pm", "7:00 pm"];

export type SalidaNueva = { ruta: string; de: string; a: string; parada: string; hora: string; llegada: string; km: number; min: number; precio: number };

export function PublicarSalida({ cerrar, publicar, sugerida }: { cerrar: () => void; publicar: (s: SalidaNueva) => void; sugerida?: { de: string; a: string; hora: string } }) {
  const [de, setDe] = useState(sugerida?.de ?? "Caracas");
  const [a, setA] = useState(sugerida?.a ?? "Valencia");
  const [parada, setParada] = useState("C.C. Sambil");
  const [hora, setHora] = useState(sugerida?.hora ?? "6:00 am");
  const [calc, setCalc] = useState<{ origen: Punto; destino: Punto; parada: Punto | null; ruta: Ruta } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [precio, setPrecio] = useState<number | null>(null);

  const calcular = async () => {
    setCargando(true); setError(""); setCalc(null); setPrecio(null);
    const [o, d, p] = await Promise.all([ubicar(de), ubicar(a), ubicar(parada)]);
    if (!o || !d) { setError("No ubicamos " + (!o ? `«${de}»` : `«${a}»`) + ". Prueba con el nombre de la ciudad."); setCargando(false); return; }
    const ruta = await rutaEntre(p ?? o, d);
    if (!ruta) { setError("No pudimos calcular la ruta por carretera. Revisa la señal e intenta otra vez."); setCargando(false); return; }
    setCalc({ origen: o, destino: d, parada: p, ruta }); setPrecio(tarifaPorPuesto(ruta.km)); setCargando(false);
  };
  useEffect(() => { calcular(); /* al abrir, calcula la sugerida */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sugerido = calc ? tarifaPorPuesto(calc.ruta.km) : null;
  return (
    <Hoja titulo="Publicar una salida" cerrar={cerrar}>
      <div className="lista" style={{ overflowY: "auto", maxHeight: "70dvh", paddingBottom: 8 }}>
        <div className="fila2">
          <label className="campo texto"><span className="col"><span className="etiqueta">Salgo de</span><input list="ciudades-xp" value={de} onChange={(e) => setDe(e.target.value)} placeholder="Ciudad o sitio" /></span></label>
          <label className="campo texto"><span className="col"><span className="etiqueta">Voy a</span><input list="ciudades-xp" value={a} onChange={(e) => setA(e.target.value)} placeholder="Ciudad o sitio" /></span></label>
        </div>
        <datalist id="ciudades-xp">{CIUDADES.map((c) => <option key={c} value={c} />)}</datalist>
        <label className="campo texto"><span className="col"><span className="etiqueta">Parada virtual (donde recoges)</span><input list="paradas-xp" value={parada} onChange={(e) => setParada(e.target.value)} placeholder="Centro comercial, bomba, farmacia…" /></span></label>
        <datalist id="paradas-xp">{PARADAS.map((c) => <option key={c} value={c} />)}</datalist>
        <label className="campo"><span className="icono"><Ic.reloj /></span><span className="col"><span className="etiqueta">Hora de salida</span><span className="valor">{hora}</span></span><span className="flecha"><Ic.abajo /></span>
          <select value={hora} onChange={(e) => setHora(e.target.value)}>{HORAS.map((h) => <option key={h}>{h}</option>)}</select></label>
        <button className="btn secundario" onClick={calcular} disabled={cargando}>{cargando ? "Calculando la ruta…" : "Calcular ruta y tarifa"}</button>
        {error && <p className="small" style={{ color: "#D7263D", fontWeight: 700 }}>{error}</p>}
        {calc && precio !== null && (<>
          <div className="tarjeta lisa" style={{ padding: 8 }}><MapaReal origen={calc.parada ?? calc.origen} destino={calc.destino} parada={calc.parada} ruta={calc.ruta} alto={190} /></div>
          <div className="kpis-chofer" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div className="kpi-c"><small>Km</small><b>{Math.round(calc.ruta.km)}</b><span>por carretera</span></div>
            <div className="kpi-c"><small>Tiempo</small><b>{Math.floor(calc.ruta.min / 60)}h {String(calc.ruta.min % 60).padStart(2, "0")}</b><span>llegas {horaMas(hora, calc.ruta.min)}</span></div>
            <div className="kpi-c naranja"><small>Puesto</small><b>${precio}</b><span>carro ${precio * TARIFA.puestos}</span></div>
          </div>
          <div className="tarjeta naranja" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 10 }}>
            <div><b>Tarifa sugerida: ${sugerido} el puesto</b><p className="small muted">${TARIFA.base} de base + ${TARIFA.porKm} por km, entre {TARIFA.puestos}. Puedes moverla ±$2.</p></div>
            <div className="mas-menos"><button onClick={() => setPrecio(Math.max((sugerido ?? 3) - 2, precio - 1))}>−</button><b>${precio}</b><button onClick={() => setPrecio(Math.min((sugerido ?? 3) + 2, precio + 1))}>+</button></div>
          </div>
          <button className="btn" onClick={() => publicar({ ruta: `${de} → ${a}`, de, a, parada, hora, llegada: horaMas(hora, calc.ruta.min), km: calc.ruta.km, min: calc.ruta.min, precio })}>Publicar salida · ${precio} el puesto</button>
        </>)}
      </div>
    </Hoja>
  );
}

// ---------- mapa de la ruta de una salida (pasajero) ----------
export function MapaRuta({ salida, a, carro }: { salida: Salida; a: string; carro?: [number, number] | null }) {
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const origen = LUGARES[salida.parada] ?? LUGARES["Caracas"];
  const destino = LUGARES[a] ?? LUGARES["Valencia"];
  useEffect(() => { let vivo = true; rutaEntre(origen, destino).then((r) => { if (vivo) setRuta(r); }); return () => { vivo = false; }; }, [origen, destino]);
  if (!ruta) return <Mapa parada={salida.parada} />;
  return (
    <div>
      <MapaReal origen={origen} destino={destino} parada={origen} ruta={ruta} carro={carro} alto={200} />
      <p className="small muted" style={{ textAlign: "center", marginTop: 6, fontWeight: 700 }}>{ruta.km} km por carretera · {Math.floor(ruta.min / 60)} h {String(ruta.min % 60).padStart(2, "0")} min</p>
    </div>
  );
}
export function puntoEnRuta(ruta: Ruta, t: number): [number, number] {
  const i = Math.min(ruta.linea.length - 1, Math.max(0, Math.round(t * (ruta.linea.length - 1))));
  return ruta.linea[i];
}
