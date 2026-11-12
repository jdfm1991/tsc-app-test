# Sesión 2: mi viaje, chat, calificar y la app del conductor.
import asyncio, os
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
OUT = "capturas/sesion-2"
os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        errores = []
        pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
        pg.on("pageerror", lambda e: errores.append(str(e)))
        async def foto(n):
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f"{OUT}/{n}.png", full_page=True); print("foto", n)
        # ---- pasajero: hasta "listo" y luego "Ver mi viaje"
        await pg.goto(BASE + "/#/inicio"); await pg.evaluate("localStorage.setItem('xpuesto.sesion', JSON.stringify({nombre:'Raúl Rodríguez',correo:'raul@xpuesto.app',telefono:'0414-5551234',cedula:'V-14.523.998',rol:'pasajero',puntos:140,referido:'XP-RAUL188',choferEstado:'aprobado'}))"); await pg.reload(); await pg.wait_for_selector("text=Buscar salidas")
        await pg.add_style_tag(content=".pie{position:static !important} .flotantes{position:static !important} .tabs{position:static !important}")
        await pg.click("text=Buscar salidas"); await pg.click("text=José R. >> nth=0"); await pg.wait_for_selector("text=Elige tus puestos")
        await pg.evaluate("document.querySelectorAll('.carro g')[1].dispatchEvent(new MouseEvent('click',{bubbles:true}))")
        await pg.click("text=Seguir con"); await pg.click("text=Bolso de mano"); await pg.click("text=Revisar mi reserva")
        await pg.click("text=Confirmar reserva"); await pg.wait_for_selector("text=Ver mi viaje"); await pg.click("text=Ver mi viaje")
        await pg.wait_for_selector("text=Falta 1 puesto"); await foto("1-viaje-llenando")
        await pg.wait_for_timeout(5200); await foto("2-viaje-se-sumo")  # se sumó alguien
        await pg.wait_for_selector("text=¡Carro lleno!", timeout=8000); await foto("3-viaje-lleno")
        await pg.wait_for_selector("text=El chofer va en camino", timeout=8000); await foto("4-viaje-camino")
        await pg.wait_for_selector("text=El chofer está en la parada", timeout=10000); await foto("5-viaje-parada")
        await pg.click("text=Chat"); await pg.wait_for_selector(".burbujas"); await pg.fill("input[name=t]", "Voy llegando, dame 3 minutos"); await pg.press("input[name=t]", "Enter"); await pg.wait_for_timeout(2000); await foto("6-chat")
        await pg.click(".hoja .atras")
        await pg.wait_for_selector("text=En ruta a Valencia", timeout=12000); await pg.wait_for_timeout(4000); await foto("7-viaje-en-ruta")
        await pg.click("text=SOS"); await pg.wait_for_selector("text=Emergencia"); await foto("8-sos"); await pg.click("text=Fue un error")
        await pg.wait_for_selector("text=¡Llegaste!", timeout=20000); await foto("9-llegaste")
        await pg.click("text=Calificar a"); await pg.wait_for_selector(".estrellas-grandes"); await pg.click(".estrellas-grandes button >> nth=4"); await pg.click("text=Puntual"); await pg.click("text=Cuidó el equipaje"); await foto("10-calificar")
        await pg.click("text=Enviar calificación"); await pg.wait_for_selector("text=¡Gracias!"); await foto("11-gracias")
        # ---- conductor
        await pg.goto(BASE + "/#/conductor"); await pg.wait_for_selector("text=Hola, José"); await foto("12-chofer-hoy")
        await pg.click("text=+ Publicar un horario"); await pg.wait_for_selector("text=Publicar horario"); await foto("13-chofer-publicar"); await pg.click(".hoja .btn")
        await pg.goto(BASE + "/#/conductor/bolsa"); await pg.wait_for_selector("text=Rutas llenas sin chofer"); await foto("14-chofer-bolsa")
        await pg.click("text=Tomar esta ruta >> nth=0"); await pg.wait_for_timeout(3000); await foto("15-chofer-bolsa-tomada")
        await pg.goto(BASE + "/#/conductor/salida"); await pg.wait_for_selector("text=Salida en 40 min"); await foto("16-chofer-salida-antes")
        await pg.click("text=Voy en camino"); await pg.click("text=Ya llegué a la parada"); await pg.wait_for_selector("text=Foto del maletero")
        await pg.click("text=Tomar la foto")
        for i in range(3): await pg.click("text=Abordó >> nth=0"); await pg.wait_for_timeout(150)
        await foto("17-chofer-en-parada")
        await pg.click("text=Iniciar viaje"); await pg.wait_for_timeout(9500); await pg.click("text=Finalizar viaje"); await pg.wait_for_selector("text=Viaje terminado"); await foto("18-chofer-liquidacion")
        await pg.click("text=Cobrar"); await pg.wait_for_selector("text=Saldo disponible"); await foto("19-chofer-billetera")
        await b.close()
        print("errores de consola:", errores if errores else "ninguno")
asyncio.run(main())
