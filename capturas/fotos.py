# Recorre el flujo del pasajero a 390x844 (iPhone) y guarda una foto por pantalla.
import asyncio, sys
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
OUT = "capturas/sesion-1"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        async def foto(n):
            await pg.wait_for_timeout(600)
            await pg.screenshot(path=f"{OUT}/{n}.png", full_page=True)
            print("foto", n)
        await pg.goto(BASE + "/#/inicio"); await pg.evaluate("localStorage.setItem('xpuesto.sesion', JSON.stringify({nombre:'Raúl Rodríguez',correo:'raul@xpuesto.app',telefono:'0414-5551234',cedula:'V-14.523.998',rol:'pasajero',puntos:140,referido:'XP-RAUL188',choferEstado:'aprobado'}))"); await pg.reload(); await pg.wait_for_selector("text=Buscar salidas"); await pg.add_style_tag(content=".pie{position:static !important}"); await foto("1-inicio")
        await pg.click("text=Buscar salidas"); await pg.wait_for_selector("text=Salidas disponibles"); await foto("2-salidas")
        await pg.click("text=José R. >> nth=0"); await pg.wait_for_selector("text=Elige tus puestos"); await foto("3-detalle-sin-puesto")
        await pg.evaluate("document.querySelectorAll('.carro g')[1].dispatchEvent(new MouseEvent('click',{bubbles:true}))"); await foto("3-detalle-puesto-elegido")
        await pg.click("text=Seguir con"); await pg.wait_for_selector("text=¿Qué llevas?"); await foto("4-equipaje")
        await pg.click("text=Maleta grande"); await pg.click("text=Tomar la foto"); await foto("4-equipaje-con-foto")
        await pg.click("text=Revisar mi reserva"); await pg.wait_for_selector("text=¿Cómo pagas?"); await foto("5-confirmar")
        await pg.click("text=Confirmar reserva"); await pg.wait_for_selector("text=¡Puesto apartado!"); await pg.wait_for_timeout(800); await foto("6-listo")
        await b.close()
asyncio.run(main())
