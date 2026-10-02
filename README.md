# ALC>26

Alicante golf trip command center.

**27 Nov – 1 Dec 2026 · 4 guys · 4 nights · 3 rounds · 0 sober drivers.**

## Product idea

A deliberately minimal, editorial trip site inspired by the discipline of high-end consultancy sites and the utility of itinerary planners — without generic travel-app or AI-dashboard styling.

The site keeps one source of truth for:

- the hour-by-hour trip rhythm;
- payment status for the four travellers;
- the 1.8m ISK group pot;
- budget vs actual spend;
- booking status;
- golf rounds and transfer times.

## Stack

- React
- TypeScript
- Vite
- Lucide icons
- custom CSS
- Cloudflare Pages ready

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

### Cloudflare Pages

Connect this GitHub repo and use:

- Framework preset: **Vite**
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: current LTS

## Persistence

V1 stores edits in `localStorage` so it works immediately. The next production step is a tiny Cloudflare D1/KV persistence layer so payment, booking and budget edits sync across all four phones.

## Money model

Each traveller contributes **450,000 ISK** before anything is booked.

Total trip pot: **1,800,000 ISK**.

Baldvin pays all shared expenses. Personal purchases stay personal.
