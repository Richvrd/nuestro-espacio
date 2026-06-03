# Cartas Module — Master-Detail Redesign

## Context

You are redesigning the `/cartas` module of **Nuestro Espacio**, a private couple's web app built with **Next.js (App Router) + React + Supabase + custom CSS** (`app/globals.css`). The stack uses server actions in `modules/cartas/actions.ts`, a `"use client"` main component `CartasApp`, and two modals: `LetterReaderModal` and `WriteLetterModal`.

Before touching anything, read `app/globals.css` in full to understand the design system variables. Use only those variables — never hardcode colors, fonts, or spacing.

**All existing server actions (`getLetters`, `insertLetter`, `updateLetter`, `deleteLetter`) must remain intact and continue working.** You are only changing the frontend architecture and adding one database column.

---

## Core idea: from flat list + modal → master-detail split panel

The current layout is a single-column list of letters that opens a reading modal on click. Replace this with a **two-panel split layout**:

- **Left panel** (fixed width `340px`): the letters list, filter tabs, and search
- **Right panel** (flex 1): the selected letter displayed inline — no modal needed for reading

The `LetterReaderModal` component becomes a static inline reader panel. The `WriteLetterModal` becomes a full-screen overlay composer (kept as a modal, but redesigned).

---

## 1. Database change

Add a `mood` column to the `letters` table:

```sql
ALTER TABLE letters ADD COLUMN mood text DEFAULT NULL;
```

Valid values: `'amor'` `'nostalgia'` `'gratitud'` `'alegría'` `'melancolía'` — or `null` (no mood).

Update `modules/cartas/types.ts` — add to the `Letter` interface:

```ts
mood: string | null;
```

---

## 2. Server actions changes (`modules/cartas/actions.ts`)

### 2.1 Update `insertLetter`

Add `mood` parameter:

```ts
insertLetter(from_name, to_name, subject, body, mood: string | null)
```

Include `mood` in the INSERT payload. Keep everything else unchanged.

### 2.2 Update `updateLetter`

Add `mood` parameter:

```ts
updateLetter(id, subject, body, mood: string | null)
```

Include `mood` in the UPDATE payload. Keep everything else unchanged.

### 2.3 Add `markLetterRead`

```ts
export async function markLetterRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('letters').update({ unread: false }).eq('id', id);
  revalidatePath('/cartas');
}
```

---

## 3. Layout — split panel

The root layout of the module uses a two-column grid:

```css
.cartas-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  height: calc(100vh - var(--nav-height, 60px));
  overflow: hidden;
  gap: 0;
}
```

Left panel (`.cartas-sidebar`) and right panel (`.cartas-reader`) are siblings inside `.cartas-layout`.

Both panels have `overflow-y: auto` independently — the list scrolls on the left, the letter content scrolls on the right.

A 1px vertical divider separates the panels:
```css
.cartas-sidebar {
  border-right: 1px solid var(--border);
}
```

---

## 4. Left panel — letters list

### 4.1 Sidebar header

```css
.cartas-sidebar-header {
  padding: 1.5rem 1.25rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}
```

Contains:
- Title row: `"cartas"` in `var(--serif)` italic 1.3rem + `var(--gold)`, and a `"+ escribir"` button (`.cartas-new-btn`) right-aligned
- Search input (`.cartas-search`): full-width, `var(--surface)` background, `var(--border)` border, `var(--radius)`, `var(--mono)` 0.72rem, placeholder `"buscar carta..."` in italic `var(--dimmed)`. On focus: border becomes `var(--border-hi)`.
- Filter tabs row

### 4.2 Filter tabs

Four tab buttons in a flex row:

| Tab | Filter logic |
|-----|-------------|
| `Todas` | show all |
| `No leídas` | `unread === true` |
| `De mí` | letter's `from_name` matches the current user's display name (read from `COUPLE` constants) |
| `Para mí` | letter's `to_name` matches the current user's display name |

```css
.cartas-tabs {
  display: flex;
  gap: 0.25rem;
}
.cartas-tab {
  flex: 1;
  padding: 0.35rem 0.5rem;
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s var(--ease);
}
.cartas-tab:hover { color: var(--text); border-color: var(--border); }
.cartas-tab.active {
  color: var(--gold);
  background: var(--card);
  border-color: var(--border-hi);
}
```

Show a small badge count on "No leídas" tab if count > 0:
```css
.cartas-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px; height: 16px;
  background: var(--rose);
  color: #080710;
  border-radius: 50%;
  font-size: 0.45rem;
  margin-left: 0.3rem;
  font-family: var(--mono);
}
```

### 4.3 Letter list items

The list (`.cartas-list`) is a `flex column` with no gap (items are visually separated by a bottom border).

Each item (`.cartas-list-item`):

```css
.cartas-list-item {
  padding: 1rem 1.25rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  position: relative;
  transition: background 0.15s var(--ease);
}
.cartas-list-item:hover { background: var(--surface); }
.cartas-list-item.selected {
  background: var(--card);
  border-left: 2px solid var(--gold);
  padding-left: calc(1.25rem - 2px);
}
```

Inside each item:

**Row 1** — flex row, space-between:
- Left: `"de [from_name]"` in `var(--mono)` 0.52rem uppercase `var(--muted)`
- Right: mood indicator dot (see 4.4) + unread dot if `unread === true`

**Row 2** — subject in `var(--serif)` italic 0.92rem `var(--text)`, `font-weight: 500` if unread

**Row 3** — body preview: first 80 characters, `var(--body)` 0.75rem `var(--muted)`, 1-line clamp, `text-overflow: ellipsis`

**Row 4** — date in `var(--mono)` 0.52rem `var(--dimmed)`

**Unread indicator**: a `6px × 6px` circle `var(--rose)` absolutely positioned at `top: 1rem; right: 1.25rem` — only visible when `unread === true` and the item is not selected.

### 4.4 Mood indicator

Each mood maps to a color dot (5px circle) shown in the top-right of the list item, next to the unread dot:

| Mood | Color |
|------|-------|
| `amor` | `var(--rose)` |
| `nostalgia` | `#8a7ab5` (soft purple) |
| `gratitud` | `var(--gold)` |
| `alegría` | `#7ab58a` (soft green) |
| `melancolía` | `var(--teal)` |

```css
.mood-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  opacity: 0.8;
}
```

### 4.5 Empty states

**No letters at all:**
Center a `.cartas-empty` div in the list area:
- Ornament `💌` large
- Text `"Aún no hay cartas"` in `var(--serif)` italic `var(--muted)`
- Subtext `"La primera estará esperando aquí"` in `var(--mono)` small `var(--dimmed)`

**No results from search/filter:**
- Ornament `🔍`
- Text `"No hay cartas que coincidan"` in `var(--serif)` italic `var(--muted)`

---

## 5. Right panel — inline letter reader

### 5.1 Empty state (no letter selected)

When no letter is selected, show a centered `.cartas-reader-empty`:
- Large ornament `✦` in `var(--gold)` with glow
- Text `"Selecciona una carta para leerla"` in `var(--serif)` italic `var(--muted)` 1.1rem
- Subtext `"o escribe una nueva"` in `var(--mono)` 0.6rem `var(--dimmed)`

### 5.2 Letter reader content

When a letter is selected, render `.cartas-reader-content` with a max-width of `640px`, centered horizontally, padding `3rem 2rem`.

**Reader header:**

```css
.cartas-reader-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 2rem;
}
```

Contains:
- Mood tag pill (`.cartas-mood-pill`) — only if mood exists. Shows mood emoji + mood name in `var(--mono)` 0.55rem. Each mood has its emoji:
  - `amor` → `💗`
  - `nostalgia` → `🌙`
  - `gratitud` → `✨`
  - `alegría` → `🌸`
  - `melancolía` → `🌧`
- From/To line: `"de [from_name] → para [to_name]"` in `var(--mono)` 0.6rem `var(--gold)` uppercase
- Subject: `var(--serif)` 2rem font-weight 400 `var(--text)` — if `unread`, add a subtle left border `3px solid var(--rose)` and `padding-left: 0.75rem`
- Date: `var(--mono)` 0.6rem `var(--muted)`
- Action row: edit button + delete button (right-aligned), same style as existing menu actions

```css
.cartas-mood-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
  font-family: var(--mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  width: fit-content;
  border: 1px solid;
}
/* each mood variant uses its color at 10% opacity background and full color border/text */
```

**Reader body:**

```css
.cartas-reader-body {
  font-family: var(--body);
  font-size: 1rem;
  line-height: 2;
  color: rgba(var(--text-rgb, 237,232,218), 0.85);
  white-space: pre-wrap;
}
```

Render line breaks as actual paragraphs: split `body` by `\n\n` into `<p>` tags, single `\n` becomes `<br>`.

**Reader signature:**

Below the body, after a `2rem` top margin:
```css
.cartas-reader-sig {
  font-family: var(--serif);
  font-style: italic;
  font-size: 1.3rem;
  color: var(--gold);
  text-align: right;
}
```

Text: `"— [from_name]"`

**Reveal animation:** when a new letter is selected, the reader content fades in with a subtle upward motion:

```css
.cartas-reader-content {
  animation: cartasReaderEnter 0.35s var(--ease) both;
}
@keyframes cartasReaderEnter {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Force re-trigger the animation by changing a React `key` prop to `letter.id` on the container.

### 5.3 Mark as read on open

When a letter is selected and `unread === true`, call `markLetterRead(letter.id)` and update local state `unread → false` immediately (optimistic). Do this in the `handleSelectLetter` handler.

---

## 6. Write / Edit overlay — full-screen composer

Replace `WriteLetterModal` with a full-screen overlay composer (`.cartas-composer-overlay`). It covers the entire viewport with a dark semi-transparent backdrop and a centered composer panel.

```css
.cartas-composer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 7, 16, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 2rem;
  animation: cartasOverlayIn 0.3s var(--ease) both;
}
@keyframes cartasOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.cartas-composer {
  background: var(--surface);
  border: 1px solid var(--border-hi);
  border-radius: 16px;
  width: min(620px, 96vw);
  max-height: 90vh;
  overflow-y: auto;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: cartasComposerIn 0.4s var(--ease) both;
}
@keyframes cartasComposerIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

### 6.1 Composer header

Left: ornament `✍️` + title `"nueva carta"` (or `"editar carta"` when editing) in `var(--serif)` italic 1.2rem `var(--gold)`.
Right: close button `×` in `var(--muted)`, 1.5rem.

### 6.2 Composer fields

**From / To row** — two inputs side by side (`grid-template-columns: 1fr 1fr`, gap `1rem`):
- Both are styled like the login inputs but smaller
- Labels: `"de"` and `"para"` in `var(--mono)` 0.55rem uppercase `var(--muted)`
- Placeholder suggestions: `"Ricardo"`, `"Sarai"` — or add a small quick-fill button next to each (tiny pill button with the partner's name)

**Subject input** — full width, same style

**Mood selector** — a flex row of 5 pill buttons, one per mood. Selected pill gets its mood color as background (10% opacity) and border. Unselected pills use `var(--border)`. Label above: `"estado de ánimo"` in `var(--mono)` 0.55rem `var(--muted)`. Include a `"ninguno"` pill to clear the mood.

```css
.composer-mood-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.composer-mood-pill {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  font-family: var(--mono);
  font-size: 0.58rem;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.15s var(--ease);
  background: transparent;
  color: var(--muted);
}
.composer-mood-pill:hover { border-color: var(--border-hi); color: var(--text); }
/* .active variant per mood is applied via inline style using the mood color */
```

**Body textarea** — `var(--body)` font, `font-size: 0.95rem`, `line-height: 1.9`, `min-height: 260px`, `resize: vertical`, `var(--surface)` background, `var(--border)` border, focus glow same as login inputs. Placeholder: `"Escribe lo que sientes..."` in italic.

**Divider** — 1px `var(--border)` horizontal line before the action buttons.

**Action row** — right-aligned:
- Cancel button: ghost style, `var(--muted)` text
- Save button: `var(--gold)` background, `#080710` text, same as existing primary button style. Text: `"guardar carta"`. While saving: disabled + `"guardando..."`.

### 6.3 Char counter on body

Below the textarea, show a character count in `var(--mono)` 0.52rem `var(--dimmed)`:
`"[n] caracteres"` — no maximum limit enforced, just informational.

---

## 7. CartasApp state — updated

```ts
const [letters, setLetters]             = useState<Letter[]>(initialLetters);
const [selectedId, setSelectedId]       = useState<string | null>(null);
const [showComposer, setShowComposer]   = useState(false);
const [editingLetter, setEditingLetter] = useState<Letter | null>(null);
const [activeTab, setActiveTab]         = useState<'all'|'unread'|'from'|'to'>('all');
const [search, setSearch]               = useState('');
```

Derived values (useMemo):
```ts
const filteredLetters = useMemo(() => {
  let result = letters;
  if (activeTab === 'unread') result = result.filter(l => l.unread);
  if (activeTab === 'from')   result = result.filter(l => l.from_name === COUPLE.name1 || ...);
  if (activeTab === 'to')     result = result.filter(l => l.to_name === COUPLE.name1 || ...);
  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(l =>
      l.subject.toLowerCase().includes(q) ||
      l.body.toLowerCase().includes(q) ||
      l.from_name.toLowerCase().includes(q)
    );
  }
  return result;
}, [letters, activeTab, search]);

const selectedLetter = useMemo(
  () => letters.find(l => l.id === selectedId) ?? null,
  [letters, selectedId]
);
```

---

## 8. CSS additions (`app/globals.css`)

Append all new styles at the end under:

```css
/* ══════════════════════════════════════════════════════════
   CARTAS — MASTER-DETAIL REDESIGN
══════════════════════════════════════════════════════════ */
```

Do not modify any existing `.letter-*` or `.write-*` CSS. The existing classes can remain (they will no longer be used, but removing them is unnecessary).

---

## 9. Responsive — `@media (max-width: 768px)`

On mobile the split panel collapses:

```css
@media (max-width: 768px) {
  .cartas-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
    min-height: calc(100vh - var(--nav-height, 60px));
  }
  .cartas-sidebar {
    border-right: none;
    border-bottom: 1px solid var(--border);
    max-height: 45vh;
    overflow-y: auto;
  }
  /* When a letter is selected on mobile, hide the list and show only the reader */
  .cartas-layout.letter-open .cartas-sidebar { display: none; }
  .cartas-layout.letter-open .cartas-reader { display: flex; }
  /* Add a back button in the reader header on mobile */
  .cartas-reader-back { display: flex; }
}
@media (min-width: 769px) {
  .cartas-reader-back { display: none; }
}
```

Add a `"← volver"` back button (`.cartas-reader-back`) at the top of the reader panel, visible only on mobile, that clears `selectedId` and removes `letter-open` from the layout class.

---

## 10. Constraints

1. **Do not break** existing `getLetters`, `insertLetter`, `updateLetter`, `deleteLetter` — only add `mood` parameter where specified.
2. **Optimistic updates** — letter creation, deletion, and read-marking must update local state immediately before the server confirms.
3. **No Tailwind classes** — all styling via `globals.css` classes.
4. The `key={letter.id}` prop on `.cartas-reader-content` is required to re-trigger the entrance animation on every letter change.
5. The `markLetterRead` call must happen only once per letter — check `unread === true` before calling it.
6. The composer overlay must trap focus while open and close on `Escape` key (`useEffect` with `keydown` listener, removed on cleanup).
7. The search input must debounce at `300ms` to avoid filtering on every keystroke — use a `useEffect` + `setTimeout` pattern or a simple `useDeferredValue`.
8. Use `COUPLE.name1` and `COUPLE.name2` from `lib/constants.ts` for the "De mí / Para mí" filter logic — do not hardcode names.
9. Do not rename or move any existing file.
10. The `mood` column is nullable — the composer must work correctly when no mood is selected (send `null`).
