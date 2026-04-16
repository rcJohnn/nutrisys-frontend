# Skill: Integración de API con TanStack Query

## 1. Definición del Contrato (en `src/api/`)
- Crear una `interface` que refleje el DTO del backend.
- Ejemplo:
  ```typescript
  export interface UsuarioResponse {
    id: number;
    nombre: string;
    // ... rest of fields
  }