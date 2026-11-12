// Cuentas y perfiles: entrada, permisos, perfil del pasajero, registro (7 pasos) y perfil del chofer.
import { useState } from "react";
import { bs } from "./data";
import { Cabecera, Ic } from "./ui";
import { Hoja } from "./viaje";
import {
  alertasEntrevista, codigoReferido, COMISION_POR_NIVEL, DOCS_CHOFER, evaluarEntrevista, FONDO_VUELTOS, PREGUNTAS_ENTREVISTA, REGISTRO_CHOFER_VACIO,
  type RegistroChofer, type Rol, type Usuario,
} from "./sesion";
import { CIUDADES_POR_ESTADO, ESTADOS, NOMBRES_ESTADOS } from "./venezuela";
import { ANIOS, MARCAS, MODELOS, PESOS, SEDES } from "./modelos";

const ir = (r: string) => { window.location.hash = "/" + r; };

// ---------- campos del prototipo ----------
export function Texto({ etiqueta, valor, onChange, tipo = "text", placeholder }: { etiqueta: string; valor: string; onChange: (v: string) => void; tipo?: string; placeholder?: string }) {
  return (
    <label className="campo texto">
      <span className="col"><span className="etiqueta">{etiqueta}</span><input type={tipo} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></span>
    </label>
  );
}
export function Clave({ etiqueta, valor, onChange, ver, setVer, placeholder }: { etiqueta: string; valor: string; onChange: (v: string) => void; ver: boolean; setVer: (v: boolean) => void; placeholder?: string }) {
  return (
    <label className="campo texto">
      <span className="col"><span className="etiqueta">{etiqueta}</span><input type={ver ? "text" : "password"} value={valor} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></span>
      <button type="button" className="ojo" onClick={(e) => { e.preventDefault(); setVer(!ver); }} aria-label={ver ? "Ocultar clave" : "Ver clave"}>{ver ? <Ic.ojoCerrado /> : <Ic.ojo />}</button>
    </label>
  );
}
export function Opcion({ etiqueta, valor, opciones, onChange }: { etiqueta: string; valor: string; opciones: string[]; onChange: (v: string) => void }) {
  return (
    <label className="campo">
      <span className="col"><span className="etiqueta">{etiqueta}</span><span className="valor">{valor || "Elegir"}</span></span>
      <span className="flecha"><Ic.abajo /></span>
      <select value={valor} onChange={(e) => onChange(e.target.value)}><option value="">Elegir</option>{opciones.map((o) => <option key={o}>{o}</option>)}</select>
    </label>
  );
}
function FotoBoton({ ok, etiqueta, sub, onClick }: { ok: boolean; etiqueta: string; sub?: string; onClick: () => void }) {
  return (
    <button className={"doc-fila" + (ok ? " ok" : "")} onClick={onClick}>
      <span className="ico">{ok ? <Ic.check /> : <Ic.camara />}</span>
      <span><b>{etiqueta}</b><small>{ok ? "Foto guardada" : sub ?? "Tomar foto o subir de la galería"}</small></span>
      {ok && <span className="mini-foto" style={{ backgroundImage: "url(./foto-maleta.jpg)" }} />}
    </button>
  );
}

// =====================================================================
// ENTRADA
// =====================================================================
export function Entrada({ onEntrar }: { onEntrar: (u: Usuario) => void }) {
  const [rol, setRol] = useState<Rol>("pasajero");
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [f, setF] = useState({ nombre: "", correo: "", clave: "", clave2: "", cedula: "", telefono: "", genero: "", estado: "", ciudad: "" });
  const [ver, setVer] = useState(false);
  const [error, setError] = useState("");
  const pon = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const clavesIguales = f.clave.length >= 4 && f.clave === f.clave2;
  const listo = modo === "entrar" ? f.correo.includes("@") && f.clave.length >= 4
    : f.nombre.trim().length > 1 && f.correo.includes("@") && clavesIguales && f.cedula.length >= 6 && f.telefono.length >= 7 && f.genero !== "" && f.estado !== "" && f.ciudad !== "";
  const entrar = () => {
    if (!listo) {
      setError(modo === "entrar" ? "Correo y clave de al menos 4 caracteres." : !clavesIguales && f.clave.length >= 4 ? "Las dos claves no son iguales." : "Faltan datos: nombre, correo, clave (dos veces), cédula, teléfono, género, estado y ciudad.");
      return;
    }
    const nombre = modo === "crear" ? f.nombre.trim() : f.correo.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    onEntrar({ nombre, correo: f.correo.trim(), telefono: f.telefono, cedula: f.cedula || "V-", genero: f.genero, estado: f.estado, ciudad: f.ciudad, rol, puntos: modo === "crear" ? 20 : 140, referido: codigoReferido(nombre), choferEstado: "sin-registro", nivel: "Evaluación", favoritos: [], permisos: modo === "crear" ? undefined : { ubicacion: true, fotos: true, contactos: true, avisos: true } });
  };
  const invitado = () => onEntrar({ nombre: "Invitado", correo: "", telefono: "", cedula: "", rol: "pasajero", invitado: true, puntos: 0, referido: "" });
  return (
    <div className="pantalla">
      <div className="cuerpo" style={{ paddingTop: 24 }}>
        <img src="./logo-full.png" alt="XPuesto" style={{ width: 240, margin: "0 auto 6px", display: "block" }} />
        <div>
          <p className="small muted" style={{ fontWeight: 700, marginBottom: 8, textAlign: "center" }}>¿Cómo entras hoy?</p>
          <div className="roles">
            <button className={"rol" + (rol === "pasajero" ? " on" : "")} onClick={() => setRol("pasajero")}><Ic.usuarios /><b>Soy pasajero</b><span>Aparto mi puesto</span></button>
            <button className={"rol" + (rol === "chofer" ? " on" : "")} onClick={() => setRol("chofer")}><Ic.carro /><b>Soy chofer</b><span>Salgo lleno y pago</span></button>
          </div>
        </div>
        <div className="pestanas">
          <button className={modo === "entrar" ? "on" : ""} onClick={() => setModo("entrar")}>Entrar</button>
          <button className={modo === "crear" ? "on" : ""} onClick={() => setModo("crear")}>Crear cuenta</button>
        </div>
        <div className="lista">
          {modo === "crear" && <Texto etiqueta="Nombres y apellidos" valor={f.nombre} onChange={pon("nombre")} placeholder="Como en tu cédula" />}
          <Texto etiqueta="Correo" valor={f.correo} onChange={pon("correo")} tipo="email" placeholder="tu@correo.com" />
          <Clave etiqueta="Clave" valor={f.clave} onChange={pon("clave")} ver={ver} setVer={setVer} placeholder="Mínimo 4 caracteres" />
          {modo === "crear" && (<>
            <Clave etiqueta="Repite la clave" valor={f.clave2} onChange={pon("clave2")} ver={ver} setVer={setVer} placeholder="La misma otra vez" />
            {f.clave2.length > 0 && <p className="small" style={{ fontWeight: 700, color: clavesIguales ? "var(--ok)" : "#D7263D", marginTop: -6 }}>{clavesIguales ? "Las claves coinciden" : "Las claves no son iguales"}</p>}
            <div className="fila2">
              <Texto etiqueta="Cédula" valor={f.cedula} onChange={pon("cedula")} placeholder="V-12345678" />
              <Texto etiqueta="Teléfono" valor={f.telefono} onChange={pon("telefono")} tipo="tel" placeholder="0414-1234567" />
            </div>
            <Opcion etiqueta="Género" valor={f.genero} opciones={["Masculino", "Femenino", "Prefiero no decir"]} onChange={pon("genero")} />
            <div className="fila2">
              <Opcion etiqueta="Estado" valor={f.estado} opciones={NOMBRES_ESTADOS} onChange={(v) => setF({ ...f, estado: v, ciudad: "" })} />
              <Opcion etiqueta="Ciudad" valor={f.ciudad} opciones={f.estado ? [...(CIUDADES_POR_ESTADO[f.estado] ?? []), "Otra"] : []} onChange={pon("ciudad")} />
            </div>
            <div className="nota"><Ic.escudo /><span>Con la cédula quedas como usuario verificado. El chofer ve tu nombre y tu calificación, nunca tu cédula.</span></div>
          </>)}
          {error && <p className="small" style={{ color: "#D7263D", fontWeight: 700 }}>{error}</p>}
          <button className="btn" onClick={entrar}>{modo === "entrar" ? `Entrar como ${rol}` : `Crear mi cuenta de ${rol}`}</button>
          {modo === "entrar" && <button className="btn fantasma">Olvidé mi clave</button>}
        </div>
        <div className="nota"><Ic.info /><span>Más adelante la entrada será por teléfono con un código por SMS. Por ahora, correo y clave.</span></div>
        {rol === "pasajero" && <button className="btn secundario" onClick={invitado}>Mirar sin cuenta</button>}
        <p className="small muted" style={{ textAlign: "center" }}>Al entrar aceptas los términos y la política de privacidad de XPuesto.</p>
      </div>
    </div>
  );
}

// ---------- PERMISOS (después de crear la cuenta) ----------
const PERMISOS = [
  ["ubicacion", "Ubicación", "Para mostrarte las paradas cercanas y seguir tu viaje en vivo."],
  ["fotos", "Cámara y fotos", "Para la foto de tu equipaje y tu perfil."],
  ["contactos", "Contactos", "Para invitar a tus panas y apartar puestos para otra persona."],
  ["avisos", "Notificaciones", "Se llenó el carro, el chofer va en camino, el chofer llegó."],
] as const;
export function Permisos({ u, guardar }: { u: Usuario; guardar: (u: Usuario) => void }) {
  const [p, setP] = useState<Record<string, boolean>>({ ubicacion: false, fotos: false, contactos: false, avisos: false });
  const todos = Object.values(p).every(Boolean);
  const seguir = () => { guardar({ ...u, permisos: p }); ir(u.rol === "chofer" ? "chofer/registro" : "inicio"); };
  return (
    <div className="pantalla">
      <Cabecera />
      <div className="cuerpo">
        <div><h2>Permisos de la app</h2><p className="small muted">Los necesitamos para que el viaje funcione. Se piden una sola vez.</p></div>
        <div className="lista">
          {PERMISOS.map(([k, t, d]) => (
            <label key={k} className={"perilla grande" + (p[k] ? " on" : "")}><span><b>{t}</b><small>{d}</small></span><input type="checkbox" checked={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.checked })} /><i /></label>
          ))}
        </div>
        <button className="btn fantasma" onClick={() => setP({ ubicacion: true, fotos: true, contactos: true, avisos: true })}>Permitir todo</button>
      </div>
      <div className="pie"><button className="btn" disabled={!todos} onClick={seguir}>{todos ? "Listo, seguir" : "Activa los cuatro para seguir"}</button></div>
    </div>
  );
}

// =====================================================================
// PERFIL DEL PASAJERO
// =====================================================================
const VIAJES_HECHOS = [
  { fecha: "8 sep", ruta: "Caracas → Valencia", chofer: "José R.", monto: 12, puesto: "Copiloto" },
  { fecha: "1 sep", ruta: "Valencia → Caracas", chofer: "Ana G.", monto: 12, puesto: "Trasero derecho" },
  { fecha: "24 ago", ruta: "Caracas → Maracay", chofer: "Carlos P.", monto: 8, puesto: "Trasero izquierdo" },
];
export function Perfil({ u, guardar, salir, proximo }: { u: Usuario; guardar: (u: Usuario) => void; salir: () => void; proximo?: string }) {
  const [editar, setEditar] = useState(false);
  const [f, setF] = useState({ nombre: u.nombre, correo: u.correo, telefono: u.telefono, cedula: u.cedula });
  const [aviso, setAviso] = useState<string | null>(null);
  const [notif, setNotif] = useState({ llenado: true, chofer: true, ofertas: false });
  const avisa = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 2500); };
  const ini = u.nombre.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
  if (u.invitado) return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("inicio")} titulo={<h3 style={{ flex: 1 }}>Tu cuenta</h3>} />
      <div className="cuerpo listo" style={{ justifyContent: "center" }}>
        <div className="avatar" style={{ width: 96, height: 96, fontSize: 36 }}>?</div>
        <h2>Estás mirando sin cuenta</h2>
        <p className="muted">Para apartar un puesto, guardar tus boletos y ganar XPuntos necesitas una cuenta. Es un minuto.</p>
      </div>
      <div className="pie"><button className="btn" onClick={salir}>Crear cuenta o entrar</button></div>
    </div>
  );
  const favoritos = u.favoritos ?? [];
  return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("inicio")} titulo={<h3 style={{ flex: 1 }}>Mi perfil</h3>}>
        <button className="atras" onClick={() => setEditar(true)} aria-label="Editar"><Ic.editar /></button>
      </Cabecera>
      <div className="cuerpo">
        <div className="perfil-cab">
          <button className="avatar grande" onClick={() => avisa("Foto: se abre la cámara o la galería")}>{ini}<span className="cam"><Ic.camara /></span></button>
          <div>
            <h2>{u.nombre}</h2>
            <p className="muted small">{u.correo}{u.telefono ? " · " + u.telefono : ""}{u.ciudad ? " · " + u.ciudad + (u.estado ? ", " + u.estado : "") : ""}</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ok)", fontWeight: 700, fontSize: 13, marginTop: 4 }}><span style={{ width: 16, height: 16 }}><Ic.escudo /></span>Usuario verificado · {u.cedula}</span>
          </div>
        </div>

        {proximo && <div className="tarjeta naranja"><b>Próximo viaje</b><p className="small muted">{proximo}</p><button className="btn fantasma" style={{ justifyContent: "flex-start", paddingLeft: 0, color: "var(--naranja)", minHeight: 36 }} onClick={() => ir("viaje")}>Ver mi viaje <span style={{ width: 18, height: 18 }}><Ic.derecha /></span></button></div>}

        <div className="tarjeta naranja" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}>
          <div><b>{u.puntos} XPuntos</b><p className="small muted">A {Math.max(0, 200 - u.puntos)} de tu primer viaje con descuento.</p>
            <div className="maletero" style={{ marginTop: 6 }}><div className="barra" style={{ height: 8 }}><i className="tuyo" style={{ flex: Math.min(1, u.puntos / 200) }} /><i style={{ flex: Math.max(0, 1 - u.puntos / 200) }} /></div></div></div>
          <span style={{ width: 36, height: 36, color: "var(--naranja)" }}><Ic.trofeo /></span>
        </div>

        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Invita y gana</h3><span className="cuenta">20 XPuntos por cada uno</span></div>
          <p className="small muted" style={{ marginBottom: 8 }}>Comparte tu código. Cuando tu invitado haga su primer viaje, ganan los dos.</p>
          <div className="codigo"><b>{u.referido}</b><button className="chip activo" onClick={() => { navigator.clipboard?.writeText(u.referido).catch(() => { }); avisa("Código copiado"); }}>Copiar</button><button className="chip" onClick={() => avisa("Se abre WhatsApp con el link")}>Compartir</button></div>
        </div>

        <div>
          <div className="encabezado-seccion"><h3>Mis viajes</h3><span className="cuenta">{VIAJES_HECHOS.length} hechos</span></div>
          <div className="lista" style={{ marginTop: 8 }}>
            {VIAJES_HECHOS.map((v) => (
              <button key={v.fecha} className="tarjeta lisa viaje-hecho" onClick={() => avisa("Se abre el boleto y las fotos del equipaje")}>
                <div><b>{v.ruta}</b><small>{v.fecha} · {v.chofer} · {v.puesto}</small></div>
                <span className="naranja" style={{ fontWeight: 800 }}>${v.monto}</span>
                <span style={{ width: 18, height: 18, color: "var(--ink3)" }}><Ic.derecha /></span>
              </button>
            ))}
          </div>
        </div>

        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Choferes favoritos</h3><span className="cuenta">{favoritos.length}</span></div>
          {favoritos.length === 0
            ? <p className="small muted">Marca el ♥ en la ficha de un chofer y te avisamos cuando publique una salida.</p>
            : <div className="chips" style={{ margin: "8px 0 0", padding: 0, flexWrap: "wrap" }}>{favoritos.map((n) => <button key={n} className="chip activo" onClick={() => guardar({ ...u, favoritos: favoritos.filter((x) => x !== n) })}>♥ {n} ×</button>)}</div>}
        </div>

        <div className="tarjeta lisa">
          <h3>Cómo pago</h3>
          <div className="resumen">
            <div className="r"><span className="k">Billetera XPuesto</span><span className="v">$40,00 · {bs(40)}</span></div>
            <div className="r"><span className="k">Pago Móvil</span><span className="v">0414-•••-4521 · Mercantil</span></div>
            <div className="r"><span className="k">Efectivo al chofer</span><span className="v">el vuelto te queda en la billetera</span></div>
          </div>
          <button className="btn fantasma" style={{ justifyContent: "flex-start", paddingLeft: 0, color: "var(--naranja)" }} onClick={() => avisa("Recarga por Pago Móvil: se acredita sola")}>Recargar billetera <span style={{ width: 18, height: 18 }}><Ic.derecha /></span></button>
        </div>

        <div className="tarjeta lisa">
          <h3>Rutas favoritas</h3>
          <div className="chips" style={{ margin: "8px 0 0", padding: 0, flexWrap: "wrap" }}><span className="chip">Caracas → Valencia</span><span className="chip">Valencia → Caracas</span><span className="chip">Caracas → Maracay</span></div>
        </div>

        <div className="tarjeta lisa">
          <h3>Avisos</h3>
          {([["llenado", "Cuando se llene mi carro"], ["chofer", "Cuando el chofer va en camino y llega"], ["ofertas", "Ofertas y rutas nuevas"]] as const).map(([k, t]) => (
            <label key={k} className="perilla"><span>{t}</span><input type="checkbox" checked={notif[k]} onChange={(e) => setNotif({ ...notif, [k]: e.target.checked })} /><i /></label>
          ))}
        </div>

        <div className="lista">
          <button className="btn secundario" onClick={() => { guardar({ ...u, rol: "chofer" }); ir(u.choferEstado === "aprobado" ? "conductor" : "chofer/registro"); }}><span style={{ width: 22, height: 22 }}><Ic.carro /></span>{u.choferEstado === "aprobado" ? "Cambiar a modo chofer" : "Quiero manejar con XPuesto"}</button>
          <button className="btn fantasma" onClick={salir}>Cerrar sesión</button>
        </div>
      </div>
      {aviso && <div className="toast">{aviso}</div>}
      {editar && (
        <Hoja titulo="Editar mis datos" cerrar={() => setEditar(false)}>
          <div className="lista">
            <Texto etiqueta="Nombres y apellidos" valor={f.nombre} onChange={(v) => setF({ ...f, nombre: v })} />
            <Texto etiqueta="Correo" valor={f.correo} onChange={(v) => setF({ ...f, correo: v })} tipo="email" />
            <div className="fila2"><Texto etiqueta="Teléfono" valor={f.telefono} onChange={(v) => setF({ ...f, telefono: v })} tipo="tel" /><Texto etiqueta="Cédula" valor={f.cedula} onChange={(v) => setF({ ...f, cedula: v })} /></div>
            <button className="btn" onClick={() => { guardar({ ...u, ...f }); setEditar(false); avisa("Datos guardados"); }}>Guardar</button>
          </div>
        </Hoja>
      )}
    </div>
  );
}

// =====================================================================
// REGISTRO DEL CHOFER · 7 pasos
// =====================================================================
const PASOS = ["Datos", "Documentos", "Carro", "Fotos", "Presencial", "Inducción", "Activar"];
const FOTOS_VIRTUAL = ["Frente", "Lateral izquierdo", "Lateral derecho", "Atrás, maletero abierto"];
export function RegistroChofer({ u, guardar }: { u: Usuario; guardar: (u: Usuario) => void }) {
  const [paso, setPaso] = useState(0);
  const [r, setR] = useState<RegistroChofer>(u.chofer ?? { ...REGISTRO_CHOFER_VACIO, estado: u.estado ?? "" });
  const [modeloOtro, setModeloOtro] = useState(false);
  const [leido, setLeido] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const avisa = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 2200); };
  const municipios = r.estado ? Object.keys(ESTADOS[r.estado] ?? {}) : [];
  const parroquias = r.estado && r.municipio ? (ESTADOS[r.estado]?.[r.municipio] ?? []) : [];
  const docsListos = DOCS_CHOFER.every((d) => r.docs[d]?.foto && r.docs[d]?.vence) && r.fotoFondo;
  const c = r.carro;
  const modelos = c.marca ? [...(MODELOS[c.marca] ?? []), "Otro"] : [];

  const [identidad, setIdentidad] = useState({
    nombre: u.nombre.split(" ")[0],
    cedula: u.cedula,
  });

  const avanzarPaso = () => {
    if (!listoPaso) return;

    if (paso === 0) {
      const partes = u.nombre.trim().split(/\s+/);

      guardar({
        ...u,
        nombre: [
          identidad.nombre.trim(),
          ...partes.slice(1),
        ].filter(Boolean).join(" "),
        cedula: identidad.cedula.trim(),
      });
    }

    setPaso((actual) => actual + 1);
  };

  const listoPaso = [
    identidad.nombre.trim().length > 0 &&
    identidad.cedula.trim().length >= 6 &&
    r.apellido.trim() !== "" &&
    r.genero !== "" &&
    r.nacimiento !== "" &&
    r.estado !== "" &&
    r.municipio.trim() !== "" &&
    r.parroquia.trim() !== "" &&
    r.tipoPago !== "" &&
    r.banco !== "" &&
    r.cuenta.trim().length >= 7,
    docsListos,
    c.carnetFoto && c.carnetNumero.trim() !== "" && c.carnetSerial.trim() !== "" && c.marca !== "" && c.modelo.trim() !== "" && c.anio !== "" && c.color !== "" && c.placa.trim().length >= 6 && c.caja !== "" && c.peso !== "",
    r.virtual.fotos >= 4,
    r.inspeccion !== "" && r.entrevista !== "" && r.puntaje >= 76,
    r.induccion,
    r.rcvVence !== "" && r.etiquetas,
  ][paso];

  const faltantes = [
    !identidad.nombre.trim() && "nombre",
    !identidad.cedula.trim() && "cédula",
    !r.apellido.trim() && "apellido",
    !r.genero && "género",
    !r.nacimiento && "nacimiento",
    !r.estado && "estado",
    !r.municipio.trim() && "municipio",
    !r.parroquia.trim() && "parroquia",
    !r.tipoPago && "tipo de pago",
    !r.banco && "banco",
    !r.cuenta.trim() && "cuenta",
  ].filter(Boolean) as string[];

  const alertas = alertasEntrevista(r.respuestas);
  const evaluar = () => { const p = evaluarEntrevista(r.respuestas); setR({ ...r, puntaje: p }); avisa(p >= 76 ? `Entrevista aprobada: ${p} %` : `Puntaje ${p} %: revisa las marcadas`); };
  const leerCarnet = () => {
    // En producción: la foto del carnet se lee con OCR y llena estos campos. Aquí se simula.
    setR({ ...r, carro: { ...c, carnetFoto: true, carnetNumero: c.carnetNumero || "45678901", carnetSerial: c.carnetSerial || "XYZ987654", marca: c.marca || "Toyota", modelo: c.modelo || "Corolla", anio: c.anio || "2019", color: c.color || "Azul", placa: c.placa || "AB123CD" } });
    setLeido(true); avisa("Leímos el carnet. Revisa que todo esté bien.");
  };
  const enviar = () => { guardar({ ...u, rol: "chofer", chofer: r, choferEstado: "en-revision", nivel: "Evaluación" }); ir("chofer/estado"); };
  const docNombre = (d: string) => d.replace("Cédula de identidad", "cédula").replace("Licencia de conducir", "licencia").replace("Certificado médico", "certificado médico");
  const sede = r.inspeccion ? SEDES[r.inspeccion] : null;

  return (
    <div className="pantalla">
      <Cabecera onAtras={() => (paso > 0 ? setPaso(paso - 1) : ir("inicio"))} titulo={<h3 style={{ flex: 1 }}>Registro de chofer</h3>} />
      <div className="cuerpo">
        <div className="pasos-barra siete">{PASOS.map((p, i) => <span key={p} className={i < paso ? "hecho" : i === paso ? "actual" : ""}><i>{i < paso ? "✓" : i + 1}</i>{p}</span>)}</div>

        {paso === 0 && (<>
          <div><h2>Tus datos</h2><p className="small muted">Como aparecen en tu cédula. Aquí también dices dónde te pagamos los lunes, miércoles y viernes.</p></div>
          <div className="lista">
            <div className="fila2">
              <Texto
                etiqueta="Nombre"
                valor={identidad.nombre}
                onChange={(v) =>
                  setIdentidad({ ...identidad, nombre: v })
                }
              />
              <Texto
                etiqueta="Apellido"
                valor={r.apellido}
                onChange={(v) => setR({ ...r, apellido: v })}
              />
            </div>
            <div className="fila2">
              <Texto
                etiqueta="Cédula"
                valor={identidad.cedula}
                onChange={(v) =>
                  setIdentidad({ ...identidad, cedula: v })
                }
              />

              <Texto
                etiqueta="Nacimiento"
                valor={r.nacimiento}
                onChange={(v) => setR({ ...r, nacimiento: v })}
                tipo="date"
              />
            </div>
            <div className="fila2"><Opcion etiqueta="Género" valor={r.genero} opciones={["Masculino", "Femenino", "Prefiero no decir"]} onChange={(v) => setR({ ...r, genero: v })} /><Texto etiqueta="Teléfono" valor={u.telefono || ""} onChange={(v) => guardar({ ...u, telefono: v })} tipo="tel" /></div>
            <Texto etiqueta="Correo" valor={u.correo} onChange={() => { }} />
            <Opcion etiqueta="Estado" valor={r.estado} opciones={NOMBRES_ESTADOS} onChange={(v) => setR({ ...r, estado: v, municipio: "", parroquia: "" })} />
            <div className="fila2">
              <Opcion etiqueta="Municipio" valor={r.municipio} opciones={municipios} onChange={(v) => setR({ ...r, municipio: v, parroquia: "" })} />
              {parroquias.length > 0
                ? <Opcion etiqueta="Parroquia" valor={r.parroquia} opciones={parroquias} onChange={(v) => setR({ ...r, parroquia: v })} />
                : <Texto etiqueta="Parroquia" valor={r.parroquia} onChange={(v) => setR({ ...r, parroquia: v })} placeholder="Escríbela" />}
            </div>
            <div className="tarjeta lisa doc-bloque">
              <b>¿Dónde te pagamos?</b>
              <div className="roles" style={{ marginTop: 6 }}>
                <button className={"rol" + (r.tipoPago === "Pago Móvil" ? " on" : "")} onClick={() => setR({ ...r, tipoPago: "Pago Móvil", cuenta: "" })}><Ic.telefono /><b>Pago Móvil</b><span>Con tu teléfono</span></button>
                <button className={"rol" + (r.tipoPago === "Cuenta bancaria" ? " on" : "")} onClick={() => setR({ ...r, tipoPago: "Cuenta bancaria", cuenta: "" })}><Ic.billetera /><b>Cuenta bancaria</b><span>Número de 20 dígitos</span></button>
              </div>
              {r.tipoPago && (<>
                <Opcion etiqueta="Banco" valor={r.banco} opciones={["Mercantil", "Banesco", "BBVA Provincial", "Venezuela", "Bancamiga", "BNC", "Banplus", "Bancaribe", "Tesoro", "Bicentenario", "Plaza", "Sofitasa", "Exterior", "Caroní", "Fondo Común", "Otro"]} onChange={(v) => setR({ ...r, banco: v })} />
                {r.tipoPago === "Pago Móvil"
                  ? <div className="fila2">
                    <Texto
                      etiqueta="Cédula del Pago Móvil"
                      valor={identidad.cedula}
                      onChange={(v) =>
                        setIdentidad({ ...identidad, cedula: v })
                      }
                    />
                    <Texto etiqueta="Teléfono del Pago Móvil" valor={r.cuenta} onChange={(v) => setR({ ...r, cuenta: v })} tipo="tel" placeholder="0414-1234567" />
                  </div>
                  : <Texto etiqueta="Número de cuenta" valor={r.cuenta} onChange={(v) => setR({ ...r, cuenta: v })} placeholder="0105-0000-00-0000000000" />}
              </>)}
            </div>
          </div>


        </>)}

        {paso === 1 && (<>
          <div><h2>Documentos</h2><p className="small muted">Todos vigentes. A cada uno le pones la fecha de vencimiento. Tu cédula es la {u.cedula}.</p></div>
          <div className="lista">
            <FotoBoton ok={r.fotoFondo} etiqueta="Tu foto, fondo blanco" sub="De frente, sin lentes ni gorra" onClick={() => { setR({ ...r, fotoFondo: true }); avisa("Foto guardada"); }} />
            {DOCS_CHOFER.map((d) => {
              const doc = r.docs[d] ?? { foto: false };
              return (
                <div key={d} className={"tarjeta lisa doc-bloque" + (doc.foto && doc.vence ? " ok" : "")}>
                  <b>{d}</b>
                  <Texto etiqueta="Fecha de vencimiento" valor={doc.vence ?? ""} onChange={(v) => setR({ ...r, docs: { ...r.docs, [d]: { ...doc, vence: v } } })} tipo="date" />
                  <FotoBoton ok={doc.foto} etiqueta={"Foto de la " + docNombre(d)} sub="Clara, con las cuatro esquinas" onClick={() => { setR({ ...r, docs: { ...r.docs, [d]: { ...doc, foto: true } } }); avisa("Foto guardada"); }} />
                </div>
              );
            })}
          </div>
          <div className="nota"><Ic.escudo /><span>Tus documentos sólo los ve el equipo de verificación. Nunca el pasajero.</span></div>
        </>)}

        {paso === 2 && (<>
          <div><h2>Tu carro</h2><p className="small muted">Primero la foto del carnet de circulación: de ahí leemos los datos y tú sólo revisas.</p></div>
          <div className="lista">
            <div className="tarjeta lisa doc-bloque">
              <b>Carnet de circulación</b>
              <FotoBoton ok={c.carnetFoto} etiqueta="Foto del carnet" sub="Clara, con las cuatro esquinas" onClick={leerCarnet} />
              {leido && <div className="tarjeta ok" style={{ padding: "8px 12px" }}><b style={{ fontSize: 14 }}>Datos leídos del carnet. Revísalos y corrige lo que haga falta.</b></div>}
              <div className="fila2"><Texto etiqueta="Número" valor={c.carnetNumero} onChange={(v) => setR({ ...r, carro: { ...c, carnetNumero: v } })} placeholder="12345678" /><Texto etiqueta="Serial" valor={c.carnetSerial} onChange={(v) => setR({ ...r, carro: { ...c, carnetSerial: v.toUpperCase() } })} placeholder="ABC123456" /></div>
            </div>
            <div className="fila2">
              <Opcion etiqueta="Marca" valor={c.marca} opciones={MARCAS} onChange={(v) => { setR({ ...r, carro: { ...c, marca: v, modelo: "" } }); setModeloOtro(false); }} />
              {modeloOtro || (c.marca && !modelos.includes(c.modelo) && c.modelo !== "")
                ? <Texto etiqueta="Modelo (otro)" valor={c.modelo} onChange={(v) => setR({ ...r, carro: { ...c, modelo: v } })} placeholder="Escríbelo" />
                : <Opcion etiqueta="Modelo" valor={c.modelo} opciones={modelos} onChange={(v) => { if (v === "Otro") { setModeloOtro(true); setR({ ...r, carro: { ...c, modelo: "" } }); } else setR({ ...r, carro: { ...c, modelo: v } }); }} />}
            </div>
            <div className="fila2"><Opcion etiqueta="Año (2005 en adelante)" valor={c.anio} opciones={ANIOS} onChange={(v) => setR({ ...r, carro: { ...c, anio: v } })} /><Opcion etiqueta="Color" valor={c.color} opciones={["Blanco", "Negro", "Gris", "Plata", "Azul", "Rojo", "Beige", "Vinotinto", "Verde", "Dorado", "Otro"]} onChange={(v) => setR({ ...r, carro: { ...c, color: v } })} /></div>
            <div className="fila2"><Texto etiqueta="Placa" valor={c.placa} onChange={(v) => setR({ ...r, carro: { ...c, placa: v.toUpperCase() } })} placeholder="AB123CD" /><Opcion etiqueta="Caja" valor={c.caja} opciones={["Sincrónico", "Automático"]} onChange={(v) => setR({ ...r, carro: { ...c, caja: v } })} /></div>
            <Opcion etiqueta="Capacidad de peso" valor={c.peso} opciones={PESOS} onChange={(v) => setR({ ...r, carro: { ...c, peso: v } })} />
            <div className="tarjeta naranja"><b>4 puestos · maletero para {["Hyundai", "Suzuki", "Toyota"].includes(c.marca) && /Tucson|Fortuner|Grand Vitara|Santa Fe|4Runner|Prado/.test(c.modelo) ? 4 : 3} maletas grandes</b><p className="small muted">Lo calculamos por marca y modelo. Se confirma en la inspección.</p></div>
          </div>
        </>)}

        {paso === 3 && (<>
          <div><h2>Fotos del carro</h2><p className="small muted">Cuatro fotos, lo más claras posible. Las revisa el asesor antes de la cita.</p></div>
          <div className="fotos-carro">
            {FOTOS_VIRTUAL.map((l, i) => (
              <button key={l} className={"foto-carro" + (i < r.virtual.fotos ? " ok" : "")} onClick={() => { if (i === r.virtual.fotos) { setR({ ...r, virtual: { fotos: r.virtual.fotos + 1 } }); avisa(`${l}: foto guardada`); } }} style={i < r.virtual.fotos ? { backgroundImage: "url(./foto-maleta.jpg)" } : undefined}>
                {i < r.virtual.fotos ? <span className="sello-mini"><Ic.check /></span> : <><Ic.camara /><small>{l}</small></>}
              </button>
            ))}
          </div>
          <div className="nota"><Ic.info /><span>Sin parabrisas ni retrovisores rotos, sin choques fuertes, color original y asientos en buen estado. Choques leves y pintura algo quemada sí pasan.</span></div>
        </>)}

        {paso === 4 && (<>
          <div><h2>Inspección presencial y entrevista</h2><p className="small muted">Un asesor revisa luces, cruces, vidrios, manillas, aire, parabrisas y retrovisores, y te hace ocho preguntas.</p></div>
          <div className="lista">
            <Opcion etiqueta="Sede" valor={r.inspeccion} opciones={Object.keys(SEDES)} onChange={(v) => setR({ ...r, inspeccion: v })} />
            {sede && (
              <div className="tarjeta lisa">
                <b>{r.inspeccion}</b>
                <p className="small muted" style={{ marginTop: 4 }}>{sede.direccion}</p>
                <p className="small muted">{sede.horario}</p>
                <div className="chips" style={{ margin: "8px 0 0", padding: 0, flexWrap: "wrap" }}>
                  <a className="chip activo" href={"tel:" + sede.telefono.replace(/-/g, "")}>Llamar {sede.telefono}</a>
                  <a className="chip" href={sede.mapa} target="_blank" rel="noreferrer">Ver en el mapa</a>
                  <a className="chip" href={"https://wa.me/58" + sede.telefono.replace(/-/g, "").slice(1)} target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            )}
            <div>
              <p className="small muted" style={{ fontWeight: 700, marginBottom: 8 }}>Día y hora</p>
              <div className="chips" style={{ margin: 0, padding: 0, flexWrap: "wrap" }}>
                {["Jue 24 · 9:00 am", "Jue 24 · 2:00 pm", "Vie 25 · 9:00 am", "Sáb 26 · 10:00 am"].map((h) => <button key={h} className={"chip" + (r.entrevista === h ? " activo" : "")} onClick={() => setR({ ...r, entrevista: h })}>{h}</button>)}
              </div>
            </div>
            <div className="tarjeta lisa">
              <h3>Entrevista · responde aquí</h3>
              <p className="small muted" style={{ marginBottom: 8 }}>Responde con tus palabras, una o dos líneas. Mínimo 76 % para seguir. El asesor decide al final.</p>
              {PREGUNTAS_ENTREVISTA.map((q, i) => (
                <div key={q} style={{ marginBottom: 10 }}>
                  <p className="small" style={{ fontWeight: 700, marginBottom: 4 }}>{i + 1}. {q}</p>
                  <textarea className={"texto-libre" + (r.puntaje > 0 && (alertas[i] || r.respuestas[i].trim().length < 15) ? " mal" : "")} rows={2} value={r.respuestas[i]} placeholder="Escribe tu respuesta" onChange={(e) => { const rr = [...r.respuestas]; rr[i] = e.target.value; setR({ ...r, respuestas: rr, puntaje: 0 }); }} />
                  {r.puntaje > 0 && alertas[i] && <p className="small" style={{ color: "#D7263D", fontWeight: 700 }}>Esta respuesta no va con las reglas de XPuesto.</p>}
                  {r.puntaje > 0 && !alertas[i] && r.respuestas[i].trim().length < 15 && <p className="small" style={{ color: "#D7263D", fontWeight: 700 }}>Muy corta: cuéntanos qué harías.</p>}
                </div>
              ))}
              {r.puntaje === 0
                ? <button className="btn secundario" disabled={r.respuestas.some((x) => x.trim().length < 5)} onClick={evaluar}>Evaluar mis respuestas</button>
                : <div className={"tarjeta " + (r.puntaje >= 76 ? "ok" : "naranja")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><b>{r.puntaje >= 76 ? "Aprobada" : "Corrige las marcadas y evalúa otra vez"}</b><span style={{ fontSize: 28, fontWeight: 800, color: r.puntaje >= 76 ? "var(--ok)" : "var(--naranja)" }}>{r.puntaje} %</span></div>}
            </div>
          </div>
        </>)}

        {paso === 5 && (<>
          <div><h2>Inducción</h2><p className="small muted">Un video de 6 minutos con cómo funciona la app: la bolsa, la parada, la foto del maletero, el cobro.</p></div>
          <button className="video" onClick={() => { setR({ ...r, induccion: true }); avisa("Se abre el video en YouTube"); }}>
            <img src="./portada-video.jpg" alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            <span className="play">▶</span>
            <span className="pie-video">Cómo trabajar con XPuesto · 6:12</span>
          </button>
          <label className="perilla grande"><span><b>Ya vi el video completo</b><small>Si te quedan dudas, las aclaras en la inspección presencial.</small></span><input type="checkbox" checked={r.induccion} onChange={(e) => setR({ ...r, induccion: e.target.checked })} /><i /></label>
        </>)}

        {paso === 6 && (<>
          <div><h2>Activar tu cuenta</h2><p className="small muted">RCV vigente y las tres etiquetas oficiales. La afiliación no cuesta.</p></div>
          <div className="lista">
            <div className="tarjeta lisa doc-bloque">
              <b>RCV (seguro de responsabilidad civil)</b>
              <p className="small muted">Si no tienes, lo pagas con la aseguradora aliada desde aquí con descuento.</p>
              <div className="fila2" style={{ marginTop: 8 }}><Texto etiqueta="Vence" valor={r.rcvVence} onChange={(v) => setR({ ...r, rcvVence: v })} tipo="date" /><button className="btn secundario" style={{ minHeight: 48, fontSize: 14 }} onClick={() => avisa("Se abre la aseguradora aliada")}>Pagar RCV aliado</button></div>
            </div>
            <div className="tarjeta navy-oscura">
              <span className="cod">Afiliación</span>
              <div className="grande">$0 <small>gratis</small></div>
              <ul><li>Sólo pagas las 3 etiquetas oficiales del carro: trasera, lateral y frontal.</li><li>Te las entregan en la inspección presencial.</li><li>Con las etiquetas puestas, quedas activo.</li></ul>
            </div>
            <label className="perilla grande"><span><b>Acepto pagar las 3 etiquetas y las reglas del chofer XPuesto</b><small>Puntualidad, trato, carro limpio, foto del maletero en cada salida.</small></span><input type="checkbox" checked={r.etiquetas} onChange={(e) => setR({ ...r, etiquetas: e.target.checked })} /><i /></label>
          </div>
        </>)}
      </div>
      <div className="pie">
        {paso < PASOS.length - 1
          ? <button className="btn" disabled={faltantes.length > 0} onClick={avanzarPaso}>
            {faltantes.length === 0
              ? "Siguiente"
              : `Falta: ${faltantes[0]}`}
          </button>
          : <button className="btn" disabled={!listoPaso} onClick={enviar}>Enviar mi registro</button>}
      </div>
      {aviso && <div className="toast">{aviso}</div>}
    </div >
  );
}

// ---------- estado del registro ----------
export function EstadoChofer({ u, guardar }: { u: Usuario; guardar: (u: Usuario) => void }) {
  const aprobado = u.choferEstado === "aprobado";
  const c = u.chofer;
  return (
    <div className="pantalla">
      <Cabecera onAtras={() => ir("inicio")} titulo={<h3 style={{ flex: 1 }}>Tu registro</h3>} />
      <div className="cuerpo">
        <div className="listo">
          <div className="check" style={aprobado ? {} : { background: "var(--naranja-soft)" }}><span style={{ color: aprobado ? "var(--ok)" : "var(--naranja)", width: 52, height: 52 }}>{aprobado ? <Ic.check /> : <Ic.reloj />}</span></div>
          <h1>{aprobado ? "¡Aprobado!" : "En revisión"}</h1>
          <p className="muted">{aprobado ? "Ya puedes publicar horarios y tomar rutas. Empiezas en nivel Evaluación." : "Recibimos todo. El equipo revisa tus documentos en 24 horas y te avisamos por correo y en la app."}</p>
        </div>
        <div className="tarjeta lisa">
          {[["Datos personales y cuenta", true], ["Documentos y foto", true], [`Carro: ${c?.carro.marca} ${c?.carro.modelo} ${c?.carro.color} · ${c?.carro.caja}`, true], ["Fotos del carro (4)", true], [`Entrevista: ${c?.puntaje} %`, true], [`Inspección presencial: ${c?.inspeccion} · ${c?.entrevista}`, aprobado], ["Inducción vista", true], ["RCV y etiquetas", aprobado]].map(([t, ok]) => (
            <div key={String(t)} className="resumen"><div className="r"><span className="k">{t}</span><span className={"pill " + (ok ? "llena" : "")}>{ok ? "Listo" : "Pendiente"}</span></div></div>
          ))}
        </div>
        {!aprobado && <div className="nota"><Ic.info /><span>Para la demo: toca «Simular aprobación» y entra como chofer aprobado.</span></div>}
      </div>
      <div className="pie" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {aprobado
          ? <button className="btn" onClick={() => ir("conductor")}>Entrar a mi app de chofer</button>
          : <button className="btn secundario" onClick={() => guardar({ ...u, choferEstado: "aprobado", nivel: "Evaluación" })}>Simular aprobación (demo)</button>}
        <button className="btn fantasma" onClick={() => ir("inicio")}>Volver al inicio</button>
      </div>
    </div>
  );
}

// =====================================================================
// PERFIL DEL CHOFER
// =====================================================================
export function PerfilChofer({ u, guardar, salir }: { u: Usuario; guardar: (u: Usuario) => void; salir: () => void }) {
  const [aviso, setAviso] = useState<string | null>(null);
  const avisa = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 2500); };
  const c = u.chofer;
  const nivel = u.nivel ?? "Impulso";
  const carro = c ? `${c.carro.marca} ${c.carro.modelo} ${c.carro.color}` : "Toyota Corolla azul";
  const placa = c ? c.carro.placa.slice(0, 3) + "•••" : "AB1•••";
  const niveles = (["Evaluación", "Impulso", "Líder"] as const);
  return (
    <>
      <Cabecera titulo={<h3 style={{ flex: 1 }}>Mi perfil de chofer</h3>} />
      <div className="cuerpo">
        <div className="perfil-cab">
          <button className="avatar grande" style={{ backgroundImage: "url(./chofer-jose.jpg)", backgroundSize: "cover", color: "transparent" }} onClick={() => avisa("Foto: se abre la cámara")}>·<span className="cam"><Ic.camara /></span></button>
          <div>
            <h2>{u.nombre}{c && c.apellido && !u.nombre.includes(c.apellido) ? " " + c.apellido : ""}</h2>
            <p className="muted small">{carro} · {placa}{c?.carro.caja ? " · " + c.carro.caja : ""}</p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--ok)", fontWeight: 700, fontSize: 13, marginTop: 4 }}><span style={{ width: 16, height: 16 }}><Ic.escudo /></span>Chofer verificado · {nivel}</span>
          </div>
        </div>
        <div className="kpis-chofer" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div className="kpi-c"><small>Viajes</small><b>{c ? 0 : 312}</b><span>{c ? "empiezas hoy" : "desde marzo"}</span></div>
          <div className="kpi-c naranja"><small>Estrellas</small><b>{c ? "—" : "4.9"}</b><span>{c ? "sin calificar" : "241 calificaciones"}</span></div>
          <div className="kpi-c"><small>Aceptación</small><b>{c ? "—" : "96 %"}</b><span>rutas y viajes</span></div>
        </div>
        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Tu nivel y lo que te queda</h3><span className="cuenta">comisión XPuesto</span></div>
          <div className="niveles">
            {niveles.map((n) => <div key={n} className={"nivel" + (n === nivel ? " on" : "")}><b>{n}</b><span>te quedas con {Math.round((1 - COMISION_POR_NIVEL[n]) * 100)} %</span><small>comisión {Math.round(COMISION_POR_NIVEL[n] * 100)} %</small></div>)}
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>Subes de nivel con rutas aceptadas, viajes completos y estrellas. La ganancia neta se te muestra antes de tomar cada ruta.</p>
        </div>
        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Documentos</h3><span className="cuenta">se revisan al vencer</span></div>
          <div className="docs">
            {["Cédula", "Licencia", "Cert. médico", "Carnet circ.", "Inspección"].map((d) => <span key={d} className="doc ok"><Ic.check />{d}</span>)}
            <span className="doc pend">RCV vence {c?.rcvVence || "30 oct"}</span>
          </div>
          <button className="btn fantasma" style={{ justifyContent: "flex-start", paddingLeft: 0, color: "var(--naranja)" }} onClick={() => avisa("Sube la foto del RCV nuevo")}>Renovar RCV con la aseguradora aliada <span style={{ width: 18, height: 18 }}><Ic.derecha /></span></button>
        </div>
        <div className="tarjeta lisa">
          <h3>Pagos a tu cuenta</h3>
          <div className="resumen">
            <div className="r"><span className="k">{c?.banco || "Mercantil"}</span><span className="v">{c?.cuenta ? "•••• " + c.cuenta.slice(-4) : "0105 •••• 4521"}</span></div>
            <div className="r"><span className="k">Días de pago</span><span className="v">Lunes · Miércoles · Viernes</span></div>
            <div className="r"><span className="k">Moneda</span><span className="v">Bolívares a tasa BCV del día</span></div>
            <div className="r"><span className="k">Fondo para vueltos en efectivo</span><span className="v">${FONDO_VUELTOS} prestados por la app</span></div>
          </div>
        </div>
        <div className="tarjeta lisa">
          <div className="encabezado-seccion"><h3>Trae choferes y pasajeros</h3><span className="cuenta">puntos operativos</span></div>
          <div className="codigo" style={{ marginTop: 8 }}><b>{u.referido || "XP-JOSE312"}</b><button className="chip activo" onClick={() => avisa("Código copiado")}>Copiar</button><button className="chip" onClick={() => avisa("Se abre WhatsApp con el link")}>Compartir</button></div>
        </div>
        <div className="lista">
          <button className="btn secundario" onClick={() => { guardar({ ...u, rol: "pasajero" }); ir("inicio"); }}><span style={{ width: 22, height: 22 }}><Ic.usuarios /></span>Cambiar a modo pasajero</button>
          <button className="btn fantasma" onClick={salir}>Cerrar sesión</button>
        </div>
      </div>
      {aviso && <div className="toast">{aviso}</div>}
    </>
  );
}
