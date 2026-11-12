# Sesión 5: entrada, cuenta, perfil del pasajero, registro y perfil del chofer, y el nuevo en el backoffice.
import asyncio, os
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
OUT = "capturas/sesion-5"
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
        await pg.add_style_tag(content=".pie{position:static !important} .tabs{position:static !important} .admin-nav{position:static !important; height:auto !important}")
        await foto("1-entrada")
        await pg.click("text=Crear cuenta"); await pg.fill("input[placeholder='Como en tu cédula']", "Raúl Rodríguez")
        await pg.fill("input[type=email]", "raul@xpuesto.app"); await pg.fill("input[type=password]", "1234")
        await pg.fill("input[placeholder='V-12345678']", "V-14.523.998"); await pg.fill("input[placeholder='0414-1234567']", "0414-5551234")
        await foto("2-crear-cuenta")
        await pg.click("text=Crear mi cuenta de pasajero"); await pg.wait_for_selector("text=¿Pa' dónde vas, Raúl?"); await foto("3-inicio-con-nombre")
        await pg.click("button[aria-label='Mi perfil']"); await pg.wait_for_selector("text=Mi perfil"); await foto("4-perfil")
        await pg.click("button[aria-label='Editar']"); await pg.wait_for_selector("text=Editar mis datos"); await foto("5-editar"); await pg.click(".hoja .atras")
        # registro de chofer
        await pg.click("text=Quiero manejar con XPuesto"); await pg.wait_for_selector("text=Registro de chofer"); await foto("6-chofer-datos")
        await pg.fill("label:has-text('Apellido') input", "Rodríguez")
        await pg.select_option("label:has-text('Género') select", "Masculino"); await pg.select_option("label:has-text('Banco') select", "Mercantil")
        await pg.fill("input[placeholder='0105-0000-00-0000000000']", "0105-0123-45-1234567890")
        await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Documentos")
        for i in range(5): await pg.click(".doc-fila:not(.ok) >> nth=0"); await pg.wait_for_timeout(150)
        await foto("7-chofer-documentos"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Tu carro")
        await pg.select_option("label:has-text('Marca') select", "Toyota"); await pg.fill("input[placeholder='Corolla']", "Corolla")
        await pg.select_option("label:has-text('Año') select", "2019"); await pg.select_option("label:has-text('Color') select", "Azul"); await pg.fill("input[placeholder='AB123CD']", "AB123CD")
        for i in range(4): await pg.click(".foto-carro:not(.ok) >> nth=0"); await pg.wait_for_timeout(150)
        await foto("8-chofer-carro"); await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Inspección y entrevista")
        await pg.select_option("label:has-text('Sede') select", "Caracas · La Castellana"); await pg.click("text=Jue 24 · 9:00 am"); await foto("9-chofer-inspeccion")
        await pg.click("text=Siguiente"); await pg.wait_for_selector("text=Membresía y kit"); await pg.click(".perilla.grande"); await foto("10-chofer-membresia")
        await pg.click("text=Enviar mi registro"); await pg.wait_for_selector("text=En revisión"); await foto("11-chofer-en-revision")
        await pg.click("button:has-text(\"Simular aprobación\")"); await pg.wait_for_selector("text=¡Aprobado!"); await foto("12-chofer-aprobado")
        await pg.click("text=Entrar a mi app de chofer"); await pg.wait_for_selector("text=Hola, Raúl"); await foto("13-chofer-hoy-con-nombre")
        await pg.goto(BASE + "/#/conductor/perfil"); await pg.wait_for_selector("text=Mi perfil de chofer"); await foto("14-perfil-chofer")
        # backoffice ve al registrado: lo pongo "en revisión" otra vez para la foto
        await pg.evaluate("(function(){var u=JSON.parse(localStorage.getItem('xpuesto.sesion'));u.choferEstado='en-revision';localStorage.setItem('xpuesto.sesion',JSON.stringify(u));})()")
        await pg.goto(BASE + "/#/admin/choferes"); await pg.reload(); await pg.wait_for_selector("text=Raúl Rodríguez"); await pg.add_style_tag(content=".admin-nav{position:static !important; height:auto !important}"); await foto("15-backoffice-nuevo")
        await pg.click("text=Raúl Rodríguez"); await pg.wait_for_selector("text=Faltan documentos para aprobar"); await foto("16-backoffice-ficha-nuevo")
        # invitado y cerrar sesión
        await pg.goto(BASE + "/#/perfil"); await pg.wait_for_selector("text=Cerrar sesión"); await pg.click("text=Cerrar sesión"); await pg.wait_for_selector("text=¿Cómo entras hoy?")
        await pg.click("text=Mirar sin cuenta"); await pg.wait_for_selector("text=¿Pa' dónde vas?"); await pg.click("button[aria-label='Mi perfil']"); await pg.wait_for_selector("text=Estás mirando sin cuenta"); await foto("17-invitado")
        await b.close()
        print("errores de consola:", errores if errores else "ninguno")
asyncio.run(main())
