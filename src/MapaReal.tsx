// Mapa real con Leaflet + OpenStreetMap. Dibuja la ruta y los puntos. Sin imágenes externas: marcadores de círculo.
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Punto, Ruta } from "./mapa";

export function MapaReal({ origen, destino, parada, ruta, carro, alto = 200 }: { origen?: Punto | null; destino?: Punto | null; parada?: Punto | null; ruta?: Ruta | null; carro?: [number, number] | null; alto?: number }) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<L.Map | null>(null);
  const capa = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!caja.current || mapa.current) return;
    mapa.current = L.map(caja.current, { zoomControl: false, attributionControl: true, dragging: true, scrollWheelZoom: false }).setView([10.3, -67.4], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(mapa.current);
    capa.current = L.layerGroup().addTo(mapa.current);
    return () => { mapa.current?.remove(); mapa.current = null; };
  }, []);

  useEffect(() => {
    const m = mapa.current, c = capa.current;
    if (!m || !c) return;
    c.clearLayers();
    const puntos: [number, number][] = [];
    const pin = (p: Punto, color: string, r = 8) => { L.circleMarker([p.lat, p.lon], { radius: r, color: "#fff", weight: 3, fillColor: color, fillOpacity: 1 }).addTo(c).bindTooltip(p.nombre, { direction: "top", offset: [0, -8] }); puntos.push([p.lat, p.lon]); };
    if (ruta) { L.polyline(ruta.linea, { color: "#0A274F", weight: 6, opacity: .9 }).addTo(c); L.polyline(ruta.linea, { color: "#FB5E17", weight: 2, dashArray: "8 8" }).addTo(c); ruta.linea.forEach((x) => puntos.push(x)); }
    if (origen) pin(origen, "#0A274F");
    if (destino) pin(destino, "#0A274F");
    if (parada) pin(parada, "#FB5E17", 9);
    if (carro) { L.circleMarker(carro, { radius: 11, color: "#fff", weight: 3, fillColor: "#0A274F", fillOpacity: 1 }).addTo(c); L.circleMarker(carro, { radius: 18, color: "#0A274F", weight: 0, fillColor: "#0A274F", fillOpacity: .15 }).addTo(c); }
    if (puntos.length > 1) m.fitBounds(L.latLngBounds(puntos), { padding: [24, 24] });
    else if (puntos.length === 1) m.setView(puntos[0], 13);
    setTimeout(() => m.invalidateSize(), 50);
  }, [origen, destino, parada, ruta, carro]);

  return <div ref={caja} className="mapa-real" style={{ height: alto }} />;
}
