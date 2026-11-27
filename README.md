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
| `youtubeId` | The marketing video in the "Watch the tour" pop-up |
| `demoUrl` | "Try the live demo" button in the hero |
| `gaId` | Google Analytics 4, loaded only after the visitor accepts the cookie notice; demo requests are logged as `generate_lead` |
| `pricing` | Real SAR estimates in the quote builder (otherwise it says "custom quote") |
| `customers` | "Shops running on Ceevora" section. Real customers with permission only |

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
