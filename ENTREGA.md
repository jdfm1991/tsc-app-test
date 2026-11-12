# XPuesto · Entrega técnica

Prototipo funcional de XPuesto: app de carros por puesto interurbanos en Venezuela. Tres caras en una sola app web: **Pasajero**, **Chofer** y **Backoffice**. Este documento es para quien siga el desarrollo.

- En línea: https://xpuesto.replit.app (Replit, sitio estático)
- Repo: https://github.com/raulrodriguez-coko/xpuesto (privado)
- Deck para inversionistas: `deck/XPuesto-deck.pdf` (se regenera desde `deck/deck.html`)
- Informe maestro del negocio: lo tiene Raúl en PDF (`xpuesto_informe_maestro_ecosistema_apps.pdf`)

---

## 1. Qué es esto y qué NO es

Es un **prototipo de producto**: todas las pantallas, flujos y reglas del negocio están hechas y se pueden recorrer en un teléfono. **No tiene servidor.** Nada se guarda fuera del teléfono del que lo usa, nadie cobra de verdad y un teléfono no ve lo que hace otro.

| Funciona de verdad | Simulado (datos de mentira o reloj) |
|---|---|
| Toda la interfaz y navegación | Las salidas, choferes y pasajeros de ejemplo (`src/data.ts`) |
| Cuenta y perfil guardados en el teléfono (`localStorage`) | Pagos, billetera, saldos, liquidaciones |
| Mapa real y ruta por carretera (OpenStreetMap + OSRM) | «Faltan N puestos» y el viaje en vivo avanzan solos con relojes |
| Tarifa calculada por kilómetros | Lectura del carnet de circulación (OCR) y fotos: se marcan como tomadas |
| Evaluación de la entrevista del chofer (palabras clave) | Aprobación del chofer («Simular aprobación») |
| Instalable como app (PWA: manifest + service worker) | El backoffice: números fijos y un chofer «registrado» que viene del teléfono |

---

## 2. Stack y cómo correrlo

- **Vite + React 19 + TypeScript**, sin librerías de UI. CSS propio en `src/styles.css`.
- **Leaflet** para el mapa (única dependencia extra).
- Node 22, npm.

```bash
npm install
npm run dev -- --port 5180 --host     # desarrollo, abre http://localhost:5180
npm run build                          # produce dist/
```

Rutas por hash (`#/inicio`, `#/conductor`, `#/admin`), para que funcione en cualquier hosting estático. `base: './'` en Vite por la misma razón.

### Publicar en Replit
El repo trae `.replit` con `deploymentTarget = "static"`, `build = npm run build`, `publicDir = dist`. Flujo actual: push a `main` → en la Shell de Replit `git fetch origin && git reset --hard origin/main` → botón **Publish**. Ojo: Replit a veces hace un commit propio; por eso el `reset --hard`, no `pull`.

---

## 3. Mapa del código (`src/`)

| Archivo | Qué hace |
|---|---|
| `App.tsx` | Ruteo por hash, estado de la reserva, y las pantallas del pasajero: Inicio, Salidas, Detalle (puestos), Equipaje, Confirmar, Listo. |
| `viaje.tsx` | «Mi viaje» (llenando → lleno → chofer en camino → en la parada → en ruta → llegaste), SOS, chat, Calificar. `Hoja` = panel deslizante reutilizable. |
| `conductor.tsx` | App del chofer: Hoy (salidas, publicar), Bolsa de trabajo, Salida activa (deslizar, abordados, foto del maletero, validar efectivo, calificar pasajeros, liquidación), Billetera. |
| `cuenta.tsx` | Entrada (pasajero/chofer, correo+clave, invitado), Permisos, Perfil del pasajero, **Registro del chofer en 7 pasos**, Estado del registro, Perfil del chofer. |
| `admin.tsx` | Backoffice: Mapa nacional en vivo (SVG de Venezuela), Choferes y su ficha, Central SOS, Caja. |
| `publicar.tsx` | Publicar una salida con ruta real y tarifa (`PublicarSalida`), y el mapa de la ruta para el pasajero (`MapaRuta`). |
| `mapa.ts` | Geocodificación (Nominatim), ruta (OSRM), coordenadas de ciudades y paradas (`LUGARES`), **fórmula de tarifa** (`TARIFA`, `tarifaPorPuesto`). |
| `MapaReal.tsx` | Componente Leaflet: ruta, puntos, carrito. |
| `sesion.ts` | Tipos `Usuario` y `RegistroChofer`, sesión en `localStorage`, niveles y comisión (`COMISION_POR_NIVEL`), preguntas de la entrevista y su evaluación. |
| `data.ts` | Datos de ejemplo: salidas, puestos, equipajes, ciudades, tasa Bs. |
| `venezuela.ts` | 24 estados, municipios y parroquias para elegir; ciudades por estado. |
| `modelos.ts` | Modelos por marca, años, pesos y sedes de inspección (dirección, teléfono, mapa). |
| `ui.tsx` | Iconos, cabecera, el carro con los 4 puestos (SVG), mapa estilizado de respaldo, deslizar para confirmar. |

Otras carpetas: `public/` (logo, iconos, retratos de choferes, foto de maleta, manifest, `sw.js`), `deck/` (deck HTML → PDF con `python3 deck/render.py`, prompts para videos en `prompts-veo.md`), `capturas/` (scripts Playwright que recorren cada flujo y sacan fotos; sirven como pruebas de humo).

---

## 4. Reglas del negocio ya decididas (no cambiarlas sin hablar con Raúl)

- **Carro por puesto interurbano**, no taxi urbano. 4 puestos: copiloto, trasero izquierdo, centro, derecho. Cada puesto se vende por separado; el que aparta un puesto se lo queda. Los puestos de otros se ven con candado, sin nombre.
- Un pasajero puede apartar varios puestos y ponerles nombre, o marcar «viaja otra persona» con nombre y teléfono.
- **«Faltan N puestos»**: el pasajero decide esperar, comprar los que faltan o compartir el costo.
- **Equipaje** A/B/C/D con foto del pasajero al reservar y foto del chofer al cerrar el maletero.
- **Paradas virtuales** en comercios (Sambil, Tolón, PDV, Farmatodo, Big Low, Metrópolis). Sin terminales.
- **Pago**: billetera, Pago Móvil o efectivo al chofer. En efectivo, el chofer valida el billete; el vuelto se abona a la billetera del pasajero y sale de un fondo de $30 que la app presta al chofer (si lo agota, sólo recibe prepagados).
- **Tarifa**: `$2 base + $0,27/km`, entre 4 puestos, mínimo $3 → Caracas–Valencia ≈ $12. El chofer puede moverla ±$2. Los dos números van en `src/mapa.ts` y deben pasar al backoffice.
- **Niveles del chofer** y comisión de XPuesto: Evaluación 20 %, Impulso 15 %, Líder 10 %. La ganancia neta se muestra antes de tomar una ruta.
- **Pagos al chofer** lunes, miércoles y viernes, en Bs a tasa BCV, por Pago Móvil o cuenta.
- **Registro del chofer** (7 pasos): datos con estado/municipio/parroquia y forma de cobro → foto fondo blanco + cédula, licencia y certificado médico con vencimiento y foto → carro leído del carnet de circulación (marca, modelo, año ≥ 2005, color, placa, caja, peso) → 4 fotos del carro → sede e inspección presencial + entrevista de 8 preguntas (mínimo 76 %; una respuesta que delate mal chofer tumba la nota) → video de inducción → RCV vigente + afiliación gratis + 3 etiquetas. Queda «En revisión» hasta que el backoffice aprueba.
- **Calificación** en los dos sentidos, 1 a 5: muy malo, malo, bueno, muy bueno, excelente.
- Entrada por **correo y clave** por ahora; después, teléfono + SMS.
- Diseño: dirección «B» (blanco, navy `#0A274F`, naranja `#FB5E17` sólo para precio, puestos y acciones), fuente Inter, cuerpo peso 500. Todo probado a 390 px de ancho primero.

---

## 5. Lo que sigue (en orden)

1. **Servidor y base de datos** para que un teléfono vea lo que hace otro: salidas publicadas por choferes, reservas, estado del viaje, usuarios. Propuesta pendiente: Supabase (Postgres + auth + realtime, gratis para empezar). Tablas mínimas: `usuarios`, `choferes`, `salidas`, `reservas`, `viajes`, `pagos`.
2. **Autenticación real** (correo+clave ahora, SMS después) y perfiles persistentes.
3. **Pagos**: Pago Móvil con conciliación automática (Raúl ya tiene esto resuelto en otro producto en producción y puede compartir la pieza), billetera y liquidaciones.
4. **GPS real** del chofer durante el viaje y notificaciones push (se llenó, va en camino, llegó).
5. **OCR del carnet** y validación de documentos; fotos guardadas en un storage.
6. **Backoffice conectado**: aprobar choferes, ver viajes y alertas de verdad, editar la tarifa y los niveles.
7. Mapas: Nominatim y OSRM públicos son servidores demo; para producción, proveedor propio (Mapbox, Google, o un OSRM propio).

---

## 6. Cómo probar rápido

En el teléfono o en el navegador a 390 px:

1. Crear cuenta como pasajero → permisos → Buscar salidas → José R. → ♥ → elegir puesto → equipaje → efectivo → confirmar → **Ver mi viaje** (la flecha › arriba a la derecha adelanta la simulación).
2. Mi perfil → «Quiero manejar con XPuesto» → los 7 pasos → Enviar → **Simular aprobación (demo)** → app del chofer.
3. Hoy → «+ Publicar un horario» (calcula ruta y tarifa reales) → «Ir a esta salida» → deslizar, abordados, validar efectivo, foto, deslizar, calificar, cobrar.
4. `#/admin` para el backoffice (sin cuenta).

Scripts automáticos (Playwright, Python 3): `capturas/fotos*.py` con el servidor en 5180. Cada uno imprime «errores de consola: ninguno» si todo está bien.

---

## 7. Material que acompaña

- Logo original y variantes: `public/logo-mark.png`, `logo-blanco.png`, `logo-full.png`, `icono-*.png`.
- Deck: `deck/XPuesto-deck.pdf` + láminas PNG en `deck/laminas/`. Faltan por llenar: monto, equipo y contacto (lámina 12).
- Prompts para videos con IA: `deck/prompts-veo.md`.
- Documentos de referencia de Raúl: «Aplicación de Usuario.docx» y «Aplicación de Conductor.docx» (describen flujos tipo Ridery; se usaron como referencia de detalle, no como producto).
