# Flujo con 2 puestos (tú + acompañante) en la salida de Luis M.
import asyncio
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        await pg.goto(BASE + "/#/inicio"); await pg.evaluate("localStorage.setItem('xpuesto.sesion', JSON.stringify({nombre:'Raúl Rodríguez',correo:'raul@xpuesto.app',telefono:'0414-5551234',cedula:'V-14.523.998',rol:'pasajero',puntos:140,referido:'XP-RAUL188',choferEstado:'aprobado'}))"); await pg.reload(); await pg.wait_for_selector("text=Buscar salidas")
        await pg.add_style_tag(content=".pie{position:static !important}")
        await pg.click("text=Buscar salidas"); await pg.click("text=Luis M. >> nth=0"); await pg.wait_for_selector("text=Elige tus puestos")
        # asientos: [0]=chofer, [1]=copiloto (ocupado D), [2]=tras-izq, [3]=tras-centro, [4]=tras-der
        await pg.evaluate("document.querySelectorAll('.carro g')[3].dispatchEvent(new MouseEvent('click',{bubbles:true}))")
        await pg.evaluate("document.querySelectorAll('.carro g')[4].dispatchEvent(new MouseEvent('click',{bubbles:true}))")
        await pg.wait_for_selector("input[placeholder='Acompañante 1']")
        await pg.fill("input[placeholder='Acompañante 1']", "Mamá")
        await pg.wait_for_timeout(400)
        await pg.screenshot(path="capturas/sesion-1/3b-dos-puestos.png", full_page=True)
        await pg.click("text=Seguir con 2 puestos"); await pg.click("text=Bolso de mano"); await pg.click("text=Revisar mi reserva")
        await pg.wait_for_selector("text=¿Cómo pagas?"); await pg.wait_for_timeout(300)
        await pg.screenshot(path="capturas/sesion-1/5b-confirmar-dos.png", full_page=True)
        await pg.click("text=Confirmar reserva"); await pg.wait_for_selector("text=puestos apartados"); await pg.wait_for_timeout(800)
        await pg.screenshot(path="capturas/sesion-1/6b-listo-dos.png", full_page=True)
        await b.close()
        print("ok")
asyncio.run(main())
