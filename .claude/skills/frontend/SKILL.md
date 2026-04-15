# Frontend React/TypeScript Best Practices & Patterns

## Contexto del proyecto — nutrisys-frontend

Esta skill aplica al frontend de **NutriSys** (en `C:\DESARROLLO\nutrisys-frontend`).

**Antes de escribir cualquier código, leer `Router.md` en la raíz del proyecto.** Contiene:
- Stack real (React 19, Vite 8, TanStack Query v5, react-hook-form)
- Estructura de carpetas y qué ignorar
- Rutas y estado de implementación
- Patrón de archivos API (`apiClient`, interceptores, `normalizeKeys`)
- Design System (tokens `--ev-*` y `--ns-*` en `theme-nutrisys.css`)
- Componentes compartidos (`useAlerta`, `Pagination`)
- Deuda técnica documentada — priorizar mejoras al tocar cada módulo

**Reglas no negociables del proyecto:**
- Usar `useAlerta()` en lugar de `window.alert` / `window.confirm`
- Usar `apiClient` de `src/api/client.ts` — nunca `fetch` directo con URL hardcodeada
- No escribir en el DOM directo (`document.getElementById`) — usar estado React
- No inventar colores, tipografía ni espaciados — usar los tokens CSS del design system
- `react-hook-form` ya está instalado — preferir sobre `useState` manual para formularios nuevos o al refactorizar

---

## Overview
Patterns and techniques for building performant, maintainable React applications with TypeScript and modern best practices — applied to the NutriSys project conventions.

---

## 🎯 Patterns

### 1. Component Composition Pattern
**Description**: Break UI into small, reusable, composable components  
**When to use**: Always  
**Principle**: Single responsibility, testability, reusability

```typescript
// ❌ BAD: Monolithic component
export const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  // 500 lines of JSX...
  return <div>...</div>;
};

// ✅ GOOD: Composed components
export const Dashboard = () => (
  <div>
    <Header />
    <UserList />
    <OrderSummary />
  </div>
);

const Header = () => <header>Dashboard</header>;
const UserList = () => (/* User list logic */);
const OrderSummary = () => (/* Order summary logic */);
```

### 2. Hooks Pattern
**Description**: Use React hooks for state and side effects  
**When to use**: Always in functional components  
**Principle**: Cleaner code, easier testing, better composition

```typescript
// ✅ GOOD: Custom hook
function useUserData(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}

// ✅ GOOD: Using the hook
function UserProfile({ userId }: Props) {
  const { user, loading, error } = useUserData(userId);
  
  if (loading) return <Spinner />;
  if (error) return <Error error={error} />;
  return <div>{user?.name}</div>;
}
```

### 3. Props Drilling Solution - Context API
**Description**: Share state across components without prop drilling  
**When to use**: Avoid passing props through 5+ levels

```typescript
// ✅ GOOD: Use context
const ThemeContext = createContext<'light' | 'dark'>('light');

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Deep component can access theme directly
const DeepComponent = () => {
  const theme = useContext(ThemeContext); // No prop drilling!
  return <div style={{ background: theme === 'dark' ? '#333' : '#fff' }} />;
};
```

### 4. Performance Optimization Pattern
**Description**: Prevent unnecessary re-renders

```typescript
// ✅ GOOD: Memoize expensive components
const UserCard = React.memo(({ user }: Props) => {
  return <div>{user.name}</div>;
});

// ✅ GOOD: Use useCallback for handlers
const OrderList = ({ onSelect }: Props) => {
  const handleSelect = useCallback((id: number) => {
    onSelect(id);
  }, [onSelect]); // Only recreate if onSelect changes

  return <div onClick={() => handleSelect(id)}>Orders</div>;
};

// ✅ GOOD: Use useMemo for expensive computations
const UserStats = ({ users }: Props) => {
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length
  }), [users]);

  return <div>Total: {stats.total}</div>;
};
```

### 5. State Management Pattern
**Description**: Manage complex state cleanly

```typescript
// ✅ GOOD: useReducer for complex state
type UserState = {
  data: User | null;
  loading: boolean;
  error: Error | null;
};

type UserAction = 
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: User }
  | { type: 'ERROR'; payload: Error };

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true };
    case 'SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, error: action.payload, loading: false };
  }
};

const UserProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  return <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>;
};
```

---

## 📋 Best Practices

### 1. TypeScript Usage
Always type your components and props.

```typescript
// ✅ GOOD: Proper typing
interface UserProps {
  id: number;
  name: string;
  onDelete: (id: number) => Promise<void>;
}

export const UserCard: React.FC<UserProps> = ({ id, name, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return <button onClick={handleDelete}>{isDeleting ? 'Deleting...' : name}</button>;
};
```

### 2. Error Boundaries
Catch errors in component tree.

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

// Usage:
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

### 3. Lazy Loading & Code Splitting
Load components only when needed.

```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

export const App = () => (
  <Suspense fallback={<Loading />}>
    <HeavyComponent />
  </Suspense>
);
```

### 4. Controlled vs Uncontrolled Components
Prefer controlled for forms.

```typescript
// ✅ GOOD: Controlled component
const [email, setEmail] = useState('');
<input value={email} onChange={(e) => setEmail(e.target.value)} />

// ❌ AVOID: Uncontrolled (harder to test)
const emailRef = useRef<HTMLInputElement>(null);
<input ref={emailRef} />
const email = emailRef.current?.value;
```

### 5. API Data Fetching
Use consistent pattern for API calls.

```typescript
// ✅ GOOD: useEffect pattern
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
```

---

## ⚠️ Anti-Patterns

### 1. Props Drilling
```typescript
// ❌ BAD: Passing through 10 components
<Level1 theme={theme} user={user} onLogout={onLogout} isLoading={isLoading} />

// ✅ GOOD: Use Context
<ThemeProvider value={theme}>
  <UserProvider value={user}>
    <Level1 />
  </UserProvider>
</ThemeProvider>
```

### 2. useEffect Misuse
```typescript
// ❌ BAD: No dependency array = runs every render
useEffect(() => {
  fetchData();
});

// ✅ GOOD: Proper dependency array
useEffect(() => {
  fetchData();
}, [userId]); // Only when userId changes
```

### 3. Creating Objects/Functions in Render
```typescript
// ❌ BAD: Creates new object every render
const User = ({ user }: Props) => {
  const theme = { color: 'red' }; // New object each render
  return <Component theme={theme} />;
};

// ✅ GOOD: Create outside or use useMemo
const theme = useMemo(() => ({ color: 'red' }), []);
```

### 4. Not Handling Async Properly
```typescript
// ❌ BAD: Race condition
const [user, setUser] = useState(null);
useEffect(() => {
  fetch(`/user/${id}`).then(setUser);
}, [id]); // If id changes rapidly, might set stale data

// ✅ GOOD: Handle cleanup
useEffect(() => {
  let isMounted = true;
  fetch(`/user/${id}`)
    .then(data => isMounted && setUser(data));
  return () => { isMounted = false; }; // Cleanup
}, [id]);
```

### 5. Storing Derived State
```typescript
// ❌ BAD: Derived state gets out of sync
const [firstName, setFirstName] = useState('John');
const [lastName, setLastName] = useState('Doe');
const [fullName, setFullName] = useState('John Doe'); // Out of sync!

// ✅ GOOD: Compute on demand
const fullName = `${firstName} ${lastName}`;
```

---

## 🛠️ Common Tasks

### Task: Fetch User Data with Loading State
```typescript
export const UserProfile = ({ userId }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{user?.name}</div>;
};
```

---

## 📚 Resources
- [React Docs](https://react.dev)
- [TypeScript React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Web Performance](https://web.dev/performance/)

---

**This skill documentation guides all React/TypeScript development decisions.**
