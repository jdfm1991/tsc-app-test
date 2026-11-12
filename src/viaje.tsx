// Mi viaje: desde que apartas hasta que llegas. Todo simulado con relojes, para la demo.
import { useEffect, useRef, useState } from "react";
import { PUESTOS, type Puesto, type Salida } from "./data";
import { Cabecera, Carro, Ic, MapaVivo } from "./ui";

export type Fase = "llenando" | "lleno" | "camino" | "parada" | "ruta" | "llegaste";
const ORDEN: Fase[] = ["llenando", "lleno", "camino", "parada", "ruta", "llegaste"];

const QUIEN_SE_SUMA = [
  { nombre: "Karla V.", ini: "K" },
  { nombre: "Pedro L.", ini: "P" },
  { nombre: "Yusmary R.", ini: "Y" },
];

type Msg = { de: "yo" | "chofer"; texto: string; hora: string };
const ahora = () => new Date().toLocaleTimeString("es-VE", { hour: "numeric", minute: "2-digit" });

export function Viaje({ salida: s, puestos, etiquetas, onCalificar, onInicio }: {
  salida: Salida; puestos: Puesto[]; etiquetas: Partial<Record<Puesto, string>>; onCalificar: () => void; onInicio: () => void;
}) {
  const [fase, setFase] = useState<Fase>("llenando");
  const [sumados, setSumados] = useState<Partial<Record<Puesto, string>>>({});
  const [comprados, setComprados] = useState(false);
  const [progreso, setProgreso] = useState(0); // 0..1 por la autopista
  const [aviso, setAviso] = useState<string | null>(null);
  const [chat, setChat] = useState(false);
  const [sos, setSos] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ de: "chofer", texto: "Buenas, soy " + s.chofer + ". Salgo puntual a las " + s.hora + ". Nos vemos en " + s.parada + ".", hora: ahora() }]);
  const [noLeidos, setNoLeidos] = useState(1);

  const libres = PUESTOS.map((p) => p.id).filter((p) => !s.ocupados[p] && !puestos.includes(p) && !sumados[p]);
  const faltan = comprados ? 0 : libres.length;
  const ocupadosAhora = { ...s.ocupados, ...sumados };

  const avisa = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 3200); };
  const dice = (texto: string) => { setMsgs((m) => [...m, { de: "chofer", texto, hora: ahora() }]); if (!chat) setNoLeidos((n) => n + 1); };

  // relojes de la simulación
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (ref.current) window.clearTimeout(ref.current);
    const luego = (ms: number, f: () => void) => { ref.current = window.setTimeout(f, ms); };
    if (fase === "llenando") {
      if (faltan === 0) { luego(900, () => setFase("lleno")); return; }
      luego(4500, () => {
        const p = libres[0]; const q = QUIEN_SE_SUMA[Object.keys(sumados).length % QUIEN_SE_SUMA.length];
        setSumados((x) => ({ ...x, [p]: q.ini })); avisa(`Se sumó ${q.nombre} · ${PUESTOS.find((z) => z.id === p)!.nombre}`);
      });
    }
    if (fase === "lleno") luego(3500, () => { setFase("camino"); dice("Voy saliendo pa' la parada. Corolla azul, placa " + s.placa + "."); });
    if (fase === "camino") luego(6000, () => { setFase("parada"); dice("Ya llegué a " + s.parada + ". Estoy en " + s.paradaDetalle.toLowerCase() + "."); });
    if (fase === "parada") luego(7000, () => setFase("ruta"));
    if (fase === "ruta") {
      const paso = () => setProgreso((p) => { const n = Math.min(1, p + 0.012); return n; });
      const id = window.setInterval(paso, 120);
      return () => window.clearInterval(id);
    }
    return () => { if (ref.current) window.clearTimeout(ref.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, faltan, Object.keys(sumados).length]);
  useEffect(() => { if (fase === "ruta" && progreso >= 1) setFase("llegaste"); }, [progreso, fase]);

  const adelantar = () => { const i = ORDEN.indexOf(fase); if (fase === "llenando") setComprados(true); else if (i < ORDEN.length - 1) { if (ORDEN[i + 1] === "llegaste") setProgreso(1); setFase(ORDEN[i + 1]); } };

  const envia = (texto: string) => {
    if (!texto.trim()) return;
    setMsgs((m) => [...m, { de: "yo", texto, hora: ahora() }]);
    setTimeout(() => dice(["Dale, listo 👍", "Perfecto, ahí te espero.", "Sí, sin problema."][Math.floor(Math.random() * 3)]), 1500);
  };

  const titulo: Record<Fase, [string, string]> = {
    llenando: [faltan === 1 ? "Falta 1 puesto" : `Faltan ${faltan} puestos`, "Cuando se llene, sale. Te avisamos."],
    lleno: ["¡Carro lleno!", `Salida confirmada a las ${s.hora}.`],
    camino: ["El chofer va en camino", `${s.chofer} llega a ${s.parada} en unos minutos.`],
    parada: ["El chofer está en la parada", `Búscalo en ${s.paradaDetalle}. ${s.carro} ${s.color}.`],
    ruta: ["En ruta a Valencia", `Llegada aprox. ${s.llegada}.`],
    llegaste: ["¡Llegaste!", "Gracias por viajar con XPuesto."],
  };
  const [t1, t2] = titulo[fase];

  return (
    <div className="pantalla">
      <Cabecera onAtras={onInicio} titulo={<h3 style={{ flex: 1 }}>Mi viaje · {s.hora}</h3>}>
        <button className="atras" aria-label="Adelantar (demo)" onClick={adelantar} title="Adelantar la demo"><Ic.derecha /></button>
      </Cabecera>
      <div className="cuerpo">
        <div className={"estado " + fase}>
          <div className="punto" />
          <div><h2>{t1}</h2><p className="muted">{t2}</p></div>
        </div>

        <div className="tarjeta lisa" style={{ padding: 10 }}>
          <MapaVivo parada={s.parada} fase={fase} progreso={progreso} />
          {fase === "ruta" && (
            <div className="ruta-barra">
              <span>{s.parada}</span>
              <div className="pista"><i style={{ width: `${Math.round(progreso * 100)}%` }} /></div>
              <span>Valencia</span>
            </div>
          )}
        </div>

        {fase === "llenando" && (
          <div className="tarjeta naranja" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" }}>
            <Carro salida={{ ...s, ocupados: ocupadosAhora }} mios={etiquetas} mini />
            <div>
              <b>¿Qué prefieres?</b>
              <div className="opciones">
                <button className="opcion activa">Esperar a que se llene</button>
                <button className="opcion" onClick={() => { setComprados(true); avisa(`Compraste ${faltan === 1 ? "el puesto que faltaba" : `los ${faltan} puestos que faltaban`} · $${faltan * s.precio}`); }}>Comprar {faltan === 1 ? "el que falta" : `los ${faltan} que faltan`} · ${faltan * s.precio}</button>
                <button className="opcion" onClick={() => avisa("Link enviado por WhatsApp para compartir el costo")}>Compartir el costo con otro</button>
              </div>
            </div>
          </div>
        )}

        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Quiénes van</h3><span className="cuenta">{4 - (comprados ? 0 : libres.length)} de 4</span></div>
          <div className="pasajeros">
            <div className="pasajero"><img src={s.foto} alt="" /><span><b>{s.chofer}</b><small>Chofer · {s.carro} {s.color}</small></span></div>
            {PUESTOS.map((p) => {
              const mio = etiquetas[p.id]; const otro = ocupadosAhora[p.id];
              const nombre = mio ? (mio === "Tú" ? "Tú" : mio) : otro ? "Pasajero" : comprados ? "Comprado por ti" : "Libre";
              return (
                <div key={p.id} className={"pasajero" + (!mio && !otro && !comprados ? " libre" : "")}>
                  <i className={"ini" + (mio ? " mio" : otro ? " otro" : "")}>{mio ? (mio === "Tú" ? "Tú" : mio[0]) : otro ? <Ic.candado /> : "·"}</i>
                  <span><b>{nombre}</b><small>{p.nombre}</small></span>
                </div>
              );
            })}
          </div>
        </div>

        {fase === "llegaste" && (
          <div className="tarjeta ok"><b>Equipaje entregado.</b><p className="small muted">El chofer cerró el viaje a las {s.llegada}. Las dos fotos del equipaje quedan en tu historial.</p></div>
        )}
      </div>

      {/* botones flotantes */}
      {fase !== "llegaste" && (
        <div className="flotantes">
          <button className="flot sos" onClick={() => setSos(true)}><Ic.sos />SOS</button>
          <button className="flot chat" onClick={() => { setChat(true); setNoLeidos(0); }}><Ic.chat />Chat{noLeidos > 0 && <em>{noLeidos}</em>}</button>
        </div>
      )}

      <div className="pie">
        {fase === "llegaste" ? <button className="btn" onClick={onCalificar}>Calificar a {s.chofer}</button>
          : <button className="btn secundario" onClick={onInicio}>Volver al inicio</button>}
      </div>

      {aviso && <div className="toast">{aviso}</div>}

      {chat && (
        <Hoja titulo={"Chat con " + s.chofer} cerrar={() => setChat(false)}>
          <div className="burbujas">
            {msgs.map((m, i) => <div key={i} className={"burbuja " + m.de}><span>{m.texto}</span><small>{m.hora}</small></div>)}
          </div>
          <form className="escribir" onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const inp = f.elements.namedItem("t") as HTMLInputElement; envia(inp.value); inp.value = ""; }}>
            <input name="t" placeholder="Escribe al chofer…" autoComplete="off" />
            <button className="btn" type="submit" style={{ width: 56, minHeight: 48 }}><Ic.enviar /></button>
          </form>
          <p className="small muted" style={{ textAlign: "center", marginTop: 8 }}>Todo queda dentro de XPuesto. Tu número no se comparte.</p>
        </Hoja>
      )}

      {sos && (
        <Hoja titulo="Emergencia" cerrar={() => setSos(false)} rojo>
          <p className="muted">Tu ubicación y los datos del viaje ya le llegan a la Central SOS de XPuesto.</p>
          <div className="lista" style={{ marginTop: 12 }}>
            <button className="btn" style={{ background: "#D7263D", boxShadow: "0 10px 24px rgba(215,38,61,.3)" }}>Llamar a la Central SOS</button>
            <button className="btn secundario">Compartir mi ubicación con un familiar</button>
            <button className="btn fantasma" onClick={() => setSos(false)}>Fue un error, todo bien</button>
          </div>
        </Hoja>
      )}
    </div>
  );
}

export function Hoja({ titulo, cerrar, children, rojo }: { titulo: string; cerrar: () => void; children: React.ReactNode; rojo?: boolean }) {
  return (
    <div className="velo" onClick={cerrar}>
      <div className={"hoja" + (rojo ? " roja" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="asa" />
        <div className="encabezado-seccion" style={{ marginBottom: 10 }}><h3>{titulo}</h3><button className="atras" onClick={cerrar} aria-label="Cerrar"><Ic.cerrar /></button></div>
        {children}
      </div>
    </div>
  );
}

// ---------- calificar ----------
const ETIQUETAS = ["Puntual", "Carro limpio", "Manejo seguro", "Amable", "Buena música", "Cuidó el equipaje"];
export function Calificar({ salida: s, onListo }: { salida: Salida; onListo: () => void }) {
  const [n, setN] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  if (enviado) return (
    <div className="pantalla"><Cabecera /><div className="cuerpo listo" style={{ justifyContent: "center" }}>
      <div className="check"><Ic.check /></div>
      <h1>¡Gracias!</h1>
      <p className="muted">Tu calificación ayuda a que {s.chofer} suba de nivel y a que los próximos pasajeros elijan mejor.</p>
      <div className="tarjeta naranja" style={{ width: "100%" }}><b>+20 XPuntos</b><p className="small muted">Por viajar y calificar. Ya tienes 140. A 60 de tu primer viaje con descuento.</p></div>
    </div><div className="pie"><button className="btn" onClick={onListo}>Volver al inicio</button></div></div>
  );
  return (
    <div className="pantalla">
      <Cabecera titulo={<h3 style={{ flex: 1 }}>¿Cómo estuvo el viaje?</h3>} />
      <div className="cuerpo">
        <div className="tarjeta chofer">
          <img className="foto" src={s.foto} alt="" />
          <div><div className="nombre">{s.chofer}</div><div className="datos">{s.carro} {s.color} · Caracas → Valencia · {s.hora}</div></div>
        </div>
        <div className="estrellas-grandes">
          {[1, 2, 3, 4, 5].map((i) => <button key={i} className={i <= n ? "on" : ""} onClick={() => setN(i)} aria-label={`${i} estrellas`}><Ic.estrella /></button>)}
        </div>
        <p className="muted" style={{ textAlign: "center", fontWeight: 700 }}>{["Toca las estrellas", "Muy malo", "Malo", "Bueno", "Muy bueno", "¡Excelente!"][n]}</p>
        <div className="chips" style={{ flexWrap: "wrap", overflow: "visible", margin: 0, padding: 0 }}>
          {ETIQUETAS.map((t) => <button key={t} className={"chip" + (tags.includes(t) ? " activo" : "")} onClick={() => setTags((x) => x.includes(t) ? x.filter((y) => y !== t) : [...x, t])}>{t}</button>)}
        </div>
        <textarea className="texto-libre" placeholder="¿Algo más que quieras contar? (opcional)" rows={3} />
      </div>
      <div className="pie"><button className="btn" disabled={n === 0} onClick={() => setEnviado(true)}>Enviar calificación</button></div>
    </div>
  );
}
