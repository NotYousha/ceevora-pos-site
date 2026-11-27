# Ceevora POS website

Static marketing site for Ceevora POS (point of sale for Saudi Arabia). One page, English and Arabic, no build step.

- `index.html` – page structure
- `style.css` – styles, including the liquid-glass material (nav, hero buttons, chips, video card, ZATCA panel, demo form)
- `app.js` – language switch, screenshot gallery, business-type tabs, FAQ, demo form (opens an email draft to info@ceevora.com)
- `strings.js` – every English and Arabic string
- `assets/` – product screenshots (WebP) and logo

## Demo form email
The form sends requests to info@ceevora.com through FormSubmit (formsubmit.co). The very first submission sends an activation email to that inbox; click "Activate Form" once and every request after that arrives as a normal email. If sending fails, the visitor's email app opens with the details instead. The address is set in `EMAIL` in `app.js`.

Countries, cities and dialling codes are in `COUNTRIES` in `app.js`.

## Editing text
All English and Arabic text is in `strings.js`. After changing it, run `python build.py` so the English text is baked into `index.html` (faster first paint and better for Google).

## Adding the marketing video
Upload it to YouTube, then put its ID in the first line of `app.js`:

```js
const YOUTUBE_ID = "abc123XYZ";
```

The "Watch the tour" button and the video card then play it in a pop-up.

## Running locally
`python -m http.server` in this folder, then open http://localhost:8000.
