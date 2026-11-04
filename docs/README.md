# Modiflix

A responsive app, game, movie and book storefront built with plain HTML, CSS and JavaScript.
No build step and no dependencies — everything runs from static files.

## Run it

```bash
cd docs
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open <http://127.0.0.1:8080>.

## What it does

- **For you** home page with featured banners, a ranked Top charts rail, new releases, recommendations and category tiles.
- **Games / Apps** browse pages with genre filters and sortable shelves.
- **Movies & TV / Books** storefronts with poster and cover cards.
- **Search** with live suggestions, keyboard support (`/` focuses the box) and full result pages.
- **App detail pages** with screenshots, long description, rating breakdown, reviews, app info, data-safety panel and similar apps.
- **Simulated installs**: progress bar, installed/open state, library ("My apps") with update buttons, persisted in `localStorage`.
- **Library** listing everything you installed.
- **Store admin** at `#/admin` (linked in the footer and in "My apps"):
  - Search and filter the catalog, see live stats.
  - Add apps or games, edit any field (name, developer, type, genre, icon, colours, rating, reviews, downloads, size, age rating, badge, featured flag, tagline, description).
  - Delete listings with an inline confirmation, reset the catalog to defaults, clear installed apps.
  - Everything saves to this device's `localStorage` and appears in the storefront immediately.
- Dark/light theme toggle (persisted), responsive layout, and a mobile bottom navigation bar.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Shell: header, search, navigation, footer, script tags |
| `styles.css` | Design tokens, components, admin panel, responsive/dark-theme rules |
| `data.js` | Fictional catalog: 30 apps/games, 8 films, 8 books, reviews |
| `app.js` | Hash router, views, install simulation, search, theme, catalog admin and persistence |

All apps, films, books and reviews are fictional demo content.

## Catalog storage

Admin edits are stored under the `gp_catalog_v1` localStorage key; installs use `gp_installed`.
"Reset catalog" removes the saved catalog and restores the seed data from `data.js`.
