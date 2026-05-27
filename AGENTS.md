# Nuestro Espacio — AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project
Private couple's web app (Sarai ♥ Ricardo). All UI text is in Spanish. Features: photo gallery/albums, love letters, shared music playlist, memory game, time capsule, and a "time together" counter.

## Commands
- `npm run dev` — dev server on port 3000
- `npm run build` — production build
- `npm run lint` — ESLint flat config (`eslint.config.mjs`) with `next/core-web-vitals` + TypeScript presets
- No typecheck, test, or format scripts configured

## Architecture
- **Next.js 16.2.6 + React 19.2.4 + Tailwind CSS v4** (via `@tailwindcss/postcss`)
- **App Router** with route groups: `(app)/` = protected (Sidebar + ToastProvider + StarField layout), `auth/` = public
- **Supabase**: `@supabase/ssr` for cookie-based auth; clients at `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server). Auth: login page + OAuth callback. Route protection in `(app)/` layout.
- **Env**: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Path alias**: `@/*` maps to project root
- **Dev LAN access**: `allowedDevOrigins: ['192.168.0.12']` in `next.config.ts`
- **Server action limit**: `bodySizeLimit: '10mb'` (for image uploads)
- **Image compression**: client-side Canvas API at `lib/compressImage.ts` (WebP, max 1920px, ~200-400KB output). Falls back to original on error.
- **Styling**: Custom CSS in `app/globals.css` (CSS custom properties — `--gold`, `--rose`, `--surface`, etc.; serif/body/mono font stacks). Tailwind is installed but unused in templates.

## Module architecture (target from `estructura.txt`)
Each feature lives in `modules/<name>/` with `components/`, `hooks/`, `actions.ts` (`'use server'`), `types.ts`, and barrel `index.ts`.

| Module | Status | Key files |
|--------|--------|-----------|
| `galeria` | Complete | types.ts, actions.ts (CRUD), useFotos.ts, GaleriaGrid/FotoCard/AlbumCard/FotoModal/AlbumModal/UploadModal/Lightbox |
| `inicio` | Has components | OrbitCanvas, CounterDisplay, StatCard, WishButton (used in `app/(app)/inicio/page.tsx`) |
| `capsula` | Scaffold only | Empty `components/` + `hooks/` |
| `cartas` | Scaffold only | Empty `components/` + `hooks/` |
| `musica` | Scaffold only | Empty `components/` + `hooks/` |
| `juegos` | Scaffold only | Empty `components/` + `hooks/` |

## Gotchas
- `estructura.txt` describes the **target** architecture — some listed files (`middleware.ts`, `lib/utils.ts`, `styles/animations.css`, `types/database.types.ts`, `hooks/useTheme.ts`, `modules/*/index.ts`) don't exist yet and need to be built.
- No barrel `index.ts` files exist — import directly from subpaths.
- No middleware, no CI, no pre-commit hooks, no tests.
