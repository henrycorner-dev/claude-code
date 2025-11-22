# Pinia Implementation Patterns

Complete guide to implementing Pinia in Vue 3 applications.

## Installation and Setup

### Installation

```bash
npm install pinia
```

### App Integration

```typescript
// main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount('#app');
```

## Store Definition

### Setup Syntax (Recommended for Vue 3)

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface User {
  id: string;
  name: string;
  email: string;
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // Getters (computed)
  const displayName = computed(() => {
    return user.value?.name || user.value?.email || 'Guest';
  });

  const isAdmin = computed(() => {
    return user.value?.role === 'admin';
  });

  // Actions
  function setUser(newUser: User) {
    user.value = newUser;
    isAuthenticated.value = true;
  }

  function logout() {
    user.value = null;
    isAuthenticated.value = false;
  }

  async function fetchUser(userId: string) {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  return {
    // State
    user,
    isAuthenticated,
    // Getters
    displayName,
    isAdmin,
    // Actions
    setUser,
    logout,
    fetchUser,
  };
});
```

### Options Syntax

```typescript
// stores/products.ts
import { defineStore } from 'pinia';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsState => ({
    products: [],
    loading: false,
    error: null,
  }),

  getters: {
    expensiveProducts: (state) => {
      return state.products.filter((p) => p.price > 100);
    },

    productById: (state) => {
      return (id: string) => state.products.find((p) => p.id === id);
    },

    productCount: (state) => state.products.length,
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/products');
        this.products = await response.json();
      } catch (error) {
        this.error = (error as Error).message;
      } finally {
        this.loading = false;
      }
    },

    addProduct(product: Product) {
      this.products.push(product);
    },

    removeProduct(id: string) {
      const index = this.products.findIndex((p) => p.id === id);
      if (index > -1) {
        this.products.splice(index, 1);
      }
    },

    updateProduct(id: string, updates: Partial<Product>) {
      const product = this.products.find((p) => p.id === id);
      if (product) {
        Object.assign(product, updates);
      }
    },
  },
});
```

## Async Operations

### Basic Async Actions

```typescript
export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchProducts() {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      products.value = await response.json();
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(product: Omit<Product, 'id'>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to create product');
      const newProduct = await response.json();
      products.value.push(newProduct);
      return newProduct;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, fetchProducts, createProduct };
});
```

### Async with AbortController

```typescript
export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  let abortController: AbortController | null = null;

  async function fetchProducts() {
    // Cancel previous request
    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();
    loading.value = true;

    try {
      const response = await fetch('/api/products', {
        signal: abortController.signal,
      });
      products.value = await response.json();
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    } finally {
      loading.value = false;
      abortController = null;
    }
  }

  return { products, loading, fetchProducts };
});
```

## Getters (Computed Properties)

### Basic Getters

```typescript
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);

  // Simple computed
  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Computed with calculation
  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  });

  // Computed returning function
  const itemById = computed(() => {
    return (id: string) => items.value.find((item) => item.id === id);
  });

  return { items, itemCount, total, itemById };
});
```

### Accessing Other Stores in Getters

```typescript
export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore();
  const items = ref<CartItem[]>([]);

  const total = computed(() => {
    const subtotal = items.value.reduce((sum, item) => sum + item.price, 0);

    // Apply discount for authenticated users
    if (userStore.isAuthenticated) {
      return subtotal * 0.9; // 10% discount
    }

    return subtotal;
  });

  return { items, total };
});
```

## Component Integration

### Composition API (Script Setup)

```vue
<script setup lang="ts">
import { useProductsStore } from '@/stores/products';
import { onMounted } from 'vue';

const store = useProductsStore();

onMounted(() => {
  store.fetchProducts();
});
</script>

<template>
  <div>
    <div v-if="store.loading">Loading...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <ul v-else>
      <li v-for="product in store.products" :key="product.id">
        {{ product.name }} - ${{ product.price }}
      </li>
    </ul>
  </div>
</template>
```

### Destructuring with storeToRefs

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useProductsStore } from '@/stores/products';

const store = useProductsStore();

// Destructure state and getters while keeping reactivity
const { products, loading, error, expensiveProducts } = storeToRefs(store);

// Destructure actions directly (they don't need storeToRefs)
const { fetchProducts, addProduct } = store;
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="product in expensiveProducts" :key="product.id">
        {{ product.name }}
      </li>
    </ul>
  </div>
</template>
```

### Options API

```vue
<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useProductsStore } from '@/stores/products';

export default defineComponent({
  computed: {
    ...mapState(useProductsStore, ['products', 'loading', 'error']),
    ...mapState(useProductsStore, {
      productList: 'products',
      isLoading: 'loading',
    }),
  },
  methods: {
    ...mapActions(useProductsStore, ['fetchProducts', 'addProduct']),
  },
  mounted() {
    this.fetchProducts();
  },
});
</script>
```

## Persistence

### Using pinia-plugin-persistedstate

**Installation:**
```bash
npm install pinia-plugin-persistedstate
```

**Setup:**
```typescript
// main.ts
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
```

**Basic Persistence:**
```typescript
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);

  function setUser(newUser: User) {
    user.value = newUser;
  }

  return { user, token, setUser };
}, {
  persist: true, // Persists entire store to localStorage
});
```

**Selective Persistence:**
```typescript
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const preferences = ref({});

  return { user, token, preferences };
}, {
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'preferences'], // Only persist these
  },
});
```

**Multiple Storages:**
```typescript
export const useAppStore = defineStore('app', () => {
  const sessionData = ref({});
  const permanentData = ref({});

  return { sessionData, permanentData };
}, {
  persist: [
    {
      key: 'session-data',
      storage: sessionStorage,
      paths: ['sessionData'],
    },
    {
      key: 'permanent-data',
      storage: localStorage,
      paths: ['permanentData'],
    },
  ],
});
```

## Store Composition

### Accessing Other Stores

```typescript
// stores/cart.ts
import { useUserStore } from './user';
import { useProductsStore } from './products';

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore();
  const productsStore = useProductsStore();

  const items = ref<CartItem[]>([]);

  async function addToCart(productId: string) {
    if (!userStore.isAuthenticated) {
      throw new Error('Must be logged in to add to cart');
    }

    const product = productsStore.productById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    items.value.push({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  return { items, addToCart };
});
```

### Store Dependencies

```typescript
// stores/notifications.ts
export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);

  function add(notification: Notification) {
    notifications.value.push(notification);
  }

  return { notifications, add };
});

// stores/products.ts
export const useProductsStore = defineStore('products', () => {
  const notificationsStore = useNotificationsStore();
  const products = ref<Product[]>([]);

  async function createProduct(product: Omit<Product, 'id'>) {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
      const newProduct = await response.json();
      products.value.push(newProduct);

      // Notify success
      notificationsStore.add({
        type: 'success',
        message: 'Product created successfully',
      });

      return newProduct;
    } catch (error) {
      notificationsStore.add({
        type: 'error',
        message: 'Failed to create product',
      });
      throw error;
    }
  }

  return { products, createProduct };
});
```

## Advanced Patterns

### Optimistic Updates

```typescript
export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([]);
  const optimisticTodos = ref<Map<string, Todo>>(new Map());

  const allTodos = computed(() => {
    return [...todos.value, ...Array.from(optimisticTodos.value.values())];
  });

  async function addTodo(text: string) {
    const tempId = `temp-${Date.now()}`;
    const optimisticTodo: Todo = {
      id: tempId,
      text,
      completed: false,
    };

    // Add optimistically
    optimisticTodos.value.set(tempId, optimisticTodo);

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const newTodo = await response.json();

      // Remove optimistic and add real
      optimisticTodos.value.delete(tempId);
      todos.value.push(newTodo);
    } catch (error) {
      // Revert on error
      optimisticTodos.value.delete(tempId);
      throw error;
    }
  }

  return { allTodos, addTodo };
});
```

### Store Subscriptions

```typescript
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);

  function setUser(newUser: User) {
    user.value = newUser;
  }

  return { user, setUser };
});

// In component or plugin:
const userStore = useUserStore();

// Subscribe to entire store
userStore.$subscribe((mutation, state) => {
  console.log('Store changed:', mutation.type, state);

  // Persist to API
  localStorage.setItem('user', JSON.stringify(state.user));
});

// Subscribe to specific property
watch(
  () => userStore.user,
  (newUser, oldUser) => {
    console.log('User changed from', oldUser, 'to', newUser);
  }
);
```

### Store Actions Subscriptions

```typescript
userStore.$onAction(({
  name,      // action name
  store,     // store instance
  args,      // action arguments
  after,     // hook after action
  onError,   // hook on error
}) => {
  const startTime = Date.now();

  console.log(`Action ${name} started with args:`, args);

  after((result) => {
    console.log(
      `Action ${name} finished in ${Date.now() - startTime}ms with result:`,
      result
    );
  });

  onError((error) => {
    console.error(`Action ${name} failed:`, error);
  });
});
```

### Reset Store

```typescript
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);

  function increment() {
    count.value++;
  }

  function $reset() {
    count.value = 0;
  }

  return { count, increment, $reset };
});

// Usage:
const counterStore = useCounterStore();
counterStore.$reset(); // Resets to initial state
```

### Patch Store

```typescript
const userStore = useUserStore();

// Patch with object
userStore.$patch({
  name: 'John',
  email: 'john@example.com',
});

// Patch with function (better for arrays)
userStore.$patch((state) => {
  state.items.push({ id: '1', name: 'Item' });
  state.name = 'Updated';
});
```

## Testing

### Store Testing

```typescript
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useProductsStore } from './products';

describe('Products Store', () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
  });

  it('initializes with empty products', () => {
    const store = useProductsStore();
    expect(store.products).toEqual([]);
  });

  it('adds a product', () => {
    const store = useProductsStore();
    const product = { id: '1', name: 'Test Product', price: 10 };

    store.addProduct(product);

    expect(store.products).toHaveLength(1);
    expect(store.products[0]).toEqual(product);
  });

  it('fetches products', async () => {
    const store = useProductsStore();

    await store.fetchProducts();

    expect(store.products.length).toBeGreaterThan(0);
    expect(store.loading).toBe(false);
  });
});
```

### Component Testing with Store

```typescript
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ProductList from './ProductList.vue';
import { useProductsStore } from '@/stores/products';

describe('ProductList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('displays products', () => {
    const store = useProductsStore();
    store.products = [
      { id: '1', name: 'Product 1', price: 10 },
      { id: '2', name: 'Product 2', price: 20 },
    ];

    const wrapper = mount(ProductList);

    expect(wrapper.text()).toContain('Product 1');
    expect(wrapper.text()).toContain('Product 2');
  });
});
```

## Plugins

### Custom Plugin

```typescript
// plugins/piniaLogger.ts
import { PiniaPluginContext } from 'pinia';

export function piniaLogger({ store }: PiniaPluginContext) {
  store.$subscribe((mutation, state) => {
    console.log(`[${store.$id}]:`, mutation.type, state);
  });

  store.$onAction(({ name, args }) => {
    console.log(`Action "${name}" called with:`, args);
  });
}

// main.ts
import { piniaLogger } from './plugins/piniaLogger';

const pinia = createPinia();
pinia.use(piniaLogger);
```

### Plugin with Options

```typescript
interface LoggerOptions {
  enabled: boolean;
  logActions: boolean;
  logMutations: boolean;
}

export function piniaLogger(options: LoggerOptions) {
  return ({ store }: PiniaPluginContext) => {
    if (!options.enabled) return;

    if (options.logMutations) {
      store.$subscribe((mutation, state) => {
        console.log(`[${store.$id}] Mutation:`, mutation.type);
      });
    }

    if (options.logActions) {
      store.$onAction(({ name }) => {
        console.log(`[${store.$id}] Action:`, name);
      });
    }
  };
}

// Usage:
pinia.use(piniaLogger({
  enabled: process.env.NODE_ENV === 'development',
  logActions: true,
  logMutations: true,
}));
```

## Best Practices

1. **Use setup syntax** for Vue 3 (more intuitive with Composition API)
2. **Leverage TypeScript** for type safety
3. **Use storeToRefs** when destructuring state/getters
4. **Keep stores focused** on single domains
5. **Use persistence** for user preferences and auth tokens
6. **Access other stores** when needed for composition
7. **Subscribe to changes** for side effects
8. **Test stores** independently from components
9. **Use plugins** for cross-cutting concerns
10. **Reset stores** when needed (e.g., on logout)
