# Handmade by Nanny Rae Rae

The e-commerce site for Rae's handmade children's clothing, made in Mallacoota, Victoria.

**Live:** https://bynannyraerae.com.au

Every piece Rae makes is one of a kind — one garment, made once, sold once. That single fact shapes
most of how this codebase works, so it's worth reading [the architecture notes](docs/ARCHITECTURE.md)
before making changes.

## Heads up before you push

**`main` deploys straight to the live shop.** Vercel builds and publishes every push to `main`
automatically. There is no staging environment and no approval step — a push is a deploy to a site
that takes real customer payments.

Work on a branch, check it locally, and merge to `main` when you're happy with it.

## Getting started

You'll need Node.js 18 or newer.

```bash
git clone https://github.com/yourmatematt/nannyraerae-crafted-closet.git
cd nannyraerae-crafted-closet
npm install

cp .env.example .env.local   # then fill in the values — see below
npm run dev
```

The dev server runs on **http://localhost:8080** (not the usual Vite 5173 — the port is set in
`vite.config.ts`).

### Environment variables

Copy `.env.example` to `.env.local` and fill it in. `.env.local` is gitignored; never commit it.

To run the site locally you only need the four `VITE_` values. They're compiled into the browser
bundle, so they're public by design — the Supabase anon key is meant to be visible, and Row Level
Security is what actually protects the data. You can pull them from the Vercel project settings or
the Supabase dashboard.

The server-side keys (Stripe secret, Brevo API key, Supabase service role) are listed in
`.env.example` for reference only. **You don't need them for frontend work.** They live as Supabase
Edge Function secrets in production. Treat them as credentials — they can charge cards and send
email as the business.

### Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router 6

Supabase for the database, auth, image storage and server-side functions. Stripe Checkout for
payments. Brevo for transactional email. Tawk.to for live chat. Hosted on Vercel.

## Routes

**Shop**

| Path | Page |
|---|---|
| `/` | Homepage |
| `/new-arrivals` | Newest products |
| `/shop-by-age`, `/shop/age/:ageGroup` | Age-group browsing |
| `/collection`, `/collections/:collectionName` | Collection browsing |
| `/gifts` | Gift landing page |
| `/products/:id` | Product detail |
| `/cart`, `/checkout` | Cart and checkout |
| `/checkout/success`, `/checkout/cancel` | Post-payment returns from Stripe |
| `/order-confirmation/:orderId` | Order confirmation |
| `/about` | About Rae |

**Admin** — all behind `ProtectedRoute`, which checks the signed-in user against the `admin_users`
table.

| Path | Page |
|---|---|
| `/admin/login` | Login |
| `/admin/dashboard` | Overview |
| `/admin/orders` | Orders, fulfilment, Australia Post label printing |
| `/admin/products` | Product list |
| `/admin/products/new`, `/admin/products/:id/edit` | Add / edit a product |
| `/admin/messages` | Contact form messages |

There are also hand-written landing pages under `/gifts/*` (first-birthday, new-baby, christmas,
easter, starting-school, big-sibling) and `/collections/*` (ten of them). These are static and
SEO-driven — each has its own copy rather than being generated from data.

`src/App.tsx` is the definitive list.

## Project layout

```
src/
  App.tsx          Routing and global providers
  pages/           One file per route (admin/, collections/, gifts/ subfolders)
  components/      admin/, auth/, ui/ (shadcn primitives) and shared components
  contexts/        AuthContext, CartContext
  lib/             Supabase client, reservations, Stripe checkout, helpers
  types/           TypeScript types
supabase/
  functions/       Deno edge functions — checkout, webhooks, emails, cleanup
  migrations/      Historic SQL — see the warning in docs/ARCHITECTURE.md
docs/              Architecture notes and Brevo email setup
```

## Docs

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — the data model, edge functions, design
  decisions, and the known landmines. Read this one.
- **[docs/BREVO_EMAIL_SETUP.md](docs/BREVO_EMAIL_SETUP.md)** — transactional email config and the
  failure modes that have caught people out.

## Known issues

Covered in full in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), but the short version:

1. **There are two generations of code in `src/`.** The site was scaffolded against one data model
   and rebuilt against another, and the abandoned version is still in the tree — `src/pages/shop/`,
   `src/components/shop/`, `src/components/cart/`, `src/components/reviews/`. It compiles but isn't
   routed. Check a file is reachable from `src/App.tsx` before editing it.
2. **`supabase/migrations/` doesn't match the live database.** Later schema changes were made
   through the Supabase dashboard. Don't run the migrations against production.
3. **Google Places address autocomplete is switched off** — the component is sound but its usage in
   `Checkout.tsx` is commented out, and `index.html` has a leftover Maps script tag that fails on
   every page load. Checkout uses manual address fields in the meantime.
4. The main JS bundle is ~1MB (280KB gzipped) with no code splitting.
5. Product images aren't resized or optimised on upload, and each product has a single image.
