// Complete Zustand store example with middleware and best practices

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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

// ===== User Store =====

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
  fetchUser: (userId: string) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        loading: false,
        error: null,

        setUser: user => set({ user }, false, 'setUser'),

        setToken: token => set({ token }, false, 'setToken'),

        logout: () =>
          set(
            {
              user: null,
              token: null,
              loading: false,
              error: null,
            },
            false,
            'logout'
          ),

        fetchUser: async userId => {
          set({ loading: true, error: null }, false, 'fetchUser/pending');

          try {
            const response = await fetch(`/api/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            });

            if (!response.ok) throw new Error('Failed to fetch user');

            const user = await response.json();
            set({ user, loading: false }, false, 'fetchUser/fulfilled');
          } catch (error) {
            set(
              {
                error: (error as Error).message,
                loading: false,
              },
              false,
              'fetchUser/rejected'
            );
          }
        },

        updateUser: async updates => {
          const currentUser = get().user;
          if (!currentUser) throw new Error('No user to update');

          set({ loading: true, error: null }, false, 'updateUser/pending');

          try {
            const response = await fetch(`/api/users/${currentUser.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${get().token}`,
              },
              body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update user');

            const updatedUser = await response.json();
            set({ user: updatedUser, loading: false }, false, 'updateUser/fulfilled');
          } catch (error) {
            set(
              {
                error: (error as Error).message,
                loading: false,
              },
              false,
              'updateUser/rejected'
            );
          }
        },
      }),
      {
        name: 'user-store',
        partialize: state => ({
          token: state.token, // Only persist token
        }),
      }
    ),
    { name: 'UserStore' }
  )
);

// ===== Products Store =====

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (categoryId?: string) => Promise<void>;
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsState>()(
  devtools(
    immer((set, get) => ({
      products: [],
      loading: false,
      error: null,

      fetchProducts: async categoryId => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const url = categoryId ? `/api/products?category=${categoryId}` : '/api/products';
          const response = await fetch(url);

          if (!response.ok) throw new Error('Failed to fetch products');

          const products = await response.json();

          set(state => {
            state.products = products;
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = (error as Error).message;
            state.loading = false;
          });
        }
      },

      createProduct: async product => {
        set(state => {
          state.loading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });

          if (!response.ok) throw new Error('Failed to create product');

          const newProduct = await response.json();

          set(state => {
            state.products.push(newProduct);
            state.loading = false;
          });
        } catch (error) {
          set(state => {
            state.error = (error as Error).message;
            state.loading = false;
          });
        }
      },

      updateProduct: (id, updates) => {
        set(state => {
          const product = state.products.find(p => p.id === id);
          if (product) {
            Object.assign(product, updates);
          }
        });
      },

      removeProduct: id => {
        set(state => {
          state.products = state.products.filter(p => p.id !== id);
        });
      },
    })),
    { name: 'ProductsStore' }
  )
);

// ===== Cart Store =====

interface CartState {
  items: CartItem[];
  addItem: (productId: string, price: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  // Computed values
  get total(): number;
  get itemCount(): number;
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      immer((set, get) => ({
        items: [],

        addItem: (productId, price) => {
          set(state => {
            const existingItem = state.items.find(item => item.productId === productId);

            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              state.items.push({
                id: crypto.randomUUID(),
                productId,
                quantity: 1,
                price,
              });
            }
          });
        },

        removeItem: id => {
          set(state => {
            state.items = state.items.filter(item => item.id !== id);
          });
        },

        updateQuantity: (id, quantity) => {
          set(state => {
            const item = state.items.find(item => item.id === id);
            if (item) {
              item.quantity = quantity;
            }
          });
        },

        clear: () => {
          set({ items: [] });
        },

        get total() {
          return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        },

        get itemCount() {
          return get().items.reduce((sum, item) => sum + item.quantity, 0);
        },
      })),
      {
        name: 'cart-store',
        partialize: state => ({ items: state.items }),
      }
    ),
    { name: 'CartStore' }
  )
);

// ===== Custom Hooks (Selectors) =====

// User selectors
export const useUser = () => useUserStore(state => state.user);
export const useIsAuthenticated = () => useUserStore(state => state.user !== null);
export const useIsAdmin = () => useUserStore(state => state.user?.role === 'admin');

// Product selectors
export const useProducts = () => useProductsStore(state => state.products);
export const useProductsLoading = () => useProductsStore(state => state.loading);

export const useExpensiveProducts = () =>
  useProductsStore(state => state.products.filter(p => p.price > 100));

export const useProductsByCategory = (categoryId: string) =>
  useProductsStore(state => state.products.filter(p => p.categoryId === categoryId));

// Cart selectors
export const useCartItems = () => useCartStore(state => state.items);
export const useCartTotal = () => useCartStore(state => state.total);
export const useCartItemCount = () => useCartStore(state => state.itemCount);

// ===== Store Subscriptions (for side effects) =====

// Subscribe to user changes
useUserStore.subscribe(
  state => state.user,
  (user, prevUser) => {
    if (user && !prevUser) {
      console.log('User logged in:', user);
    } else if (!user && prevUser) {
      console.log('User logged out');
    }
  }
);

// Subscribe to cart changes to sync with server
useCartStore.subscribe(
  state => state.items,
  items => {
    // Sync cart to server for logged-in users
    const user = useUserStore.getState().user;
    if (user) {
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      }).catch(error => {
        console.error('Failed to sync cart:', error);
      });
    }
  }
);

// ===== Usage Examples =====

/*
// In a component:

import { useUser, useProducts, useCartTotal } from './store';

function Header() {
  const user = useUser();
  const cartTotal = useCartTotal();

  return (
    <header>
      <div>Welcome, {user?.name || 'Guest'}</div>
      <div>Cart Total: ${cartTotal.toFixed(2)}</div>
    </header>
  );
}

function ProductList() {
  const products = useProducts();
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const loading = useProductsLoading();

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

// Accessing store outside React:

const currentUser = useUserStore.getState().user;
useUserStore.getState().logout();

// Subscribe to changes outside React:

const unsubscribe = useUserStore.subscribe((state) => {
  console.log('Store updated:', state);
});

// Clean up:
unsubscribe();
*/
