"""Render ad creatives from ad.html: python ad-kit/render.py  (needs a local server: python -m http.server 8765 in the repo root)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).parent
SIZES = {"story": (1080, 1920), "square": (1080, 1080), "wide": (1200, 628)}

with sync_playwright() as p:
    b = p.chromium.launch()
    for lang in ("ar", "en"):
        for fmt, (w, h) in SIZES.items():
            pg = b.new_page(viewport={"width": w, "height": h})
            pg.goto(f"http://localhost:8765/ad-kit/ad.html?lang={lang}&fmt={fmt}")
            pg.wait_for_load_state("networkidle")
            pg.evaluate("document.fonts.ready")
            out = OUT / f"ceevora-{fmt}-{lang}.jpg"
            pg.screenshot(path=str(out), type="jpeg", quality=90)
            print(out.name)
            pg.close()
    b.close()
