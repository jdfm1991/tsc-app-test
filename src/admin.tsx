// Backoffice de XPuesto. Cuatro cuartos: Mapa en vivo, Choferes, Central SOS y Caja. Todo simulado.
import { useEffect, useState } from "react";
import { bs } from "./data";
import { Ic } from "./ui";
import { Hoja } from "./viaje";
import type { Usuario } from "./sesion";

const ir = (r: string) => { window.location.hash = "/" + r; };

// ---------- Venezuela estilizada (viewBox 0 0 600 420) ----------
const VENEZUELA = "M100 24 L114 31 L99 53 L84 64 L90 73 L106 64 L128 51 L147 42 L154 22 L165 9 L176 22 L172 42 L194 53 L229 68 L246 84 L282 81 L321 77 L352 92 L387 99 L414 86 L440 77 L480 75 L515 74 L506 86 L480 99 L497 114 L528 125 L559 147 L581 167 L603 174 L590 198 L576 229 L554 260 L537 284 L568 317 L572 343 L532 363 L484 367 L449 372 L414 365 L396 392 L409 431 L422 462 L378 499 L352 515 L321 513 L295 491 L286 460 L295 433 L268 420 L253 396 L273 361 L255 321 L264 295 L268 273 L229 275 L185 277 L150 255 L119 240 L70 235 L51 218 L51 191 L31 163 L22 139 L33 110 L48 88 L33 66 L57 37 L77 33 Z";
const LAGO = { cx: 90, cy: 117, rx: 18, ry: 37 };
const CIUDADES: Record<string, [number, number]> = {
  "Maracaibo": [88, 77],
  "Barquisimeto": [189, 103],
  "Valencia": [246, 98],
  "Maracay": [264, 95],
  "Caracas": [295, 84],
  "Pto. La Cruz": [392, 97],
  "Cumaná": [414, 86],
  "Pto. Ordaz": [480, 180],
  "Mérida": [108, 167],
  "San Cristóbal": [62, 204],
};
const ETIQUETA: Record<string, [number, number, "start" | "middle" | "end"]> = {
  "Maracaibo": [0, -12, "middle"],
  "Barquisimeto": [-6, 20, "middle"],
  "Valencia": [-4, -12, "end"],
  "Maracay": [2, 20, "middle"],
  "Caracas": [2, -12, "start"],
  "Pto. La Cruz": [0, 18, "middle"],
  "Cumaná": [4, -10, "start"],
  "Pto. Ordaz": [8, 4, "start"],
  "Mérida": [8, 4, "start"],
  "San Cristóbal": [0, 18, "middle"],
};
const TRAMOS: [string, string][] = [["Caracas", "Valencia"], ["Valencia", "Barquisimeto"], ["Caracas", "Pto. La Cruz"], ["Barquisimeto", "Maracaibo"], ["Pto. La Cruz", "Pto. Ordaz"], ["Barquisimeto", "Mérida"], ["Mérida", "San Cristóbal"], ["Valencia", "Maracay"], ["Maracay", "Caracas"], ["Pto. La Cruz", "Cumaná"]];

type ViajeVivo = { id: string; de: string; a: string; chofer: string; foto: string; pasajeros: number; t: number; vel: number; eta: string; alerta?: string };
const VIAJES_INI: ViajeVivo[] = [
  { id: "v1", de: "Caracas", a: "Valencia", chofer: "José R.", foto: "./chofer-jose.jpg", pasajeros: 4, t: 0.35, vel: 0.0012, eta: "8:15 am" },
  { id: "v2", de: "Valencia", a: "Caracas", chofer: "Luis M.", foto: "./chofer-luis.jpg", pasajeros: 3, t: 0.6, vel: 0.0011, eta: "8:40 am", alerta: "Desvío de ruta" },
  { id: "v3", de: "Caracas", a: "Pto. La Cruz", chofer: "Ana G.", foto: "./chofer-ana.jpg", pasajeros: 4, t: 0.15, vel: 0.0006, eta: "11:10 am" },
  { id: "v4", de: "Barquisimeto", a: "Maracaibo", chofer: "Carlos P.", foto: "./chofer-carlos.jpg", pasajeros: 4, t: 0.7, vel: 0.0008, eta: "9:05 am" },
  { id: "v5", de: "Valencia", a: "Barquisimeto", chofer: "Ana G.", foto: "./chofer-ana.jpg", pasajeros: 2, t: 0.05, vel: 0.001, eta: "10:20 am" },
  { id: "v6", de: "Pto. La Cruz", a: "Pto. Ordaz", chofer: "Luis M.", foto: "./chofer-luis.jpg", pasajeros: 4, t: 0.5, vel: 0.0009, eta: "10:00 am" },
  { id: "v7", de: "Mérida", a: "San Cristóbal", chofer: "Carlos P.", foto: "./chofer-carlos.jpg", pasajeros: 3, t: 0.8, vel: 0.0015, eta: "9:30 am" },
];

export function Admin({ ruta, registrado }: { ruta: string; registrado?: Usuario | null }) {
  const sub = ruta.replace(/^admin\/?/, "") || "mapa";
  const [viajes, setViajes] = useState(VIAJES_INI);
  const [alertaAtendida, setAlertaAtendida] = useState(false);
  useEffect(() => {
    const id = window.setInterval(() => setViajes((v) => v.map((x) => ({ ...x, t: x.t + x.vel > 1 ? 0 : x.t + x.vel }))), 60);
    return () => window.clearInterval(id);
  }, []);
  const alertas = alertaAtendida ? 0 : viajes.filter((v) => v.alerta).length;
  const NAV = [["mapa", "Mapa en vivo", <Ic.pin />], ["choferes", "Choferes", <Ic.usuarios />], ["sos", "Central SOS", <Ic.sos />], ["caja", "Caja", <Ic.billetera />]] as const;
  return (
    <div className="admin">
      <header className="admin-cab">
        <img src="./logo-blanco.png" alt="XPuesto" />
        <span className="sep">Backoffice</span>
        <span className="espacio" />
        <span className="en-vivo"><i />EN VIVO · 15 sep · 7:42 am</span>
        <button className="admin-salir" onClick={() => ir("inicio")}>Ver como pasajero</button>
      </header>
      <div className="admin-cuerpo">
        <nav className="admin-nav">
          {NAV.map(([k, n, ic]) => (
            <button key={k} className={sub === k ? "on" : ""} onClick={() => ir("admin/" + k)}>{ic}<span>{n}</span>{k === "sos" && alertas > 0 && <em>{alertas}</em>}</button>
          ))}
        </nav>
        <main className="admin-main">
          {sub === "mapa" && <MapaVivoNacional viajes={viajes} alertas={alertas} alertaAtendida={alertaAtendida} />}
          {sub === "choferes" && <Choferes registrado={registrado} />}
          {sub === "sos" && <CentralSOS viajes={viajes} atendida={alertaAtendida} atender={() => setAlertaAtendida(true)} />}
          {sub === "caja" && <Caja />}
        </main>
      </div>
    </div>
  );
}

// ---------- 1. MAPA EN VIVO ----------
function MapaVivoNacional({ viajes, alertas, alertaAtendida }: { viajes: ViajeVivo[]; alertas: number; alertaAtendida: boolean }) {
  const pos = (v: ViajeVivo): [number, number] => { const a = CIUDADES[v.de], b = CIUDADES[v.a]; return [a[0] + (b[0] - a[0]) * v.t, a[1] + (b[1] - a[1]) * v.t]; };
  return (
    <>
      <div className="kpis-admin">
        <div className="kpi-a"><small>Viajes en curso</small><b>{viajes.length + 7}</b><span>{viajes.reduce((a, v) => a + v.pasajeros, 0) + 26} pasajeros a bordo</span></div>
        <div className="kpi-a"><small>Puestos vendidos hoy</small><b>212</b><span>+18 % vs. ayer</span></div>
        <div className="kpi-a"><small>Choferes activos</small><b>63</b><span>de 148 certificados</span></div>
        <div className={"kpi-a" + (alertas ? " alerta" : " ok")}><small>Alertas SOS</small><b>{alertas}</b><span>{alertas ? "1 desvío de ruta · Luis M." : "todo en orden"}</span></div>
      </div>
      <div className="admin-grid">
        <div className="tarjeta lisa" style={{ padding: 8 }}>
          <svg viewBox="0 0 610 520" className="venezuela" aria-label="Mapa de Venezuela con los viajes en curso">
            <path d={VENEZUELA} fill="#E9EEF7" stroke="#B8C2D6" strokeWidth="2" strokeLinejoin="round" />
            <ellipse cx={LAGO.cx} cy={LAGO.cy} rx={LAGO.rx} ry={LAGO.ry} fill="#D6E0F0" />
            {TRAMOS.map(([a, b]) => <line key={a + b} x1={CIUDADES[a][0]} y1={CIUDADES[a][1]} x2={CIUDADES[b][0]} y2={CIUDADES[b][1]} stroke="#0A274F" strokeWidth="3" strokeLinecap="round" opacity=".55" />)}
            {Object.entries(CIUDADES).map(([n, [x, y]]) => (
              <g key={n}><circle cx={x} cy={y} r="5" fill="#fff" stroke="#0A274F" strokeWidth="3" /><text x={x + ETIQUETA[n][0]} y={y + ETIQUETA[n][1]} textAnchor={ETIQUETA[n][2]} fontSize="11" fontWeight="800" fill="#0A274F">{n}</text></g>
            ))}
            {viajes.map((v) => { const [x, y] = pos(v); const mal = v.alerta && !alertaAtendida; return (
              <g key={v.id} transform={`translate(${x} ${y})`}>
                {mal && <circle r="16" fill="#D7263D" opacity=".25"><animate attributeName="r" values="10;22;10" dur="1.2s" repeatCount="indefinite" /></circle>}
                <circle r="8" fill={mal ? "#D7263D" : "#FB5E17"} stroke="#fff" strokeWidth="2.5" />
              </g>
            ); })}
          </svg>
          <div className="leyenda" style={{ marginTop: 6 }}><span><i style={{ background: "#FB5E17", borderRadius: "50%" }} />Viaje en curso</span><span><i style={{ background: "#D7263D", borderRadius: "50%" }} />Alerta</span><span><i style={{ background: "#0A274F", height: 4, borderRadius: 2, marginTop: 5 }} />Ruta activa</span></div>
        </div>
        <div className="tarjeta lisa" style={{ padding: 0, overflow: "hidden" }}>
          <div className="encabezado-seccion" style={{ padding: "14px 16px 8px" }}><h3>En curso ahora</h3><span className="cuenta">{viajes.length} de {viajes.length + 7}</span></div>
          <div className="tabla">
            {viajes.map((v) => (
              <div key={v.id} className={"fila-viaje" + (v.alerta && !alertaAtendida ? " mal" : "")}>
                <img src={v.foto} alt="" />
                <div><b>{v.de} → {v.a}</b><small>{v.chofer} · {v.pasajeros} de 4 · llega {v.eta}</small></div>
                <div className="avance"><i style={{ width: `${Math.round(v.t * 100)}%` }} /></div>
                <span className={"pill " + (v.alerta && !alertaAtendida ? "mal" : "llena")}>{v.alerta && !alertaAtendida ? v.alerta : `${Math.round(v.t * 100)} %`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- 2. CHOFERES ----------
type Chofer = { nombre: string; foto: string; carro: string; ciudad: string; estrellas: number; viajes: number; puntos: number; nivel: string; estado: "Activo" | "En revisión" | "Suspendido"; docs: { n: string; ok: boolean; nota?: string }[] };
const DOCS_OK = ["Cédula", "RIF", "Licencia", "Cert. médico", "Carnet circ.", "RCV", "Inspección"].map((n) => ({ n, ok: true }));
const CHOFERES: Chofer[] = [
  { nombre: "José R.", foto: "./chofer-jose.jpg", carro: "Toyota Corolla azul", ciudad: "Caracas", estrellas: 4.9, viajes: 312, puntos: 1240, nivel: "Plata", estado: "Activo", docs: DOCS_OK.map((d) => d.n === "RCV" ? { ...d, nota: "vence 30 oct" } : d) },
  { nombre: "Ana G.", foto: "./chofer-ana.jpg", carro: "Hyundai Tucson rojo", ciudad: "Caracas", estrellas: 5.0, viajes: 97, puntos: 640, nivel: "Bronce", estado: "Activo", docs: DOCS_OK },
  { nombre: "Luis M.", foto: "./chofer-luis.jpg", carro: "Renault Logan gris", ciudad: "Valencia", estrellas: 4.7, viajes: 148, puntos: 880, nivel: "Bronce", estado: "Activo", docs: DOCS_OK },
  { nombre: "Carlos P.", foto: "./chofer-carlos.jpg", carro: "Chevrolet Aveo plata", ciudad: "Barquisimeto", estrellas: 4.8, viajes: 521, puntos: 2310, nivel: "Oro", estado: "Activo", docs: DOCS_OK },
  { nombre: "Yorman D.", foto: "", carro: "Kia Rio blanco", ciudad: "Maracay", estrellas: 0, viajes: 0, puntos: 0, nivel: "Nuevo", estado: "En revisión", docs: DOCS_OK.map((d) => ["Inspección", "RCV"].includes(d.n) ? { ...d, ok: false, nota: d.n === "RCV" ? "falta pagar" : "cita jueves" } : d) },
  { nombre: "Freddy A.", foto: "", carro: "Ford Fiesta negro", ciudad: "Caracas", estrellas: 3.9, viajes: 44, puntos: 210, nivel: "Bronce", estado: "Suspendido", docs: DOCS_OK.map((d) => d.n === "Licencia" ? { ...d, ok: false, nota: "vencida" } : d) },
];
function Choferes({ registrado }: { registrado?: Usuario | null }) {
  const [filtro, setFiltro] = useState<"Todos" | Chofer["estado"]>("Todos");
  const [abierto, setAbierto] = useState<Chofer | null>(null);
  const nuevo: Chofer[] = registrado && registrado.chofer ? [{
    nombre: registrado.nombre.includes(registrado.chofer.apellido) ? registrado.nombre : `${registrado.nombre} ${registrado.chofer.apellido}`.trim(), foto: "", carro: `${registrado.chofer.carro.marca} ${registrado.chofer.carro.modelo} ${registrado.chofer.carro.color.toLowerCase()}`,
    ciudad: (registrado.chofer.inspeccion.split(" · ")[0] || "Caracas"), estrellas: 0, viajes: 0, puntos: 0, nivel: "Nuevo", estado: "En revisión",
    docs: [...Object.entries(registrado.chofer.docs).map(([n, d]) => ({ n: n.replace("Cédula de identidad", "Cédula").replace("Licencia de conducir", "Licencia").replace("Certificado médico", "Cert. médico"), ok: d.foto, nota: d.foto ? "vence " + (d.vence || "—") : "falta" })), { n: "Carnet circ.", ok: registrado.chofer.carro.carnetFoto, nota: registrado.chofer.carro.carnetNumero }, { n: "Fotos del carro", ok: registrado.chofer.virtual.fotos >= 4, nota: registrado.chofer.virtual.fotos + " de 4" }, { n: "Entrevista", ok: registrado.chofer.puntaje >= 76, nota: registrado.chofer.puntaje + " %" }, { n: "Insp. presencial", ok: false, nota: registrado.chofer.entrevista || "sin cita" }, { n: "RCV", ok: !!registrado.chofer.rcvVence, nota: registrado.chofer.rcvVence ? "vence " + registrado.chofer.rcvVence : "falta" }],
  }] : [];
  const lista = [...nuevo, ...CHOFERES].filter((c) => filtro === "Todos" || c.estado === filtro);
  return (
    <>
      <div className="encabezado-seccion"><h2>Choferes</h2><span className="cuenta">148 certificados · 12 en revisión · 3 suspendidos</span></div>
      <div className="chips" style={{ margin: 0, padding: 0 }}>{(["Todos", "Activo", "En revisión", "Suspendido"] as const).map((f) => <button key={f} className={"chip" + (filtro === f ? " activo" : "")} onClick={() => setFiltro(f)}>{f}</button>)}</div>
      <div className="tarjeta lisa" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tabla">
          {lista.map((c) => (
            <button key={c.nombre} className="fila-chofer" onClick={() => setAbierto(c)}>
              {c.foto ? <img src={c.foto} alt="" /> : <i className="ini">{c.nombre[0]}</i>}
              <div><b>{c.nombre}</b><small>{c.carro} · {c.ciudad}</small></div>
              <div className="col-num"><b>{c.estrellas ? "★ " + c.estrellas.toFixed(1) : "—"}</b><small>{c.viajes} viajes</small></div>
              <div className="col-num"><b>{c.puntos}</b><small>XPuntos · {c.nivel}</small></div>
              <div className="docs" style={{ margin: 0 }}>{c.docs.filter((d) => !d.ok || d.nota).length === 0 ? <span className="doc ok"><Ic.check />Docs al día</span> : c.docs.filter((d) => !d.ok || d.nota).map((d) => <span key={d.n} className={"doc " + (d.ok ? "pend" : "mal")}>{d.n} · {d.nota}</span>)}</div>
              <span className={"pill " + (c.estado === "Activo" ? "llena" : c.estado === "Suspendido" ? "mal" : "")}>{c.estado}</span>
            </button>
          ))}
        </div>
      </div>
      {abierto && (
        <Hoja titulo={abierto.nombre} cerrar={() => setAbierto(null)}>
          <div className="chofer" style={{ marginBottom: 12 }}>
            {abierto.foto ? <img className="foto" src={abierto.foto} alt="" /> : <i className="ini" style={{ width: 72, height: 72, fontSize: 28 }}>{abierto.nombre[0]}</i>}
            <div><div className="datos">{abierto.carro} · {abierto.ciudad}<br />{abierto.viajes} viajes · {abierto.puntos} XPuntos · {abierto.nivel}</div><span className={"pill " + (abierto.estado === "Activo" ? "llena" : abierto.estado === "Suspendido" ? "mal" : "")}>{abierto.estado}</span></div>
          </div>
          <b>Documentos</b>
          <div className="docs" style={{ marginBottom: 14 }}>{abierto.docs.map((d) => <span key={d.n} className={"doc " + (!d.ok ? "mal" : d.nota ? "pend" : "ok")}>{d.ok && !d.nota && <Ic.check />}{d.n}{d.nota ? " · " + d.nota : ""}</span>)}</div>
          <div className="lista">
            {abierto.estado === "En revisión" && <button className="btn" disabled={abierto.docs.some((d) => !d.ok)}>{abierto.docs.some((d) => !d.ok) ? "Faltan documentos para aprobar" : "Aprobar chofer"}</button>}
            {abierto.estado === "Activo" && <button className="btn secundario">Suspender temporalmente</button>}
            {abierto.estado === "Suspendido" && <button className="btn">Reactivar (al renovar licencia)</button>}
            <button className="btn fantasma">Ver historial de viajes y reclamos</button>
          </div>
        </Hoja>
      )}
    </>
  );
}

// ---------- 3. CENTRAL SOS ----------
function CentralSOS({ viajes, atendida, atender }: { viajes: ViajeVivo[]; atendida: boolean; atender: () => void }) {
  const v = viajes.find((x) => x.alerta)!;
  const [paso, setPaso] = useState(0);
  const pasos = ["Llamar al chofer", "Llamar al pasajero del copiloto", "Marcar como falsa alarma", "Escalar a autoridades"];
  return (
    <>
      <div className="encabezado-seccion"><h2>Central SOS</h2><span className="cuenta">monitoreo 24/7 · 2 operadores en turno</span></div>
      {!atendida ? (
        <div className="tarjeta alerta-sos">
          <div className="cab"><span className="pill mal">DESVÍO DE RUTA · hace 2 min</span><b>{v.de} → {v.a}</b></div>
          <div className="grid2" style={{ marginTop: 10 }}>
            <div className="chofer"><img className="foto" src={v.foto} alt="" /><div><div className="nombre">{v.chofer}</div><div className="datos">Renault Logan gris · AC7•••<br />{v.pasajeros} pasajeros a bordo · última señal hace 20 s</div></div></div>
            <div className="tarjeta lisa" style={{ background: "#fff" }}>
              <b>Qué pasó</b>
              <p className="small muted">El carro salió de la autopista Regional del Centro a la altura de Tejerías y lleva 4 min por una vía secundaria sin parada programada. Velocidad: 38 km/h. Nadie pulsó SOS.</p>
            </div>
          </div>
          <div className="protocolo">
            {pasos.map((p, i) => <button key={p} className={"paso" + (i < paso ? " hecho" : i === paso ? " actual" : "")} onClick={() => setPaso(i + 1)}>{i < paso ? <Ic.check /> : <i>{i + 1}</i>}{p}{i === 0 && paso > 0 && <small>Contestó: cola por accidente, retomó la ruta</small>}</button>)}
          </div>
          <div className="lista" style={{ marginTop: 12 }}>
            <button className="btn" onClick={atender}>Cerrar la alerta: resuelta</button>
          </div>
        </div>
      ) : (
        <div className="tarjeta ok"><b>Sin alertas activas.</b><p className="small muted">La última (desvío de Luis M., Caracas → Valencia) se cerró como resuelta: cola por accidente, retomó la ruta.</p></div>
      )}
      <div className="tarjeta lisa" style={{ padding: 0, overflow: "hidden" }}>
        <div className="encabezado-seccion" style={{ padding: "14px 16px 8px" }}><h3>Historial de hoy</h3><span className="cuenta">4 alertas</span></div>
        <div className="tabla">
          {[["6:12 am", "Botón SOS · pasajera", "Valencia → Caracas · Ana G.", "Falsa alarma, lo tocó sin querer", "ok"], ["6:48 am", "Parada larga 9 min", "Caracas → Pto. La Cruz · Carlos P.", "Alcabala, verificado por foto", "ok"], ["7:05 am", "Pérdida de señal 3 min", "Barquisimeto → Mérida · Luis M.", "Túnel, señal recuperada", "ok"], ["7:40 am", "Desvío de ruta", "Caracas → Valencia · Luis M.", atendida ? "Cola por accidente, resuelta" : "En atención", atendida ? "ok" : "mal"]].map(([h, t, r, n, e]) => (
            <div key={h} className="fila-viaje historial"><b>{h}</b><div><b>{t}</b><small>{r}</small></div><span className="muted small nota-h">{n}</span><span className={"pill " + (e === "ok" ? "llena" : "mal")}>{e === "ok" ? "Resuelta" : "Activa"}</span></div>
          ))}
        </div>
      </div>
    </>
  );
}

// ---------- 4. CAJA ----------
function Caja() {
  const [pagados, setPagados] = useState<string[]>([]);
  const retiros = [["Carlos P.", 120, "Mercantil · Pago Móvil"], ["Ana G.", 85, "Banesco · Pago Móvil"], ["Luis M.", 60, "BBVA · Pago Móvil"]] as const;
  const semana = [1840, 2110, 1960, 2480, 2920, 3310, 2544];
  const max = Math.max(...semana);
  return (
    <>
      <div className="encabezado-seccion"><h2>Caja</h2><span className="cuenta">hoy · 15 sep · corte 11:59 pm</span></div>
      <div className="kpis-admin">
        <div className="kpi-a"><small>Vendido hoy</small><b>$2.544</b><span>212 puestos · {bs(2544)}</span></div>
        <div className="kpi-a naranja"><small>Comisión XPuesto</small><b>$381,60</b><span>15 % de lo vendido</span></div>
        <div className="kpi-a"><small>Liquidado a choferes</small><b>$2.162</b><span>en billeteras, hoy</span></div>
        <div className="kpi-a"><small>Retiros pendientes</small><b>${retiros.filter((r) => !pagados.includes(r[0])).reduce((a, r) => a + r[1], 0)}</b><span>{retiros.length - pagados.length} por pagar</span></div>
      </div>
      <div className="admin-grid">
        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Vendido esta semana</h3><span className="cuenta">US$</span></div>
          <svg viewBox="0 0 420 180" className="grafico" aria-label="Ventas de los últimos 7 días">
            {semana.map((v, i) => { const h = (v / max) * 130; const x = 20 + i * 57; return (
              <g key={i}><rect x={x} y={150 - h} width="40" height={h} rx="6" fill={i === 6 ? "#FB5E17" : "#0A274F"} opacity={i === 6 ? 1 : .8} /><text x={x + 20} y={150 - h - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0A274F">{(v / 1000).toFixed(1)}k</text><text x={x + 20} y="170" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8B96AD">{["Mar", "Mié", "Jue", "Vie", "Sáb", "Dom", "Hoy"][i]}</text></g>
            ); })}
          </svg>
          <b style={{ display: "block", marginTop: 8 }}>De dónde entra la plata</b>
          {[["Comisión por puesto", 381.6, "#0A274F"], ["Membresías (63 × $15 / 30)", 31.5, "#3A4A6B"], ["Premium / VIP (extra)", 96, "#FB5E17"], ["Publicidad de comercios aliados", 40, "#F2A93B"]].map(([n, v, c]) => (
            <div key={n as string} className="linea-ingreso"><span>{n}</span><div className="pista"><i style={{ width: `${(Number(v) / 381.6) * 100}%`, background: c as string }} /></div><b>${Number(v).toFixed(2)}</b></div>
          ))}
        </div>
        <div className="lista">
          <div className="tarjeta lisa" style={{ padding: 0, overflow: "hidden" }}>
            <div className="encabezado-seccion" style={{ padding: "14px 16px 8px" }}><h3>Retiros por pagar</h3><span className="cuenta">se pagan por Pago Móvil</span></div>
            <div className="tabla">
              {retiros.map(([n, m, b]) => (
                <div key={n} className="fila-viaje sin-foto"><div><b>{n}</b><small>{b}</small></div><b>${m}</b>{pagados.includes(n) ? <span className="pill llena">Pagado</span> : <button className="chip activo" onClick={() => setPagados((p) => [...p, n])}>Pagar</button>}</div>
              ))}
            </div>
          </div>
          <div className="tarjeta lisa">
            <b>Billeteras de choferes</b>
            <div className="resumen">
              <div className="r"><span className="k">Saldo total en billeteras</span><span className="v">$18.420</span></div>
              <div className="r"><span className="k">Saldo prepago (cobran en efectivo)</span><span className="v">$4.130</span></div>
              <div className="r"><span className="k">Comisiones debitadas hoy por efectivo</span><span className="v">$92,40</span></div>
              <div className="r"><span className="k">Choferes con saldo bajo (&lt; $5)</span><span className="v naranja">7 · avisados</span></div>
            </div>
          </div>
          <div className="tarjeta naranja"><b>Alianzas activas: 41 paradas virtuales</b><p className="small muted">Sambil, Tolón, PDV, Farmatodo, Metrópolis… 6 nuevas este mes. Publicidad cobrada: $1.200 / mes.</p></div>
        </div>
      </div>
    </>
  );
}
