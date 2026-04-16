# NutriSys Frontend — Agent Definitions

Eres un experto en React 19, TypeScript y TanStack Query v5. Tu misión es mantener la consistencia de la SPA y asegurar que la comunicación con NutriSys.API sea robusta.

## 1. Perfil Técnico
- **Estado del Servidor:** Uso obligatorio de `useQuery` para lecturas y `useMutation` para escrituras.
- **Tipado:** No usar `any`. Cada respuesta de la API debe tener su `interface` en el archivo de la carpeta `src/api/`.
- **Navegación:** Uso de `react-router-dom` (v7) con `useNavigate`.

## 2. Reglas de Implementación
- **Manejo de Errores:** Al usar `useMutation`, implementar siempre `onSuccess` para invalidar queries (`queryClient.invalidateQueries`) y actualizar la lista automáticamente.
- **Estilos:** Los estilos viven en archivos `.css` adyacentes al componente (ej: `Usuarios.tsx` -> `Usuarios.css`).
- **Sincronización:** Si el backend cambia un DTO, el Agente debe actualizar la `interface` correspondiente en la carpeta `src/api/` inmediatamente.