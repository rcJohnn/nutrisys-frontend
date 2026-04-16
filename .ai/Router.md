# NutriSys Frontend — Master Router

## Regla de Oro
Antes de modificar cualquier componente, identifica si la lógica de datos está en el `.tsx` o si debe actualizarse el archivo en `src/api/`.

## Matriz de Decisión
| Si el usuario quiere... | Acción / Skill a Cargar | Archivo de Referencia |
| :--- | :--- | :--- |
| Crear una nueva pantalla | `.ai/skills/frontend/Create_View.md` | `Usuarios.tsx` |
| Agregar/Cambiar llamada a API | `.ai/skills/frontend/API_Integration.md` | `src/api/usuarios.ts` |
| Ajustar validaciones de form | `.ai/skills/frontend/UI_Validation.md` | `MantenimientoUsuarios.tsx` |
| Cambiar diseño/CSS | Buscar el `.css` del componente | `Usuarios.css` |

## Fuentes de Verdad
- **Lógica de Consultas:** `src/api/usuarios.ts`.
- **Patrón de UI:** `Usuarios.tsx` (Lista) y `MantenimientoUsuarios.tsx` (Formulario).