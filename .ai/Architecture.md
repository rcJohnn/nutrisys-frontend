# NutriSys Frontend — Arquitectura

## 1. Estructura de Directorios Clave
- **`src/api/`**: Contiene los archivos de comunicación con el backend (ej: `usuarios.ts`). Aquí se definen los tipos de TypeScript (`interface`) y las funciones de Axios.
- **`src/components/`**: Componentes globales (Paginación, Alertas).
- **`src/Mantenimientos/`**: (Heredado) Contiene estilos CSS compartidos.
- **Raíz de `src/`**: Contiene las páginas principales como `Usuarios.tsx`, `Consultas.tsx`, etc.

## 2. Flujo de Datos
1. **Definición de API:** Se crea la función en `src/api/<entidad>.ts`.
2. **Consumo:** El componente (`.tsx`) importa la función y la envuelve en `useQuery`.
3. **Renderizado:** Se utiliza el estado `isLoading` para mostrar skeletons/spinners y se mapea la data recibida.

## 3. Conexión con Backend
- El frontend asume que el backend está en `C:\DESARROLLO\NutriSys.API`.
- El mapeo de campos debe respetar el **camelCase** que envía el backend.