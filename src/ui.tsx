import type { ReactNode } from "react";
import { PUESTOS, type Puesto, type Salida } from "./data";

// ---------- iconos (trazo, 24x24) ----------
const I = ({ d, children }: { d?: string; children?: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);
export const Ic = {
  atras: () => <I d="M15 18l-6-6 6-6" />,
  buscar: () => <I><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></I>,
  pin: () => <I><path d="M12 22s7-7.1 7-12a7 7 0 0 0-14 0c0 4.9 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></I>,
  bandera: () => <I d="M4 22V4m0 0h12l-2 4 2 4H4" />,
  calendario: () => <I><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></I>,
  reloj: () => <I><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>,
  swap: () => <I d="M7 4v16m0 0l-3-3m3 3l3-3M17 20V4m0 0l3 3m-3-3l-3 3" />,
  abajo: () => <I d="M6 9l6 6 6-6" />,
  derecha: () => <I d="M9 6l6 6-6 6" />,
  check: () => <I d="M5 12l5 5L20 7" />,
  escudo: () => <I><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></I>,
  camara: () => <I><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></I>,
  maleta: () => <I><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V4h6v3M4 12h16" /></I>,
  bolso: () => <I><path d="M5 9h14l-1 11H6z" /><path d="M9 9V7a3 3 0 0 1 6 0v2" /></I>,
  caja: () => <I><path d="M3 8l9-4 9 4-9 4z" /><path d="M3 8v9l9 4 9-4V8M12 12v9" /></I>,
  billetera: () => <I><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14h2" /></I>,
  telefono: () => <I><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></I>,
  info: () => <I><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></I>,
  estrella: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7-5-4.6 6.8-.8z" /></svg>
  ),
  sos: () => <I><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></I>,
  campana: () => <I><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z" /><path d="M10 21h4" /></I>,
  candado: () => <I><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></I>,
  chat: () => <I d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z" />,
  enviar: () => <I d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  cerrar: () => <I d="M18 6L6 18M6 6l12 12" />,
  carro: () => <I><path d="M5 17h14M6 17l1.5-6h9L18 17M6 11l-2 2v4h2M18 11l2 2v4h-2" /><circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></I>,
  casa: () => <I d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
  bolsa: () => <I><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></I>,
  usuarios: () => <I><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 15.5a5 5 0 0 1 5.5 4.5" /></I>,
  trofeo: () => <I><path d="M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6" /></I>,
  rayo: () => <I d="M13 2L4 14h6l-1 8 9-12h-6z" />,
  ojo: () => <I><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></I>,
  editar: () => <I d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  ojoCerrado: () => <I><path d="M3 3l18 18M10.6 10.6A3 3 0 0 0 13.4 13.4M9.9 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.4-1" /></I>,
  billete: () => <I><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 12h.01M18 12h.01" /></I>,
  corazon: () => <I d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.4a5.2 5.2 0 0 1 9.3 5.6C19 16.4 12 21 12 21z" />,
  corazonLleno: () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7-4.6-9.3-9A5.2 5.2 0 0 1 12 6.4a5.2 5.2 0 0 1 9.3 5.6C19 16.4 12 21 12 21z" /></svg>,
};

// ---------- cabecera ----------
export function Cabecera({ onAtras, titulo, children }: { onAtras?: () => void; titulo?: ReactNode; children?: ReactNode }) {
  return (
    <div className="cabecera">
      {onAtras && (
        <button className="atras" onClick={onAtras} aria-label="Atrás"><Ic.atras /></button>
      )}
      {titulo ?? <img className="logo" src="./logo-mark.png" alt="XPuesto" />}
      {children}
    </div>
  );
}

// ---------- vista del carro con los puestos ----------
// Vista desde arriba. Fila delantera: chofer (volante) a la izquierda, copiloto a la derecha.
// Fila trasera: tres puestos del mismo tamaño, alineados.
const POS: Record<Puesto, { x: number; y: number; w: number }> = {
  copiloto: { x: 146, y: 118, w: 56 },
  "tras-izq": { x: 62, y: 206, w: 46 },
  "tras-centro": { x: 110, y: 206, w: 46 },
  "tras-der": { x: 158, y: 206, w: 46 },
};
const ALTO = 62; // alto de cada asiento (respaldo + cojín)

function Asiento({ x, y, w, fill, stroke, respaldo, label, onClick, title }: { x: number; y: number; w: number; fill: string; stroke: string; respaldo: string; label?: string; onClick?: () => void; title: string }) {
  const left = x - w / 2, top = y - ALTO / 2;
  return (
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <title>{title}</title>
      {/* respaldo */}
      <rect x={left} y={top} width={w} height={16} rx={7} fill={respaldo} stroke={stroke} strokeWidth="3" />
      {/* cojín */}
      <rect x={left} y={top + 19} width={w} height={ALTO - 19} rx={9} fill={fill} stroke={stroke} strokeWidth="3" />
      {label === "🔒" ? (
        <g transform={`translate(${x} ${top + 19 + (ALTO - 19) / 2})`} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="-8" y="-3" width="16" height="12" rx="3" fill="#fff" stroke="none" />
          <path d="M-5 -3v-4a5 5 0 0 1 10 0v4" />
        </g>
      ) : label ? (
        <text x={x} y={top + 19 + (ALTO - 19) / 2 + 5} textAnchor="middle" fontSize={label.length > 3 ? 11 : 17} fontWeight="800" fill="#fff">{label.length > 7 ? label.slice(0, 6) + "\u2026" : label}</text>
      ) : null}
    </g>
  );
}

export function Carro({ salida, mios, onElegir, mini }: { salida: Salida; mios?: Partial<Record<Puesto, string>>; onElegir?: (p: Puesto) => void; mini?: boolean }) {
  const s = mini ? 0.36 : 1;
  return (
    <svg className={mini ? "carro-mini" : "carro"} viewBox="0 0 220 290" width={220 * s} height={290 * s} aria-label="Puestos del carro">
      {/* carrocería */}
      <rect x="24" y="14" width="172" height="262" rx="46" fill="#F7F8FA" stroke="#C9CFDB" strokeWidth="3" />
      {/* parabrisas y vidrio trasero */}
      <path d="M52 62 Q110 44 168 62 L162 80 L58 80 Z" fill="#DCE4F0" />
      <path d="M58 244 L162 244 L166 256 Q110 268 54 256 Z" fill="#DCE4F0" />
      {/* retrovisores */}
      <rect x="10" y="84" width="16" height="8" rx="3" fill="#C9CFDB" /><rect x="194" y="84" width="16" height="8" rx="3" fill="#C9CFDB" />
      {/* chofer: asiento gris + volante */}
      <Asiento x={74} y={118} w={56} fill="#E4E6EC" stroke="#C9CFDB" respaldo="#D5D9E2" title="Chofer" />
      <circle cx="74" cy="96" r="13" fill="#F7F8FA" stroke="#8B96AD" strokeWidth="4" />
      <circle cx="74" cy="96" r="3.5" fill="#8B96AD" />
      {!mini && <text x="74" y="160" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8B96AD">chofer</text>}
      {PUESTOS.map(({ id, nombre }) => {
        const p = POS[id];
        const ocupado = salida.ocupados[id];
        const mio = mios?.[id];
        const esElegido = mio !== undefined;
        const fill = esElegido ? "#FB5E17" : ocupado ? "#0A274F" : "#FFFFFF";
        const stroke = esElegido ? "#FB5E17" : ocupado ? "#0A274F" : "#C9CFDB";
        const respaldo = esElegido ? "#FF9A66" : ocupado ? "#3A4A6B" : "#EEF1F6";
        return (
          <Asiento key={id} x={p.x} y={p.y} w={p.w} fill={fill} stroke={stroke} respaldo={respaldo}
            label={esElegido ? mio : ocupado ? "🔒" : undefined}
            onClick={!ocupado && onElegir ? () => onElegir(id) : undefined}
            title={nombre + (ocupado ? " · ocupado" : esElegido ? " · tu puesto" : " · libre")} />
        );
      })}
    </svg>
  );
}

// ---------- mapa estilizado Caracas → Valencia ----------
export function Mapa({ parada }: { parada: string }) {
  return (
    <svg className="mapa" viewBox="0 0 390 170" aria-label={`Ruta con parada en ${parada}`}>
      <rect width="390" height="170" rx="12" fill="#EEF2F8" />
      {/* montañas y calles decorativas */}
      <path d="M0 120 Q60 70 120 110 T240 100 T390 90 V170 H0z" fill="#E3E9F3" />
      <path d="M20 40 H120 M60 20 V80 M300 30 H370 M330 10 V60 M180 130 H260 M220 110 V160" stroke="#D5DCE8" strokeWidth="4" strokeLinecap="round" />
      {/* autopista */}
      <path d="M340 45 C280 70 230 120 60 130" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
      <path d="M340 45 C280 70 230 120 60 130" fill="none" stroke="#0A274F" strokeWidth="8" strokeLinecap="round" />
      <path d="M340 45 C280 70 230 120 60 130" fill="none" stroke="#FB5E17" strokeWidth="2" strokeDasharray="10 8" strokeLinecap="round" />
      {/* ciudades */}
      <circle cx="340" cy="45" r="9" fill="#fff" stroke="#0A274F" strokeWidth="4" />
      <text x="340" y="72" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0A274F">CARACAS</text>
      <circle cx="60" cy="130" r="9" fill="#fff" stroke="#0A274F" strokeWidth="4" />
      <text x="60" y="156" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0A274F">VALENCIA</text>
      {/* parada virtual */}
      <g transform="translate(296 66)">
        <path d="M0 0c-9-11-14-16-14-24a14 14 0 0 1 28 0c0 8-5 13-14 24z" fill="#FB5E17" transform="translate(0 6)" />
        <circle cx="0" cy="-18" r="5" fill="#fff" />
        <rect x="-150" y="-56" width="140" height="22" rx="11" fill="#fff" stroke="#FFD2BB" strokeWidth="1.5" />
        <text x="-80" y="-41" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0A274F">Parada · {parada}</text>
      </g>
    </svg>
  );
}

// ---------- foto de equipaje (dibujo, de mentira) ----------
export function FotoMaleta() {
  return <img src="./foto-maleta.jpg" alt="Foto del equipaje" />;
}

export function Estrellas({ n }: { n: number }) {
  return <span className="estrella" style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><span style={{ width: 16, height: 16, display: "inline-block" }}><Ic.estrella /></span>{n.toFixed(1)}</span>;
}

// ---------- mapa vivo: el carrito se mueve por la autopista ----------
// La autopista es la curva M340 45 C280 70 230 120 60 130 (de Caracas a Valencia).
function puntoRuta(t: number) {
  const P = [[340, 45], [280, 70], [230, 120], [60, 130]];
  const u = 1 - t;
  const x = u * u * u * P[0][0] + 3 * u * u * t * P[1][0] + 3 * u * t * t * P[2][0] + t * t * t * P[3][0];
  const y = u * u * u * P[0][1] + 3 * u * u * t * P[1][1] + 3 * u * t * t * P[2][1] + t * t * t * P[3][1];
  return [x, y];
}
export function MapaVivo({ parada, fase, progreso }: { parada: string; fase: string; progreso: number }) {
  // en "camino" el carro se acerca a la parada desde el este; en "ruta" recorre la autopista
  let carro: [number, number] | null = null;
  if (fase === "camino") carro = [370, 20];
  if (fase === "parada") carro = [300, 60];
  if (fase === "ruta" || fase === "llegaste") { const [x, y] = puntoRuta(0.08 + progreso * 0.92); carro = [x, y]; }
  return (
    <svg className="mapa" viewBox="0 0 390 170" aria-label={`Viaje con parada en ${parada}`}>
      <rect width="390" height="170" rx="12" fill="#EEF2F8" />
      <path d="M0 120 Q60 70 120 110 T240 100 T390 90 V170 H0z" fill="#E3E9F3" />
      <path d="M20 40 H120 M60 20 V80 M300 30 H370 M330 10 V60 M180 130 H260 M220 110 V160" stroke="#D5DCE8" strokeWidth="4" strokeLinecap="round" />
      <path d="M340 45 C280 70 230 120 60 130" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
      <path d="M340 45 C280 70 230 120 60 130" fill="none" stroke="#0A274F" strokeWidth="8" strokeLinecap="round" />
      <path d="M340 45 C280 70 230 120 60 130" fill="none" stroke="#FB5E17" strokeWidth="2" strokeDasharray="10 8" strokeLinecap="round" />
      <circle cx="340" cy="45" r="9" fill="#fff" stroke="#0A274F" strokeWidth="4" />
      <text x="340" y="72" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0A274F">CARACAS</text>
      <circle cx="60" cy="130" r="9" fill="#fff" stroke="#0A274F" strokeWidth="4" />
      <text x="60" y="156" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0A274F">VALENCIA</text>
      <g transform="translate(296 66)">
        {fase === "parada" && <circle cx="0" cy="-12" r="22" fill="#FB5E17" opacity=".18"><animate attributeName="r" values="14;30;14" dur="1.6s" repeatCount="indefinite" /></circle>}
        <path d="M0 0c-9-11-14-16-14-24a14 14 0 0 1 28 0c0 8-5 13-14 24z" fill="#FB5E17" transform="translate(0 6)" />
        <circle cx="0" cy="-18" r="5" fill="#fff" />
      </g>
      {carro && (
        <g transform={`translate(${carro[0]} ${carro[1]})`}>
          <circle r="22" fill="#0A274F" opacity=".12" />
          <circle r="15" fill="#0A274F" stroke="#fff" strokeWidth="3" />
          <g transform="translate(-10 -10) scale(0.85)" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17h14M6 17l1.5-6h9L18 17M6 11l-2 2v4h2M18 11l2 2v4h-2" /><circle cx="8" cy="17" r="1.5" fill="#fff" /><circle cx="16" cy="17" r="1.5" fill="#fff" />
          </g>
        </g>
      )}
    </svg>
  );
}

// ---------- deslizar para confirmar (como en las apps de choferes) ----------
import { useRef, useState } from "react";
export function Deslizar({ texto, onListo, disabled }: { texto: string; onListo: () => void; disabled?: boolean }) {
  const pista = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [arrastra, setArrastra] = useState(false);
  const ancho = () => (pista.current ? pista.current.clientWidth - 64 : 200);
  const mover = (cx: number) => { if (!pista.current) return; const r = pista.current.getBoundingClientRect(); setX(Math.max(0, Math.min(ancho(), cx - r.left - 32))); };
  const soltar = () => { if (!arrastra) return; setArrastra(false); if (x > ancho() * 0.8) { setX(ancho()); setTimeout(() => { onListo(); setX(0); }, 150); } else setX(0); };
  return (
    <div ref={pista} className={"deslizar" + (disabled ? " off" : "")}
      onPointerMove={(e) => arrastra && mover(e.clientX)} onPointerUp={soltar} onPointerLeave={soltar}>
      <span className="pista-texto" style={{ opacity: 1 - x / Math.max(1, ancho()) }}>{texto}</span>
      <div className="relleno" style={{ width: x + 64 }} />
      <button className="perilla-d" style={{ transform: `translateX(${x}px)` }} disabled={disabled}
        onPointerDown={(e) => { if (disabled) return; setArrastra(true); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onClick={() => { if (!disabled && x === 0) { /* toque simple: pista */ } }} aria-label={texto}>
        <Ic.derecha />
      </button>
    </div>
  );
}
