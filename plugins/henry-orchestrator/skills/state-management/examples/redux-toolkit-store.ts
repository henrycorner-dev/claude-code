// Complete Redux Toolkit store example with best practices

import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

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

interface UserState {
  current: User | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

interface ProductsState {
  items: Product[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

// ===== User Slice =====

const initialUserState: UserState = {
  current: null,
  loading: 'idle',
  error: null,
};

// Async thunk for fetching user
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk for updating user
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, updates }: { id: string; updates: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.current = action.payload;
      state.error = null;
    },
    logout: state => {
      state.current = null;
      state.loading = 'idle';
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Fetch user
    builder
      .addCase(fetchUser.pending, state => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });

    // Update user
    builder
      .addCase(updateUser.pending, state => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.current = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setUser, logout, clearError } = userSlice.actions;

// ===== Products Slice =====

const initialProductsState: ProductsState = {
  items: [],
  loading: 'idle',
  error: null,
};

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (categoryId: string | undefined, { rejectWithValue }) => {
    try {
      const url = categoryId ? `/api/products?category=${categoryId}` : '/api/products';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk for creating product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Omit<Product, 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: initialProductsState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    updateProduct: (state, action: PayloadAction<{ id: string; updates: Partial<Product> }>) => {
      const product = state.items.find(p => p.id === action.payload.id);
      if (product) {
        Object.assign(product, action.payload.updates);
      }
    },
  },
  extraReducers: builder => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });

    // Create product
    builder
      .addCase(createProduct.pending, state => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { addProduct, removeProduct, updateProduct } = productsSlice.actions;

// ===== Store Configuration =====

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    products: productsSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['your/action/type'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ===== TypeScript Types =====

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ===== Typed Hooks =====

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ===== Selectors =====

// User selectors
export const selectUser = (state: RootState) => state.user.current;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;
export const selectIsAuthenticated = (state: RootState) => state.user.current !== null;
export const selectIsAdmin = (state: RootState) => state.user.current?.role === 'admin';

// Product selectors
export const selectProducts = (state: RootState) => state.products.items;
export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectProductsError = (state: RootState) => state.products.error;

// Memoized selectors
import { createSelector } from '@reduxjs/toolkit';

export const selectExpensiveProducts = createSelector([selectProducts], products =>
  products.filter(p => p.price > 100)
);

export const selectProductsByCategory = createSelector(
  [selectProducts, (_state: RootState, categoryId: string) => categoryId],
  (products, categoryId) => products.filter(p => p.categoryId === categoryId)
);

export const selectProductStats = createSelector([selectProducts], products => {
  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = total > 0 ? totalValue / total : 0;

  return {
    total,
    totalValue,
    averagePrice,
  };
});

// ===== Usage Example in Component =====

/*
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { fetchProducts, selectProducts, selectProductsLoading } from './store';

function ProductList() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchProducts(undefined));
  }, [dispatch]);

  if (loading === 'pending') return <div>Loading...</div>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}
*/
