# Architecture

How the site is actually put together. Read this before making structural changes.

## The one-of-a-kind model

Everything follows from this: **every product is a single physical garment.** Rae makes one, sells
one. There are no sizes, no colours, no variants, no restocking.

In practice:

- `products.stock` is `1` (available) or `0` (sold). It is not a quantity — never increment it.
- `products.is_active` is the soft-delete flag. Products are never hard-deleted.
- The cart can only ever hold one of any given item.
- Because two people can add the same unique item to their cart at once, there's a reservation
  system (below) that holds an item for a short window during checkout.

If you find yourself writing quantity-selector UI or variant logic, stop — you're solving a problem
this shop doesn't have.

## Stack

| Layer | What |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router 6 |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| State | React Context (`AuthContext`, `CartContext`) + TanStack Query |
| Database / auth / storage | Supabase (Postgres with RLS) |
| Server logic | Supabase Edge Functions (Deno) |
| Payments | Stripe Checkout |
| Email | Brevo transactional templates |
| Live chat | Tawk.to (embedded in `index.html`) |
| Hosting | Vercel — pushes to `main` deploy to production |

## Frontend layout

```
src/
  App.tsx              Routing + global providers. The definitive route list.
  pages/               One file per route
    admin/             Login, Dashboard, Orders, Products, AddProduct, Messages
    collections/       Ten static collection landing pages (SEO)
    gifts/             Six static gift-occasion landing pages (SEO)
  components/
    admin/             Product upload form, image uploader, shipping label printing
    auth/              Login / signup / account dashboard
    ui/                shadcn/ui primitives — generated, avoid hand-editing
  contexts/            AuthContext, CartContext
  lib/
    supabase.ts        The Supabase client most of the app uses
    reservations.ts    Cart reservation logic (cart_reservations table)
    checkout.ts        Stripe checkout session kickoff
    stripe.ts, session.ts, store.ts, utils.ts
  types/               TypeScript types
```

The `collections/` and `gifts/` pages are deliberately static hand-written pages rather than
data-driven routes — they exist to rank for gift-occasion search terms and each has its own copy.

## Backend — Supabase

### Tables the app actually uses

`products`, `orders`, `order_items`, `admin_users`, `subscribers`, `cart_reservations`,
`customer_profiles`, `categories`.

**The source of truth is the live database, not `supabase/migrations/`.** See the warning below.

Key columns:

- `products` — `name`, `description`, `price`, `image_url`, `age_group`, `gender`, `product_type`,
  `collection`, `is_gift_idea`, `gift_category`, `stock` (1/0), `is_active`
- `orders` — customer contact fields, `shipping_address_line1/line2`, `shipping_city/state/postcode/country`,
  `status`, `subtotal`, `shipping_cost`, `total`, `stripe_payment_intent_id`,
  `stripe_checkout_session_id`, `tracking_number`, `shipped_at`
- `admin_users` — `id` matches `auth.users.id`. Being in this table is what makes someone an admin;
  `ProtectedRoute` checks it.

### Storage

Bucket `product-images`, public read. Uploads are named with `crypto.randomUUID()`. Brand assets
(logo, OG image) live in a `brand-assets` bucket and are referenced by absolute URL in `index.html`
and various components.

### Edge Functions (`supabase/functions/`)

| Function | Does |
|---|---|
| `create-checkout-session` | Builds the Stripe Checkout session, adds $12 flat shipping, collects an AU-only shipping address |
| `create-payment-intent` | Payment intent path for the embedded Stripe flow |
| `stripe-webhook` | Listens for `checkout.session.completed`; creates the order + order_items, then triggers the two emails |
| `send-order-confirmation` | Customer receipt + admin new-order notification via Brevo |
| `send-shipping-email` | Customer shipping notification with tracking number |
| `cleanup-reservations` | Releases expired `cart_reservations` rows. Scheduled — see `cron.yaml` and `20241022000001_setup_cron_cleanup.sql` |
| `test-stripe`, `test-webhook-simple` | Debugging stubs. Not part of the live flow. |

Deployment: `supabase functions deploy <name>`. The Stripe functions are deployed with
`--no-verify-jwt` because Stripe's servers can't present a Supabase JWT.

Secrets are set with `supabase secrets set KEY=value`. They **cannot be edited in place** — delete
and recreate to change one.

## Design decisions worth knowing

**No GST.** The business is under the $75k ATO registration threshold, so GST was removed entirely
rather than calculated at 0%. Don't add it back without checking the business's turnover.

**$12 flat shipping.** Australia Post rate calculation was scoped and deferred. The admin dashboard
does print Australia Post thermal labels (28mm × 89mm) — see `components/admin/AddressLabel.tsx`.

**Cart reservations use a short hold with an `expires_at` timestamp.** Watch the timezone: Postgres
timestamps returned without a `Z` suffix get parsed as local time by JavaScript. In Melbourne
(UTC+11) that makes every reservation appear already expired. Append `Z` before parsing.

**Stripe webhooks in Deno need `constructEventAsync`**, not `constructEvent` — the sync version
relies on Node crypto that isn't available in the Deno runtime.

## Known landmines

### 1. The repo contains two generations of code

The site was scaffolded in Lovable against one data model, then rebuilt against another. Both are
still in the tree. **The abandoned generation is still there and still compiles.**

Live (`stock` 1/0, `admin_users`, `@/lib/supabase`):
: `src/App.tsx` and everything it imports — `src/pages/*.tsx`, `src/pages/admin/*`,
  `src/pages/collections/*`, `src/pages/gifts/*`.

Abandoned (`is_sold`/`is_reserved`, `cart_items`, `reviews`, `wishlists`):
: `src/pages/shop/` — **not routed, dead**
: `src/components/shop/`, `src/components/cart/`, `src/components/reviews/` — only imported by the
  dead pages above
: `src/lib/utils/reservations.ts` — superseded by `src/lib/reservations.ts`

Before editing any file, check it's reachable from `src/App.tsx`. Editing `src/pages/shop/ProductDetail.tsx`
expecting it to change the live product page is the single easiest mistake to make in this codebase.

### 2. There are two Supabase clients

- `src/lib/supabase.ts` — untyped, imported by ~41 files. This is the one to use.
- `src/lib/supabase/client.ts` — typed against `src/types/database.ts`, plus auth helpers. Imported
  by the dead tree and by one live file, `src/components/admin/ProductUploadForm.tsx`.

They connect to the same project, so nothing breaks — but don't add new imports of the second one.

### 3. `supabase/migrations/` does not describe the live database

The initial migrations define `is_sold`, `is_reserved`, `cart_items`, `reviews`, `wishlists` and
`similarity_notifications`. The live database uses `stock`, `admin_users`, `subscribers` and
`cart_reservations`. Later schema changes were applied through the Supabase dashboard rather than
as migration files.

**Do not run these migrations against the live database.** To see the real schema, use the table
editor at https://supabase.com/dashboard/project/kqshrevhtrusxrwkgdmd/editor. The same caveat
applies to `src/types/database.ts` — it's generated from the old schema and is not accurate.

### 4. Google Places address autocomplete is switched off

The idea was that a customer starts typing their address at checkout and Google autofills line 1,
city, state and postcode. It's currently disabled — checkout uses plain manual address fields,
which work fine. Nothing is broken for customers.

Three separate things are going on:

**The feature is commented out.** `src/pages/Checkout.tsx:18` has the import commented, and the
usage is inside a comment block at roughly lines 419–430 marked "Commented out for now".

**`src/components/AddressAutocomplete.tsx` is orphaned but sound.** It loads the Maps script itself
at runtime (line 86) using `import.meta.env.VITE_GOOGLE_PLACES_API_KEY` — the correct pattern for
Vite. It simply has no caller.

**`index.html` used to carry a leftover script tag** that hardcoded an unsubstituted
`NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` placeholder. Vite doesn't substitute env vars inside
`index.html`, and `NEXT_PUBLIC_` is a Next.js prefix that means nothing here, so every page load
fired a failing request to Google and logged an `InvalidKey` console warning. It has been removed —
the component loads its own script and never needed it.

To turn the feature back on: uncomment the two blocks in `Checkout.tsx` and set
**`VITE_GOOGLE_PLACES_API_KEY`** in `.env.local`. Watch the variable name — the key may still be
stored as `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`, which the component won't find; it'll log "API key
not found" and quietly disable itself. Also confirm the key has the Places API enabled and billing
attached in Google Cloud, which is a common reason this gets shelved mid-build.

### 5. Leftover multi-currency env vars

`VITE_EXCHANGE_RATE_USD` / `_EUR` / `_GBP` may still be set in your `.env.local`. Multi-currency was
scoped and dropped — the shop is AUD-only. Nothing reads them.
