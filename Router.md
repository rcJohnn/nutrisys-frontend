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