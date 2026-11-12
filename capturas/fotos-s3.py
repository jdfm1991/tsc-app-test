# Sesión 3: backoffice en escritorio (1280) y en teléfono (390).
import asyncio, os
from playwright.async_api import async_playwright
BASE = "http://localhost:5180"
OUT = "capturas/sesion-3"
os.makedirs(OUT, exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errores = []
        async def recorrido(ancho, alto, sufijo, escala):
            pg = await b.new_page(viewport={"width": ancho, "height": alto}, device_scale_factor=escala)
            pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
            pg.on("pageerror", lambda e: errores.append(str(e)))
            async def foto(n):
                await pg.wait_for_timeout(600)
                await pg.screenshot(path=f"{OUT}/{n}{sufijo}.png", full_page=True); print("foto", n + sufijo)
            await pg.goto(BASE + "/#/admin"); await pg.wait_for_selector("text=Viajes en curso")
            await pg.add_style_tag(content=".admin-nav{position:static !important; height:auto !important}")
            await foto("1-mapa")
            await pg.goto(BASE + "/#/admin/choferes"); await pg.wait_for_selector("text=148 certificados"); await foto("2-choferes")
            await pg.click("text=Yorman D."); await pg.wait_for_selector("text=Faltan documentos"); await foto("3-chofer-ficha"); await pg.click(".hoja .atras")
            await pg.goto(BASE + "/#/admin/sos"); await pg.wait_for_selector("text=DESVÍO DE RUTA"); await pg.click("text=Llamar al chofer"); await foto("4-sos")
            await pg.click("text=Cerrar la alerta"); await pg.wait_for_selector("text=Sin alertas activas"); await foto("5-sos-resuelta")
            await pg.goto(BASE + "/#/admin/caja"); await pg.wait_for_selector("text=Vendido hoy"); await pg.click("text=Pagar >> nth=0"); await foto("6-caja")
            await pg.close()
        await recorrido(1280, 800, "-pc", 1)
        await recorrido(390, 844, "-tel", 2)
        await b.close()
        print("errores de consola:", errores if errores else "ninguno")
asyncio.run(main())
