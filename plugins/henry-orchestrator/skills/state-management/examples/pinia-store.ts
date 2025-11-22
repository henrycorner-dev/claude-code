// Complete Pinia store example with TypeScript and best practices

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// ===== Types =====

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

// ===== User Store (Setup Syntax) =====

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const user = ref<User | null>(null);
    const token = ref<string | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Getters (computed)
    const isAuthenticated = computed(() => user.value !== null);
    const isAdmin = computed(() => user.value?.role === 'admin');
    const displayName = computed(() => {
      if (!user.value) return 'Guest';
      return user.value.name || user.value.email;
    });

    // Actions
    function setUser(newUser: User) {
      user.value = newUser;
      error.value = null;
    }

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function logout() {
      user.value = null;
      token.value = null;
      loading.value = false;
      error.value = null;
    }

    async function fetchUser(userId: string) {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user');

        const userData = await response.json();
        user.value = userData;
      } catch (e) {
        error.value = (e as Error).message;
        throw e;
      } finally {
        loading.value = false;
      }
    }

    async function updateUser(updates: Partial<User>) {
      if (!user.value) throw new Error('No user to update');

      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(`/api/users/${user.value.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.value}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error('Failed to update user');

        const updatedUser = await response.json();
        user.value = updatedUser;
        return updatedUser;
      } catch (e) {
        error.value = (e as Error).message;
        throw e;
      } finally {
        loading.value = false;
      }
    }

    return {
      // State
      user,
      token,
      loading,
      error,
      // Getters
      isAuthenticated,
      isAdmin,
      displayName,
      // Actions
      setUser,
      setToken,
      logout,
      fetchUser,
      updateUser,
    };
  },
  {
    persist: {
      paths: ['token'], // Only persist token
    },
  }
);

// ===== Products Store (Setup Syntax) =====

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const productCount = computed(() => products.value.length);

  const expensiveProducts = computed(() => {
    return products.value.filter((p) => p.price > 100);
  });

  const productsByCategory = computed(() => {
    return (categoryId: string) => {
      return products.value.filter((p) => p.categoryId === categoryId);
    };
  });

  const productById = computed(() => {
    return (id: string) => {
      return products.value.find((p) => p.id === id);
    };
  });

  // Actions
  async function fetchProducts(categoryId?: string) {
    loading.value = true;
    error.value = null;

    try {
      const url = categoryId ? `/api/products?category=${categoryId}` : '/api/products';
      const response = await fetch(url);

      if (!response.ok) throw new Error('Failed to fetch products');

      products.value = await response.json();
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
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

  function updateProduct(id: string, updates: Partial<Product>) {
    const product = products.value.find((p) => p.id === id);
    if (product) {
      Object.assign(product, updates);
    }
  }

  function removeProduct(id: string) {
    const index = products.value.findIndex((p) => p.id === id);
    if (index > -1) {
      products.value.splice(index, 1);
    }
  }

  return {
    // State
    products,
    loading,
    error,
    // Getters
    productCount,
    expensiveProducts,
    productsByCategory,
    productById,
    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    removeProduct,
  };
});

// ===== Cart Store (Options Syntax) =====

interface CartState {
  items: CartItem[];
}

export const useCartStore = defineStore(
  'cart',
  {
    state: (): CartState => ({
      items: [],
    }),

    getters: {
      itemCount: (state) => {
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      total: (state) => {
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      itemById: (state) => {
        return (id: string) => state.items.find((item) => item.id === id);
      },

      isEmpty: (state) => state.items.length === 0,
    },

    actions: {
      addItem(productId: string, price: number) {
        const existingItem = this.items.find((item) => item.productId === productId);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          this.items.push({
            id: crypto.randomUUID(),
            productId,
            quantity: 1,
            price,
          });
        }
      },

      removeItem(id: string) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index > -1) {
          this.items.splice(index, 1);
        }
      },

      updateQuantity(id: string, quantity: number) {
        const item = this.items.find((item) => item.id === id);
        if (item) {
          if (quantity <= 0) {
            this.removeItem(id);
          } else {
            item.quantity = quantity;
          }
        }
      },

      clear() {
        this.items = [];
      },

      async syncWithServer() {
        const userStore = useUserStore();

        if (!userStore.isAuthenticated) {
          return;
        }

        try {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userStore.token}`,
            },
            body: JSON.stringify({ items: this.items }),
          });
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },
    },
  },
  {
    persist: {
      key: 'shopping-cart',
      storage: localStorage,
    },
  }
);

// ===== Notifications Store (for cross-store actions example) =====

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);

  function add(type: Notification['type'], message: string) {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      message,
    };

    notifications.value.push(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      remove(notification.id);
    }, 5000);
  }

  function remove(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clear() {
    notifications.value = [];
  }

  return {
    notifications,
    add,
    remove,
    clear,
  };
});

// ===== Store Subscriptions =====

// Subscribe to user changes
export function setupUserSubscription() {
  const userStore = useUserStore();
  const cartStore = useCartStore();

  userStore.$subscribe((mutation, state) => {
    // Clear cart when user logs out
    if (!state.user && mutation.events) {
      cartStore.clear();
    }
  });

  // Track user actions
  userStore.$onAction(({ name, args, after, onError }) => {
    console.log(`User action: ${name}`, args);

    after((result) => {
      console.log(`User action ${name} completed`, result);
    });

    onError((error) => {
      console.error(`User action ${name} failed`, error);
    });
  });
}

// ===== Usage Examples in Components =====

/*
// Using setup syntax in Vue component:

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useProductsStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';

// User store
const userStore = useUserStore();
const { user, isAuthenticated, displayName } = storeToRefs(userStore);
const { logout, fetchUser } = userStore;

// Products store
const productsStore = useProductsStore();
const { products, loading, expensiveProducts } = storeToRefs(productsStore);
const { fetchProducts, createProduct } = productsStore;

// Cart store
const cartStore = useCartStore();
const { items, total, itemCount } = storeToRefs(cartStore);
const { addItem, removeItem } = cartStore;

onMounted(async () => {
  await fetchProducts();
});

function handleAddToCart(product: Product) {
  addItem(product.id, product.price);
}
</script>

<template>
  <div>
    <header>
      <div>Welcome, {{ displayName }}</div>
      <div>Cart: {{ itemCount }} items - ${{ total.toFixed(2) }}</div>
    </header>

    <div v-if="loading">Loading...</div>
    <ul v-else>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} - ${{ product.price }}
        <button @click="handleAddToCart(product)">Add to Cart</button>
      </li>
    </ul>
  </div>
</template>

// Using Options API:

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useProductsStore } from '@/stores/products';

export default defineComponent({
  computed: {
    ...mapState(useProductsStore, ['products', 'loading', 'expensiveProducts']),
  },
  methods: {
    ...mapActions(useProductsStore, ['fetchProducts', 'createProduct']),
  },
  mounted() {
    this.fetchProducts();
  },
});
</script>

// Accessing store outside components:

import { useUserStore } from '@/stores/user';

export async function apiRequest(url: string) {
  const userStore = useUserStore();

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${userStore.token}`,
    },
  });

  if (response.status === 401) {
    userStore.logout();
  }

  return response;
}
*/
