# create-zuri-storefront

A CLI that scaffolds a production-ready storefront in under a minute. Built on Next.js 15, Supabase, and Paystack — with WhatsApp ordering and a full admin dashboard included.

```bash
npx create-zuri-storefront
```

---

## What you get

- **Storefront** — hero, product grid, product detail pages, category/size filters
- **Cart & checkout** — slide-in cart drawer, Paystack inline payment, WhatsApp order fallback
- **Newsletter** — email capture stored in Supabase
- **Admin dashboard** — manage products, view orders, export subscribers (protected by Supabase Auth)
- **API routes** — Paystack webhook, order creation, subscriber signup
- **5 design tastes** — apply a full visual theme in one conversation with Claude

Stack: **Next.js 15** · **TypeScript** · **Tailwind CSS v4** · **Supabase** (DB + Auth + Storage) · **Paystack**

---

## Prerequisites

Before running the CLI you need accounts at:

| Service | What you need |
|---|---|
| [Supabase](https://supabase.com) | Project URL + anon key |
| [Paystack](https://paystack.com) | Public key + secret key |

---

## Quick start

```bash
# Scaffold a new store
npx create-zuri-storefront

# The CLI will ask for:
# - Project name (folder to create)
# - Store name
# - Currency symbol (₦, $, €, GH₵, …)
# - WhatsApp number for order notifications
# - Supabase credentials
# - Paystack credentials
```

After scaffolding:

```bash
cd my-store

# 1. Run the database schema
#    Copy supabase/schema.sql and run it in:
#    Supabase dashboard → SQL Editor

# 2. Create a storage bucket
#    Supabase dashboard → Storage → New bucket
#    Name: product-images  |  Public: yes

# 3. Create an admin user
#    Supabase dashboard → Authentication → Add user

# 4. Start the dev server
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Design tastes

Your project ships with a `TASTE.md` file that describes **5 visual themes** — from minimal to editorial to dark luxury. If you're using Claude (Claude Code or claude.ai), open the project and ask Claude to read `TASTE.md`. It will walk you through the options and apply your chosen theme across the entire codebase in one go.

| Taste | Vibe | Inspired by |
|---|---|---|
| **Blanc** | Clean, minimal, confident | Apple Store, Muji |
| **Noir** | Bold, editorial, high-contrast | Supreme, Palace |
| **Terra** | Warm, artisan, considered | Kinfolk, Brightland |
| **Obsidian** | Dark, luxe, cinematic | Tom Ford, Byredo |
| **Pop** | Playful, vibrant, rounded | Glossier, Parade |

Each taste changes the font, colour palette, border radii, and shadow style — no design skills required.

---

## Environment variables

The CLI writes `.env.local` automatically. If you need to edit it:

```env
# Store identity
NEXT_PUBLIC_STORE_NAME=My Store
NEXT_PUBLIC_CURRENCY_SYMBOL=₦
NEXT_PUBLIC_WHATSAPP_NUMBER=2349000000000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
```

> `PAYSTACK_SECRET_KEY` is server-only (no `NEXT_PUBLIC_` prefix) — it is never sent to the browser.

---

## Admin dashboard

Navigate to `/admin` and sign in with the Supabase user you created.

### Products

| Field | Notes |
|---|---|
| Name | Displayed on the storefront |
| Slug | URL-friendly ID (`my-product`), auto-generated from name |
| Price | In your local currency (no conversion) |
| Category | Free text — used for storefront filter pills |
| Sizes | Optional — leave empty for one-size or non-apparel products |
| Images | Uploaded to Supabase Storage |
| Available | Toggle to mark as sold out without deleting |
| Featured | Shows on the homepage hero section |

### Orders

Click any row to open the order detail panel. You can update the status (`pending → paid → processing → shipped → delivered`).

Orders are created automatically by:
- Paystack webhook (on successful payment)
- WhatsApp button (logged as `source: whatsapp`)

### Subscribers

Email list from the newsletter form. Download as CSV anytime.

---

## Customisation

### Categories and sizes

Categories and sizes shown in the store filter are derived dynamically from your product data — whatever values you use in the admin become filter options automatically. No code changes needed.

### Currency

Set `NEXT_PUBLIC_CURRENCY_SYMBOL` to any symbol (`$`, `€`, `GH₵`, `KSh`, …). The Paystack transaction is always charged in **NGN** — update the `currency` field in `components/CartDrawer.tsx` if your Paystack account is set up for a different currency.

### Design taste

Open your project with Claude and say: *"Read TASTE.md and help me pick a design."* Claude will present the five options and apply your choice — fonts, colours, border radius, shadows — across all components. See [`TASTE.md`](./TASTE.md) for the full breakdown.

### Adding pages

Add any Next.js page under `app/`. The navbar and cart drawer are included in the root layout and appear automatically.

---

## Deployment

### Vercel (recommended)

```bash
# Push to GitHub, then import the repo at vercel.com
# Add all env vars from .env.local in the Vercel dashboard
```

### Paystack webhook

After deploying, register your webhook URL in the Paystack dashboard:

```
Settings → API Keys & Webhooks → Webhook URL
https://your-domain.com/api/paystack/webhook
```

---

## Project structure

```
my-store/
├── app/
│   ├── page.tsx                 # Homepage
│   ├── store/
│   │   ├── page.tsx             # Product listing
│   │   └── [slug]/page.tsx      # Product detail
│   ├── admin/
│   │   ├── page.tsx             # Admin dashboard
│   │   └── login/page.tsx       # Admin login
│   └── api/
│       ├── paystack/
│       │   ├── verify/          # Verifies payment & creates order
│       │   └── webhook/         # Paystack webhook handler
│       ├── orders/whatsapp/     # Logs WhatsApp orders
│       └── subscribers/         # Newsletter signup
├── components/
│   ├── Navbar.tsx
│   ├── CartDrawer.tsx
│   ├── ProductCard.tsx
│   └── TheDropClient.tsx        # Newsletter form
├── lib/
│   ├── cart-context.tsx         # React cart state
│   └── supabase/                # Supabase client helpers
├── types/
│   └── index.ts                 # All shared TypeScript types
├── supabase/
│   └── schema.sql               # Run once to set up the database
└── TASTE.md                     # Design themes — apply with Claude
```

---

## License

MIT
