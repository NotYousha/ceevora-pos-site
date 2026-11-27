# Ceevora POS website

Static marketing site for Ceevora POS (point of sale for Saudi Arabia). One page, English and Arabic, no build step.

- `index.html` – page structure
- `style.css` – styles, including the liquid-glass material (nav, hero buttons, chips, video card, ZATCA panel, demo form)
- `app.js` – language switch, screenshot gallery, business-type tabs, FAQ, demo form (opens an email draft to info@ceevora.com)
- `strings.js` – every English and Arabic string
- `assets/` – product screenshots (WebP) and logo

## Settings (config.js)
Everything the team needs to switch on lives in `config.js`. Empty values keep a feature hidden:

| Setting | What it turns on |
| --- | --- |
| `whatsapp` | Floating WhatsApp chat button with a ready-made message |
| `youtubeId` / `youtubeIdAr` | The marketing video in the "Watch the tour" pop-up; Arabic visitors get the Arabic one |
| `plans` | The "Compare plans" table (see the example in config.js) |
| `demoUrl` | "Try the live demo" button in the hero |
| `gaId` | Google Analytics 4, loaded only after the visitor accepts the cookie notice; demo requests are logged as `generate_lead` |
| `pricing` | Real SAR estimates in the quote builder (otherwise it says "custom quote") |
| `customers` | "Shops running on Ceevora" section. Real customers with permission only |

## Links for ads
- Arabic ads: link to `https://notyousha.github.io/ceevora-pos-site/?lang=ar` (visitors whose phone is set to Arabic get Arabic anyway).
- Add UTM tags so each demo request email says which ad brought the visitor, e.g. `?lang=ar&utm_source=instagram&utm_campaign=video1`.

## Ad kit (ad-kit/)
Ready-made ad images in Arabic and English: `ceevora-story-*.jpg` (1080x1920, Instagram/TikTok/Snapchat stories), `ceevora-square-*.jpg` (1080x1080 feed), `ceevora-wide-*.jpg` (1200x628, link previews / YouTube). To change the wording, edit `ad-kit/ad.html`, start `python -m http.server 8765` in the repo root and run `python ad-kit/render.py`.

## Using your own domain
1. In the repo: Settings → Pages → Custom domain → enter e.g. `www.ceevora.com`, save, tick "Enforce HTTPS".
2. At the domain registrar: add a CNAME record `www` → `notyousha.github.io`.
3. For the bare domain (`ceevora.com`) add A records to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
4. Update the `canonical`, `og:url` and `og:image` links at the top of `index.html` to the new domain.

## Demo form email
The form sends requests to info@ceevora.com through FormSubmit (formsubmit.co). The very first submission sends an activation email to that inbox; click "Activate Form" once and every request after that arrives as a normal email. If sending fails, the visitor's email app opens with the details instead. The address is `email` in `config.js`.

Countries, cities and dialling codes are in `COUNTRIES` in `app.js`.

## Editing text
All English and Arabic text is in `strings.js`. After changing it, run `python build.py` so the English text is baked into `index.html` (faster first paint and better for Google).

## Adding the marketing video
Upload it to YouTube, then put its ID in `youtubeId` in `config.js`.

The "Watch the tour" button and the video card then play it in a pop-up.

## Running locally
`python -m http.server` in this folder, then open http://localhost:8000.
