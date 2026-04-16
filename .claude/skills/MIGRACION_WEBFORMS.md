# Skill: Migración Quirúrgica (WebForms -> NutriSys React)

## 1. Análisis de Entrada (Legacy)
Para cada componente a migrar, sigue este orden de lectura:
1. **Interfaz:** Revisa `src\Mantenimientos\[Nombre].aspx` para identificar inputs, validadores y eventos (OnClick).
2. **Lógica:** Revisa `src\Mantenimientos\[Nombre].aspx.cs` para entender la lógica de negocio y qué datos se envían al servidor.
3. **Scripts:** Consulta `src\JavaScript\JavaScript` solo si hay validaciones complejas en el lado del cliente.

## 2. Mapeo al Backend Moderno (NutriSys.API)
NO inventes endpoints. Tu brújula es la arquitectura actual:
1. **Contratos:** Busca el DTO correspondiente en `NutriSys.BLL`. El frontend DEBE respetar esa estructura.
2. **Endpoints:** Los controladores en `NutriSys.API` son la única vía de comunicación.
3. **Procedimientos:** Si necesitas saber qué hace una función, busca el nombre del Stored Procedure en el `appsettings.json` del Backend.

## 3. Estándar de Salida (React + TS)
Basado en los componentes ya migrados (Medicos, Usuarios, etc.):
- **Componentes:** Usa Funcional Components con TypeScript.
- **Estilos:** Adapta el CSS de `src\Mantenimientos\css` al estándar actual del proyecto (Tailwind/Material/etc).
- **Hooks:** Centraliza la lógica de API en hooks personalizados o servicios si el patrón del proyecto lo dicta.

## 4. Eficiencia de Tokens (REGLAS ESTRICTAS)
- **Caché:** Si ya leíste un Helper de la BLL, no lo vuelvas a leer; asume que su funcionamiento es consistente.
- **Engram:** Antes de proponer un manejo de errores, verifica en Gentle.ai cómo se resolvió en "MantenimientoUsuarios".
- **Brevedad:** No expliques el código generado a menos que se te pida. Solo entrega el código y una breve nota de cambios.