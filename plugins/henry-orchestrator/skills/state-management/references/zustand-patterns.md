# Zustand Implementation Patterns

Complete guide to implementing Zustand in React applications.

## Store Creation

### Basic Store

```typescript
// stores/userStore.ts
import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>(set => ({
  user: null,
  isAuthenticated: false,
  setUser: user => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Store with Immer Middleware

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>()(
  immer(set => ({
    todos: [],
    addTodo: text =>
      set(state => {
        state.todos.push({
          id: crypto.randomUUID(),
          text,
          completed: false,
        });
      }),
    toggleTodo: id =>
      set(state => {
        const todo = state.todos.find(t => t.id === id);
        if (todo) {
          todo.completed = !todo.completed;
        }
      }),
    removeTodo: id =>
      set(state => {
        state.todos = state.todos.filter(t => t.id !== id);
      }),
  }))
);
```

## Async Operations

### Basic Async Actions

```typescript
import { create } from 'zustand';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      set({ products, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createProduct: async product => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const newProduct = await response.json();
      set(state => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
```

### Async with Abort Controller

```typescript
export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  abortController: null as AbortController | null,

  fetchProducts: async () => {
    // Cancel previous request if still pending
    get().abortController?.abort();

    const controller = new AbortController();
    set({ loading: true, error: null, abortController: controller });

    try {
      const response = await fetch('/api/products', {
        signal: controller.signal,
      });
      const products = await response.json();
      set({ products, loading: false, abortController: null });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        set({ error: (error as Error).message, loading: false });
      }
    }
  },
}));
```

## Middleware

### Persist Middleware

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  toggleNotifications: () => void;
}

export const useSettingsStore = create<AppSettings>()(
  persist(
    set => ({
      theme: 'light',
      language: 'en',
      notifications: true,
      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      toggleNotifications: () => set(state => ({ notifications: !state.notifications })),
    }),
    {
      name: 'app-settings', // localStorage key
      storage: createJSONStorage(() => localStorage), // or sessionStorage
    }
  )
);
```

### Persist with Selective Storage

```typescript
export const useUserStore = create<UserState>()(
  persist(
    set => ({
      user: null,
      token: null,
      preferences: {},
      setUser: user => set({ user }),
      setToken: token => set({ token }),
      setPreferences: preferences => set({ preferences }),
    }),
    {
      name: 'user-store',
      partialize: state => ({
        // Only persist these fields
        token: state.token,
        preferences: state.preferences,
        // Don't persist user data
      }),
    }
  )
);
```

### Persist with Custom Storage

```typescript
import { StateStorage } from 'zustand/middleware';

// Custom storage using IndexedDB
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await idb.get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idb.set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await idb.del(name);
  },
};

export const useStore = create<State>()(
  persist(
    set => ({
      /* state */
    }),
    {
      name: 'my-store',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
```

### DevTools Middleware

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    set => ({
      count: 0,
      increment: () => set(state => ({ count: state.count + 1 }), false, 'increment'),
      decrement: () => set(state => ({ count: state.count - 1 }), false, 'decrement'),
    }),
    { name: 'CounterStore' }
  )
);
```

### Combining Middlewares

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<State>()(
  devtools(
    persist(
      immer(set => ({
        // Store implementation
      })),
      { name: 'my-store' }
    ),
    { name: 'MyStore' }
  )
);
```

## Slices Pattern

For large stores, split into slices:

```typescript
// stores/slices/userSlice.ts
import { StateCreator } from 'zustand';

export interface UserSlice {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const createUserSlice: StateCreator<
  UserSlice & ProductSlice, // All slices
  [],
  [],
  UserSlice
> = set => ({
  user: null,
  setUser: user => set({ user }),
  logout: () => set({ user: null }),
});

// stores/slices/productSlice.ts
export interface ProductSlice {
  products: Product[];
  addProduct: (product: Product) => void;
}

export const createProductSlice: StateCreator<
  UserSlice & ProductSlice,
  [],
  [],
  ProductSlice
> = set => ({
  products: [],
  addProduct: product =>
    set(state => ({
      products: [...state.products, product],
    })),
});

// stores/index.ts
import { create } from 'zustand';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createProductSlice, ProductSlice } from './slices/productSlice';

export const useStore = create<UserSlice & ProductSlice>()((...a) => ({
  ...createUserSlice(...a),
  ...createProductSlice(...a),
}));
```

## Selectors

### Basic Selectors

```typescript
// In component:
function UserProfile() {
  const user = useUserStore((state) => state.user);
  const name = useUserStore((state) => state.user?.name);

  return <div>{name}</div>;
}
```

### Optimized Selectors with Shallow

```typescript
import { shallow } from 'zustand/shallow';

function UserInfo() {
  // Only re-render if name or email change
  const { name, email } = useUserStore(
    (state) => ({
      name: state.user?.name,
      email: state.user?.email,
    }),
    shallow
  );

  return (
    <div>
      <p>{name}</p>
      <p>{email}</p>
    </div>
  );
}
```

### Custom Selector Hooks

```typescript
// hooks/useUser.ts
export const useUser = () => useUserStore((state) => state.user);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);

// Computed selectors
export const useUserDisplayName = () =>
  useUserStore((state) => {
    const user = state.user;
    if (!user) return 'Guest';
    return user.name || user.email;
  });

// Usage:
function Header() {
  const displayName = useUserDisplayName();
  return <div>Hello, {displayName}</div>;
}
```

### Memoized Selectors

```typescript
import { useMemo } from 'react';

function ProductList() {
  const products = useProductStore((state) => state.products);

  const expensiveProducts = useMemo(
    () => products.filter((p) => p.price > 100),
    [products]
  );

  return (
    <ul>
      {expensiveProducts.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

## Component Integration

### Basic Usage

```typescript
function TodoList() {
  const todos = useTodoStore((state) => state.todos);
  const addTodo = useTodoStore((state) => state.addTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);

  return (
    <div>
      <button onClick={() => addTodo('New todo')}>Add</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### With useEffect

```typescript
function ProductList() {
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### Optimistic Updates

```typescript
interface TodoState {
  todos: Todo[];
  optimisticTodos: Map<string, Todo>;
  addTodo: (text: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  optimisticTodos: new Map(),

  addTodo: async text => {
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo = { id: tempId, text, completed: false };

    // Add optimistically
    set(state => ({
      optimisticTodos: new Map(state.optimisticTodos).set(tempId, optimisticTodo),
    }));

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const newTodo = await response.json();

      // Replace optimistic with real
      set(state => {
        const newOptimistic = new Map(state.optimisticTodos);
        newOptimistic.delete(tempId);
        return {
          todos: [...state.todos, newTodo],
          optimisticTodos: newOptimistic,
        };
      });
    } catch (error) {
      // Remove optimistic on error
      set(state => {
        const newOptimistic = new Map(state.optimisticTodos);
        newOptimistic.delete(tempId);
        return { optimisticTodos: newOptimistic };
      });
    }
  },
}));
```

## Store Access Outside React

### Direct Store Access

```typescript
// Get current state
const currentUser = useUserStore.getState().user;

// Subscribe to changes
const unsubscribe = useUserStore.subscribe(state => {
  console.log('User changed:', state.user);
});

// Update state
useUserStore.setState({ user: newUser });

// Clean up
unsubscribe();
```

### In Event Handlers

```typescript
// utils/api.ts
import { useUserStore } from '../stores/userStore';

export async function fetchWithAuth(url: string) {
  const token = useUserStore.getState().token;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    useUserStore.getState().logout();
  }

  return response;
}
```

## Testing

### Store Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useStore } from './store';

describe('Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.setState({ count: 0 });
  });

  it('increments count', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('fetches products', async () => {
    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(result.current.products.length).toBeGreaterThan(0);
    expect(result.current.loading).toBe(false);
  });
});
```

### Component Testing with Store

```typescript
import { render, screen } from '@testing-library/react';
import { useStore } from './store';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  it('displays user name', () => {
    // Set up store state
    useStore.setState({
      user: { id: '1', name: 'John Doe', email: 'john@example.com' },
    });

    render(<UserProfile />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Advanced Patterns

### Store Subscriptions

```typescript
interface NotificationState {
  notifications: Notification[];
  subscribe: (callback: (notification: Notification) => void) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  subscribe: callback => {
    // Return unsubscribe function
    return useNotificationStore.subscribe((state, prevState) => {
      const newNotifications = state.notifications.filter(
        n => !prevState.notifications.includes(n)
      );
      newNotifications.forEach(callback);
    });
  },
}));

// Usage:
useEffect(() => {
  const unsubscribe = useNotificationStore.getState().subscribe(notification => {
    toast.show(notification.message);
  });

  return unsubscribe;
}, []);
```

### Computed Values

```typescript
interface CartState {
  items: CartItem[];
  get total(): number;
  get itemCount(): number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  get itemCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// Usage:
const total = useCartStore(state => state.total);
```

### Middleware for Side Effects

```typescript
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useStore = create<State>()(
  subscribeWithSelector(set => ({
    user: null,
    setUser: user => set({ user }),
  }))
);

// Subscribe to specific property
useStore.subscribe(
  state => state.user,
  (user, prevUser) => {
    console.log('User changed from', prevUser, 'to', user);
  }
);
```

## Best Practices

1. **Keep stores focused** - One store per domain or feature
2. **Use TypeScript** for type safety
3. **Optimize selectors** - Use shallow equality for objects
4. **Use immer middleware** for complex nested updates
5. **Leverage persistence** for user preferences and settings
6. **Split large stores** into slices
7. **Access outside React** via getState() and setState()
8. **Test stores independently** before integration
9. **Use DevTools** in development
10. **Handle async properly** - Track loading and error states
