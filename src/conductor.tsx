// App Conductor. El chofer de la demo es José R. Todo simulado.
import { useEffect, useState } from "react";
import { bs, type Puesto } from "./data";
import { Cabecera, Deslizar, Ic, MapaVivo } from "./ui";
import { Hoja } from "./viaje";
import { PerfilChofer } from "./cuenta";
import { PublicarSalida } from "./publicar";
import { COMISION_POR_NIVEL, FONDO_VUELTOS, type Usuario } from "./sesion";

const ir = (r: string) => { window.location.hash = "/" + r; };
let COMISION = 0.15; // se ajusta al nivel del chofer al entrar

type Pasajero = { puesto: Puesto; nombre: string; equipaje: string; foto?: boolean; ini: string; efectivo?: boolean; telefono?: string };
const PASAJEROS_6AM: Pasajero[] = [
  { puesto: "copiloto", nombre: "Raúl S.", ini: "R", equipaje: "C · Maleta grande", foto: true, efectivo: true, telefono: "0414-555-1234" },
  { puesto: "tras-izq", nombre: "María P.", ini: "M", equipaje: "B · Maleta mediana", foto: true },
  { puesto: "tras-der", nombre: "Karla V.", ini: "K", equipaje: "A · Bolso de mano" },
];

type SalidaMia = { id: string; ruta: string; hora: string; parada: string; llenos: number; precio: number; estado: "abierta" | "llena" | "hecha"; km?: number; llegada?: string };
const SALIDAS_HOY_INI: SalidaMia[] = [
  { id: "z", ruta: "Valencia → Caracas", hora: "4:30 am", parada: "Terminal Big Low", llenos: 4, precio: 12, estado: "hecha" },
  { id: "a", ruta: "Caracas → Valencia", hora: "6:00 am", parada: "C.C. Sambil", llenos: 3, precio: 12, estado: "abierta" },
  { id: "b", ruta: "Valencia → Caracas", hora: "11:00 am", parada: "Terminal Big Low", llenos: 4, precio: 12, estado: "llena" },
  { id: "c", ruta: "Caracas → Valencia", hora: "2:00 pm", parada: "C.C. Sambil", llenos: 4, precio: 14, estado: "llena" },
];

type Oferta = { id: string; ruta: string; hora: string; parada: string; monto: number; estado: "libre" | "mia" | "perdida" };
const BOLSA_INI: Oferta[] = [
  { id: "o1", ruta: "Caracas → Maracay", hora: "8:30 am", parada: "Bomba PDV La Castellana", monto: 32, estado: "libre" },
  { id: "o2", ruta: "Caracas → Valencia", hora: "9:15 am", parada: "C.C. Tolón", monto: 48, estado: "libre" },
  { id: "o3", ruta: "Valencia → Barquisimeto", hora: "1:00 pm", parada: "C.C. Metrópolis", monto: 40, estado: "libre" },
];

export function Conductor({ ruta, u, guardar, salir }: { ruta: string; u: Usuario; guardar: (u: Usuario) => void; salir: () => void }) {
  const sub = ruta.replace(/^conductor\/?/, "") || "hoy";
  COMISION = COMISION_POR_NIVEL[u.nivel ?? "Impulso"];
  const [salidas, setSalidas] = useState(SALIDAS_HOY_INI);
  const [bolsa, setBolsa] = useState(BOLSA_INI);
  const [aviso, setAviso] = useState<string | null>(null);
  const avisa = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 3200); };

  let cuerpo: React.ReactNode;
  if (sub === "salida") cuerpo = <SalidaActiva onFin={(neto) => { setSalidas((x) => x.map((s) => s.id === "a" ? { ...s, estado: "hecha", llenos: 4 } : s)); avisa(`Liquidado: $${neto.toFixed(2)} a tu billetera`); ir("conductor/billetera"); }} />;
  else if (sub === "bolsa") cuerpo = <Bolsa bolsa={bolsa} tomar={(id) => {
    setBolsa((b) => b.map((o) => o.id === id ? { ...o, estado: "mia" } : o)); avisa("¡Es tuya! Te la sumamos a Hoy.");
    const o = bolsa.find((x) => x.id === id)!; setSalidas((s) => [...s, { id: "n" + id, ruta: o.ruta, hora: o.hora, parada: o.parada, llenos: 4, precio: o.monto / 4, estado: "llena" }]);
    // otro chofer se lleva la siguiente, para que se vea la carrera
    setTimeout(() => setBolsa((b) => { const libre = b.find((x) => x.estado === "libre"); return libre ? b.map((x) => x.id === libre.id ? { ...x, estado: "perdida" } : x) : b; }), 2500);
  }} />;
  else if (sub === "billetera") cuerpo = <Billetera salidas={salidas} />;
  else if (sub === "perfil") cuerpo = <PerfilChofer u={u} guardar={guardar} salir={salir} />;
  else cuerpo = <Hoy nombre={u.nombre.split(" ")[0]} nivel={u.nivel ?? "Impulso"} salidas={salidas} publicar={(s) => { setSalidas((x) => [...x, s]); avisa("Horario publicado. Ya lo ven los pasajeros de esa ruta."); }} />;

  return (
    <div className="pantalla conductor">
      {cuerpo}
      {sub !== "salida" && (
        <nav className="tabs">
          <button className={sub === "hoy" ? "on" : ""} onClick={() => ir("conductor")}><Ic.casa />Hoy</button>
          <button className={sub === "bolsa" ? "on" : ""} onClick={() => ir("conductor/bolsa")}><Ic.bolsa />Bolsa{bolsa.some((o) => o.estado === "libre") && <em />}</button>
          <button className={sub === "billetera" ? "on" : ""} onClick={() => ir("conductor/billetera")}><Ic.billetera />Billetera</button>
          <button className={sub === "perfil" ? "on" : ""} onClick={() => ir("conductor/perfil")}><Ic.usuarios />Perfil</button>
        </nav>
      )}
      {aviso && <div className="toast">{aviso}</div>}
    </div>
  );
}

// ---------- HOY ----------
function Hoy({ nombre, nivel, salidas, publicar }: { nombre: string; nivel: string; salidas: SalidaMia[]; publicar: (s: SalidaMia) => void }) {
  const [hoja, setHoja] = useState(false);
  const [f, setF] = useState({ ruta: "Caracas → Valencia", hora: "", precio: 12 });
  const ganado = salidas.filter((s) => s.estado === "hecha").reduce((a, s) => a + s.llenos * s.precio * (1 - COMISION), 0);
  const porGanar = salidas.filter((s) => s.estado !== "hecha").reduce((a, s) => a + s.llenos * s.precio * (1 - COMISION), 0);
  return (
    <>
      <Cabecera titulo={
        <div className="chofer-cab"><button onClick={() => ir("conductor/perfil")} style={{ display: "contents" }}><img src="./chofer-jose.jpg" alt="" /></button><div><b>Hola, {nombre}</b><small>★ 4.9 · Chofer Plata · 312 viajes</small></div></div>
      }><span className="espacio" /><button className="atras" aria-label="Avisos"><Ic.campana /></button></Cabecera>
      <div className="cuerpo">
        <div className="nota" style={{ alignItems: "center" }}><Ic.trofeo /><span>Nivel <b>{nivel}</b>: te quedas con el {Math.round((1 - COMISION) * 100) } % de cada puesto. La ganancia neta se muestra antes de tomar cada ruta.</span></div>
        <div className="kpis-chofer">
          <div className="kpi-c"><small>Ganado hoy</small><b>${ganado.toFixed(0)}</b><span>{bs(ganado)}</span></div>
          <div className="kpi-c naranja"><small>Por ganar hoy</small><b>${porGanar.toFixed(0)}</b><span>{salidas.filter((s) => s.estado !== "hecha").length} salidas</span></div>
        </div>

        <div className="tarjeta naranja" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center" }}>
          <span style={{ width: 28, height: 28, color: "var(--naranja)" }}><Ic.rayo /></span>
          <div><b>3 personas piden Caracas → Valencia a las 5:00 pm</b><p className="small muted">Publica esa hora y la salida arranca casi llena.</p>
            <button className="btn fantasma" style={{ justifyContent: "flex-start", paddingLeft: 0, color: "var(--naranja)", minHeight: 36 }} onClick={() => { setF({ ruta: "Caracas → Valencia", hora: "5:00 pm", precio: 12 }); setHoja(true); }}>Publicar a esa hora <span style={{ width: 18, height: 18 }}><Ic.derecha /></span></button>
          </div>
        </div>

        <div className="encabezado-seccion"><h2>Tus salidas de hoy</h2><span className="cuenta">{salidas.length}</span></div>
        <div className="lista">
          {salidas.map((s) => (
            <div key={s.id} className={"tarjeta salida-mia" + (s.estado === "hecha" ? " hecha" : "")}>
              <div className="cab"><b>{s.hora}</b><span className={"pill " + s.estado}>{s.estado === "abierta" ? `${s.llenos} de 4 · faltan ${4 - s.llenos}` : s.estado === "llena" ? "Llena · lista para salir" : "Hecha · liquidada"}</span></div>
              <div className="ruta">{s.ruta}</div>
              <div className="muted small">Parada: {s.parada}{s.km ? ` · ${s.km} km · llegas ${s.llegada}` : ""} · ${s.precio} el puesto · ${(s.precio * 4 * (1 - COMISION)).toFixed(0)} neto si va llena</div>
              <div className="puestitos">{[0, 1, 2, 3].map((i) => <i key={i} className={i < s.llenos ? "on" : ""} />)}</div>
              {s.id === "a" && s.estado !== "hecha" && <button className="btn" style={{ minHeight: 48, fontSize: 16, marginTop: 8 }} onClick={() => ir("conductor/salida")}>Ir a esta salida</button>}
            </div>
          ))}
        </div>
        <button className="btn secundario" onClick={() => setHoja(true)}>+ Publicar un horario</button>
      </div>

      {hoja && (
        <PublicarSalida cerrar={() => setHoja(false)} sugerida={f.hora === "5:00 pm" ? { de: "Caracas", a: "Valencia", hora: "5:00 pm" } : undefined}
          publicar={(n) => { publicar({ id: "p" + Date.now(), ruta: n.ruta, hora: n.hora, parada: n.parada, llenos: n.hora === "5:00 pm" ? 3 : 0, precio: n.precio, estado: "abierta", km: n.km, llegada: n.llegada }); setHoja(false); }} />
      )}
    </>
  );
}

// ---------- BOLSA DE TRABAJO ----------
function Bolsa({ bolsa, tomar }: { bolsa: Oferta[]; tomar: (id: string) => void }) {
  return (
    <>
      <Cabecera titulo={<h3 style={{ flex: 1 }}>Bolsa de trabajo</h3>} />
      <div className="cuerpo">
        <div><h2>Rutas llenas sin chofer</h2><p className="small muted">Los cuatro puestos ya están pagos. El primero que la toma se la lleva.</p></div>
        <div className="lista">
          {bolsa.map((o) => (
            <div key={o.id} className={"tarjeta oferta " + o.estado}>
              <div className="cab"><b>{o.hora}</b><span className="monto">${o.monto} <small>· ${(o.monto * (1 - COMISION)).toFixed(0)} netos</small></span></div>
              <div className="ruta">{o.ruta}</div>
              <div className="muted small">Parada: {o.parada} · 4 de 4 pagos</div>
              {o.estado === "libre" && <button className="btn" style={{ minHeight: 48, fontSize: 16, marginTop: 8 }} onClick={() => tomar(o.id)}>Tomar esta ruta</button>}
              {o.estado === "mia" && <div className="sello-ok"><Ic.check />¡Es tuya! Ya está en Hoy.</div>}
              {o.estado === "perdida" && <div className="sello-no">Se la llevó otro chofer hace un momento.</div>}
            </div>
          ))}
        </div>
        <div className="tarjeta lisa">
          <b>Demanda en tus rutas</b>
          <p className="small muted" style={{ marginBottom: 8 }}>Pasajeros que propusieron una hora y esperan chofer.</p>
          <div className="demanda"><span>Caracas → Valencia · 5:00 pm</span><b>3 personas</b></div>
          <div className="demanda"><span>Caracas → Valencia · 7:00 pm</span><b>1 persona</b></div>
          <div className="demanda"><span>Valencia → Caracas · 6:00 am mañana</span><b>2 personas</b></div>
        </div>
      </div>
    </>
  );
}

// ---------- SALIDA ACTIVA (6:00 am) ----------
type Paso = "antes" | "camino" | "parada" | "ruta" | "fin";
function SalidaActiva({ onFin }: { onFin: (neto: number) => void }) {
  const [paso, setPaso] = useState<Paso>("antes");
  const [fotoMaletero, setFotoMaletero] = useState(false);
  const [abordaron, setAbordaron] = useState<Puesto[]>([]);
  const [progreso, setProgreso] = useState(0);
  const [efectivo, setEfectivo] = useState<Record<string, number>>({});
  const [validando, setValidando] = useState<Pasajero | null>(null);
  const [monto, setMonto] = useState("12");
  const [estrellas, setEstrellas] = useState<Record<string, number>>({});
  useEffect(() => {
    if (paso !== "ruta") return;
    const id = window.setInterval(() => setProgreso((p) => Math.min(1, p + 0.015)), 120);
    return () => window.clearInterval(id);
  }, [paso]);
  const bruto = PASAJEROS_6AM.length * 12;
  const neto = bruto * (1 - COMISION);
  const todos = abordaron.length === PASAJEROS_6AM.length;
  const efectivoPendiente = PASAJEROS_6AM.filter((p) => p.efectivo && abordaron.includes(p.puesto) && efectivo[p.puesto] === undefined);
  const vueltos = Object.values(efectivo).reduce((a, m) => a + Math.max(0, m - 12), 0);
  const nombrePuesto: Record<Puesto, string> = { copiloto: "Copiloto", "tras-izq": "Tras. izq.", "tras-centro": "Tras. centro", "tras-der": "Tras. der." };

  return (
    <>
      <Cabecera onAtras={() => ir("conductor")} titulo={<h3 style={{ flex: 1 }}>Caracas → Valencia · 6:00 am</h3>} />
      <div className="cuerpo">
        <div className={"estado " + (paso === "fin" ? "llegaste" : paso === "ruta" ? "ruta" : "camino")}>
          <div className="punto" />
          <div>
            <h2>{{ antes: "Salida en 40 min", camino: "Vas a la parada", parada: "Estás en la parada", ruta: "En ruta a Valencia", fin: "Viaje terminado" }[paso]}</h2>
            <p className="muted">{{ antes: "3 de 4 puestos pagos. Sale igual: el puesto vacío no te cuesta.", camino: "Los pasajeros ya saben que vas en camino.", parada: "C.C. Sambil, nivel Feria. Los pasajeros ven tu carro en el mapa.", ruta: `Llegada aprox. 8:15 am · ${Math.round(progreso * 100)} %`, fin: "Liquidación lista." }[paso]}</p>
          </div>
        </div>

        {paso !== "antes" && <div className="tarjeta lisa" style={{ padding: 10 }}><MapaVivo parada="C.C. Sambil" fase={paso === "fin" ? "llegaste" : paso} progreso={progreso} /></div>}

        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Pasajeros</h3><span className="cuenta">{PASAJEROS_6AM.length} de 4</span></div>
          <div className="pasajeros">
            {PASAJEROS_6AM.map((p) => {
              const abordo = abordaron.includes(p.puesto);
              return (
                <div key={p.puesto} className="pasajero" style={{ gridTemplateColumns: "40px 1fr auto" }}>
                  <i className={"ini " + (abordo ? "mio" : "otro")}>{abordo ? <Ic.check /> : p.ini}</i>
                  <span><b>{p.nombre}</b><small>{nombrePuesto[p.puesto]} · {p.equipaje}{p.foto ? " · con foto" : ""}{p.efectivo ? " · paga en efectivo" : ""}{p.telefono && paso !== "antes" ? " · " + p.telefono : ""}</small></span>
                  {paso === "parada" && !abordo && <button className="chip" onClick={() => setAbordaron((a) => [...a, p.puesto])}>Abordó</button>}
                  {paso === "parada" && abordo && p.efectivo && efectivo[p.puesto] === undefined && <button className="chip activo" onClick={() => { setValidando(p); setMonto("12"); }}>Validar efectivo</button>}
                  {paso === "parada" && abordo && p.efectivo && efectivo[p.puesto] !== undefined && <span className="pill llena">${efectivo[p.puesto]} ok</span>}
                  {p.foto && paso !== "parada" && <span className="mini-foto" style={{ backgroundImage: "url(./foto-maleta.jpg)" }} />}
                </div>
              );
            })}
            <div className="pasajero libre"><i className="ini">·</i><span><b>Libre</b><small>Tras. centro</small></span></div>
          </div>
        </div>

        {paso === "parada" && (
          <div>
            <h3 style={{ marginBottom: 8 }}>Foto del maletero cerrado</h3>
            {!fotoMaletero
              ? <button className="foto-caja" onClick={() => setFotoMaletero(true)}><Ic.camara />Tomar la foto</button>
              : <div className="foto-lista"><img src="./foto-maleta.jpg" alt="" /><span className="sello"><Ic.check />Guardada · 6:02 am</span></div>}
            <div className="nota" style={{ marginTop: 10 }}><Ic.escudo /><span>Esta foto y las de los pasajeros quedan en el viaje. Si hay un reclamo, te respalda.</span></div>
          </div>
        )}

        {paso === "fin" && (
          <div className="tarjeta lisa">
            <div className="encabezado-seccion"><h3>Califica a tus pasajeros</h3><span className="cuenta">1 muy malo · 5 muy bueno</span></div>
            {PASAJEROS_6AM.map((p) => (
              <div key={p.puesto} className="estrellas-fila"><span>{p.nombre}</span><span className="est">{[1, 2, 3, 4, 5].map((i) => <button key={i} className={i <= (estrellas[p.puesto] ?? 0) ? "on" : ""} onClick={() => setEstrellas({ ...estrellas, [p.puesto]: i })} aria-label={`${i} estrellas`}><Ic.estrella /></button>)}</span></div>
            ))}
          </div>
        )}
        {paso === "fin" && (
          <div className="tarjeta lisa resumen">
            <div className="r"><span className="k">3 puestos × $12</span><span className="v">${bruto.toFixed(2)}</span></div>
            {Object.keys(efectivo).length > 0 && <div className="r"><span className="k">Cobrado en efectivo (te lo quedas)</span><span className="v">− ${Object.values(efectivo).reduce((a, m) => a + Math.min(12, m), 0).toFixed(2)}</span></div>}
            {vueltos > 0 && <div className="r"><span className="k">Vueltos que dio la app por ti</span><span className="v" style={{ color: "#D7263D" }}>− ${vueltos.toFixed(2)} del fondo</span></div>}
            <div className="r"><span className="k">Comisión XPuesto {Math.round(COMISION * 100)} %</span><span className="v" style={{ color: "#D7263D" }}>− ${(bruto * COMISION).toFixed(2)}</span></div>
            <div className="r"><span className="k"><b>A tu billetera</b></span><span className="v naranja" style={{ fontSize: 20 }}>${(neto - Object.values(efectivo).reduce((a, m) => a + Math.min(12, m), 0)).toFixed(2)}</span></div>
            <div className="r"><span className="k">Se paga a tu banco</span><span className="v">Próximo lunes · tasa BCV</span></div>
            <div className="r"><span className="k">XPuntos</span><span className="v" style={{ color: "var(--ok)" }}>+ 120 (viaje completo + 158 km)</span></div>
          </div>
        )}
      </div>
      <div className="pie">
        {paso === "antes" && <Deslizar texto="Desliza · voy en camino" onListo={() => setPaso("camino")} />}
        {paso === "camino" && <Deslizar texto="Desliza · ya llegué a la parada" onListo={() => setPaso("parada")} />}
        {paso === "parada" && <Deslizar texto={!todos ? `Faltan ${PASAJEROS_6AM.length - abordaron.length} por abordar` : efectivoPendiente.length > 0 ? "Valida el efectivo para iniciar" : !fotoMaletero ? "Falta la foto del maletero" : "Desliza · iniciar viaje"} disabled={!fotoMaletero || !todos || efectivoPendiente.length > 0} onListo={() => setPaso("ruta")} />}
        {paso === "ruta" && <Deslizar texto={progreso < 1 ? "En ruta…" : "Desliza · finalizar viaje"} disabled={progreso < 1} onListo={() => setPaso("fin")} />}
        {paso === "fin" && <button className="btn" disabled={Object.keys(estrellas).length < PASAJEROS_6AM.length} onClick={() => onFin(neto - Object.values(efectivo).reduce((a, m) => a + Math.min(12, m), 0))}>{Object.keys(estrellas).length < PASAJEROS_6AM.length ? "Califica a los pasajeros" : "Enviar y cobrar"}</button>}
      </div>
      {validando && (
        <Hoja titulo={"Validar efectivo · " + validando.nombre} cerrar={() => setValidando(null)}>
          <p className="muted small">El pasajero paga $12. Pon el billete que estás recibiendo. Si es más grande, la app le abona el vuelto en su billetera y lo descuenta del fondo de ${FONDO_VUELTOS} que te presta.</p>
          <div className="chips" style={{ margin: "12px 0", padding: 0, flexWrap: "wrap" }}>{["10", "12", "20", "50"].map((m) => <button key={m} className={"chip" + (monto === m ? " activo" : "")} onClick={() => setMonto(m)}>${m}</button>)}</div>
          <div className="tarjeta naranja resumen">
            <div className="r"><span className="k">Recibes</span><span className="v">${monto}</span></div>
            <div className="r"><span className="k">Vale el puesto</span><span className="v">$12</span></div>
            <div className="r"><span className="k">{Number(monto) >= 12 ? "Vuelto a su billetera" : "Le falta"}</span><span className="v naranja">${Math.abs(Number(monto) - 12).toFixed(2)}</span></div>
          </div>
          <button className="btn" style={{ marginTop: 12 }} disabled={Number(monto) < 12} onClick={() => { setEfectivo({ ...efectivo, [validando.puesto]: Number(monto) }); setValidando(null); }}>Confirmar ${monto} recibidos</button>
        </Hoja>
      )}
    </>
  );
}

// ---------- BILLETERA ----------
function Billetera({ salidas }: { salidas: SalidaMia[] }) {
  const liquidadas = salidas.filter((s) => s.estado === "hecha");
  const saldoBase = 148.4;
  const saldo = saldoBase + liquidadas.reduce((a, s) => a + s.llenos * s.precio * (1 - COMISION), 0);
  const puntos = 1240 + liquidadas.length * 120;
  return (
    <>
      <Cabecera titulo={<h3 style={{ flex: 1 }}>Billetera</h3>} />
      <div className="cuerpo">
        <div className="boleto" style={{ gap: 6 }}>
          <span className="cod">Saldo disponible</span>
          <div className="grande" style={{ fontSize: 36 }}>${saldo.toFixed(2)}</div>
          <div className="fila"><span>{bs(saldo)}</span><b className="naranja">Se paga lunes · miércoles · viernes</b></div>
        </div>
        <div className="tarjeta lisa resumen">
          <div className="r"><span className="k">Fondo para vueltos en efectivo<br /><small>la app te presta ${FONDO_VUELTOS}; si lo agotas, sólo recibes viajes prepagados hasta reponerlo por Pago Móvil</small></span><span className="v">$8 usados · $22 libres</span></div>
          <div className="r"><span className="k">Próximo pago a tu cuenta</span><span className="v">Lunes · Bs a tasa BCV</span></div>
        </div>
        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><b>Chofer Plata</b><span className="cuenta">{puntos} XPuntos</span></div>
          <div className="maletero" style={{ marginTop: 8 }}><div className="barra" style={{ height: 10 }}><i className="tuyo" style={{ flex: (puntos - 1000) / 1000 }} /><i style={{ flex: 1 - (puntos - 1000) / 1000 }} /></div>
            <div className="texto"><span>Faltan {2000 - puntos} para Chofer Oro</span><span className="naranja">prioridad en la bolsa + RCV con descuento</span></div></div>
        </div>
        <div className="encabezado-seccion"><h3>Movimientos</h3><span className="cuenta">esta semana</span></div>
        <div className="tarjeta lisa resumen">
          {liquidadas.slice().reverse().map((s) => <div key={s.id} className="r"><span className="k">Liquidación {s.ruta} · {s.hora}<br /><small>{s.llenos} puestos · comisión descontada</small></span><span className="v" style={{ color: "var(--ok)" }}>+ ${(s.llenos * s.precio * (1 - COMISION)).toFixed(2)}</span></div>)}
          <div className="r"><span className="k">Cobro en efectivo · Valencia → Caracas<br /><small>Ayer 11:00 am · comisión debitada del saldo</small></span><span className="v" style={{ color: "#D7263D" }}>− $7.20</span></div>
          <div className="r"><span className="k">Liquidación Caracas → Valencia<br /><small>Ayer 6:00 am · 4 puestos</small></span><span className="v" style={{ color: "var(--ok)" }}>+ $40.80</span></div>
          <div className="r"><span className="k">Retiro a Pago Móvil<br /><small>Lunes · Banco Mercantil</small></span><span className="v" style={{ color: "#D7263D" }}>− $100.00</span></div>
          <div className="r"><span className="k">Membresía mensual<br /><small>Lunes · kit + etiquetas + RCV</small></span><span className="v" style={{ color: "#D7263D" }}>− $15.00</span></div>
        </div>
        <div className="tarjeta lisa">
          <b>Tus documentos</b>
          <div className="docs">
            {["Cédula", "RIF", "Licencia", "Cert. médico", "Carnet circ.", "Inspección"].map((d) => <span key={d} className="doc ok"><Ic.check />{d}</span>)}
            <span className="doc pend">RCV vence 30 oct</span>
          </div>
        </div>
      </div>
    </>
  );
}
