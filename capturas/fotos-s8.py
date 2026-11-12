# Sesión 8: mapa real y tarifa calculada (chofer publica, pasajero ve la ruta).
import asyncio, os, re
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
OUT = "capturas/sesion-8"
os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(BASE + "/#/inicio")
        await pg.evaluate("localStorage.setItem('xpuesto.sesion', JSON.stringify({nombre:'Raúl Rodríguez',correo:'raul@xpuesto.app',telefono:'0414-5551234',cedula:'V-14.523.998',rol:'chofer',puntos:140,referido:'XP-RAUL188',choferEstado:'aprobado',nivel:'Impulso',permisos:{ubicacion:true,fotos:true,contactos:true,avisos:true}}))")
        await pg.goto(BASE + "/#/conductor"); await pg.reload(); await pg.wait_for_selector("text=Hola, Raúl")
        await pg.add_style_tag(content=".pie{position:static !important} .tabs{position:static !important}")
        await pg.click("text=+ Publicar un horario"); await pg.wait_for_selector("text=Publicar una salida")
        await pg.wait_for_selector("text=km por carretera", timeout=40000); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f"{OUT}/1-publicar-ruta-tarifa.png", full_page=True); print("foto 1")
        txt = await pg.inner_text(".hoja")
        print("Valencia:", re.findall(r"(\d+(?:\.\d+)?)\s*\n?km por carretera", txt), re.findall(r"Por puesto\s*\n\$(\d+)", txt))
        await pg.fill("input[placeholder='Ciudad o sitio'] >> nth=1", "Maracay"); await pg.click("text=Calcular ruta y tarifa"); await pg.wait_for_timeout(5000)
        txt = await pg.inner_text(".hoja"); print("Maracay:", re.findall(r"(\d+(?:\.\d+)?)\s*\n?km por carretera", txt), re.findall(r"Por puesto\s*\n\$(\d+)", txt))
        await pg.screenshot(path=f"{OUT}/2-publicar-maracay.png", full_page=True); print("foto 2")
        await pg.click("button:has-text('Publicar salida')"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f"{OUT}/3-hoy-con-salida-nueva.png", full_page=True); print("foto 3")
        await pg.evaluate("(function(){var u=JSON.parse(localStorage.getItem('xpuesto.sesion'));u.rol='pasajero';localStorage.setItem('xpuesto.sesion',JSON.stringify(u));})()")
        await pg.goto(BASE + "/#/inicio"); await pg.reload(); await pg.wait_for_selector("text=Buscar salidas"); await pg.add_style_tag(content=".pie{position:static !important}")
        await pg.click("text=Buscar salidas"); await pg.click("text=José R. >> nth=0"); await pg.wait_for_selector("text=km por carretera", timeout=40000); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f"{OUT}/4-detalle-mapa-real.png", full_page=True); print("foto 4")
        print("errores:", [e for e in errs if "tile" not in e.lower()] or "ninguno")
        await b.close()
asyncio.run(main())
