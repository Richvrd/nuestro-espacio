# Gallery Module — Timeline View Enhancement Prompt

## Context

You are modifying the `galeria` module of **Nuestro Espacio**, a private couple's web app built with Next.js (App Router) + React + Supabase + custom CSS. The project uses a dark-mode design system with a gold/rose/teal palette, Playfair Display (serif), Lora (body), and IBM Plex Mono (mono) fonts. All styles live in `app/globals.css`.

**Existing functionality that must keep working without regression:**
- View all photos and albums in a grid
- Upload photos (with compression via `lib/compressImage.ts`)
- Create albums with title and description
- Open a photo in detail modal (`FotoModal`) — shows image + metadata
- Open an album modal (`AlbumModal`) — shows album photos grid
- Open lightbox (`Lightbox`) for full-screen image view
- Edit photo title, caption, date, emoji, bg_gradient
- Delete individual photos
- Edit album title and caption
- Delete albums
- All server actions in `modules/galeria/actions.ts` must remain intact and called correctly

---

## Database Change

Add a `is_special` boolean column to the `photos` table in Supabase:

```sql
ALTER TABLE photos ADD COLUMN is_special boolean NOT NULL DEFAULT false;
```

Update `modules/galeria/types.ts` — add the field to the `Photo` interface:

```ts
is_special: boolean;
```

---

## 1. Server Actions (`modules/galeria/actions.ts`)

Add a new server action to toggle the `is_special` field on a photo:

```ts
export async function toggleSpecialMomento(photoId: string, current: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('photos')
    .update({ is_special: !current })
    .eq('id', photoId);
  if (error) throw new Error(error.message);
  revalidatePath('/galeria');
}
```

No other actions need to be added or removed.

---

## 2. Hook (`modules/galeria/hooks/useFotos.ts`)

No changes needed to data fetching. The `is_special` field will be returned automatically since it's a new column on the same table. Verify that the `fetchGaleriaItems` query uses `select('*')` or explicitly includes `is_special`.

---

## 3. Page (`app/(app)/galeria/page.tsx`)

Replace the existing page content with the updated `GaleriaGrid` component. No structural changes to the page itself are needed — all logic lives in the components.

---

## 4. Component: `GaleriaGrid` (`modules/galeria/components/GaleriaGrid.tsx`)

This is the main component. Add a **view mode state** (`'grid' | 'timeline'`) and render either the existing grid or the new `TimelineView` component based on the active mode.

### 4.1 Add view state

```tsx
const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');
```

Persist the preference in `localStorage` under the key `'galeria-view'`. Read it on mount with `useEffect`.

### 4.2 Page header — keep upload/album buttons, add view toggle

The existing **"Subir foto"** and **"Nuevo álbum"** buttons must remain exactly as they are, including their `onClick` handlers that open `UploadModal` and `AlbumModal`.

Add a view toggle control to the right of the existing buttons (or group them in a flex row). The toggle has two buttons: **Cuadrícula** and **Línea del tiempo**. The active one gets the `.view-btn.active` CSS class (defined in globals.css — see Section 7).

### 4.3 Stats row

Below the header, render a stats row with three values derived from the already-fetched data:
- Total photo count (`items.filter(i => i.type === 'photo').length`)
- Total album count (`items.filter(i => i.type === 'album').length`)
- Special moments count (`items.filter(i => i.type === 'photo' && i.data.is_special).length`)

### 4.4 Filter bar

Add a filter state: `'all' | 'special' | 'albums' | 'photos'`.

Render four chip buttons:
- `✦ Todos` → filter = `'all'`
- `★ Momentos especiales` → filter = `'special'`
- `🗂 Solo álbumes` → filter = `'albums'`
- `📸 Solo fotos` → filter = `'photos'`

The active chip gets the `.filter-chip.active` class.

Pass the filter value down to both `GaleriaGrid` (existing grid) and `TimelineView` (new component) so each can apply it.

### 4.5 Conditional rendering

```tsx
{viewMode === 'grid'
  ? <ExistingGaleriaGridContent items={filteredItems} ... />
  : <TimelineView items={filteredItems} onToggleSpecial={handleToggleSpecial} ... />
}
```

The existing grid rendering logic stays intact — just wrap it to be conditionally shown.

---

## 5. New Component: `TimelineView` (`modules/galeria/components/TimelineView.tsx`)

This is the main new component. It receives `items: GaleriaItem[]` and all the existing modal-opening handlers.

### 5.1 Props interface

```tsx
interface TimelineViewProps {
  items: GaleriaItem[];
  onPhotoClick: (photo: Photo) => void;    // opens FotoModal
  onAlbumClick: (album: Album) => void;    // opens AlbumModal
  onToggleSpecial: (photo: Photo) => void; // calls toggleSpecialMomento
}
```

### 5.2 Grouping logic

Group photos and albums by month using their `date` (photos) or `created_at` (albums) field. Use `getMonthYear()` from `lib/constants.ts` for the group key. Sort groups in descending order (most recent month first).

```ts
type MonthGroup = {
  key: string;          // e.g. "mayo de 2026"
  label: string;        // display label split into month name and year
  items: GaleriaItem[];
  featuredPhoto: Photo | null;  // first photo with is_special=true, else first photo in group
};
```

The **featured photo** selection logic:
1. First, use the first `is_special` photo in the group (if any).
2. If none is special, use the first photo in the group.
3. If the group has only albums (no photos), set `featuredPhoto = null` and render the group without the featured column.

### 5.3 Month group layout

For each `MonthGroup`, render a `.month-section` div containing:

**Month header** (`.month-header`):
- Month name in italic serif gold (`.month-name`)
- Year in mono muted (`.month-year`)
- Photo count in mono dimmed (`.month-count`)
- A decorative line (`.month-line`) that extends to fill the remaining width

**Month content** (`.month-content`):
- Left column: `.featured-photo` — the featured photo (see 5.4)
- Right column: `.photos-rail` — the remaining items as a grid (see 5.5)

If `featuredPhoto` is null, render the right column full-width (no grid split).

### 5.4 Featured photo card

Render the featured photo as a tall portrait card (aspect-ratio 3/4 on desktop).

Elements inside:
- The `<img>` or emoji/gradient placeholder (same fallback logic as existing `FotoCard`)
- `.featured-badge` pill with text `"destacada"`
- If `photo.is_special`, render a `.special-badge-featured` with `★` symbol
- `.featured-overlay` (appears on hover): shows `photo.caption` and `photo.date`
- `onClick` → calls `onPhotoClick(photo)` to open the existing `FotoModal`

### 5.5 Photos rail (remaining items)

Render all items in the group **except** the featured photo in a `.photos-row` grid (CSS `repeat(auto-fill, minmax(130px, 1fr))`).

For each item:

**If `type === 'photo'`** → render a `.photo-card`:
- Img or placeholder (same fallback logic as existing `FotoCard`)
- If `photo.is_special` → render `.special-badge` with `★`
- `.photo-card-overlay` on hover showing caption
- `onClick` → `onPhotoClick(photo)`
- **Star toggle button** (`.special-toggle-btn`): a small button visible on hover that calls `onToggleSpecial(photo)`. Show filled `★` if special, outline `☆` if not. This is the only new interactive action on a photo card.

**If `type === 'album'`** → render an `.album-rail-card`:
- Album icon `🗂`
- Album title in serif italic gold
- Photo count in mono muted (`album.photos.length + ' fotos'`)
- `onClick` → `onAlbumClick(album)`

**"Ver más" card**: if the group has more than 7 items total (excluding featured), show a `.more-card` at the end displaying `+N más`. Clicking it expands the group (toggle local state `expandedMonths: Set<string>`).

### 5.6 Toggle special handler

In `GaleriaGrid`, define:

```tsx
const handleToggleSpecial = async (photo: Photo) => {
  await toggleSpecialMomento(photo.id, photo.is_special);
};
```

Call this from `TimelineView` via the `onToggleSpecial` prop.

---

## 6. Modify existing `FotoCard` component (`modules/galeria/components/FotoCard.tsx`)

Add a small `★` indicator on existing grid cards when `photo.is_special === true`. Use the same `.special-badge` class (absolute-positioned top-right). No other changes.

---

## 7. CSS additions (`app/globals.css`)

Append the following CSS blocks at the end of `globals.css`. **Do not remove or modify any existing CSS.**

```css
/* ── Galería: view toggle ────────────────────── */
.view-toggle {
  display: flex;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.view-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  font-family: var(--mono);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all var(--trans-fast);
}
.view-btn:hover { color: var(--text); }
.view-btn.active {
  background: var(--card-high);
  color: var(--gold);
}

/* ── Galería: stats row ──────────────────────── */
.gallery-stats-row {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.gallery-stat-item { display: flex; flex-direction: column; gap: 0.15rem; }
.gallery-stat-val {
  font-family: var(--serif);
  font-size: 1.5rem;
  color: var(--gold);
  line-height: 1;
  text-shadow: 0 0 20px rgba(201,169,110,0.25);
}
.gallery-stat-val.rose { color: var(--rose); }
.gallery-stat-label {
  font-family: var(--mono);
  font-size: 0.55rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--muted);
}
.gallery-stat-sep {
  width: 1px;
  background: var(--border);
  align-self: stretch;
}

/* ── Galería: filter bar ─────────────────────── */
.gallery-filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.filter-label {
  font-family: var(--mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--dimmed);
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 0.6rem;
  color: var(--muted);
  background: transparent;
  cursor: pointer;
  transition: all var(--trans-fast);
  letter-spacing: 0.05em;
}
.filter-chip:hover { border-color: var(--border-hi); color: var(--text); }
.filter-chip.active {
  border-color: var(--rose);
  color: var(--rose);
  background: rgba(184,117,106,0.08);
}

/* ── Timeline: month section ─────────────────── */
.timeline { display: flex; flex-direction: column; gap: 3.5rem; }

.month-section {
  animation: fadeSlideUp 0.45s var(--ease) both;
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.month-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.5rem;
}
.month-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, var(--gold-dim), transparent);
}
.month-label { display: flex; align-items: baseline; gap: 0.5rem; flex-shrink: 0; }
.month-name {
  font-family: var(--serif);
  font-size: 1.15rem;
  font-style: italic;
  color: var(--gold);
}
.month-year {
  font-family: var(--mono);
  font-size: 0.6rem;
  color: var(--muted);
  letter-spacing: 0.2em;
}
.month-count {
  font-family: var(--mono);
  font-size: 0.55rem;
  color: var(--dimmed);
  letter-spacing: 0.1em;
  margin-left: 0.3rem;
}

/* ── Timeline: month layout ──────────────────── */
.month-content {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 1rem;
  align-items: start;
}
.month-content.no-featured { grid-template-columns: 1fr; }

/* ── Timeline: featured photo ────────────────── */
.featured-photo {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border);
  cursor: pointer;
  transition: border-color var(--trans-med), transform var(--trans-med);
  flex-shrink: 0;
}
.featured-photo:hover {
  border-color: var(--border-hi);
  transform: scale(1.015);
}
.featured-photo img,
.featured-photo .photo-placeholder-inner {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--trans-med);
}
.featured-photo:hover img,
.featured-photo:hover .photo-placeholder-inner { transform: scale(1.04); }

.featured-badge {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  font-family: var(--mono);
  font-size: 0.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #0c0b10;
  background: var(--gold);
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  pointer-events: none;
}
.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(12,11,16,0.85) 0%, transparent 55%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem;
  opacity: 0;
  transition: opacity var(--trans-med);
  pointer-events: none;
}
.featured-photo:hover .featured-overlay { opacity: 1; }
.featured-caption {
  font-family: var(--body);
  font-size: 0.82rem;
  color: var(--text);
  font-style: italic;
  line-height: 1.5;
}
.featured-date {
  font-family: var(--mono);
  font-size: 0.55rem;
  color: var(--gold);
  letter-spacing: 0.15em;
  margin-top: 0.3rem;
}

/* ── Timeline: special moment badges ─────────── */
.special-badge {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  width: 22px;
  height: 22px;
  background: rgba(184,117,106,0.85);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  backdrop-filter: blur(4px);
  pointer-events: none;
  transition: transform var(--trans-fast);
  z-index: 2;
}
.special-badge-featured {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  width: 26px;
  height: 26px;
  background: rgba(184,117,106,0.85);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 2;
}

/* ── Timeline: special toggle button ─────────── */
.special-toggle-btn {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  width: 24px;
  height: 24px;
  background: rgba(12,11,16,0.6);
  border: 1px solid var(--border-hi);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--trans-fast), background var(--trans-fast);
  z-index: 3;
  backdrop-filter: blur(4px);
}
.photo-card:hover .special-toggle-btn { opacity: 1; }
.special-toggle-btn:hover { background: rgba(184,117,106,0.4); }
.special-toggle-btn.is-special { background: rgba(184,117,106,0.75); opacity: 1; }

/* ── Timeline: photos rail ───────────────────── */
.photos-rail { display: flex; flex-direction: column; gap: 0.75rem; }
.photos-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

/* ── Timeline: album rail card ───────────────── */
.album-rail-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border-hi);
  cursor: pointer;
  background: var(--card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background var(--trans-fast), transform var(--trans-fast);
}
.album-rail-card:hover {
  background: var(--card-high);
  transform: scale(1.03);
}
.album-rail-icon { font-size: 1.4rem; }
.album-rail-title {
  font-family: var(--serif);
  font-size: 0.75rem;
  font-style: italic;
  color: var(--gold);
  text-align: center;
  padding: 0 0.5rem;
  line-height: 1.3;
}
.album-rail-count {
  font-family: var(--mono);
  font-size: 0.55rem;
  color: var(--muted);
  letter-spacing: 0.1em;
}

/* ── Timeline: "ver más" card ────────────────── */
.more-card {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius);
  border: 1px dashed var(--dimmed);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: border-color var(--trans-fast);
}
.more-card:hover { border-color: var(--gold-dim); }
.more-count {
  font-family: var(--serif);
  font-size: 1.1rem;
  color: var(--muted);
}
.more-label {
  font-family: var(--mono);
  font-size: 0.55rem;
  color: var(--dimmed);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* ── Responsive: max-width 768px ─────────────── */
@media (max-width: 768px) {
  .gallery-stats-row { gap: 1.2rem; padding: 0.75rem 1rem; }
  .gallery-stat-val { font-size: 1.2rem; }
  .gallery-filter-bar { gap: 0.5rem; }
  .month-content { grid-template-columns: 1fr; }
  .featured-photo { aspect-ratio: 4 / 3; }
  .photos-row { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; }
  .view-btn { padding: 0.4rem 0.65rem; font-size: 0.6rem; }
}
```

---

## 8. Summary of files to create or modify

| File | Action |
|------|--------|
| `modules/galeria/types.ts` | Add `is_special: boolean` to `Photo` interface |
| `modules/galeria/actions.ts` | Add `toggleSpecialMomento` server action |
| `modules/galeria/hooks/useFotos.ts` | Verify `is_special` is included in the select query |
| `modules/galeria/components/GaleriaGrid.tsx` | Add view toggle, stats row, filter bar, conditional rendering |
| `modules/galeria/components/TimelineView.tsx` | **Create new component** (month grouping, featured photo, photos rail) |
| `modules/galeria/components/FotoCard.tsx` | Add `is_special` star badge when `photo.is_special === true` |
| `app/globals.css` | Append all new CSS blocks (Section 7) |
| Supabase (manual) | Run the `ALTER TABLE` migration to add `is_special` column |

---

## 9. Constraints and rules

1. **Do not refactor** existing components, hooks, or server actions. Only add to them.
2. **All existing modal flows** (FotoModal, AlbumModal, UploadModal, Lightbox) must remain wired up exactly as they are.
3. **`toggleSpecialMomento` is optimistic**: update the local state immediately and call the server action in the background. Rollback on error.
4. The `is_special` toggle button on `.photo-card` must have `e.stopPropagation()` so it doesn't trigger `onPhotoClick`.
5. **Placeholder fallback**: if a photo has no `url`, render the same emoji + gradient fallback used in the existing `FotoCard` component (`photo.emoji` centered over `photo.bg_gradient` background).
6. All new CSS classes go at the end of `globals.css`. Do not use Tailwind classes (Tailwind v4 is installed but intentionally unused in components).
7. Default view mode on first visit is `'timeline'`. After the user changes it, persist in `localStorage('galeria-view')` and restore on mount.
8. The filter applies to both the grid view and the timeline view. In the timeline view, if all photos in a month group are filtered out and no albums remain, hide that month group entirely.
9. Follow the existing responsive rule: `@media (max-width: 768px)` in `globals.css`. All new layout must adapt at this breakpoint.
10. Do not rename or move any existing files.
