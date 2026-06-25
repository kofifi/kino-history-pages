# kino-history-pages

Ultralekka statyczna strona pod GitHub Pages dla historii filmów.

## Założenia

- brak frameworka
- brak bundlera
- brak zależności runtime
- źródło danych: `history.json`
- hosting: GitHub Pages

## Struktura

- `index.html` – statyczny shell strony
- `styles.css` – minimalne style
- `app.js` – lekki renderer historii
- `history.json` – dane publikowane przez `kino-cron`

## Publikacja

Najprościej ustawić GitHub Pages z:
- branch: `main`
- folder: `/ (root)`

## Integracja z kino-cron

W `kino-cron/.env.local` ustaw:

- `GITHUB_REPOSITORY=<owner>/kino-history-pages`
- `GITHUB_HISTORY_FILE_PATH=history.json`
