# Global Feedback System — Toasts, Loading & Error Pages

## Context

You are implementing a global feedback system for **Nuestro Espacio**, a private couple's web app built with **Next.js (App Router) + React + Supabase + custom CSS** (`app/globals.css`).

This system has four parts:
1. **Toast notifications** — success, error, warning messages
2. **Loading overlay** — full-screen or component-level loading state
3. **Top progress bar** — thin bar for page navigation
4. **Error pages** — beautiful fallback UI for unhandled errors

Before writing any code, read `app/globals.css` in full. Use only existing CSS variables. No Tailwind. No external UI libraries for toasts or loading — build them from scratch. The only allowed external package for this system is `nextjs-toploader` (for the navigation progress bar).

---

## Part 1 — Toast System

### 1.1 Files to create

| File | Purpose |
|------|---------|
| `contexts/ToastContext.tsx` | Context + provider + state management |
| `hooks/useToast.ts` | Consumer hook |
| `components/ui/ToastContainer.tsx` | Renders the toast stack |
| `components/ui/ToastItem.tsx` | Individual toast component |

### 1.2 Toast types and colors

| Type | Color variable | Icon |
|------|---------------|------|
| `success` | `var(--gold)` | `✦` |
| `error` | `var(--rose)` | `✕` |
| `warning` | `var(--teal)` | `◆` |

### 1.3 Toast data structure

```ts
interface Toast {
  id:        string;       // crypto.randomUUID()
  type:      'success' | 'error' | 'warning';
  message:   string;
  duration:  number;       // ms, default 4000
  exiting:   boolean;      // true when the exit animation is playing
}
```

### 1.4 ToastContext

```tsx
interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (message: string, duration?: number) => void;
    error:   (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    dismiss: (id: string) => void;
  };
}
```

State: `const [toasts, setToasts] = useState<Toast[]>([])`.

Each `toast.success/error/warning` call:
1. Creates a new Toast object with `exiting: false`
2. Adds it to the array (max 4 toasts visible — if the array already has 4, remove the oldest before adding)
3. Sets a `setTimeout` for `duration` ms that calls an internal `startExit(id)` function
4. `startExit(id)` sets `exiting: true` on that toast, then after 350ms removes it from the array

`toast.dismiss(id)` immediately calls `startExit(id)`.

### 1.5 ToastItem component

```css
.toast-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  min-width: 280px;
  max-width: 380px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(8, 7, 16, 0.5);
  animation: toastEnter 0.35s var(--ease) both;
  will-change: transform, opacity;
}

.toast-item.exiting {
  animation: toastExit 0.35s var(--ease) forwards;
}

@keyframes toastEnter {
  from { opacity: 0; transform: translateX(20px) scale(0.97); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes toastExit {
  from { opacity: 1; transform: translateX(0) scale(1); max-height: 80px; margin-bottom: 0.5rem; }
  to   { opacity: 0; transform: translateX(20px) scale(0.96); max-height: 0; margin-bottom: 0; }
}
```

Left accent bar (3px wide, full height, absolutely positioned left):
```css
.toast-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 3px 0 0 3px;
}
```

Icon (`.toast-icon`): 16×16px circle with the type color at 15% opacity background, type color icon centered. `var(--mono)` font.

Message (`.toast-message`): `var(--body)` 0.82rem `var(--text)` line-height 1.5. Allow up to 2 lines.

Dismiss button (`.toast-dismiss`): `×` character, absolute top-right, `var(--dimmed)` color, transitions to `var(--muted)` on hover.

**Progress bar** — a thin 2px bar at the very bottom of the toast that shrinks from 100% to 0% over the toast's duration:
```css
.toast-progress {
  position: absolute;
  bottom: 0; left: 0;
  height: 2px;
  border-radius: 0 0 var(--radius) var(--radius);
  /* width animated via CSS animation with duration matching toast duration */
}
@keyframes toastProgress {
  from { width: 100%; }
  to   { width: 0%; }
}
```
Apply `animation: toastProgress [duration]ms linear forwards` via inline style.

Each type has its color applied to: accent bar, icon background, icon color, and progress bar.

### 1.6 ToastContainer

Fixed positioned, bottom-right:

```css
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 9000;
  pointer-events: none;
}
.toast-item {
  pointer-events: all;
}
```

### 1.7 Integration into root layout

In `app/layout.tsx`:
1. Wrap everything in `<ToastProvider>`
2. Render `<ToastContainer />` inside the provider, outside any page content

### 1.8 Integration into existing modules

Replace every `console.error`, `alert()`, and silent failure in the following files with the appropriate toast call. Use `useToast()` in client components, or pass a callback prop from parent client components when the action is triggered from a server action result.

Files to update:
- `modules/galeria/components/GaleriaGrid.tsx` — upload success/error, delete success/error
- `modules/cartas/` — save success/error, delete success/error
- `modules/peliculas/` — add/update/delete success/error, duplicate warning
- `app/(auth)/login/LoginForm.tsx` — replace inline error state with `toast.error()` (keep the inline error as well for accessibility, but also fire a toast)
- Any other `"use client"` component that currently handles server action responses silently

Toast messages to use (in Spanish):

| Action | Type | Message |
|--------|------|---------|
| Photo uploaded | success | `"Foto subida correctamente"` |
| Photo deleted | success | `"Foto eliminada"` |
| Photo upload failed | error | `"No se pudo subir la foto"` |
| Album created | success | `"Álbum creado correctamente"` |
| Album deleted | success | `"Álbum eliminado"` |
| Letter saved | success | `"Carta guardada"` |
| Letter deleted | success | `"Carta eliminada"` |
| Movie added | success | `"Película añadida a vuestra lista"` |
| Movie already exists | warning | `"Esta película ya está en vuestra lista"` |
| Movie deleted | success | `"Película eliminada"` |
| Rating saved | success | `"Calificación guardada"` |
| Login failed | error | `"Email o contraseña incorrectos"` |
| Generic save error | error | `"Algo salió mal, intenta de nuevo"` |
| Generic delete error | error | `"No se pudo eliminar"` |

---

## Part 2 — Loading Overlay System

### 2.1 Files to create

| File | Purpose |
|------|---------|
| `contexts/LoadingContext.tsx` | Context + provider |
| `hooks/useLoading.ts` | Consumer hook |
| `components/ui/LoadingOverlay.tsx` | Full-screen overlay component |

### 2.2 LoadingContext

```ts
interface LoadingContextValue {
  loading: {
    show: (message?: string) => void;
    hide: () => void;
  };
  isLoading: boolean;
}
```

State:
```ts
const [state, setState] = useState<{ active: boolean; message: string }>({
  active: false,
  message: '',
});
```

`loading.show(message?)` sets `active: true` and stores the message (default: `"Cargando..."`).
`loading.hide()` sets `active: false`.

### 2.3 LoadingOverlay component

Only renders when `isLoading === true`. Uses `createPortal` to render at `document.body` level.

```css
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 7, 16, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  z-index: 8000;
  animation: loadingFadeIn 0.2s var(--ease) both;
}
@keyframes loadingFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

**Orbital spinner** — a mini version of the app's orbital animation. Two dots orbiting a central point, implemented in CSS (no canvas needed at this scale):

```css
.loading-orbit {
  position: relative;
  width: 48px;
  height: 48px;
}
.loading-orbit-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 10px var(--gold);
}
.loading-orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(201, 169, 110, 0.15);
}
.loading-orbit-dot {
  position: absolute;
  width: 7px; height: 7px;
  border-radius: 50%;
  top: 50%; left: 50%;
  transform-origin: 0 0;
}
.loading-orbit-dot--gold {
  background: var(--gold);
  box-shadow: 0 0 8px rgba(201, 169, 110, 0.6);
  animation: orbitGold 1.4s linear infinite;
  margin: -3.5px 0 0 14px;
}
.loading-orbit-dot--rose {
  background: var(--rose);
  box-shadow: 0 0 6px rgba(184, 112, 112, 0.5);
  animation: orbitRose 1.9s linear infinite;
  margin: -3px 0 0 19px;
}
@keyframes orbitGold {
  from { transform: rotate(0deg) translateX(-14px); }
  to   { transform: rotate(360deg) translateX(-14px); }
}
@keyframes orbitRose {
  from { transform: rotate(180deg) translateX(-19px); }
  to   { transform: rotate(540deg) translateX(-19px); }
}
```

**Loading message** below the spinner:
```css
.loading-message {
  font-family: var(--mono);
  font-size: 0.62rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--muted);
  animation: loadingPulse 1.5s ease-in-out infinite;
}
@keyframes loadingPulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}
```

### 2.4 Integration into root layout

Add `<LoadingProvider>` wrapping in `app/layout.tsx`, alongside `ToastProvider`. Render `<LoadingOverlay />` inside it.

### 2.5 Integration into existing actions

Update the following client components to use `useLoading()`:

| Component | Action | Message |
|-----------|--------|---------|
| Photo upload handler | show before upload, hide after | `"Subiendo foto..."` |
| Login form submit | show on submit, hide on result | `"Iniciando sesión..."` |
| Album creation | show/hide around action | `"Creando álbum..."` |
| Movie add (after selecting from TMDB) | show/hide | `"Guardando película..."` |
| Letter save (composer) | show/hide | `"Guardando carta..."` |
| Any delete confirmation | show/hide | `"Eliminando..."` |

Pattern to follow in every case:
```ts
loading.show('Subiendo foto...');
try {
  const result = await someServerAction(data);
  if (result.success) toast.success('Foto subida correctamente');
  else toast.error('No se pudo subir la foto');
} catch {
  toast.error('Algo salió mal, intenta de nuevo');
} finally {
  loading.hide();
}
```

---

## Part 3 — Top Navigation Progress Bar

### 3.1 Install package

```bash
npm install nextjs-toploader
```

### 3.2 Integration

In `app/layout.tsx`, import and render `<NextTopLoader>` as the very first child inside `<body>`, before any providers:

```tsx
import NextTopLoader from 'nextjs-toploader';

// inside <body>:
<NextTopLoader
  color="var(--gold, #c9a96e)"
  initialPosition={0.08}
  crawlSpeed={200}
  height={2}
  crawl={true}
  showSpinner={false}
  easing="ease"
  speed={200}
  shadow={`0 0 10px rgba(201,169,110,0.4), 0 0 5px rgba(201,169,110,0.2)`}
/>
```

`showSpinner: false` — the default circular spinner in the corner must be disabled. Only the thin top bar is shown.

---

## Part 4 — Error Pages

### 4.1 Global error boundary — `app/error.tsx`

This catches unhandled runtime errors in any route segment.

```tsx
'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) { ... }
```

**Layout**: No sidebar, no navigation. Full-screen centered. The starfield background must be present — import and render the `Starfield` (or equivalent) component directly in this file since the normal layout is bypassed.

**Visual structure:**

```
[starfield background]

      ✦
   ups...

"Algo salió mal"   ← var(--serif) italic 2.5rem var(--gold)

"[error.message or fallback text]"  ← var(--body) italic var(--muted) max-width 440px centered

  ──────────

[volver al inicio]   [intentar de nuevo]
```

Fallback message if `error.message` is empty or too technical (contains words like "Error:", "undefined", "null", "cannot read", "fetch failed"): replace with `"Ocurrió un error inesperado. No te preocupes, no perdiste nada."`.

Detect "technical" messages with:
```ts
const isTechnical = !error.message ||
  /error:|undefined|null|cannot|failed|unexpected|chunk/i.test(error.message);
const displayMessage = isTechnical
  ? 'Ocurrió un error inesperado. No te preocupes, no perdiste nada.'
  : error.message;
```

**Buttons:**

Primary button `"volver al inicio"` → `router.push('/inicio')` using `useRouter`.
Ghost button `"intentar de nuevo"` → calls `reset()`.

```css
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
  position: relative;
}
.error-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% 50%,
    transparent 20%, rgba(8,7,16,0.7) 100%);
  pointer-events: none;
}
.error-ornament {
  font-family: var(--serif);
  font-size: 1.5rem;
  color: var(--gold);
  opacity: 0.5;
  filter: drop-shadow(0 0 12px rgba(201,169,110,0.3));
}
.error-eyebrow {
  font-family: var(--mono);
  font-size: 0.55rem;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: var(--dimmed);
  margin-top: -0.5rem;
}
.error-title {
  font-family: var(--serif);
  font-style: italic;
  font-size: clamp(2rem, 5vw, 2.8rem);
  font-weight: 400;
  color: var(--gold);
  line-height: 1.1;
}
.error-message {
  font-family: var(--body);
  font-style: italic;
  font-size: 1rem;
  color: var(--muted);
  max-width: 440px;
  line-height: 1.7;
}
.error-sep {
  width: 40px; height: 1px;
  background: var(--gold-dim, #6b5228);
}
.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}
```

All elements animate in with staggered `fadeSlideUp` (same keyframe used in other modules):
- ornament: delay 0s
- eyebrow: delay 0.1s
- title: delay 0.2s
- message: delay 0.3s
- separator: delay 0.4s
- buttons: delay 0.5s

### 4.2 Not found page — `app/not-found.tsx`

Same visual structure as `error.tsx` but for 404s.

Content:
- Ornament: `✦`
- Eyebrow: `"404"`
- Title: `"esta página no existe"`
- Message: `"El rincón que buscas no está aquí. Quizás nunca existió, o quizás ya no está."`
- Only one button: `"volver al inicio"`

### 4.3 Route-level error boundaries

In addition to the global `app/error.tsx`, create individual error boundaries for each main module route. These catch errors scoped to that route without taking down the whole app.

Create the following files, all with identical structure (same visual as `app/error.tsx` but with a module-specific subtitle):

| File | Subtitle |
|------|---------|
| `app/(app)/galeria/error.tsx` | `"Algo salió mal cargando la galería"` |
| `app/(app)/cartas/error.tsx` | `"Algo salió mal cargando las cartas"` |
| `app/(app)/peliculas/error.tsx` | `"Algo salió mal cargando las películas"` |
| `app/(app)/inicio/error.tsx` | `"Algo salió mal cargando el inicio"` |

These route-level error pages DO have access to the normal layout (sidebar, etc.) since they are inside `app/(app)/`. They should render a centered message within the content area (not full-screen), and include a `"reintentar"` button that calls `reset()`.

```css
.route-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 50vh;
}
```

### 4.4 Supabase error handling

In all server actions across the app (`modules/*/actions.ts`), replace raw `throw new Error(error.message)` with structured returns:

```ts
// Instead of:
if (error) throw new Error(error.message);

// Use:
if (error) return { success: false, error: error.message };
```

This prevents unhandled promise rejections from bubbling up to the error boundary when the issue is a known Supabase error (duplicate key, RLS violation, etc.). Reserve thrown errors for truly unexpected cases — those will be caught by the error boundary and shown as the error page.

---

## 5. CSS additions (`app/globals.css`)

Append all new styles at the end under:

```css
/* ══════════════════════════════════════════════════════════
   GLOBAL FEEDBACK SYSTEM — TOASTS · LOADING · ERRORS
══════════════════════════════════════════════════════════ */
```

Include all classes from Parts 1–4. Do not modify any existing CSS.

---

## 6. Root layout — final provider order

`app/layout.tsx` provider nesting order (outermost first):

```tsx
<ToastProvider>
  <LoadingProvider>
    <NextTopLoader ... />
    {/* starfield background */}
    {/* sidebar / nav */}
    {children}
    <ToastContainer />
    <LoadingOverlay />
  </LoadingProvider>
</ToastProvider>
```

---

## 7. Constraints

1. **No external libraries** for toasts or loading — built from scratch using the design system.
2. `nextjs-toploader` is the only allowed new package. Install it; do not build a custom router event listener.
3. Both `ToastContainer` and `LoadingOverlay` must use `createPortal` to render at `document.body` — this ensures they appear above modals and overlays from any module.
4. **Loading overlay blocks all interaction** — it must have `pointer-events: all` and cover `z-index: 8000`. Toasts are above it at `z-index: 9000`.
5. `app/error.tsx` and `app/not-found.tsx` bypass the normal layout — they must render their own background (import the starfield component directly).
6. **Never show raw error messages** from Supabase or fetch to the user — always map to Spanish human-readable text or use the generic fallback.
7. The `useLoading` and `useToast` hooks must throw a descriptive error if used outside their provider: `throw new Error('useToast must be used within ToastProvider')`.
8. Max 4 toasts visible simultaneously — oldest is removed when a 5th arrives.
9. The progress bar animation on toasts uses inline `style` for the duration so each toast has its own independent timer.
10. Do not modify any existing module logic beyond adding `toast.*` and `loading.show/hide` calls where specified.
