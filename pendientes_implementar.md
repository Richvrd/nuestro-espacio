# Pendientes a Implementar

Seguimiento de implementaciones. **Este archivo es PRIORITARIO: revisarlo
antes de ejecutar cualquier cambio en el proyecto.** Al completar una tarea,
marcarla como ✅ Completada.

## Implementaciones

### 1. Crear tabla `accesos` en Supabase
- Estado: ✅ Completada
- Crear `public.accesos` (id, created_at, ip, email, exito, user_agent, pais, ciudad, ruta)
  con RLS: insert para anon+authenticated, select solo authenticated.
- Verificar: Tabla existe con RLS activo.

### 2. Habilitar RLS en `public.movies`
- Estado: ✅ Completada
- `alter table ... enable row level security` + política `authenticated access movies`.
- Verificar: Desaparece el error del advisor de seguridad.

### 3. Crear `lib/accesoInfo.ts`
- Estado: ✅ Completada
- Helper que lee headers (IP, país/ciudad via x-vercel-ip-*, user-agent) con mapa país→español.
- Verificar: `npm run lint`.

### 4. Crear server action `app/(auth)/login/actions.ts`
- Estado: ✅ Completada
- `logAcceso(email, exito, ruta)` inserta en `accesos` con fallo silencioso.
- Verificar: `npm run lint` + insert funciona.

### 5. Registrar visita en `app/(auth)/login/page.tsx`
- Estado: ✅ Completada
- Llamar `logAcceso(null, null, '/login')` en el server component.
- Verificar: Abrir `/login` crea fila (IP local en dev, geo null).

### 6. Registrar intento en `app/(auth)/login/LoginForm.tsx`
- Estado: ✅ Completada
- Llamar `logAcceso(email, exito, '/login')` tras signInWithPassword (éxito, error y catch).
- Verificar: Enviar credenciales crea fila con email y exito true/false.

### 7. Actualizar `AGENTS.md`
- Estado: ✅ Completada
- Agregar instrucción: revisar `pendientes_implementar.md` como prioritario
  antes de cualquier cambio en el proyecto (junto a `pendientes.md`).
- Agregar mapa de MCP: `supabase_espacio` es este proyecto; `supabase_falabella` ignorar.
- Verificar: Lectura visual.

### 8. Verificación final
- Estado: ✅ Completada
- `npm run lint`, `npm run build`, advisors sin error, prueba en prod tras deploy.

### 9. Fix: error al hacer login y registro de `exito: true`
- Estado: ✅ Completada
- **Problema**: tras login correcto aparecía un error (había que recargar para ver la sesión activa) y nunca se registraban `exito: true` en `accesos`. Causa: `LoginForm.tsx` hacía `signInWithPassword` en el navegador y luego llamaba a la server action `logAcceso(email, true, '/login')`; ese roundtrip con la sesión recién creada se rechazaba a nivel de transporte → caía al `catch` (error visible) y el insert de `exito: true` nunca se ejecutaba.
- **Solución**: mover el login a una server action `loginAction(email, password)` en `app/(auth)/login/actions.ts` que hace `signInWithPassword`, registra `logAcceso` (true/false) y redirige con `redirect('/inicio')` (patrón oficial de Supabase). `LoginForm.tsx` ya no toca Supabase: solo llama a `loginAction` y muestra el mensaje de error si lo hay.
- Verificar: `npm run lint`, `npm run build`, prueba manual (login correcto → redirect directo + fila `exito: true`; credenciales incorrectas → mensaje + `exito: false`).