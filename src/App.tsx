import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIAS, CIUDADES, EQUIPAJES, PUESTOS, RUTAS_POPULARES, SALIDAS, bs,
  type Categoria, type Puesto, type Salida, type TipoEquipaje,
} from "./data";
import { Cabecera, Carro, Estrellas, FotoMaleta, Ic } from "./ui";
import { Calificar, Viaje } from "./viaje";
import { Conductor } from "./conductor";
import { Admin } from "./admin";
import { MapaRuta } from "./publicar";
import { Entrada, EstadoChofer, Perfil, Permisos, RegistroChofer, Texto } from "./cuenta";
import { guardarSesion, leerSesion, type Usuario } from "./sesion";

// ---------- estado de la reserva (vive en memoria, se pierde al recargar: es un prototipo) ----------
type Reserva = {
  de: string; a: string; fecha: string; hora: string;
  categoria: Categoria | null;
  salidaId: string | null;
  puestos: Puesto[];                      // el tuyo primero, luego los de tus acompañantes
  nombres: Partial<Record<Puesto, string>>; // nombre de quien va en cada puesto extra
  equipaje: TipoEquipaje | null;
  fotoLista: boolean;
  pago: "billetera" | "pagomovil" | "efectivo";
  otraPersona: { activo: boolean; nombre: string; telefono: string };
};
const INICIAL: Reserva = {
  de: "Caracas", a: "Valencia", fecha: "Hoy, 15 sep", hora: "6 – 10 am",
  categoria: null, salidaId: null, puestos: [], nombres: {}, equipaje: null, fotoLista: false, pago: "billetera", otraPersona: { activo: false, nombre: "", telefono: "" },
};

// ---------- ruteo por hash ----------
function useRuta() {
  const leer = () => window.location.hash.replace(/^#\/?/, "") || "inicio";
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const f = () => { setRuta(leer()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return ruta;
}
const ir = (r: string) => { window.location.hash = "/" + r; };
const s0 = (h: string) => h;

export default function App() {
  const ruta = useRuta();
  const [r, setR] = useState<Reserva>(INICIAL);
  const pon = (p: Partial<Reserva>) => setR((x) => ({ ...x, ...p }));
  const salida = useMemo(() => SALIDAS.find((s) => s.id === r.salidaId) ?? null, [r.salidaId]);
  const [u, setU] = useState<Usuario | null>(() => leerSesion());
  const guardar = (x: Usuario | null) => { setU(x); guardarSesion(x); };
  const salir = () => { guardar(null); setR(INICIAL); ir("entrar"); };

  // el backoffice no pide cuenta (es la demo del equipo)
  if (ruta.startsWith("admin")) return <Admin ruta={ruta} registrado={u?.choferEstado === "en-revision" ? u : null} />;
  // sin cuenta: la entrada (elige pasajero o chofer)
  if (!u || ruta === "entrar") return <div className="app" key="entrar"><Entrada onEntrar={(x) => { guardar(x); ir(!x.permisos && !x.invitado ? "permisos" : x.rol === "chofer" ? (x.choferEstado === "aprobado" ? "conductor" : "chofer/registro") : "inicio"); }} /></div>;

  let pantalla: React.ReactNode;
  if (ruta === "salidas") pantalla = <Salidas r={r} pon={pon} />;
  else if (ruta.startsWith("salida/")) pantalla = <Detalle r={r} pon={pon} id={ruta.slice(7)} u={u} guardar={guardar} />;
  else if (ruta === "equipaje" && salida) pantalla = <Equipaje r={r} pon={pon} salida={salida} />;
  else if (ruta === "confirmar" && salida) pantalla = <Confirmar r={r} pon={pon} salida={salida} />;
  else if (ruta === "listo" && salida) pantalla = <Listo r={r} salida={salida} reiniciar={() => { setR(INICIAL); ir("inicio"); }} />;
  else if (ruta === "viaje" && salida) pantalla = <Viaje salida={salida} puestos={r.puestos} etiquetas={etiquetasDe(r)} onCalificar={() => ir("calificar")} onInicio={() => ir("inicio")} />;
  else if (ruta === "calificar" && salida) pantalla = <Calificar salida={salida} onListo={() => { setR(INICIAL); ir("inicio"); }} />;
  else if (ruta.startsWith("conductor")) pantalla = <Conductor ruta={ruta} u={u} guardar={guardar} salir={salir} />;
  else if (ruta === "permisos") pantalla = <Permisos u={u} guardar={guardar} />;
  else if (ruta === "perfil") pantalla = <Perfil u={u} guardar={guardar} salir={salir} proximo={salida && r.puestos.length > 0 ? `${r.de} → ${r.a} · ${r.fecha} · ${s0(salida.hora)} · ${salida.chofer}` : undefined} />;
  else if (ruta === "chofer/registro") pantalla = <RegistroChofer u={u} guardar={guardar} />;
  else if (ruta === "chofer/estado") pantalla = <EstadoChofer u={u} guardar={guardar} />;
  else pantalla = <Inicio r={r} pon={pon} u={u} guardar={guardar} />;

  return <div className="app" key={ruta.split("/")[0]}>{pantalla}</div>;
}

// =====================================================================
// 1. INICIO — ¿Pa' dónde vas?
// =====================================================================
function Inicio({ r, pon, u, guardar }: { r: Reserva; pon: (p: Partial<Reserva>) => void; u: Usuario; guardar: (u: Usuario) => void }) {
  const ini = u.invitado ? "?" : u.nombre.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="pantalla">
      <Cabecera>
        <span className="espacio" />
        <button className="atras" aria-label="Avisos"><Ic.campana /></button>
        <button className="avatar" onClick={() => ir("perfil")} aria-label="Mi perfil">{ini}</button>
      </Cabecera>
      <div className="cuerpo">
        <div className="hero">
          <h1>{u.invitado ? "¿Pa' dónde vas?" : `¿Pa' dónde vas, ${u.nombre.split(" ")[0]}?`}</h1>
          <p className="muted">Aparta tu puesto en un carro que sale a la hora que tú quieres.</p>
        </div>

        <div className="origen-destino">
          <Campo icono={<Ic.pin />} etiqueta="Salgo de" valor={r.de} opciones={CIUDADES} onChange={(v) => pon({ de: v })} />
          <button className="swap" aria-label="Invertir ruta" onClick={() => pon({ de: r.a, a: r.de })}><Ic.swap /></button>
          <Campo icono={<Ic.bandera />} etiqueta="Voy a" valor={r.a} opciones={CIUDADES} onChange={(v) => pon({ a: v })} />
        </div>
        <div className="fila2">
          <Campo icono={<Ic.calendario />} etiqueta="Fecha" valor={r.fecha} opciones={["Hoy, 15 sep", "Mañ. 16 sep", "Jue 17 sep", "Vie 18 sep"]} onChange={(v) => pon({ fecha: v })} />
          <Campo icono={<Ic.reloj />} etiqueta="Hora" valor={r.hora} opciones={["6 – 10 am", "10 am – 2 pm", "2 – 6 pm", "6 – 10 pm"]} onChange={(v) => pon({ hora: v })} />
        </div>

        <div>
          <p className="small muted" style={{ fontWeight: 700, marginBottom: 8 }}>Tipo de carro</p>
          <div className="chips">
            <button className={"chip" + (r.categoria === null ? " activo" : "")} onClick={() => pon({ categoria: null })}>Todos</button>
            {CATEGORIAS.map((c) => (
              <button key={c} className={"chip" + (r.categoria === c ? " activo" : "")} onClick={() => pon({ categoria: c })}>{c}</button>
            ))}
          </div>
        </div>

        <button className="btn" onClick={() => ir("salidas")}><span style={{ width: 22, height: 22 }}><Ic.buscar /></span>Buscar salidas</button>

        <div>
          <p className="small muted" style={{ fontWeight: 700, marginBottom: 8 }}>Rutas populares</p>
          <div className="rutas-pop">
            {RUTAS_POPULARES.map((x) => (
              <button key={x.de + x.a} className="ruta-pop" onClick={() => { pon({ de: x.de, a: x.a }); ir("salidas"); }}>
                <b>{x.de} → {x.a}</b>
                <span>desde <span className="p">${x.desde}</span> el puesto</span>
              </button>
            ))}
          </div>
        </div>

        <div className="confianza">
          <div><Ic.escudo />Choferes verificados con cédula y RIF</div>
          <div><Ic.camara />Tu equipaje viaja con foto</div>
          <div><Ic.pin />Paradas en sitios seguros</div>
        </div>
        <div className="entradas"><button className="btn fantasma" onClick={() => { guardar({ ...u, rol: "chofer" }); ir(u.choferEstado === "aprobado" ? "conductor" : "chofer/registro"); }}>{u.choferEstado === "aprobado" ? "Cambiar a modo chofer" : "¿Manejas? Regístrate como chofer"} <span style={{ width: 18, height: 18 }}><Ic.derecha /></span></button><button className="btn fantasma" onClick={() => ir("admin")}>Backoffice <span style={{ width: 18, height: 18 }}><Ic.ojo /></span></button></div>
      </div>
    </div>
  );
}

function Campo({ icono, etiqueta, valor, opciones, onChange }: { icono: React.ReactNode; etiqueta: string; valor: string; opciones: string[]; onChange: (v: string) => void }) {
  return (
    <label className="campo">
      <span className="icono">{icono}</span>
      <span className="col">
        <span className="etiqueta">{etiqueta}</span>
        <span className="valor">{valor}</span>
      </span>
      <span className="flecha"><Ic.abajo /></span>
      <select value={valor} onChange={(e) => onChange(e.target.value)} aria-label={etiqueta}>
        {opciones.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

// =====================================================================
// 2. SALIDAS DISPONIBLES
// =====================================================================
function Salidas({ r, pon }: { r: Reserva; pon: (p: Partial<Reserva>) => void }) {
  const lista = SALIDAS.filter((s) => !r.categoria || s.categoria === r.categoria);
  return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("inicio")} titulo={
        <button className="titulo-ruta" onClick={() => ir("inicio")}>
          <Ic.buscar />{r.de} → {r.a} · {r.fecha}
        </button>
      } />
      <div className="cuerpo">
        <div className="chips">
          <button className={"chip" + (r.categoria === null ? " activo" : "")} onClick={() => pon({ categoria: null })}>Todos</button>
          {CATEGORIAS.map((c) => (
            <button key={c} className={"chip" + (r.categoria === c ? " activo" : "")} onClick={() => pon({ categoria: c })}>{c}</button>
          ))}
        </div>
        <div className="encabezado-seccion">
          <h2>Salidas disponibles</h2>
          <span className="cuenta">{lista.length} {lista.length === 1 ? "salida" : "salidas"}</span>
        </div>
        <div className="lista">
          {lista.map((s) => <TarjetaSalida key={s.id} s={s} onClick={() => { pon({ salidaId: s.id, puestos: [], nombres: {} }); ir("salida/" + s.id); }} />)}
          {lista.length === 0 && (
            <div className="tarjeta lisa"><b>No hay salidas {r.categoria} hoy.</b><p className="muted small">Prueba otro tipo de carro o propón tu hora y avisamos a los choferes.</p></div>
          )}
        </div>
        <div className="tarjeta naranja">
          <b>¿Ninguna hora te sirve?</b>
          <p className="small muted">Propón la tuya y se la mostramos a los choferes de esta ruta.</p>
          <button className="btn fantasma" style={{ justifyContent: "flex-start", paddingLeft: 0, color: "var(--naranja)" }}>Proponer mi hora <span style={{ width: 18, height: 18 }}><Ic.derecha /></span></button>
        </div>
      </div>
    </div>
  );
}

function TarjetaSalida({ s, onClick }: { s: Salida; onClick: () => void }) {
  const libres = 4 - Object.keys(s.ocupados).length;
  return (
    <button className="tarjeta salida" onClick={onClick}>
      <img className="foto" src={s.foto} alt="" />
      <div>
        <div className="nombre">{s.chofer} <Estrellas n={s.estrellas} /> {s.categoria !== "Compartido" && <span className={"etiqueta-cat " + s.categoria.toLowerCase()}>{s.categoria}</span>}</div>
        <div className="detalle">{s.carro} {s.color} · {s.parada}</div>
        <div className="hora">{s.hora} <span className="muted" style={{ fontWeight: 600, fontSize: 13 }}>· {libres === 0 ? "lleno" : libres === 1 ? "queda 1 puesto" : `quedan ${libres} puestos`}</span></div>
      </div>
      <div className="lado">
        <Carro salida={s} mini />
        <div className="precio">${s.precio}<small>por puesto</small></div>
      </div>
    </button>
  );
}

// =====================================================================
// 3. DETALLE DE LA SALIDA + ELEGIR PUESTO
// =====================================================================
function Detalle({ r, pon, id, u, guardar }: { r: Reserva; pon: (p: Partial<Reserva>) => void; id: string; u: Usuario; guardar: (u: Usuario) => void }) {
  const fav = (u.favoritos ?? []);
  const s = SALIDAS.find((x) => x.id === id);
  if (!s) { ir("salidas"); return null; }
  const n = r.puestos.length;
  const etiquetas = etiquetasDe(r);
  const toca = (p: Puesto) => pon({ puestos: r.puestos.includes(p) ? r.puestos.filter((x) => x !== p) : [...r.puestos, p] });
  return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("salidas")} titulo={<h3 style={{ flex: 1 }}>{r.de} → {r.a} · {s.hora}</h3>} />
      <div className="cuerpo">
        <div className="tarjeta chofer">
          <img className="foto" src={s.foto} alt="" />
          <div>
            <div className="nombre">{s.chofer}</div>
            <div className="datos"><Estrellas n={s.estrellas} /> · {s.viajes} viajes<br />{s.carro} {s.color} · placa {s.placa}</div>
            <span className="verificado"><Ic.escudo /> Verificado por XPuesto</span>
          </div>
          <button className={"fav" + (fav.includes(s.chofer) ? " on" : "")} aria-label="Chofer favorito" onClick={() => guardar({ ...u, favoritos: fav.includes(s.chofer) ? fav.filter((x) => x !== s.chofer) : [...fav, s.chofer] })}>{fav.includes(s.chofer) ? <Ic.corazonLleno /> : <Ic.corazon />}</button>
        </div>

        <div className="tarjeta lisa" style={{ padding: 10 }}>
          <MapaRuta salida={s} a={r.a} />
          <div className="horario" style={{ padding: "12px 6px 4px" }}>
            <div><div className="h">{s.hora}</div><div className="c">{s.parada}<br /><span style={{ fontWeight: 500 }}>{s.paradaDetalle}</span></div></div>
            <div className="linea" />
            <div style={{ textAlign: "right" }}><div className="h">{s.llegada}</div><div className="c">Terminal Big Low, Valencia<br /><span style={{ fontWeight: 500 }}>llegada aprox.</span></div></div>
          </div>
        </div>

        <div>
          <div className="encabezado-seccion"><h2>Elige tus puestos</h2><span className="cuenta">{4 - Object.keys(s.ocupados).length} libres</span></div>
          <p className="small muted">Toca el tuyo. Si viajas acompañado, toca uno por cada persona. El primero que aparta se lo queda.</p>
        </div>
        <div className="tarjeta lisa" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Carro salida={s} mios={etiquetas} onElegir={toca} />
          <div className="leyenda">
            <span><i style={{ background: "#fff", border: "2px solid #C9CFDB" }} />Libre</span>
            <span><i style={{ background: "#0A274F" }} />Apartado por otro</span>
            <span><i style={{ background: "#FB5E17" }} />Los tuyos</span>
          </div>
        </div>
        {n > 0 && (
          <div className="tarjeta lisa">
            <label className="perilla"><span><b>Viaja otra persona, no yo</b><br /><small className="muted">El chofer la llama al llegar.</small></span><input type="checkbox" checked={r.otraPersona.activo} onChange={(e) => pon({ otraPersona: { ...r.otraPersona, activo: e.target.checked } })} /><i /></label>
            {r.otraPersona.activo && <div className="fila2" style={{ marginTop: 8 }}><Texto etiqueta="Nombre" valor={r.otraPersona.nombre} onChange={(v) => pon({ otraPersona: { ...r.otraPersona, nombre: v } })} placeholder="Quién viaja" /><Texto etiqueta="Teléfono" valor={r.otraPersona.telefono} onChange={(v) => pon({ otraPersona: { ...r.otraPersona, telefono: v } })} tipo="tel" placeholder="0414-1234567" /></div>}
          </div>
        )}
        {n > 1 && (
          <div className="tarjeta lisa acompanantes">
            <b>¿Quién va en cada puesto?</b>
            {r.puestos.map((p, i) => (
              <label key={p} className="acomp">
                <span className="k">{PUESTOS.find((x) => x.id === p)!.nombre}</span>
                {i === 0 ? <span className="v naranja">Tú</span> : (
                  <input value={r.nombres[p] ?? ""} placeholder={`Acompañante ${i}`} onChange={(e) => pon({ nombres: { ...r.nombres, [p]: e.target.value } })} />
                )}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="pie">
        <button className="btn" disabled={n === 0} onClick={() => ir("equipaje")}>
          {n === 0 ? "Elige un puesto para seguir" : n === 1 ? `Seguir con ${PUESTOS.find((p) => p.id === r.puestos[0])!.nombre} · $${s.precio}` : `Seguir con ${n} puestos · $${s.precio * n}`}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// 4. EQUIPAJE
// =====================================================================
function Equipaje({ r, pon, salida }: { r: Reserva; pon: (p: Partial<Reserva>) => void; salida: Salida }) {
  const { capacidad, ocupado } = salida.maletero;
  const eq = EQUIPAJES.find((e) => e.id === r.equipaje);
  const cabe = (e: (typeof EQUIPAJES)[number]) => ocupado + e.maletero <= capacidad;
  const necesitaFoto = r.equipaje !== null && r.equipaje !== "A";
  const icono = (id: TipoEquipaje) => (id === "A" ? <Ic.bolso /> : id === "D" ? <Ic.caja /> : <Ic.maleta />);
  return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("salida/" + salida.id)} titulo={<h3 style={{ flex: 1 }}>Tu equipaje</h3>} />
      <div className="cuerpo">
        <div>
          <h2>¿Qué llevas?</h2>
          <p className="small muted">Así el chofer sabe que te cabe y tú viajas con tu equipaje respaldado.</p>
        </div>
        <div className="equipajes">
          {EQUIPAJES.map((e) => {
            const bloqueado = !cabe(e);
            return (
              <button key={e.id} className={"equipaje" + (r.equipaje === e.id ? " activo" : "") + (bloqueado ? " bloqueado" : "")} disabled={bloqueado} onClick={() => pon({ equipaje: e.id, fotoLista: false })}>
                <span className="letra">EQUIPAJE {e.id}</span>
                {icono(e.id)}
                <b>{e.nombre}</b>
                <span>{bloqueado ? "No cabe: el maletero de este carro ya está comprometido." : e.detalle}</span>
              </button>
            );
          })}
        </div>

        <div className="tarjeta lisa maletero">
          <b>Maletero del {salida.carro}</b>
          <div className="barra">
            {Array.from({ length: capacidad }).map((_, i) => {
              const tuyo = eq && eq.maletero > 0 && i >= ocupado && i < ocupado + Math.ceil(eq.maletero);
              return <i key={i} className={i < ocupado ? "lleno" : tuyo ? "tuyo" : ""} />;
            })}
          </div>
          <div className="texto">
            <span>{ocupado} de {capacidad} ocupados por otros pasajeros</span>
            {eq && eq.maletero > 0 && <span className="naranja">+ el tuyo</span>}
          </div>
        </div>

        {necesitaFoto && (
          <div>
            <h3 style={{ marginBottom: 8 }}>Foto de tu equipaje</h3>
            {!r.fotoLista ? (
              <button className="foto-caja" onClick={() => pon({ fotoLista: true })}><Ic.camara />Tomar la foto</button>
            ) : (
              <div className="foto-lista"><FotoMaleta /><span className="sello"><Ic.check />Foto guardada · 15 sep, 9:42 pm</span></div>
            )}
            <div className="nota" style={{ marginTop: 10 }}><Ic.escudo /><span>El chofer toma otra foto al cerrar el maletero. Las dos quedan en tu reserva como respaldo.</span></div>
          </div>
        )}
      </div>
      <div className="pie">
        <button className="btn" disabled={!r.equipaje || (necesitaFoto && !r.fotoLista)} onClick={() => ir("confirmar")}>
          {!r.equipaje ? "Elige tu equipaje" : necesitaFoto && !r.fotoLista ? "Falta la foto" : "Revisar mi reserva"}
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// 5. CONFIRMAR
// =====================================================================
function Confirmar({ r, pon, salida: s }: { r: Reserva; pon: (p: Partial<Reserva>) => void; salida: Salida }) {
  const eq = EQUIPAJES.find((e) => e.id === r.equipaje)!;
  const n = r.puestos.length;
  const total = s.precio * n;
  return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("equipaje")} titulo={<h3 style={{ flex: 1 }}>Revisa tu reserva</h3>} />
      <div className="cuerpo">
        <div className="tarjeta chofer">
          <img className="foto" src={s.foto} alt="" />
          <div>
            <div className="nombre">{s.chofer}</div>
            <div className="datos"><Estrellas n={s.estrellas} /> · {s.carro} {s.color} · placa {s.placa}</div>
          </div>
        </div>
        <div className="tarjeta lisa resumen">
          <div className="r"><span className="k">Ruta</span><span className="v">{r.de} → {r.a}</span></div>
          <div className="r"><span className="k">Salida</span><span className="v">{r.fecha} · {s.hora}</span></div>
          <div className="r"><span className="k">Parada virtual</span><span className="v">{s.parada}</span></div>
          <div className="r"><span className="k">{n === 1 ? "Tu puesto" : "Tus puestos"}</span><span className="v naranja">{listaPuestos(r)}</span></div>
          <div className="r"><span className="k">Equipaje</span><span className="v">{eq.id} · {eq.nombre}{r.fotoLista ? " · con foto" : ""}</span></div>
          {r.otraPersona.activo && <div className="r"><span className="k">Viaja</span><span className="v">{r.otraPersona.nombre || "otra persona"} · {r.otraPersona.telefono}</span></div>}
        </div>

        <div>
          <h3 style={{ marginBottom: 8 }}>¿Cómo pagas?</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button className={"pago" + (r.pago === "billetera" ? " activo" : "")} onClick={() => pon({ pago: "billetera" })}>
              <span className="radio" /><span style={{ width: 24, height: 24, color: "var(--ink)" }}><Ic.billetera /></span>
              <span><b>Billetera XPuesto</b><span>Saldo: $40,00 · {bs(40)}</span></span>
            </button>
            <button className={"pago" + (r.pago === "pagomovil" ? " activo" : "")} onClick={() => pon({ pago: "pagomovil" })}>
              <span className="radio" /><span style={{ width: 24, height: 24, color: "var(--ink)" }}><Ic.telefono /></span>
              <span><b>Pago Móvil</b><span>Se acredita solo con la referencia</span></span>
            </button>
            <button className={"pago" + (r.pago === "efectivo" ? " activo" : "")} onClick={() => pon({ pago: "efectivo" })}>
              <span className="radio" /><span style={{ width: 24, height: 24, color: "var(--ink)" }}><Ic.billete /></span>
              <span><b>Efectivo al chofer</b><span>Lo pagas al abordar. El vuelto te queda en la billetera.</span></span>
            </button>
          </div>
        </div>

        <div className="tarjeta naranja total">
          <span><b>Total</b><br /><span className="small muted">{n} {n === 1 ? "puesto" : "puestos"} · {s.categoria}{n > 1 ? ` · $${s.precio} c/u` : ""}</span></span>
          <span className="monto">${total}<small>≈ {bs(total)}</small></span>
        </div>
        <div className="nota"><Ic.info /><span>{r.pago === "efectivo" ? "Le pagas al chofer al abordar. Él valida el monto en su app y, si pagas con un billete más grande, el vuelto te queda en tu billetera XPuesto." : "Se te cobra cuando la salida se llene. Si no se llena, te devolvemos todo o te pasamos a otra hora."}</span></div>
      </div>
      <div className="pie">
        <button className="btn" onClick={() => ir("listo")}>Confirmar reserva · ${total}</button>
      </div>
    </div>
  );
}

// =====================================================================
// 6. LISTO
// =====================================================================
function Listo({ r, salida: s, reiniciar }: { r: Reserva; salida: Salida; reiniciar: () => void }) {
  const n = r.puestos.length;
  const faltan = 4 - Object.keys(s.ocupados).length - n;
  const etiquetas = etiquetasDe(r);
  return (
    <div className="pantalla">
      <Cabecera />
      <div className="cuerpo">
        <div className="listo">
          <div className="check"><Ic.check /></div>
          <h1>{n === 1 ? "¡Puesto apartado!" : `¡${n} puestos apartados!`}</h1>
          <p className="muted">Te avisamos cuando se llene el carro y cuando el chofer llegue a la parada.</p>
        </div>

        <div className="boleto">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="cod">Reserva XP-4F7K</span>
            <img className="logo" src="./logo-blanco.png" alt="XPuesto" />
          </div>
          <div className="grande">{r.de} → {r.a}</div>
          <div className="fila"><span>Salida</span><b>{r.fecha} · {s.hora}</b></div>
          <div className="fila"><span>Parada</span><b>{s.parada}</b></div>
          <div className="fila"><span>Chofer</span><b>{s.chofer} · {s.carro} {s.color}</b></div>
          <div className="fila"><span>{n === 1 ? "Tu puesto" : "Tus puestos"}</span><b className="naranja">{listaPuestos(r)}</b></div>
          <div className="fila"><span>Pago</span><b>{r.pago === "efectivo" ? `$${s.precio * n} en efectivo al abordar` : r.pago === "billetera" ? "Billetera XPuesto" : "Pago Móvil"}</b></div>
        </div>

        {faltan > 0 ? (
          <div className="tarjeta naranja" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" }}>
            <Carro salida={s} mios={etiquetas} mini />
            <div>
              <b>{faltan === 1 ? "Falta 1 puesto" : `Faltan ${faltan} puestos`} para completar la salida</b>
              <p className="small muted" style={{ marginTop: 4 }}>Puedes esperar, comprar {faltan === 1 ? "el que falta" : "los que faltan"} o compartir el costo con otro pasajero.</p>
            </div>
          </div>
        ) : (
          <div className="tarjeta ok"><b>El carro está lleno.</b><p className="small muted">La salida queda confirmada para las {s.hora}.</p></div>
        )}

        <div className="nota"><Ic.campana /><span>Notificaciones activas: se llenó, el chofer va en camino, el chofer llegó a la parada.</span></div>
      </div>
      <div className="pie" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="btn" onClick={() => ir("viaje")}>Ver mi viaje</button>
        <button className="btn fantasma" onClick={reiniciar}>Volver al inicio</button>
      </div>
    </div>
  );
}

// ---------- ayudas ----------
// Etiqueta de cada puesto tuyo: "Tú" para el primero, el nombre del acompañante para los demás.
function etiquetasDe(r: Reserva): Partial<Record<Puesto, string>> {
  const out: Partial<Record<Puesto, string>> = {};
  r.puestos.forEach((p, i) => { out[p] = i === 0 ? "Tú" : (r.nombres[p]?.trim() || `+${i}`); });
  return out;
}
function listaPuestos(r: Reserva) {
  return r.puestos.map((p, i) => {
    const nombre = PUESTOS.find((x) => x.id === p)!.nombre;
    return i === 0 ? nombre : `${nombre} (${r.nombres[p]?.trim() || "acompañante"})`;
  }).join(" · ");
}
