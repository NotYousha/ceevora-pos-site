# Ceevora POS website

Static marketing site for Ceevora POS (point of sale for Saudi Arabia). One page, English and Arabic, no build step.

- `index.html` – page structure
- `style.css` – styles, including the liquid-glass material (nav, hero buttons, chips, video card, ZATCA panel, demo form)
- `app.js` – language switch, screenshot gallery, business-type tabs, FAQ, demo form (opens an email draft to info@ceevora.com)
- `strings.js` – every English and Arabic string
- `assets/` – product screenshots (WebP) and logo

## Adding the marketing video
Upload it to YouTube, then put its ID in the first line of `app.js`:

```js
const YOUTUBE_ID = "abc123XYZ";
```

The "Watch the tour" button and the video card then play it in a pop-up.

## Running locally
`python -m http.server` in this folder, then open http://localhost:8000.
