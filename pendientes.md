# Pendientes

Seguimiento de pendientes. Última revisión: 2026-08-29.

## 1. Reconstruir el grafo de graphify desde cero — ✅ HECHO (2026-08-16)

- [x] Ejecutado `/graphify .` completo con la spec 0.9.32 (skill nuevo).
- **Resultado**: 499 nodos · 996 edges · 54 comunidades.
- **Extra** (decisión tomada durante el rebuild): se creó `.graphifyignore` excluyendo `.agents/` y `public/`. Sin él el corpus era 301 archivos/105k palabras con 164 docs de la librería de skills, 4 MP3 (dispararían transcripción Whisper) y 5 SVGs de boilerplate. Con el ignore: 126 archivos/33k palabras, solo proyecto real.

## 2. Verificar la calidad del grafo reconstruido — ✅ HECHO

- [x] `file_type` válidos: solo `code` (493) y `document` (6). Ninguno inválido.
- [x] Todas las 54 comunidades etiquetadas (0-53, sin "Community N").
- [x] Módulos presentes en el grafo: `capsula` (27), `cartas` (24), `galeria` (21), `peliculas` (19), `timeline` (12), `inicio` (11), `supabase` (6), `musica` (3), `juegos` (3), `middleware` (3).
- [x] Extracción semántica SÍ corrió (38 nodos semánticos desde 7 docs; antes eran 0). Caché guardada.
- [~] `cost.json` sigue en 0 tokens — **no** es señal de que la semántica no corrió (sí corrió). Es una limitación de contabilidad: el subagente de extracción no puede medir su propio uso de tokens y reporta 0. No hay forma de arreglarlo vía este pipeline salvo setear `GEMINI_API_KEY` (usaría `extract_corpus_parallel` y sí registraría tokens).
- Calidad general: god nodes significativos (`createClient` 45, `useToast` 19, `COUPLE`/`Letter`/`Photo`/`Capsule`/`Moment`/`Album`/`Movie` 11-14), 0 ciclos de import, 106 nodos aislados (21%, antes 43%), benchmark 11x menos tokens por query.

## 3. Decidir qué hacer con `.opencode/` — ✅ HECHO (commit `bcf98ce`)

- [x] Decisión: **commitearlo** (opencode.json + plugins/graphify.js). El plugin ya se activó en la sesión (recordatorio antes de comandos bash cuando existe `graphify-out/graph.json`).
- `graphify-out/` permanece en `.gitignore` (no se versiona).

## 4. Evaluar si el grafo aporta valor para este corpus — ✅ HECHO

- [x] El reporte sigue advirtiendo "fits in a single context window — you may not need a graph" (corpus 33k palabras). **Decisión**: mantener el grafo, con matices:
  - El benchmark da **11x menos tokens por query** (~4k tokens vs ~44k del corpus) → conviene para preguntas frecuentes sobre el código.
  - Cuesta tokens mantenerlo en cada `--update` semántico. Recomendación: usar `/graphify --update` solo cuando cambien archivos, y para cambios de solo código se salta la semántica (sin costo de LLM).
  - Si el costo de mantenimiento molesta, se puede borrar `graphify-out/` (ya no se necesita para la app) y usar grepping directo.

## Notas

- Skill de opencode sincronizado a 0.9.32 (SKILL.md + `references/` en `~/.config/opencode/skills/graphify/`). Las próximas sesiones usan la versión nueva.
- `.graphifyignore` (nuevo): excluye `.agents/` y `public/` de futuros scans. Commitearlo junto con la próxima tanda para que el grafo sea reproducible.
- Para habilitar contabilidad de tokens y extracción semántica automática: `pip install 'graphifyy[gemini]'` + setear `GEMINI_API_KEY` (o `GOOGLE_API_KEY`).

## 5. Actualización incremental del grafo — ✅ HECHO (2026-08-29)

- [x] Ejecutado `/graphify --update` tras el commit `90deef0` (feature de registro de accesos en login + RLS en `movies` + `pendientes_implementar.md`).
- 7 archivos re-extraídos: 4 de código (AST, sin LLM) y 3 docs (semántica): `AGENTS.md`, `pendientes.md`, `pendientes_implementar.md`.
- **Resultado**: 527 nodos · 1052 edges · 49 comunidades (antes 499/996/54). Diff: +37 nodos, +61 edges, -9 nodos, -5 edges.
- Nuevos nodos clave: `logAcceso()`, `getAccesoInfo()`, `lib/accesoInfo.ts`, `public.accesos`, "RLS on public.movies", "Supabase MCP: supabase_espacio".
- Comunidades nuevas etiquetadas: "Login y registro de accesos", "Documentación y arquitectura", "Supabase MCP".
- `graphify-out/` sigue en `.gitignore` (no se versiona). Nota: el paquete instalado es 0.9.44 mientras el skill sigue en 0.9.32 — considerar `graphify install` en el futuro.
