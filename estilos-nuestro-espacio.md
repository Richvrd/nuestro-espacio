# Estilos — Nuestro Espacio

Documentación de referencia de los estilos, colores, tipografías, tamaños, espaciados y tecnologías visuales de la aplicación **Nuestro Espacio** (web privada de pareja — Sarai ♥ Ricardo). Todo el texto de la UI está en **español**.

> **Propósito**: que cualquier IA o desarrollador entienda a la perfección el sistema de estilos y tecnologías sin necesidad de leer los archivos fuente.

> **Tema actual — «Aurora»** (rama `diseño`): rediseño completo del tema. Paleta *Northern Lights* (violeta/rosa/cian sobre fondo índigo) y tipografías *Great Vibes + Cormorant Garamond + Source Serif 4 + JetBrains Mono*. Los nombres de token legacy `--gold`/`--teal` se renombraron a `--violet`/`--cyan`; `--rose` conserva su nombre (sigue siendo rosa).

---

## 1. Tecnologías de estilado

| Tecnología | Estado | Detalle |
|---|---|---|
| **CSS puro (custom)** | ✅ Único sistema real | Todo el estilo vive en `app/globals.css` (~6.580 líneas) |
| **CSS Custom Properties** | ✅ Base del diseño | Variables en `:root` (colores, fuentes, radios, easing, transiciones) |
| **Tailwind CSS v4** | ⚠️ Instalado, **NO usado** | Dependencia presente (`tailwindcss` + `@tailwindcss/postcss`) pero **ningún template usa clases Tailwind** |
| **Google Fonts** | ✅ En runtime | Cargadas vía `<link>` en `app/layout.tsx` (Great Vibes, Cormorant Garamond, Source Serif 4, JetBrains Mono) |
| **`styles/tokens.css`** | ⚠️ Duplicado obsoleto | Copia de las variables de `:root` de `globals.css`; **no se importa ni se usa** |

**Fuente de verdad**: `app/globals.css` → importado en `app/layout.tsx` (`import "./globals.css"`).

---

## 2. Design tokens — variables CSS (`:root`)

Definidas en las líneas 1–30 de `app/globals.css`. Todo el tema del sitio se deriva de estas variables; **no usar valores hardcodeados** si existe token.

### 2.1 Colores

**Fondo / superficies (escala oscura, neutros fríos):**

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#0a0813` | Fondo general de la app (índigo casi negro) |
| `--surface` | `#14111f` | Superficies elevadas: sidebar, modales, cajas |
| `--card` | `#1a1730` | Tarjetas, inputs, contenedores de contenido |
| `--card-high` | `#232042` | Tarjetas elevadas/hover, menús desplegables |

**Bordes:**

| Variable | Valor | Uso |
|---|---|---|
| `--border` | `rgba(255,255,255,0.07)` | Bordes normales / divisores |
| `--border-hi` | `rgba(167,139,250,0.25)` | Bordes destacados (hover, tarjetas importantes, modales) |

**Texto:**

| Variable | Valor | Uso |
|---|---|---|
| `--text` | `#f2effa` | Texto principal (blanco lavanda) |
| `--muted` | `#8d86a8` | Texto secundario, metadatos, labels |
| `--dimmed` | `#4a4470` | Texto terciario / deshabilitado, placeholders |

**Acentos (paleta «Aurora» — Northern Lights):**

| Variable | Valor | Uso |
|---|---|---|
| `--violet` | `#a78bfa` | **Color principal**. Acentos, botones primarios, activos, valores numéricos, fecha/destacados (antes `--gold`) |
| `--violet-dim` | `#6d5bb0` | Violeta atenuado (hovers, decoración sutil) |
| `--rose` | `#f472b6` | Acento secundario (rosa). Errores, "enamorados", badges de no leído, categorías |
| `--rose-dim` | `#9d3d6b` | Rosa atenuado |
| `--cyan` | `#67e8f9` | Cian. Módulo cápsulas/cosmos, categoría "viaje" (antes `--teal`) |

**Otros colores en uso (valores directos, sin token):**

| Contexto | Valor |
|---|---|
| Texto sobre fondo violeta (botones primarios) | `#0a0813` |
| Hover de botón primario (violeta claro) | `#c4b5fd` |
| Categoría timeline "hito" | `#c084fc` (púrpura) |
| Categoría timeline "primer vez" | `#f472b6` (= `--rose`) |
| Sombra de texto/glow en números | `color-mix(in srgb, var(--violet) 30%, transparent)` |
| Gradientes radiales decorativos | `rgba(167,139,250,0.04–0.08)`, `rgba(244,114,182,0.07)`, `rgba(103,232,249,0.04)` |
| Overlays de modales | `rgba(10,8,19,0.85)` con `backdrop-filter: blur(8–12px)` |

### 2.2 Tipografías (font stacks)

| Variable | Stack | Uso |
|---|---|---|
| `--script` | `'Great Vibes', cursive` | Nombre de la pareja, firmas de cartas, acentos románticos. Elegante/caligráfica |
| `--serif` | `'Cormorant Garamond', Georgia, serif` | Títulos, encabezados, números grandes del contador, sujetos de cartas/cápsulas, firmas |
| `--body` | `'Source Serif 4', Georgia, serif` | Cuerpo de texto, párrafos, inputs, descripciones |
| `--mono` | `'JetBrains Mono', monospace` | Labels, subtítulos, metadatos, fechas, botones, tags, todo lo "técnico/de apoyo" |

Fuentes cargadas en `app/layout.tsx`:
```
Cormorant Garamond: ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500
Great Vibes:        wght@400
JetBrains Mono:     wght@300;400;500
Source Serif 4:     ital,wght@0,300;0,400;0,600;1,300;1,400
```
Peso base del `body`: `font-weight: 300`.

### 2.3 Medidas, radios y movimiento

| Variable | Valor | Uso |
|---|---|---|
| `--sidebar` | `220px` | Ancho del sidebar de escritorio (en móvil pasa a `0px`) |
| `--radius` | `10px` | Radio de borde base (cards, inputs, botones, menús) |
| `--ease` | `cubic-bezier(0.25, 0, 0, 1)` | Curva de easing por defecto de todo el sitio |
| `--trans-fast` | `0.15s var(--ease)` | Hover micro-interacciones |
| `--trans-med` | `0.3s var(--ease)` | Transiciones de estado, overlays, apariciones |
| `--trans-slow` | `0.6s var(--ease)` | Transiciones largas (no usada tan frecuente) |

Radios derivados: `calc(var(--radius) * 1.5)` = **15px** (modales), `calc(var(--radius) / 2)` = **5px** (miniaturas). Modales específicos usan **16px** o **18px** fijos (login, composer cartas, modales películas).

---

## 3. Tipografía — tamaños por patrón (escala)

No hay escala formal; el patrón recurrente es: **títulos serif grandes + labels mono minúsculos con letter-spacing amplio + cuerpo Source Serif 4**.

| Rol | Fuente | Tamaño | Extra |
|---|---|---|---|
| Título de página | serif | `2.2rem` | `line-height: 1` |
| Título hero inicio | serif | `clamp(2.5rem, 5vw, 4.5rem)` | |
| Números del contador (hero) | serif | `clamp(2.8rem, 6vw, 4.5rem)` | color violeta, text-shadow glow |
| Números del contador (card) | serif | `2.8rem` | |
| Números stats bar / galería | serif | `1.5–1.6rem` | |
| Sujeto carta (reader) | serif | `2rem` | |
| Sujeto carta (modal) | serif | `1.6rem` | |
| Sujeto cápsula (reader) | serif | `1.8rem` | |
| Título de tarjeta moment | serif | `1–1.25rem` según intensidad | |
| Cuerpo de carta | body | `0.95–1rem`, `line-height: 2` | |
| Cuerpo de cápsula | body | `0.9rem`, `line-height: 1.85` | con `white-space: pre-line` |
| Descripción de tarjeta | body | `0.78rem` | |
| Subtítulo de página | mono | `0.62rem`, `letter-spacing: 0.3em`, uppercase | |
| Labels de formulario | mono | `0.6rem`, `letter-spacing: 0.15em`, uppercase | |
| Labels de contador/unidades | mono | `0.5–0.55rem`, `letter-spacing: 0.3em`, uppercase | |
| Metadatos/fechas | mono | `0.5–0.62rem` | |
| Botones | mono | `0.7rem`, `letter-spacing: 0.1em` | |
| Texto de apoyo (muted) | — | `0.6–0.72rem` | |

**Regla de oro**: los **labels y metadatos SIEMPRE** usan `var(--mono)`, `text-transform: uppercase` y `letter-spacing` amplio (0.1–0.45em). Los **títulos SIEMPRE** usan `var(--serif)` con `font-weight: 400`. El **cuerpo** usa `var(--body)` con `font-weight: 300`.

---

## 4. Layout general

```
body (fondo --bg, overflow hidden, sin scroll)
└─ body::before — textura noise SVG fija (opacity .6, z-index 9998, pointer-events none)
├─ #starfield — estrellas animadas (canvas/DOM, z-index 0, pointer-events none)
├─ #app (flex, height 100vh, z-index 1)
│  ├─ #sidebar (220px, fondo --surface, borde derecho)
│  │  ├─ .sidebar-top (nombre de la pareja + since + subtitle)
│  │  ├─ nav (items + secciones + badges)
│  │  ├─ .audio-player
│  │  └─ .sidebar-bottom (logout)
│  └─ #main (flex:1, overflow-y auto)
│     └─ .page.active (padding: 2.5rem 3rem)
└─ #toast-area / .toast-container (fixed bottom-right)
```

### 4.1 Sidebar (`#sidebar`)
- Ancho `220px`, `height: 100vh`, fondo `--surface`, `border-right: 1px solid var(--border)`.
- Nombre de la pareja (`.sidebar-couple`): serif `1rem`, texto con **gradiente violeta→rosa→violeta animado** (`background-clip: text` + `grad-shimmer 4s`).
- `.sidebar-since` / `.sidebar-subtitle`: mono minúsculo, `letter-spacing` amplio, color `--muted`/`--violet`.
- `.nav-item`: `0.85rem`, color `--muted`; hover → `--text` + fondo `rgba(255,255,255,0.03)`; `.active` → `--violet` + fondo `rgba(167,139,250,0.06)` + **barra izquierda de 3px violeta**.
- `.nav-badge`: pill mono `0.5rem`, fondo `--rose-dim`, texto `--rose`.

### 4.2 Página
- `.page`: `min-height: 100vh`, `padding: 2.5rem 3rem`, animación de entrada `page-in` (0.5s: fade + translateY 16px + scale .98).
- `.page-header`: flex, `border-bottom`, `margin-bottom: 2.5rem`.
- `.page-title`: serif `2.2rem`. `.page-subtitle`: mono `0.62rem` uppercase con letter-spacing 0.3em.

---

## 5. Componentes base

### 5.1 Botones (`.btn`)
| Variante | Fondo | Texto | Borde | Hover |
|---|---|---|---|---|
| `.btn-primary` | `--violet` | `#0a0813` | — | `#c4b5fd`, `translateY(-1px)`, sombra `0 4px 20px rgba(167,139,250,0.3)` |
| `.btn-ghost` | transparente | `--muted` | `1px solid var(--border)` | `--text`, borde `--border-hi`, fondo `rgba(167,139,250,0.04)` |

Tamaño: `padding: 0.55rem 1.1rem`, mono `0.7rem`, `letter-spacing: 0.1em`, `border-radius: var(--radius)`. Variante `.btn-sm` → `padding: 0.35rem 0.7rem`, `0.6rem`.

### 5.2 Tarjetas (`.card`)
Fondo `--card`, borde `1px solid var(--border)`, `border-radius: var(--radius)`, `overflow: hidden`; hover → borde `--border-hi`.

### 5.3 Modales
- `.modal-backdrop`: fixed inset 0, fondo `rgba(6,6,15,0.85)`, `backdrop-filter: blur(12px)`, `z-index: 1000`, animación `fade-in`.
- `.modal-box`: fondo `--surface`, borde `--border-hi`, `border-radius: 15px`, `width: min(480px, 92vw)`, animación `slide-up` (translateY 16px).
- Modales específicos: `.foto-modal-box` (860px), `.album-modal-box` (760px), `.letter-modal-box` (620px), `.write-modal-box` (540px), todos `max-height: 88vh` y con scroll interno.
- `.modal-title`: mono `0.7rem`, uppercase, letter-spacing 0.2em, color `--muted`.

### 5.4 Formularios
- `.form-label`: mono `0.6rem`, uppercase, `--muted`, letter-spacing 0.15em.
- `.form-input` / inputs: fondo `--card`, borde `--border`, `radius: 10px`, body `0.85rem`, `:focus` → borde `--violet`. Placeholder → `--dimmed`.
- `.form-error`: texto `--rose` sobre fondo `rgba(244,114,182,0.08)`.
- Estados: `.spinner` (12px, borde white .2, `--text`), `.btn-loading`, `.modal-loading` (opacity .7), `.file-drop-disabled` (opacity .5).

### 5.5 Toasts (`components/ui/ToastContainer`)
- `.toast-container`: fixed bottom-right (`2rem`), columna, `z-index: 9000`, `pointer-events: none`.
- `.toast-item`: fondo `--card`, borde `--border`, radius 10px, `min-width: 280px; max-width: 380px`, sombra `0 8px 32px rgba(8,7,16,0.5)`, entrada `toastEnter`.
- Acento lateral de 3px `.toast-accent`, icono circular, mensaje body `0.82rem` (clamp 2 líneas), botón dismiss, barra de progreso `2px`.

### 5.6 Estados vacíos
`.empty-state`: centrado, padding `4rem 2rem`, icono `3rem` opacity .4, título serif `1.1rem` `--muted`, sub mono `0.65rem` `--dimmed`.

---

## 6. Módulos — estilos específicos

### 6.1 Inicio (`(app)/inicio`)
- **Rediseño scroll-snap**: `#page-home:has(.inicio-scroll-wrap)` → flex column sin scroll propio; `.inicio-scroll-wrap` con `scroll-snap-type: y mandatory`.
- `.inicio-panel`: `100vh`, centrado, con overlay radial sutil (`rgba(8,7,16,0.55)`) para que el starfield se transparente.
- `.inicio-section-tag`: mono `0.5rem` uppercase, letter-spacing 0.4em, `--dimmed`, con línea de 20px `--violet-dim`.
- `.inicio-panel-inner`: grid `1fr 1.6fr`, gap `5rem`, max-width 960px.
- `.inicio-reveal`: entrada escalonada (opacity 0 → 1, translateY 20px → 0, delays 0.08s incrementales).
- `.inicio-dot-nav`: navegación por puntos, fixed derecha; `.active` → barra violeta 18px.
- `.inicio-galeria-grid`: grid `1.4fr 1fr` × 2 filas, `height: 380px`, primera foto `grid-row: span 2`.
- `.inicio-moment-card`, `.inicio-letter-item` (hover → borde izquierdo 3px `--rose`), `.inicio-capsule-card` (ornamento decorativo en esquina), `.skeleton` (shimmer).

### 6.2 Galería (`galeria`)
- `.gallery-grid`: `repeat(auto-fill, minmax(180px, 1fr))`, gap `1.2rem`.
- `.photo-card`: `aspect-ratio: 1`, **ligera rotación** (0.5deg / -0.8deg en `.odd`) estilo polaroid; hover → `translateY(-4px) scale(1.02)` + sombra violeta.
- `.photo-overlay`: gradiente inferior `rgba(12,11,16,0.85)` visible en hover con caption + fecha.
- **Álbumes como naipes** (`.album-stack`): dos capas superpuestas desplazadas 7px (trasera arriba-derecha, delantera abajo-izquierda).
- `.upload-zone`: `aspect-ratio: 1`, borde dashed `--border-hi`, hover → `--violet`.
- Stats (`.gallery-stats-row`): valores serif `1.5rem` violeta con glow `rgba(167,139,250,0.25)`.
- Filtros (`.filter-chip`): pills radius 20px; activo → `--rose`.

### 6.3 Cápsulas (`capsula`)
- `.capsulas-grid`: `minmax(240px, 1fr)`, gap 1rem.
- `.capsula-card`: base como `.card`; `.sellada` → borde `rgba(167,139,250,0.15)` + gradiente radial sutil; `.abierta` → borde `0.35` + fondo `linear-gradient(135deg, #1a1730, #201d38)`.
- `.capsula-card.just-opened`: animación `just-opened` (pulso de brillo violeta 1.8s).
- Countdowns: `.cdc-val` serif `1.3rem` violeta (segundos en `--violet-dim`); grande en modal `.scb-val` `1.8rem`.
- Reader: `.capsule-reader-body` con `border-left: 2px solid var(--violet-dim)`.
- Cosmos (`.cosmos-*`): acento `--cyan` (cian). Items list con hover `rgba(103,232,249,0.25)`. Botones `.btn-cosmos`, `.btn-send-space`, `.btn-restore`.

### 6.4 Cartas (`cartas`)
- **Master-detail**: `.cartas-layout` grid `340px 1fr`, altura completa, sin scroll de página.
- Sidebar de lista: búsqueda, tabs (`.cartas-tab.active` → fondo `--card`, texto `--violet`), items con `border-bottom`, `.selected` → `border-left: 2px solid var(--violet)`.
- Indicadores: `.mood-dot` (estado de ánimo, 6px), `.cartas-unread-dot` (6px `--rose`).
- Reader: `.cartas-reader-subject` serif `2rem`; `.unread` → `border-left: 3px solid var(--rose)`. Cuerpo `line-height: 2`, `color: rgba(237,232,218,0.85)`.
- Composer: overlay `rgba(8,7,16,0.85)` + blur 8px; panel `min(620px, 96vw)`, radius 16px, animación `cartasComposerIn`.
- **Responsive**: en <768px alterna sidebar↔reader (`.cartas-layout.letter-open`).

### 6.5 Timeline (`timeline`)
- Eje central: `.timeline::before` línea de 1px vertical con gradiente `--dimmed`, `left: 50%`.
- Partículas flotantes en el eje (`.tp`, animación `float-up`).
- **Filtro por años con planetas** (`.yf-planet`): círculo 52px con gradiente radial `#2a2548 → #100e1c`, anillo 3D `rotateX(72deg)`; activo → glow violeta.
- Separador de año: planeta 80px sobre la línea (`.year-planet-core-tl` 52px).
- Items alternados `.tl-item` grid `1fr 60px 1fr` (izq/der con connector de 2rem).
- **Nodos por intensidad**: `.node-normal` 12px, `.node-high` 18px con pulso, `.node-vhigh` 24px con anillo expansivo.
- **Cards por intensidad**: gradientes de fondo y border violeta progresivos; badges `.badge-high`/`.badge-vhigh`.
- **Categorías** (`.cat-*`): `primer-vez`=rosa, `viaje`=cian, `celebracion`=violeta, `cotidiano`=muted, `hito`=púrpura `#c084fc`.
- Vistas `.tl-view-wrapper.compact` (colapsa descripción/acciones con max-height) y `.expanded`.
- Vista por meses: `.month-header` con línea degradada `--violet-dim → transparent`, `.month-name` serif itálica `1.15rem` violeta.
- Foto destacada (`.featured-photo`): `aspect-ratio: 3/4`, hover scale 1.015, badge `--violet`, overlay gradiente.
- **Responsive**: eje a la izquierda (`left: 24px`), grid `48px 1fr`.

### 6.6 Películas (`peliculas`)
- Página con `max-width: 1100px`.
- Grid de posters: `minmax(160px, 1fr)`, tarjetas `aspect-ratio: 2/3`, hover `translateY(-4px) scale(1.02)`.
- Badge de rating en esquina con `backdrop-filter: blur(4px)`; punto `--rose` pulsante si sin rating.
- Vista lista: grid `54px 1fr auto`, hover `translateX(3px)`.
- Búsqueda TMDB: overlay + panel `min(620px, 96vw)`, resultados con poster 48×72px.
- Detalle: formulario `180px 1fr`, pills de rating 1–10, modal `min(700px, 94vw)`.

### 6.7 Música (`musica`)
- Landing placeholder: vinilo giratorio (`.vinyl-disc` 200px, animación `spin-disc` 4s, label central con iniciales + corazón rosa), título serif `2rem`, notas flotantes animadas.
- **Reproductor** (en sidebar): `.audio-player` con track info, seek bar de 3px con thumb violeta 10px, botones circulares 28px, control de volumen. En móvil: `.ap-mobile-trigger` (botón flotante 44px) + `.ap-mobile-overlay` con panel bottom-sheet.

### 6.8 Juegos (`juegos`)
- Scaffold únicamente (sin componentes, sin estilos propios).

### 6.9 Login (`(auth)/login`)
- `.login-page`: centrado, con gradiente radial `rgba(8,7,16,0.65)` sobre el starfield.
- `.login-card`: `max-width: 420px`, fondo `--card`, borde `--border-hi`, **radius 18px**, padding `3rem 2.5rem 2.5rem`, sombra multi-capa, entrada `loginCardEnter` (0.9s, cubic-bezier(0.16,1,0.3,1)) con delays escalonados (ornamento 0.1s, título 0.2s, tagline 0.3s).
- Inputs: fondo `--surface`, `caret-color: var(--violet)`, `:focus` → borde `--border-hi` + ring `0 0 0 3px rgba(167,139,250,0.08)` + **línea animada debajo** (`.login-input-line`, scaleX 0→1).
- Botón: violeta `0.7rem` uppercase letter-spacing 0.25em; hover `#c4b5fd`.
- Errores: `.login-error` con **animación shake** (`loginErrorShake`).
- Responsive <480px: card padding `2.5rem 1.5rem 2rem`, radius 14px.

---

## 7. Animaciones clave (keyframes)

| Keyframe | Duración | Efecto |
|---|---|---|
| `tw` | `var(--d)` | Parpadeo de estrellas (`--lo`/`--hi`) |
| `grad-shimmer` | 4s | Barrido del gradiente en el nombre de la pareja |
| `page-in` / `page-out` | 0.5s / 0.25s | Entrada/salida de páginas |
| `fade-in` | 0.2s | Overlays de modales |
| `slide-up` | 0.25s | Modales (translateY 16px) |
| `scale-in` | 0.25s | Imágenes expandidas |
| `pop` | 0.5s | Botón de deseo (wish) |
| `wave-out` | 1s | Onda expansiva del wish |
| `shoot` | `var(--dur)` | Estrellas fugaces |
| `spin` | 0.6s | Spinner de carga |
| `just-opened` | 1.8s | Pulso de apertura de cápsula |
| `float-up` | 6s | Partículas del eje timeline |
| `pulse-high` / `pulse-vhigh` | 2–3s | Pulso de nodos destacados |
| `ring-expand` | 2s | Anillo del nodo vhigh |
| `slideFromRight` / `slideFromLeft` | 0.5s | Cambio de año en timeline |
| `fadeSlideUp` | 0.45s | Secciones de mes / stagger de errores |
| `skeletonShimmer` | 1.6s | Skeletons de carga |
| `spin-disc` | 4s | Vinilo de música girando |
| `note-float` | 3s | Notas musicales flotando |
| `inicioCuePulse` | 2s | Indicador de scroll (hero inicio) |
| `toastEnter` / `toastExit` | 0.35s | Toasts |
| `loginCardEnter` | 0.9s | Entrada del card de login |
| `loginErrorShake` | 0.4s | Error de login |
| `orbitGold` / `orbitRose` | 1.4s / 1.9s | Loading overlay (órbitas) |
| `supernovaFlash` | 2.8s | Evento de aniversario |
| `ringExpand` | 2.2s | Ondas de choque del aniversario |
| `twBright` | — | Estrellas brillando en evento |
| `floatHeart` | `var(--dur)` | Corazones en aniversario |
| `toastProgress` | — | Barra de vida del toast |
| `pulse-dot` | 2s | Punto de película sin calificar |

**Transición de páginas**: `.page.active` usa `page-in`; `.page.exit` usa `page-out` + `pointer-events: none`.

---

## 8. Responsive (media queries)

Solo existen dos breakpoints:

### 8.1 `@media (max-width: 768px)` — principal
- `--sidebar: 0px`; el **sidebar se convierte en bottom-nav** fijo (`position: fixed; bottom: 0`, altura auto, `z-index: 50`).
- Se ocultan `.sidebar-top`, `.sidebar-bottom`, `.nav-section`; los items van en **columna** con icono arriba, texto `0.6rem` centrado.
- `.nav-item.active::before`: barra violeta arriba de 100% × 2px (en vez de barra lateral).
- `#main` con `padding-bottom: 70px` y `height: calc(100vh - 70px)`.
- `.page` padding `1.5rem`.
- Grillas → 1 columna: `.home-grid`, `.capsulas-grid`, `.form-row` (column).
- `.page-header` → columna centrada; `.page-actions` → centrado y wrap.
- **Modales → 96vw**: `.modal-box`, `.foto-modal-box`, `.album-modal-box`, `.letter-modal-box`, `.write-modal-box`, `.session-modal`.
- FotoModal → columna (imagen arriba, sidebar abajo).
- Timeline → eje a la izquierda (`left: 24px`), grid `48px 1fr`.
- Reproductor de audio se oculta; aparece trigger flotante + bottom-sheet.
- Cartas → master-detail alterna (sidebar o reader, nunca ambos).
- `.year-filter` padding reducido; `.photos-row` min 100px.

### 8.2 `@media (max-width: 480px)`
- Solo login: card padding `2.5rem 1.5rem 2rem`, radius 14px, título `1.5rem`.

**Regla del proyecto**: toda modificación visual **debe** tener contraparte responsive en el bloque `@media (max-width: 768px)`.

---

## 9. Elementos decorativos globales

- **Textura noise** (`body::before`): SVG `feTurbulence` embebido como data-URI, `opacity: 0.04`, fijo sobre toda la app (`z-index: 9998`).
- **Starfield** (`#starfield` + `.s`): estrellas blancas animadas con `--d`, `--lo`, `--hi`, `--dl` por estrella.
- **Estrellas fugaces** (`.shooting-star`): `z-index: 1`, con cabeza brillante `rgba(235,230,255,0.9)` y glow.
- **Scrollbar**: ancho 5px, thumb `--violet-dim` (hover `--violet`), track transparente.
- **Evento de aniversario**: supernova overlay, ondas de choque, corazones flotantes.

---

## 10. Reglas para tocar estilos (IMPORTANTE)

1. **Siempre** usar las variables CSS; no hardcodear colores/tipografías salvo los valores documentados arriba (hovers de violeta, text on violeta, gradientes decorativos).
2. **Un solo archivo de estilos**: todo se agrega a `app/globals.css`. NO usar Tailwind en templates (instalado pero desaconsejado). NO editar `styles/tokens.css` (obsoleto).
3. Títulos → `var(--serif)` weight 400. Labels/metadatos/fechas → `var(--mono)` uppercase con letter-spacing. Cuerpo → `var(--body)` weight 300.
4. **Toda** modificación visual debe incluir su contraparte en `@media (max-width: 768px)`.
5. Antes de crear/editar cualquier cosa, revisar `pendientes.md` y `pendientes_implementar.md` (regla del proyecto).
6. Radios: usar `var(--radius)` (10px) por defecto, `calc(var(--radius) * 1.5)` (15px) para modales base, 16/18px para modales especiales.
7. Transiciones: usar `var(--trans-fast)` / `var(--trans-med)` y `var(--ease)`.
8. Texto de la UI siempre en **español**.

---

## 11. Tecnologías del proyecto (contexto visual)

- **Framework**: Next.js 16.2.6 (App Router) + React 19.2.4.
- **Build**: TypeScript 5, ESLint 9 (`next/core-web-vitals`).
- **Backend/DB**: Supabase (auth por cookies `@supabase/ssr`, Postgres con RLS, storage para fotos).
- **Otros de UI**: `nextjs-toploader` (barra de progreso superior, color `var(--violet)`, 2px).
- **Imágenes**: compresión client-side WebP (máx 1920px, ~200–400KB) en `lib/compressImage.ts`.
- **Patrón de componentes**: CSS classes globales con nombres BEM-lite (`bloque-elemento` o prefijo de módulo `capsula-`, `cartas-`, `tl-`, `pelicula-`); los módulos importan sus componentes desde `modules/<modulo>/`.