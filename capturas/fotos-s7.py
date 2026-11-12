# Sesión 7: correcciones de Raúl al registro (clave ×2 con ojito, estado/ciudad, municipio/parroquia, Pago Móvil, carnet primero, modelos, 4 fotos, sede con datos, 8 preguntas).
import asyncio, os
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
OUT = "capturas/sesion-7"
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
        await pg.goto(BASE + "/#/inicio"); await pg.evaluate("localStorage.clear()"); await pg.reload()
        await pg.wait_for_selector("text=¿Cómo entras hoy?")
        await pg.add_style_tag(content=".pie{position:static !important} .tabs{position:static !important}")
        await pg.click("text=Crear cuenta"); await pg.fill("input[placeholder='Como en tu cédula']", "Raúl Rodríguez")
        await pg.fill("input[type=email]", "raul@xpuesto.app")
        await pg.fill("input[placeholder='Mínimo 4 caracteres']", "clave123"); await pg.fill("input[placeholder='La misma otra vez']", "clave12")
        await foto("1-claves-distintas")
        await pg.fill("input[placeholder='La misma otra vez']", "clave123"); await pg.click("button[aria-label='Ver clave'] >> nth=0")
        await pg.fill("input[placeholder='V-12345678']", "V-14.523.998"); await pg.fill("input[placeholder='0414-1234567']", "0414-5551234")
        await pg.select_option("label:has-text('Género') select", "Masculino"); await pg.select_option("label:has-text('Estado') select", "Miranda"); await pg.select_option("label:has-text('Ciudad') select", "Guarenas")
        await foto("2-crear-cuenta-ojo-estado-ciudad")
        await pg.click("text=Crear mi cuenta de pasajero"); await pg.wait_for_selector("text=Permisos de la app"); await pg.click("text=Permitir todo"); await pg.click("text=Listo, seguir"); await pg.wait_for_selector("text=¿Pa' dónde vas, Raúl?")
        await pg.goto(BASE + "/#/perfil"); await pg.click("text=Quiero manejar con XPuesto"); await pg.wait_for_selector("text=Registro de chofer")
        # paso 0
        await pg.fill("label:has-text('Apellido') input", "Rodríguez"); await pg.fill("label:has-text('Nacimiento') input", "1988-05-12"); await pg.select_option("label:has-text('Género') select", "Masculino")
        await pg.select_option("label:has-text('Municipio') select", "Plaza"); await pg.select_option("label:has-text('Parroquia') select", "Guarenas")
        await pg.click("text=Pago Móvil"); await pg.select_option("label:has-text('Banco') select", "Mercantil"); await pg.fill("label:has-text('Teléfono del Pago Móvil') input", "0414-5551234")
        await foto("3-datos-municipio-parroquia-pagomovil"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Documentos")
        # paso 1
        await pg.click("text=Tu foto, fondo blanco")
        for inp in await pg.query_selector_all("input[type=date]"): await inp.fill("2028-05-05")
        for i in range(3): await pg.click(".doc-bloque .doc-fila:not(.ok) >> nth=0"); await pg.wait_for_timeout(120)
        await foto("4-documentos-sin-cedula-repetida"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Tu carro")
        # paso 2: carnet primero
        await foto("5-carro-antes-del-carnet"); await pg.click("button:has-text(\"Foto del carnet\")"); await pg.wait_for_selector("text=Datos leídos del carnet")
        await pg.select_option("label:has-text('Caja') select", "Sincrónico"); await pg.select_option("label:has-text('Capacidad de peso') select", "Hasta 450 kg")
        await foto("6-carro-leido-del-carnet"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Fotos del carro")
        # paso 3: 4 fotos
        for i in range(4): await pg.click(".foto-carro:not(.ok) >> nth=0"); await pg.wait_for_timeout(100)
        await foto("7-cuatro-fotos"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Inspección presencial y entrevista")
        # paso 4: sede + 8 preguntas
        await pg.select_option("label:has-text('Sede') select", "Caracas · La Castellana"); await pg.click("text=Jue 24 · 9:00 am")
        resp = ["No. Si tomo, no manejo. Aviso que no puedo salir ese día.",
                "Me quedo tranquilo, le explico que es la tranca y busco una vía alterna.",
                "Me bajo, le cargo la maleta y la acomodo en el maletero.",
                "Lo escucho, le pido disculpas si es culpa mía y lo reporto en la app.",
                "Le digo que no, que todo se paga por la app para que los dos estemos cubiertos.",
                "Le escribo de una, le digo cuánto me falta y le pido disculpas por la tardanza.",
                "Le explico que la ruta es fija y que lo dejo en la parada; si es urgente lo consulto con los demás.",
                "Lo guardo, aviso a soporte por la app y se lo devuelvo en la próxima parada."]
        areas = await pg.query_selector_all("textarea")
        for a, t in zip(areas, resp): await a.fill(t)
        await pg.click("text=Evaluar mis respuestas"); await pg.wait_for_selector("text=Aprobada"); await foto("8-sede-y-8-preguntas-aprobada")
        # una respuesta mala para ver la marca
        await areas[4].fill("Claro que sí, mejor para mí, así me queda más plata."); await pg.click("text=Evaluar mis respuestas"); await pg.wait_for_selector("text=Corrige las marcadas"); await foto("9-respuesta-marcada")
        await areas[4].fill(resp[4]); await pg.click("text=Evaluar mis respuestas"); await pg.wait_for_selector("text=Aprobada")
        await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Inducción"); await pg.click(".video"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Activar tu cuenta")
        await pg.fill("input[type=date]", "2027-10-30"); await pg.click(".perilla.grande"); await pg.click("text=Enviar mi registro"); await pg.wait_for_selector("text=En revisión"); await foto("10-en-revision")
        await b.close()
        print("errores de consola:", errores if errores else "ninguno")
asyncio.run(main())
