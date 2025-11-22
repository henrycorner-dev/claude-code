# Redux Toolkit Implementation Patterns

Complete guide to implementing Redux Toolkit in React applications.

## Store Setup

### Basic Configuration

```typescript
// store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import productsReducer from './features/products/productsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/action/type'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### App Integration

```typescript
// main.tsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <YourApp />
    </Provider>
  );
}
```

### Custom Hooks

```typescript
// hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Slice Creation

### Basic Slice

```typescript
// features/user/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string | null;
  name: string;
  email: string;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.isAuthenticated = true;
    },
    updateName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    logout: state => {
      state.id = null;
      state.name = '';
      state.email = '';
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateName, logout } = userSlice.actions;
export default userSlice.reducer;
```

### Slice with Prepare Callbacks

```typescript
import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.push(action.payload);
      },
      prepare: (text: string) => {
        return {
          payload: {
            id: nanoid(),
            text,
            completed: false,
            createdAt: Date.now(),
          },
        };
      },
    },
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
  },
});
```

## Async Operations with createAsyncThunk

### Basic Async Thunk

```typescript
// features/products/productsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsApi } from '../../api/products';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductsState {
  items: Product[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  loading: 'idle',
  error: null,
};

// Async thunk
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (categoryId: string) => {
    const response = await productsApi.getProducts(categoryId);
    return response.data;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: builder => {
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
        state.error = action.error.message || 'Failed to fetch products';
      });
  },
});

export default productsSlice.reducer;
```

### Async Thunk with Error Handling

```typescript
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Omit<Product, 'id'>, { rejectWithValue }) => {
    try {
      const response = await productsApi.createProduct(product);
      return response.data;
    } catch (err: any) {
      // Return custom error message
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  }
);

// In slice:
extraReducers: builder => {
  builder
    .addCase(createProduct.fulfilled, (state, action) => {
      state.items.push(action.payload);
    })
    .addCase(createProduct.rejected, (state, action) => {
      state.error = action.payload as string;
    });
};
```

### Async Thunk with ThunkAPI

```typescript
import { RootState } from '../../store';

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    { id, updates }: { id: string; updates: Partial<Product> },
    { getState, dispatch, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const currentUser = state.user.id;

    if (!currentUser) {
      return rejectWithValue('User must be authenticated');
    }

    try {
      const response = await productsApi.updateProduct(id, updates);
      // Optionally dispatch other actions
      dispatch(someOtherAction());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);
```

### Conditional Fetching

```typescript
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId: string) => {
    const response = await usersApi.fetchUser(userId);
    return response.data;
  },
  {
    condition: (userId, { getState }) => {
      const state = getState() as RootState;
      const user = state.users.entities[userId];
      // Don't fetch if already present
      if (user) {
        return false;
      }
    },
  }
);
```

## Selectors

### Basic Selectors

```typescript
// features/products/productsSelectors.ts
import { RootState } from '../../store';

export const selectProducts = (state: RootState) => state.products.items;
export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectProductsError = (state: RootState) => state.products.error;
```

### Memoized Selectors with Reselect

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export const selectProducts = (state: RootState) => state.products.items;

// Memoized - only recalculates when products change
export const selectExpensiveProducts = createSelector([selectProducts], products =>
  products.filter(p => p.price > 100)
);

// Selector with parameters
export const selectProductsByCategory = createSelector(
  [selectProducts, (state: RootState, categoryId: string) => categoryId],
  (products, categoryId) => products.filter(p => p.categoryId === categoryId)
);

// Usage in component:
const expensiveProducts = useAppSelector(state => selectProductsByCategory(state, 'electronics'));
```

### Complex Selectors

```typescript
export const selectProductStats = createSelector([selectProducts], products => {
  const total = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = total > 0 ? totalValue / total : 0;

  return {
    total,
    totalValue,
    averagePrice,
    mostExpensive: products.reduce((max, p) => (p.price > max.price ? p : max), products[0]),
  };
});
```

## Component Integration

### Basic Usage

```typescript
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchProducts } from './productsSlice';
import { selectProducts, selectProductsLoading } from './productsSelectors';

function ProductList() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchProducts('electronics'));
  }, [dispatch]);

  if (loading === 'pending') return <div>Loading...</div>;

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

### Optimized Rendering

```typescript
import { shallowEqual } from 'react-redux';

function UserProfile() {
  // Only re-render if name or email change
  const { name, email } = useAppSelector(
    (state) => ({
      name: state.user.name,
      email: state.user.email,
    }),
    shallowEqual
  );

  return (
    <div>
      <p>Name: {name}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

## Entity Adapter Pattern

For normalized state management:

```typescript
import { createEntityAdapter, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  price: number;
}

const productsAdapter = createEntityAdapter<Product>({
  selectId: product => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const initialState = productsAdapter.getInitialState({
  loading: 'idle' as 'idle' | 'pending' | 'succeeded' | 'failed',
  error: null as string | null,
});

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const response = await productsApi.getProducts();
  return response.data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productAdded: productsAdapter.addOne,
    productUpdated: productsAdapter.updateOne,
    productRemoved: productsAdapter.removeOne,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.loading = 'pending';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        productsAdapter.setAll(state, action.payload);
      });
  },
});

export const { productAdded, productUpdated, productRemoved } = productsSlice.actions;

// Selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors((state: RootState) => state.products);

export default productsSlice.reducer;
```

## Middleware

### Custom Middleware

```typescript
import { Middleware } from '@reduxjs/toolkit';

const loggerMiddleware: Middleware = storeAPI => next => action => {
  console.log('Dispatching:', action);
  const result = next(action);
  console.log('Next state:', storeAPI.getState());
  return result;
};

// Add to store:
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(loggerMiddleware),
});
```

### API Middleware Example

```typescript
const apiMiddleware: Middleware = storeAPI => next => async action => {
  if (action.type.endsWith('/rejected')) {
    // Handle all rejected async thunks
    if (action.error.message === 'Unauthorized') {
      storeAPI.dispatch(logout());
    }
  }
  return next(action);
};
```

## RTK Query Integration

For advanced API state management:

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Product'],
  endpoints: builder => ({
    getProducts: builder.query<Product[], void>({
      query: () => 'products',
      providesTags: ['Product'],
    }),
    getProduct: builder.query<Product, string>({
      query: id => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation<Product, Omit<Product, 'id'>>({
      query: product => ({
        url: 'products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation<Product, { id: string; updates: Partial<Product> }>({
      query: ({ id, updates }) => ({
        url: `products/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} = productsApi;

// Add to store:
export const store = configureStore({
  reducer: {
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(productsApi.middleware),
});
```

## Best Practices

1. **Use TypeScript** for type safety
2. **Normalize state** with Entity Adapter for entity collections
3. **Use createAsyncThunk** for async operations instead of manual action creators
4. **Memoize selectors** with createSelector for derived data
5. **Keep slices focused** on a single domain
6. **Use RTK Query** for server state management when appropriate
7. **Enable DevTools** in development
8. **Write tests** for reducers and selectors (they're pure functions)
9. **Use middleware** for cross-cutting concerns
10. **Follow naming conventions** (e.g., `user/setUser`, `products/fetchProducts`)
