# Untapped Market

State-of-the-art Pacific Northwest cannabis discovery — mobile-first and web-based.

## v2.0 highlights

- **100+ verified Seattle-area dispensaries** plotted on a free, high-performance Leaflet map (CartoDB dark tiles), spanning a ~25-mile radius from downtown out to Bellevue, Kirkland, Redmond, Renton, Lynnwood, Burien, Tacoma, and more.
- **30 science-grade cultivars** spanning Type I/II/III/IV chemotypes, from landrace sativas to deep myrcene indicas to high-CBD wellness picks.
- **AI Strain Match quiz** — four-step recommender that scores every strain against vibe, flavor palette, tolerance, and form factor, returning ranked matches with terpene-aware explanations.
- **Live Inventory Alerts** with a unified notification center for restocks, price drops, and system updates.
- **Mobile bottom-tab navigation** + slide-up filter drawers on Catalog and Finder.
- **Simulated OAuth** auth with Free / Premium ($7) / Pro ($19) tiered features.
- **Ethereal creative-stack links** to Runway, Sora, Pika, Luma, Midjourney, Flux, Suno, ElevenLabs, and Ideogram for video / image / audio generation.

## Stack

- Vite + React 18 + TypeScript
- Zustand for global state
- Leaflet + react-leaflet for the map
- CartoDB dark tiles (free, beautiful, biophilic dark theme)
- DM Serif Display + Outfit + DM Mono for typography

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc + vite build
npm run preview  # serve the production bundle
```

## Project structure

```
src/
  components/      Shared UI (Nav, DispensaryMap, StrainCard, NotificationCenter, …)
  pages/           HomePage, CatalogPage, StrainDetailPage, FinderPage, QuizPage, LibraryPage, ExplorePage, PremiumPage, AccountPage
  data/            strains.ts (30), dispensaries.ts (100+), mockData.ts (reports, media, ethereal links)
  store/           useStore.ts (Zustand — auth, alerts, folders, quiz, toasts, notifications)
  lib/             recommender.ts (terpene-aware AI matching)
  types.ts         All shared types
  index.css        Forest / biophilic design system
```

The legacy v1 single-file build is preserved at `legacy/untapped-market-v1.html` as the original design reference.
