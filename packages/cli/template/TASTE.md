# Storefront Taste

This file is for you and your Claude. It describes **5 visual design tastes** for this storefront. Pick one and Claude will apply it across the codebase — fonts, colours, corner radii, shadows, and button styles — all in Tailwind.

---

> **Hey Claude 👋**
> If the user hasn't picked a taste yet, show them the five options below and ask which one fits their brand. Once they choose, follow the implementation guide for that taste at the bottom of this file. Touch only the files listed — don't restructure any logic or components.

---

## The 5 Tastes

---

### 1. Blanc
**Clean · Minimal · Confident**

The default. White space does the heavy lifting. Products speak for themselves. No decorative noise — just crisp typography, neutral greys, and a paper-thin shadow on cards. Feels like a well-designed checkout experience from a brand that doesn't need to shout.

> *Vibes: Apple Store, COS, Muji*

---

### 2. Noir
**Bold · Editorial · Uncompromising**

High contrast, zero border-radius, thick borders. Every button looks like it means business. The grid is tight, the type is heavy, and the hover states flip the colour entirely. Streetwear, sneakers, limited-edition anything.

> *Vibes: Supreme, Palace, A-COLD-WALL\**

---

### 3. Terra
**Warm · Artisan · Considered**

Earth tones — cream backgrounds, terracotta accents, warm brown text. Headings go serif. Cards feel like linen. The kind of store that wraps orders in tissue paper and includes a handwritten note. Perfect for food, homewear, candles, ceramics, or anything handmade.

> *Vibes: Kinfolk, Great Jones, Brightland*

---

### 4. Obsidian
**Dark · Luxe · Cinematic**

Near-black background, off-white text, gold accents. Thin borders catch the light. Headings use a refined serif. The store feels like a private members' club — understated but expensive. High-end fashion, jewellery, premium spirits, anything where the brand is the product.

> *Vibes: Bottega Veneta, Tom Ford, Byredo*

---

### 5. Pop
**Playful · Vibrant · Memorable**

Violet primary, extra-rounded cards, generous padding. The buttons bounce. The hero is unapologetically colourful. Feels friendly and energetic — the kind of store you screenshot to send to a friend. Beauty, lifestyle, merch, anything aimed at a younger audience.

> *Vibes: Glossier, Parade, Khy*

---

## Implementation Guide

### Files to change for any taste
1. `app/globals.css` — update `@theme` block (font + any custom tokens)
2. `app/layout.tsx` — update Google Fonts `<link>` and `<body>` classes
3. Do a targeted search-and-replace of Tailwind classes across `components/` and `app/` as described per taste

---

### Blanc (default — no changes needed)

```css
/* globals.css @theme */
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
```

```tsx
// layout.tsx font link
https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap

// body class
className="bg-gray-50 text-gray-900 antialiased font-sans"
```

Key patterns: `bg-white` cards · `rounded-xl` · `shadow-sm hover:shadow-md` · `bg-gray-900` primary button · `text-gray-500` muted.

---

### Noir

```css
/* globals.css @theme */
--font-sans: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
```

```tsx
// layout.tsx font link
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap

// body class
className="bg-white text-black antialiased font-sans"
```

Global class changes across `components/` and `app/`:

| Replace | With |
|---|---|
| `rounded-xl` | `rounded-none` |
| `rounded-2xl` | `rounded-none` |
| `rounded-lg` | `rounded-none` |
| `rounded-full` | `rounded-none` |
| `shadow-sm` | `shadow-none` |
| `shadow-md` | `shadow-none` |
| `border border-gray-100` | `border-2 border-black` |
| `border border-gray-200` | `border-2 border-black` |
| `bg-gray-50` (backgrounds) | `bg-white` |
| `bg-gray-900 text-white` (buttons) | `bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors` |
| `text-gray-500` | `text-gray-600` |
| `text-gray-400` | `text-gray-500` |

Navbar: remove `backdrop-blur-md`, set `bg-white border-b-2 border-black`.

---

### Terra

```css
/* globals.css @theme */
--font-sans: 'Lato', ui-sans-serif, system-ui, sans-serif;
--font-serif: 'Playfair Display', Georgia, serif;
```

```tsx
// layout.tsx font link
https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@400;700&display=swap

// body class
className="bg-[#faf8f4] text-[#2c1810] antialiased font-sans"
```

Global class changes:

| Replace | With |
|---|---|
| `bg-gray-50` (page bg) | `bg-[#faf8f4]` |
| `bg-white` (cards/surfaces) | `bg-[#fff9f5]` |
| `border-gray-100` | `border-[#e8d5c4]` |
| `border-gray-200` | `border-[#e8d5c4]` |
| `text-gray-900` | `text-[#2c1810]` |
| `text-gray-500` | `text-[#8c6d5f]` |
| `text-gray-400` | `text-[#b09585]` |
| `bg-gray-900 text-white` (buttons) | `bg-[#c4622d] text-white hover:bg-[#a8521f]` |
| `bg-gray-100` (hover/subtle) | `bg-[#f0e6dc]` |
| `rounded-xl` | `rounded-lg` |

All `h1`, `h2` elements — add `font-serif` (use `font-[family-name:var(--font-serif)]` in Tailwind v4, or add `fontFamily` to `@theme`).

Navbar: `bg-[#faf8f4]/90 border-[#e8d5c4]`.

---

### Obsidian

```css
/* globals.css @theme */
--font-sans: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
--font-serif: 'Cormorant Garamond', Georgia, serif;
```

```tsx
// layout.tsx font link
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap

// body class
className="bg-[#0a0a0a] text-[#f5f5f0] antialiased font-sans"
```

Global class changes:

| Replace | With |
|---|---|
| `bg-gray-50` (page bg) | `bg-[#0a0a0a]` |
| `bg-white` (cards) | `bg-[#141414]` |
| `bg-gray-100` (subtle) | `bg-[#1e1e1e]` |
| `bg-gray-200` | `bg-[#2a2a2a]` |
| `border-gray-100` | `border-[#2a2a2a]` |
| `border-gray-200` | `border-[#2a2a2a]` |
| `text-gray-900` | `text-[#f5f5f0]` |
| `text-gray-500` | `text-[#888880]` |
| `text-gray-400` | `text-[#666660]` |
| `bg-gray-900 text-white` (buttons) | `bg-[#c9a84c] text-[#0a0a0a] hover:bg-[#b8963e] font-semibold` |
| `hover:bg-gray-100` | `hover:bg-[#1e1e1e]` |
| `hover:bg-gray-200` | `hover:bg-[#2a2a2a]` |
| `shadow-sm` | `shadow-none` |
| `shadow-md` | `shadow-[0_4px_24px_rgba(0,0,0,0.4)]` |

Navbar: `bg-[#0a0a0a]/90 border-[#2a2a2a]`. Cart badge: `bg-[#c9a84c] text-[#0a0a0a]`.

All `h1`, `h2` elements — add `font-serif` (tracking-wide, font-normal for elegant look).

---

### Pop

```css
/* globals.css @theme */
--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
```

```tsx
// layout.tsx font link
https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap

// body class
className="bg-[#fafafe] text-[#1a1a2e] antialiased font-sans"
```

Global class changes:

| Replace | With |
|---|---|
| `bg-gray-50` (page bg) | `bg-[#fafafe]` |
| `bg-white` (cards) | `bg-white` |
| `border-gray-100` | `border-violet-100` |
| `border-gray-200` | `border-violet-100` |
| `text-gray-900` | `text-[#1a1a2e]` |
| `text-gray-500` | `text-[#6b6b8a]` |
| `text-gray-400` | `text-[#9999b8]` |
| `bg-gray-900 text-white` (buttons) | `bg-violet-600 text-white hover:bg-violet-700` |
| `bg-gray-100` (hover/subtle) | `bg-violet-50` |
| `bg-gray-200` | `bg-violet-100` |
| `rounded-xl` (cards) | `rounded-2xl` |
| `rounded-xl` (buttons) | `rounded-full` |
| `rounded-lg` | `rounded-xl` |
| `rounded-full` (pills/badges) | `rounded-full` |
| `shadow-sm` | `shadow-sm shadow-violet-100` |
| `shadow-md` | `shadow-lg shadow-violet-100` |

Navbar: `bg-white/90 border-violet-100`. Cart badge: `bg-violet-600`.

Hero heading: bump font weight to `font-extrabold`. Add `tracking-tight` to all headings.

---

> **Claude:** once you've applied the taste, confirm which files were changed and offer to tweak any specific colour, font weight, or corner radius the user wants to adjust.
