# Convierte deck.html en PDF (16:9) y una PNG por lámina.
import asyncio, os, pathlib
from playwright.async_api import async_playwright
AQUI = pathlib.Path(__file__).parent.resolve()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        await pg.goto(AQUI.joinpath("deck.html").as_uri())
        await pg.wait_for_timeout(1500)  # fuentes e imágenes
        await pg.emulate_media(media="print")
        await pg.pdf(path=str(AQUI / "XPuesto-deck.pdf"), width="1920px", height="1080px", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}, prefer_css_page_size=False)
        await pg.emulate_media(media="screen")
        os.makedirs(AQUI / "laminas", exist_ok=True)
        laminas = await pg.query_selector_all("section.lamina")
        for i, el in enumerate(laminas, 1):
            await el.screenshot(path=str(AQUI / "laminas" / f"{i:02d}.png"))
        await b.close()
        print("ok", len(laminas), "láminas")
asyncio.run(main())
