# Inicio Page — Full-Screen Scroll-Snap Redesign

## Context

You are rewriting the `/inicio` page of **Nuestro Espacio**, a private couple's web app. The stack is **Next.js (App Router) + React + Supabase + custom CSS** (`app/globals.css`). The project's design system uses CSS variables defined in `globals.css` — use only those variables, never hardcode colors or fonts.

**Critical**: Before touching anything, read `app/globals.css` from top to bottom to understand the full design system: color variables, font variables (`--serif`, `--body`, `--mono`), spacing, radius, transition variables, and any existing utility classes. All new styles must follow that system exactly.

---

## Background: existing starfield background

The app has a persistent animated starfield background that renders across all pages. Identify how it is currently implemented (look for a canvas element, a `Starfield` or `StarCanvas` component, or a CSS/JS background in the root layout `app/layout.tsx` or a shared layout component). The `/inicio` page **must use that same background**. Do not recreate or duplicate it — just ensure the hero panel and all subsequent panels sit on top of it with their own overlays using `background: transparent` or semi-transparent backgrounds so the starfield is visible through each panel.

---

## Goal

Replace the current `InicioSections` + `useScrollReveal` implementation with a **full-screen scroll-snap layout** where each section occupies exactly `100vh` and the scroll snaps from one to the next cinematically.

Keep the existing hero (`OrbitCanvas` + title + `HeroCounter`) exactly as it is — no changes to those components. Only the sections below the hero change.

---

## Files to create or modify

| File | Action |
|------|--------|
| `app/(app)/inicio/page.tsx` | Rewrite sections below hero |
| `app/(app)/inicio/InicioSections.tsx` | Replace entirely |
| `hooks/useScrollReveal.ts` | Keep file but it will no longer be used by InicioSections (do not delete in case other pages use it) |
| `app/globals.css` | Append new `.inicio-*` CSS blocks at the end |

Do **not** modify: `OrbitCanvas.tsx`, `HeroCounter.tsx`, `WishButton.tsx`, `CounterDisplay.tsx`, `StatCard.tsx`, or any Supabase server actions.

---

## 1. Page layout — scroll-snap container

The scroll container must wrap the **entire page** including the hero. Apply `scroll-snap-type: y mandatory` to a full-height wrapper, and `scroll-snap-align: start` + `height: 100vh` to each panel.

```
.inicio-scroll-wrap
  → height: 100vh
  → overflow-y: scroll (or auto)
  → scroll-snap-type: y mandatory
  → scroll-behavior: smooth
  → position: relative

.inicio-panel
  → height: 100vh
  → width: 100%
  → scroll-snap-align: start
  → position: relative
  → display: flex
  → align-items: center
  → justify-content: center
  → overflow: hidden
  → background: transparent (so starfield shows through)
```

Each panel gets a subtle overlay to give depth without fully covering the starfield:
```css
.inicio-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 80% at 50% 50%,
    transparent 30%,
    rgba(var(--bg-rgb, 8,7,16), 0.6) 100%);
  pointer-events: none;
  z-index: 0;
}
```

All panel content must have `position: relative; z-index: 1` so it renders above the overlay.

---

## 2. Scroll dot indicator

A fixed right-side indicator with one dot per panel. The active dot is taller (`height: 18px`, `border-radius: 3px`) and uses `var(--gold)`. Inactive dots are `6px × 6px` circles in `var(--dimmed)`. Clicking a dot scrolls to that panel.

```css
.inicio-dot-nav { position: fixed; right: 2rem; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 0.5rem; z-index: 200; }
.inicio-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--dimmed); cursor: pointer; transition: all 0.4s var(--ease, cubic-bezier(0.16,1,0.3,1)); }
.inicio-dot.active { height: 18px; border-radius: 3px; background: var(--gold); box-shadow: 0 0 8px color-mix(in srgb, var(--gold) 40%, transparent); }
```

Use an `IntersectionObserver` (threshold `0.5`) to detect which panel is visible and update the active dot. The observer's `root` must be the scroll container element, not the viewport, so it works correctly inside a nested scroll context.

---

## 3. Panel inner layout

Every section panel (panels 2–5) uses a two-column grid:

```css
.inicio-panel-inner {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 5rem;
  align-items: center;
  max-width: 960px;
  width: 100%;
  padding: 0 3rem;
  position: relative;
  z-index: 1;
}
```

Left column (`.inicio-panel-left`): ornament, section label in `var(--mono)`, italic serif message in `var(--muted)`, decorative separator line.

Right column (`.inicio-panel-right`): the dynamic content for each section.

---

## 4. Reveal animation per panel

When a panel becomes visible (via the same `IntersectionObserver`), add class `.visible` to its children that have `.inicio-reveal`. This triggers:

```css
.inicio-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.65s var(--ease), transform 0.65s var(--ease);
}
.inicio-reveal.visible { opacity: 1; transform: translateY(0); }
.inicio-reveal:nth-child(2) { transition-delay: 0.08s; }
.inicio-reveal:nth-child(3) { transition-delay: 0.16s; }
.inicio-reveal:nth-child(4) { transition-delay: 0.24s; }
.inicio-reveal:nth-child(5) { transition-delay: 0.32s; }
```

---

## 5. Panel section tag (top-left)

Every section panel shows a small label in the top-left:

```css
.inicio-section-tag {
  position: absolute;
  top: 2rem; left: 3rem;
  font-family: var(--mono);
  font-size: 0.5rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--dimmed);
  display: flex; align-items: center; gap: 0.75rem;
  z-index: 5;
}
.inicio-section-tag::before {
  content: '';
  width: 20px; height: 1px;
  background: var(--gold-dim, #6b5228);
}
```

---

## 6. Data fetching — page.tsx

The page is a **server component**. Fetch all data in parallel using `Promise.all`:

```ts
const [latestMoment, recentPhotos, recentLetters, recentCapsules, stats] = await Promise.all([
  getLatestMoment(),
  getPhotos(7),
  getRecentLetters(3),
  getRecentCapsules(2),
  getStats(),
]);
```

Pass all data as props to `<InicioSections />`.

---

## 7. The 5 panels

### Panel 1 — Hero (no changes)

Keep the existing hero exactly as-is inside a `.inicio-panel` wrapper. The `OrbitCanvas` canvas already fills the panel. The only change is wrapping everything in a `.inicio-panel` div so it participates in scroll-snap.

Add the scroll cue at the bottom:

```css
.inicio-scroll-cue {
  position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem; z-index: 2;
}
.inicio-scroll-cue-line {
  width: 1px; height: 40px;
  background: linear-gradient(to bottom, transparent, var(--gold-dim, #6b5228));
  animation: inicioCuePulse 2s ease-in-out infinite;
}
@keyframes inicioCuePulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.inicio-scroll-cue-label {
  font-family: var(--mono); font-size: 0.5rem;
  letter-spacing: 0.35em; text-transform: uppercase; color: var(--dimmed);
}
```

---

### Panel 2 — "Nuestra historia" (último momento)

Section tag: `nuestra historia`
Left: ornament `✦`, label `Último momento`, message `"Cada momento contigo es un latido que el universo guarda."`

Right content:

**If `latestMoment` exists:**
Render a `.inicio-moment-card`:
- Left: emoji in a rounded box (`var(--card)` background, `var(--border-hi)` border)
- Right: section name tag, moment title (`var(--serif)`, 1.1rem), description (`var(--body)`, italic, `var(--muted)`), date (`var(--mono)`, `var(--gold)`)
- Card has `var(--card)` background, `var(--border-hi)` border, `border-radius: var(--radius)`, subtle inner radial gradient bottom-left with `var(--gold)` at 5% opacity

**If no moments exist:**
Render a `.inicio-empty-card` with a soft gold border (`var(--border-hi)`), a large centered ornament `✦`, and two lines of text:
- Title: `"Aún no hay momentos"` in `var(--serif)` italic
- Subtitle: `"El primer recuerdo que guardes aparecerá aquí"` in `var(--mono)` small `var(--muted)`

Add a `var(--gold)` text link below the card: `"registrar un momento →"` linking to `/momentos`.

---

### Panel 3 — "Lo que hemos visto" (galería)

Section tag: `lo que hemos visto`
Left: ornament `📸`, label `Galería`, message `"Nuestros ojos guardan instantes que el tiempo no borra."`

Below the message, add two photo stats in a small inline row:
- Total photos count + label `fotos` (value in `var(--gold)`, label in `var(--mono)` `var(--dimmed)`)
- Special moments count + label `especiales` (value in `var(--rose)`)
Separated by a 1px vertical line in `var(--border)`.

Add link `"ver galería →"` below.

Right content — `.inicio-galeria-grid`:

```css
.inicio-galeria-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0.6rem;
  height: 380px;
  border-radius: var(--radius);
  overflow: hidden;
}
.inicio-galeria-grid .foto-cell:first-child { grid-row: span 2; }
```

**If `recentPhotos` has photos:**
- First photo: tall portrait cell (row span 2), show `<img>` with `object-fit: cover`
- Second and third photos: the next two in the array
- Each cell has a hover overlay (gradient bottom to top, 0→opacity on hover) showing the photo's caption in `var(--body)` italic

**If fewer than 3 photos, fill remaining cells with placeholder cards:**
Each placeholder has `background: var(--card)`, `border: 1px solid var(--border)`, `border-radius: 8px`, centered emoji `📷` in `var(--dimmed)`, and a small text `"próximamente"` in `var(--mono)` `var(--dimmed)`.

**If no photos at all:**
Replace the grid entirely with a single `.inicio-empty-card` (same style as Panel 2 empty state) with ornament `📷` and text `"Tu galería está esperando"` / `"Sube la primera foto juntos"`. Add link `"ir a la galería →"`.

---

### Panel 4 — "Palabras que quedan" (cartas)

Section tag: `palabras que quedan`
Left: ornament `💌`, label `Cartas`, message `"Algunas cosas solo se dicen con el corazón."`
Add link `"leer todas →"` below.

Right content — `.inicio-letters-stack` (flex column, gap `0.6rem`):

**For each letter in `recentLetters` (up to 3):**
Render a `.inicio-letter-item`:
- Left: 36×36px icon box with `💌`, `var(--rose-dim)` background, `rgba(var(--rose-rgb),0.2)` border
- Center: "Para [recipient]" in `var(--mono)` `var(--rose)` 0.5rem; subject in `var(--serif)` italic, truncated with `text-overflow: ellipsis`
- Right: formatted date in `var(--mono)` `var(--dimmed)`
- On hover: `transform: translateX(4px)`, rose left border accent `3px solid var(--rose)`

**If fewer than 3 letters**, fill remaining slots with a soft placeholder item:
Same card shape, icon `✍️`, recipient area reads `"Escribe algo"`, subject reads `"El próximo capítulo os está esperando"`, no date. On hover: link to `/cartas`.

**If no letters at all:**
Show `.inicio-empty-card` with ornament `💌` and texts `"Todavía no hay cartas"` / `"Las palabras más bonitas están por escribirse"`. Add link `"escribir la primera carta →"`.

---

### Panel 5 — "El tiempo guarda" (cápsulas + cierre)

Section tag: `el tiempo guarda`
Left: ornament `⏳`, label `Cápsulas del tiempo`, message `"El futuro nos espera, y lo guardamos aquí."`
Add link `"ver todas →"` below.

Below the link, render the existing `<WishButton />` component with a wrapping div:
```tsx
<div className="inicio-wish-wrap">
  <p className="inicio-wish-text">Siempre hay un espacio para ti aquí 💗</p>
  <WishButton />
</div>
```

Right content — `.inicio-capsules-list` (flex column, gap `0.75rem`):

**For each capsule in `recentCapsules` (up to 2):**
Render a `.inicio-capsule-card`:
- Background `var(--card)`, border `var(--border-hi)`, `border-radius: var(--radius)`, padding `1.2rem 1.5rem`
- "Para [recipient] · desde [sender]" in `var(--mono)` `var(--gold)` small
- Subject in `var(--serif)` italic `var(--text)`
- Locked date: `"se abre · [date]"` in `var(--mono)` `var(--dimmed)` small
- Decorative `⏳` absolute-positioned top-right, `opacity: 0.15`, transitions to `0.45` on hover
- On hover: `transform: translateY(-2px)`, brighter border

**If fewer than 2 capsules**, add a placeholder card with ornament `🔒`, text `"Guarda algo para el futuro"`, subtext `"Una cápsula del tiempo espera ser creada"`, and a ghost button style link to `/capsula`.

**If no capsules at all:**
Show two placeholder cards (same shape) with romantic copy:
1. `"Una carta para dentro de un año"` / `"Cuéntale a tu yo futuro cómo te sientes hoy"`
2. `"Guardad un recuerdo juntos"` / `"El tiempo os devolverá algo precioso"`
Both link to `/capsula`.

---

## 8. Responsive — `@media (max-width: 768px)`

```css
@media (max-width: 768px) {
  .inicio-panel-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1.5rem;
    max-height: 90vh;
    overflow-y: auto;
  }
  .inicio-panel-left { gap: 0.8rem; }
  .inicio-galeria-grid { height: 260px; }
  .inicio-dot-nav { display: none; }
  .inicio-section-tag { left: 1.5rem; }
  .inicio-panel-inner .panel-message { font-size: 1rem; }
}
```

---

## 9. CSS additions (`app/globals.css`)

Append all new styles **at the end** of `globals.css` under a comment:

```css
/* ══════════════════════════════════════════════════════════
   INICIO — FULL-SCREEN SCROLL-SNAP REDESIGN
══════════════════════════════════════════════════════════ */
```

Include all classes from sections 1–8 above. **Do not modify any existing CSS**. Use only variables already defined in `globals.css`. The only new CSS variable you may add, if needed, is `--bg-rgb` as the RGB decomposition of `--bg` for use in `rgba()` expressions — but only if the existing variable set does not already provide a raw-channel version.

---

## 10. Constraints

1. **Do not break** any existing functionality, routes, layouts, or components.
2. **Do not use Tailwind classes** — the project intentionally avoids Tailwind in components; all styling is via CSS classes in `globals.css`.
3. **The starfield background must remain visible** through every panel. Use `background: transparent` on `.inicio-scroll-wrap` and semi-transparent backgrounds (not opaque) on panels and cards.
4. Every panel must **always render something** — never a blank right column. If data is missing, show the appropriate empty state as defined in Section 7.
5. The scroll-snap container must be **scoped to the `/inicio` route only** — it must not affect the global layout or other pages. The simplest approach is to apply `overflow: hidden` on the `<body>` or root layout only when `/inicio` is active; a cleaner approach is to make `.inicio-scroll-wrap` the scrollable element itself (`height: 100vh; overflow-y: scroll`) and remove any outer scroll on the page for this route.
6. `IntersectionObserver` must use **`root: scrollContainerRef.current`** (the `.inicio-scroll-wrap` element), not `root: null` (viewport), so panel detection works correctly inside a nested scroll container.
7. All new client-side logic (dot nav, reveal observer, wish button) lives in `InicioSections.tsx` as a `"use client"` component. The page itself (`page.tsx`) remains a server component.
8. Existing empty-state behavior from `WishButton` must remain unchanged.
9. **Panel background overlays** must use semi-transparent values (e.g., `rgba(8,7,16,0.5)`) — never `var(--bg)` as a solid fill — so the starfield bleeds through.
10. Do not rename or move any existing file.
