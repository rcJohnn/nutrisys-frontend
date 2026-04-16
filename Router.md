<<<<<<< HEAD
# nutrisys-frontend — Master Router

> Lee este archivo SIEMPRE antes de actuar. Es tu brújula.

---

## 1. Stack real del proyecto

**nutrisys-frontend** es la SPA React del sistema NutriSys. Complementa a `NutriSys.API` (.NET 10, en `C:\DESARROLLO\NutriSys.API`).

```
Vite 8 + React 19 + TypeScript 6
├── React Router v7          → navegación SPA
├── TanStack Query v5        → server state (fetch, cache, invalidación)
├── Axios                    → HTTP client base (apiClient)
├── react-hook-form v7       → forms (instalado, subutilizado — ver mejoras)
└── CSS custom               → design tokens propios (sin framework CSS externo)
```

---

## 2. Estructura de carpetas

```
src/
├── api/                     → funciones de acceso al backend, una por entidad
├── assets/                  → imágenes y videos (logo, fondo login)
├── components/              → componentes reutilizables
│   ├── Alerta/              → sistema de alertas/confirmaciones (useAlerta)
│   └── Pagination.tsx       → paginación genérica
├── layout/
│   ├── MainLayout.tsx       → layout principal (sidebar + header + <Outlet>)
│   └── MainLayout.css
├── Mantenimientos/css/      → CSS compartidos (legacy name, pero activos)
│   ├── theme-nutrisys.css   → 🔑 Design tokens — fuente de verdad visual
│   ├── styleCommon.css      → componentes compartidos (cards, breadcrumbs, welcome)
│   └── style-*.css          → estilos por módulo/página
├── pages/                   → componentes de página
│   ├── GeneradorPlan/       → única página con sub-módulo propio (tabs + lógica)
│   └── *.tsx + *.css        → resto de páginas
├── types/                   → interfaces TypeScript globales
│   └── auth.ts              → LoginRequest, LoginResponse, Usuario
├── App.tsx                  → router raíz + providers
├── main.tsx                 → entry point
└── index.css                → reset global mínimo
```

**Ignorar completamente:**
- `src/JavaScript/JavaScript/` — archivos `.js` del Web Forms original. Son código muerto, no tocar.
- `src/Mantenimientos/css/style-starter.css` — CSS base del template original, no editar directamente.
- `oldproject/` — carpeta del proyecto Web Forms original de referencia.

---

## 3. Routing y autenticación

### Rutas (App.tsx)

Todas las rutas excepto `/login` están protegidas por `PrivateRoute`, que verifica la presencia de `token` en `localStorage`.

| Ruta | Componente | Estado |
|------|-----------|--------|
| `/login` | `Login` | ✅ |
| `/dashboard` | `Dashboard` | ✅ |
| `/usuarios` | `Usuarios` | ✅ |
| `/usuarios/nuevo` | `MantenimientoUsuarios` | ✅ |
| `/usuarios/editar/:id` | `MantenimientoUsuarios` | ✅ |
| `/usuarios/padecimientos/:id` | `PadecimientosUsuario` | ✅ |
| `/medicos` | `Medicos` | ✅ |
| `/medicos/nuevo` | `MantenimientoMedicos` | ✅ |
| `/medicos/editar/:id` | `MantenimientoMedicos` | ✅ |
| `/consultas` | `Consultas` | ✅ |
| `/consultas/nueva` | `MantenimientoConsultas` | ✅ |
| `/consultas/editar/:id` | `MantenimientoConsultas` | ✅ |
| `/consultas/detalle/:id` | `DetalleConsulta` | ✅ |
| `/consultas/:id/completar` | `CompletarMetricas` | ✅ |
| `/generar-plan` | `GeneradorPlan` | ✅ |
| `/alimentos` | `Alimentos` | ✅ |
| `/mantenimiento-alimentos` | `MantenimientoAlimentos` | ✅ |
| `/mantenimiento-alimentos/:id` | `MantenimientoAlimentos` | ✅ |
| `/config-agenda` | `ConfigAgenda` | ✅ |
| `/config-agenda/:medicoId` | `ConfigAgenda` | ✅ |
| `/perfil` | `MiPerfil` | ✅ |
| `/padecimientos` | `BusquedaPadecimientos` | ✅ |
| `/progreso` | `Progreso` | ✅ |
| `/expediente` | `BusquedaPaciente` | ✅ |
| `/expediente/:id` | `ExpedientePaciente` | ✅ |
| `/auditoria` | placeholder `<div>` | 🔲 pendiente |
| `/configuracion` | placeholder `<div>` | 🔲 pendiente |
| `/plan` | placeholder `<div>` | 🔲 pendiente |

### Sesión en localStorage

La sesión se guarda en `localStorage` al login:

| Clave | Contenido |
|---|---|
| `token` | token de sesión |
| `userId` | ID numérico del usuario logueado |
| `userType` | `'A'` = Admin, `'M'` = Médico, `'U'` = Usuario/Paciente |
| `userName` | Nombre completo |
| `userEmail` | Correo electrónico |

Leer con: `localStorage.getItem('userType') || 'A'`

---

## 4. Capa de API (`src/api/`)

### Cliente base — `api/client.ts`

- `apiClient` = instancia axios con `baseURL` desde `VITE_API_URL` (fallback: `http://localhost:5159/api`)
- **Interceptor request**: agrega `Authorization: Bearer <token>`
- **Interceptor response**: 401 → limpia localStorage y redirige a `/login`
- **`normalizeKeys`**: transforma claves snake_case/camelCase a PascalCase para mantener consistencia con los DTOs del backend

**SIEMPRE usar `apiClient` para llamadas al backend.** El archivo `api/auth.ts` usa `fetch` directo con URL hardcodeada — eso es una deuda técnica conocida.

### Patrón de cada archivo API

```typescript
// api/<entidad>.ts
import { apiClient } from './client';

// 1. Interfaces TypeScript de la entidad
export interface Entidad { ... }
export interface EntidadFiltros { ... }

// 2. Funciones async que retornan los datos ya tipados
export const getEntidades = async (filtros = {}) => { ... }
export const getEntidadById = async (id: number) => { ... }
export const createEntidad = async (data: Omit<Entidad, 'Id'>) => { ... }
export const updateEntidad = async (id: number, data: Partial<Entidad>) => { ... }
export const deleteEntidad = async (id: number) => { ... }
```

### Archivos API existentes

`auth.ts`, `alimentos.ts`, `client.ts`, `completarMetricas.ts`, `configAgenda.ts`,
`consultas.ts`, `dashboard.ts`, `despensa.ts`, `distribucionPlan.ts`, `expediente.ts`,
`hub.ts`, `medicos.ts`, `padecimientos.ts`, `plan.ts`, `progreso.ts`, `sesion.ts`, `usuarios.ts`

---

## 5. Componentes compartidos

### `useAlerta` — `components/Alerta/AlertaContext.tsx`

Sistema de alertas custom que reemplaza `window.alert` y `window.confirm`. **Usar siempre en lugar de los nativos.**

```typescript
const alerta = useAlerta();

// Informativo
await alerta.success('Usuario creado', 'Se envió la contraseña por correo');
await alerta.error('Error', 'No se pudo guardar');
await alerta.warning('Atención', 'Cambios no guardados');
await alerta.info('Info', 'Mensaje informativo');

// Confirmación (retorna boolean)
const confirmado = await alerta.confirm('¿Eliminar?', 'Esta acción no se puede deshacer');
if (confirmado) { /* ... */ }
```

**Está disponible en toda la app** vía `<AlertaProvider>` en `App.tsx`.

### `Pagination` — `components/Pagination.tsx`

Paginación genérica. Usar en tablas de listado.

---

## 6. Design System

### Fuente de verdad visual: `src/Mantenimientos/css/theme-nutrisys.css`

No inventar colores, espaciados ni fuentes a mano. Usar los tokens CSS.

**Tríada de colores:**
- `--ns-indigo-*` → Acción & sistema (botones primarios, links activos)
- `--ns-emerald-*` → Salud & éxito (estados positivos, badges activos)
- `--ns-amber-*` → Datos & atención (warnings, métricas)
- `--ns-slate-*` → Framework & superficie (sidebar, backgrounds, texto)

**Editorial Vitality tokens (preferir estos sobre los anteriores):**
- `--ev-primary: #006c49` → color brand principal
- `--ev-surface`, `--ev-surface-low`, `--ev-surface-lowest` → fondos
- `--ev-on-surface`, `--ev-on-surface-variant` → texto
- `--ev-shadow-ambient`, `--ev-shadow-float` → sombras
- `--ev-gradient-primary` → gradiente brand

**Tipografía:** `Inter` (body y heading). Variable: `--ns-font-body`, `--ns-font-heading`.

**Motion:** usar `--ns-dur-fast` / `--ns-dur-normal` + `--ns-ease-smooth` para transiciones.

### CSS compartido: `src/Mantenimientos/css/styleCommon.css`

Clases comunes ya definidas para usar en páginas:
- `.card_border` → card con shadow y border-radius
- `.welcome-msg` → bloque de bienvenida con nombre
- `.my-breadcrumb` / `.cm-breadcrumb` → breadcrumbs
- `.input-style` → inputs con estilo del sistema

### Clases utilitarias usadas (Bootstrap-inspired, sin framework)

El proyecto usa nomenclatura Bootstrap 4 (`form-row`, `col-md-*`, `form-group`, `form-control`, `btn btn-primary`, `input-group`) pero **sin importar Bootstrap**. Estas clases están definidas en los CSS del proyecto. Mantener la misma convención.

---

## 7. Patrones de página

### Página de listado (ej: `Usuarios.tsx`)

```
useState(filtros)
useQuery(['entidades', filtros], () => getEntidades(filtros))
useMutation(deleteEntidad, { onSuccess: invalidateQueries })
→ render: filtros + tabla + Pagination + botones de acción
```

### Página de mantenimiento/formulario (ej: `MantenimientoUsuarios.tsx`)

```
useParams() → isEdit = Boolean(id)
useQuery(['entidad', id], getEntidadById, { enabled: isEdit })
useEffect → poblar form cuando llegan datos
useMutation(create/update)
→ render: breadcrumb + welcome + card con form + botones
```

### Página especial: `GeneradorPlan/`

Única página con sub-módulo propio. Tiene tabs (`planner`, `recetas`, `lista`) y lógica de IA. Estructura:
- `index.tsx` → orquestador de tabs y selección de usuario
- `PlannerTab.tsx` → planificador de comidas
- `IATab.tsx` → generación con Claude AI
- `ListaTab.tsx` → lista de alimentos
- `planLogic.ts` → lógica de cálculos nutricionales
- `constants.ts` → constantes del plan

---

## 8. Mejoras pendientes / deuda técnica

Estas son oportunidades de mejora alineadas con la skill frontend. Aplicar cuando se toque cada módulo.

### Alta prioridad

| Problema | Ubicación | Mejora |
|---|---|---|
| `window.alert` / `window.confirm` aún en uso | `Usuarios.tsx`, `MantenimientoUsuarios.tsx` y otros | Reemplazar por `useAlerta()` |
| `auth.ts` usa `fetch` hardcodeado | `src/api/auth.ts` | Migrar a `apiClient` |
| `useEffect` que escribe en DOM directo (`document.getElementById`) | `MantenimientoUsuarios.tsx` y otros | Eliminar — usar estado React / props |
| `handleChange` con `id.replace('txt', '')` | Formularios varios | Frágil — migrar a `react-hook-form` |

### Media prioridad

| Problema | Ubicación | Mejora |
|---|---|---|
| Forms con `useState` manual | Todos los formularios | Usar `react-hook-form` (ya instalado) — validación declarativa |
| `any` en handlers de error | `Usuarios.tsx`, `MantenimientoUsuarios.tsx` | Tipear el error correctamente |
| Token en `PrivateRoute` sin validar expiración | `App.tsx` | Agregar lógica de expiración o refresh |
| Duplicación de interfaces (ej: `Usuario` en `types/auth.ts` y `api/usuarios.ts`) | `types/auth.ts` | Consolidar en `api/*.ts` y exportar desde ahí |

### Baja prioridad / futuro

| Oportunidad | Detalle |
|---|---|
| Custom hooks por entidad | `useUsuarios()`, `useMedicos()` — extraer lógica de TanStack Query de los componentes |
| Auth context | Reemplazar accesos directos a `localStorage` por un `useAuth()` hook con contexto |
| Code splitting con `React.lazy` | Las páginas no se lazy-loadean — cada ruta importa todo de inmediato |
| Variable de entorno para URL del API | `auth.ts` y `cedula` en `MantenimientoUsuarios.tsx` tienen URL hardcodeada |

---

## 9. Skill de referencia

Para cualquier trabajo en el frontend, leer primero:

`.claude/skills/frontend/SKILL.md`

Contiene patrones de componentes, hooks, performance, TypeScript, manejo de errores y anti-patterns de React.

---

## 10. Páginas de referencia para estilo de código

Si tu nueva página se parece a una de estas, copiá su estructura:

| Página | Por qué es referencia |
|---|---|
| `Consultas.tsx` | Listado con filtros + calendario custom + acciones múltiples |
| `MantenimientoConsultas.tsx` | Formulario complejo con múltiples entidades relacionadas |
| `DetalleConsulta.tsx` | Vista de solo lectura con secciones colapsables |
| `GeneradorPlan/index.tsx` | Tabs + estado complejo + integración IA |
| `components/Alerta/AlertaContext.tsx` | Context + hook pattern — modelo para nuevos contextos |

---

## 11. Variables de entorno

```
VITE_API_URL=http://localhost:5159/api   ← URL del backend NutriSys.API
```

Puerto del backend: `5159` (dev). Frontend corre en `5173` o `5174`.
=======
# NutriSys Master Router

## 1. Identificación de Tarea
Antes de actuar, clasifica la tarea en una de estas tres categorías:

### A. MIGRACIÓN (Legacy -> React)
- **Disparador:** Archivos en `src\Mantenimientos` o mención de ".aspx".
- **Skill:** `.claude/skills/MIGRACION_WEBFORMS.md`
- **Acción:** Leer el `.aspx.cs` para lógica y la `BLL` para el contrato de datos.

### B. DESARROLLO NUEVO (Funcionalidades Post-Migración)
- **Disparador:** Requerimientos nuevos, carpetas fuera de "Mantenimientos".
- **Skill:** `.claude/skills/MODERN_STACK.md`
- **Acción:** Basarse 100% en la arquitectura de .NET Core (BLL/DAL) y React funcional.

### C. MANTENIMIENTO BACKEND
- **Disparador:** Cambios en `NutriSys.API`, `BLL` o `DAL`.
- **Skill:** `.claude/skills/NET_CORE_LAYERS.md`

## 2. Regla de Eficiencia (Token Saving)
- No leas archivos completos. Si vas a la DAL, lee solo el método que llama al Stored Procedure mencionado en `appsettings.json`.
- Usa el **Engram** para ver si el mapeo de ese SP ya fue documentado anteriormente.

# Referencias de Éxito
- IMPORTANTE: Los formularios de Consultas, Medicos, Usuarios, Login y sus respectivos Mantenimientos ya están terminados y funcionan correctamente. Tómalos como única fuente de verdad para el estilo de codificación, manejo de estados y conexión con la API. Si el nuevo formulario que vas a migrar se parece a MantenimientoMedicos, copia su estructura de componentes y hooks.
>>>>>>> c83e2b966a08969df96e1c9a3c3ddb061bc6df91
