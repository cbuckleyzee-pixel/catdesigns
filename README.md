# catsdesigns – Catherine Buckley's portfolio

Plain static site (no build step). Open `index.html` through any static server, or deploy as is.

## Pages
`index.html` (home), `about.html`, `art.html`, `pma.html`, `steam.html`, `debrief.html`, `coda.html`

## Files
- `dc-lite.js` – tiny runtime that powers the pages' interactive bits (ASCII beach, art-board drag + lightbox, side navs). Every page loads it.
- `images/` – all photos and screenshots.
- `vercel.json` – turns on clean URLs (`/about` instead of `/about.html`).

## Deploy (GitHub + Vercel)
1. Create a GitHub repo (e.g. `catsdesigns`) and push this folder to it.
2. On vercel.com choose **Add New → Project**, import the repo.
3. Framework preset: **Other**. Leave build command and output directory empty. Deploy.
4. Add a custom domain under Project → Settings → Domains (or use the free `*.vercel.app` address).

## Editing
Edit the HTML files directly. Text and layout live inline in each page; interactive logic is in the `<script type="text/x-dc">` block at the bottom of the page. Push to GitHub and Vercel redeploys.

Notes: the PMA page password is checked in the browser only, so it keeps casual visitors out but isn't real security.
