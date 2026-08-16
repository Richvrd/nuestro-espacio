# Pendientes

Pendientes detectados en la sesión de análisis de graphify (2026-08-15). Revisar antes de continuar con nuevos cambios.

## 1. Reconstruir el grafo de graphify desde cero

- [ ] Ejecutar `/graphify .` en la raíz del proyecto (no `--update`: la ruta cambió y el esquema de extracción es distinto).
- **Motivo**: el grafo actual (`graphify-out/`) está desactualizado:
  - Fue construido desde la ruta vieja `~/Documentos/proyecto_love_espacio_v2/nuestro-espacio/` (el proyecto se movió).
  - Data del 23-24 may 2026 y quedó ~25 commits atrás; no incluye los módulos `capsula`, `cartas`, `timeline`, `peliculas` (ya completos), ni `musica`/`juegos`.
  - La extracción semántica nunca se registró (`cost.json` en 0 tokens → grafo casi solo AST).
  - Contiene `file_type` obsoletos (`concept`, `rationale`) que la spec 0.9.32 ya prohíbe.
  - 43% de nodos aislados (76/178) y 13 de 22 comunidades sin etiquetar.

## 2. Verificar la calidad del grafo reconstruido

Tras el paso 1, comprobar:
- [ ] `graphify-out/cost.json` ya no está en 0 tokens (la extracción semántica debe registrarse).
- [ ] No hay `file_type` tipo `concept`/`rationale` (solo `code|document|paper|image`).
- [ ] Todas las comunidades están etiquetadas (ninguna queda como "Community N").
- [ ] Aparecen los módulos `capsula`, `cartas`, `timeline`, `peliculas` como comunidades.

## 3. Decidir qué hacer con `.opencode/`

Creado por `graphify install --platform opencode` (está untracked en git). Contiene:
- `.opencode/opencode.json` — registra el plugin graphify.
- `.opencode/plugins/graphify.js` — hook `tool.execute.before` que sugiere `graphify query` antes de comandos bash.

Opciones (elegir una):
- [ ] Commitearlo (útil: avisa de usar el grafo en vez de grepear).
- [ ] Añadirlo a `.gitignore` (mantenerlo local sin versionar).
- [ ] Borrarlo (el skill funciona sin el plugin).

## 4. Evaluar si el grafo aporta valor para este corpus

- [ ] El corpus es de ~8k palabras y el reporte anterior advertía "you may not need a graph". Tras reconstruir, decidir si mantener `graphify-out/` o descartarlo para evitar costos innecesarios de tokens en cada `--update`.

## Notas

- El skill de opencode ya está sincronizado a 0.9.32 (SKILL.md + `references/` en `~/.config/opencode/skills/graphify/`). Las próximas sesiones de opencode cargan la versión nueva (con fast-path de query, `--directed`, `--wiki`, GitHub URLs, etc.). La sesión actual aún usa el skill viejo.
