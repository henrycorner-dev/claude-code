---
name: state-management
description: This skill should be used when the user asks to "set up Redux", "implement Zustand", "configure Vuex", "add Pinia store", "design global state", "handle async actions", "add state persistence", "create store slice", "manage application state", or mentions state management libraries (Redux, Zustand, Vuex, Pinia, MobX, Recoil).
version: 0.1.0
---

# State Management Skill

This skill provides guidance for designing and implementing global state management solutions in modern web applications. It covers popular state management libraries across React (Redux, Zustand, Recoil, MobX) and Vue (Vuex, Pinia) ecosystems, with focus on async actions, persistence, and architectural best practices.

## When to Use This Skill

Use this skill when implementing or refactoring application state management, particularly for:

- Setting up a new state management library in a project
- Designing global state architecture and store structure
- Implementing async action patterns (API calls, side effects)
- Adding state persistence (localStorage, sessionStorage, IndexedDB)
- Migrating between state management solutions
- Optimizing state updates and re-renders
- Implementing middleware or plugins

## Core Concepts

### State Management Approach Selection

Choose the appropriate state management solution based on application complexity:

**Simple Applications (< 5 routes, minimal shared state):**
- React: Context API + useReducer
- Vue: Composition API with composables
- No external library needed

**Medium Applications (5-20 routes, moderate shared state):**
- React: Zustand or Recoil (simpler, less boilerplate)
- Vue: Pinia (modern, TypeScript-first)

**Complex Applications (20+ routes, extensive shared state):**
- React: Redux Toolkit (established patterns, DevTools, middleware ecosystem)
- Vue: Pinia or Vuex (Pinia recommended for new projects)

### Store Architecture Principles

**Domain-Based Organization:**
Structure stores by business domain, not by technical concerns:

```
stores/
├── auth/          # Authentication state
├── user/          # User profile data
├── products/      # Product catalog
├── cart/          # Shopping cart
└── ui/            # UI-specific state (modals, sidebars)
```

**Normalized State:**
Store entities by ID to avoid duplication:

```javascript
{
  products: {
    byId: { '1': {...}, '2': {...} },
    allIds: ['1', '2']
  }
}
```

**Separation of Concerns:**
- State: Data only (no logic)
- Actions: State mutations
- Selectors/Getters: Derived data and computed values
- Side effects: Async operations (API calls, timers)

## Implementation Workflows

### Setting Up Redux Toolkit (React)

**Installation:**
```bash
npm install @reduxjs/toolkit react-redux
```

**Store Configuration:**
1. Create store file with configureStore
2. Define slices with createSlice for each domain
3. Implement async actions with createAsyncThunk
4. Configure middleware (optional)
5. Wrap app with Provider

**Key Patterns:**
- Use createSlice for reducer + actions
- Use createAsyncThunk for API calls
- Use createSelector for memoized selectors
- Enable Redux DevTools by default

See `references/redux-toolkit-patterns.md` for detailed implementation patterns.

### Setting Up Zustand (React)

**Installation:**
```bash
npm install zustand
```

**Store Creation:**
1. Define store with create() function
2. Implement state and actions in single object
3. Add middleware (persist, devtools, immer)
4. Use selectors in components

**Key Patterns:**
- Colocate state and actions
- Use shallow equality for selectors
- Leverage middleware for cross-cutting concerns
- Split large stores into slices

See `references/zustand-patterns.md` for detailed implementation patterns.

### Setting Up Pinia (Vue 3)

**Installation:**
```bash
npm install pinia
```

**Store Configuration:**
1. Create Pinia instance and install in app
2. Define stores with defineStore
3. Use setup or options syntax
4. Implement getters and actions
5. Add plugins (persistence, DevTools)

**Key Patterns:**
- Use setup syntax for Composition API style
- Define getters for computed state
- Handle async in actions
- Leverage store subscriptions for side effects

See `references/pinia-patterns.md` for detailed implementation patterns.

### Setting Up Vuex (Vue 2/3)

**Installation:**
```bash
npm install vuex
```

**Store Configuration:**
1. Create store with modules
2. Define state, mutations, actions, getters per module
3. Enable namespacing
4. Configure plugins
5. Install in Vue app

**Key Patterns:**
- Use modules for organization
- Mutations for sync, actions for async
- Map helpers (mapState, mapActions) in components
- Strict mode in development

See `references/vuex-patterns.md` for detailed implementation patterns.

## Async Actions

### API Integration Patterns

**Redux Toolkit:**
Use createAsyncThunk with automatic pending/fulfilled/rejected actions:

```javascript
const fetchUser = createAsyncThunk('user/fetch', async (userId) => {
  const response = await api.getUser(userId);
  return response.data;
});
```

**Zustand:**
Define async actions directly in store:

```javascript
const useStore = create((set) => ({
  user: null,
  loading: false,
  fetchUser: async (userId) => {
    set({ loading: true });
    const user = await api.getUser(userId);
    set({ user, loading: false });
  }
}));
```

**Pinia:**
Define async actions in store:

```javascript
export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const loading = ref(false);

  async function fetchUser(userId) {
    loading.value = true;
    user.value = await api.getUser(userId);
    loading.value = false;
  }

  return { user, loading, fetchUser };
});
```

### Loading and Error States

Always track three states for async operations:
1. **Loading/pending**: Operation in progress
2. **Success**: Data available
3. **Error**: Operation failed with error details

See `references/async-patterns.md` for comprehensive async handling patterns.

## State Persistence

### Storage Options

**localStorage:**
- Synchronous, string-only
- Good for: User preferences, theme, non-sensitive data
- Size limit: ~5-10MB

**sessionStorage:**
- Same as localStorage but cleared on tab close
- Good for: Temporary form data, wizard state

**IndexedDB:**
- Asynchronous, supports complex objects
- Good for: Large datasets, offline-first apps
- Size limit: Often 50MB+ (varies by browser)

### Implementation Patterns

**Redux Toolkit:**
Use redux-persist middleware:

```bash
npm install redux-persist
```

Configure persistence with storage engine and whitelist/blacklist.

**Zustand:**
Use built-in persist middleware:

```javascript
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({ /* store */ }),
    { name: 'my-store' }
  )
);
```

**Pinia:**
Use pinia-plugin-persistedstate:

```bash
npm install pinia-plugin-persistedstate
```

Configure per-store with persist option.

See `references/persistence-patterns.md` for detailed persistence configurations.

## Best Practices

### Performance Optimization

**Selector Optimization:**
- Use memoized selectors (createSelector in Redux, computed in Pinia)
- Select only needed data in components
- Use shallow equality checks

**Update Batching:**
- Batch multiple updates when possible
- Use framework-specific batching (React 18 auto-batches, Vue 3 auto-batches)

**Code Splitting:**
- Lazy load store modules
- Use dynamic imports for large slices

### TypeScript Integration

**Strongly type:**
- State shape
- Action payloads
- Thunk arguments
- Selectors return types

**Use discriminated unions for:**
- Action types
- Loading states
- Error types

See `references/typescript-patterns.md` for TypeScript-specific patterns.

### DevTools Integration

**Enable DevTools:**
- Redux: Built-in with Redux DevTools Extension
- Zustand: Add devtools middleware
- Pinia: Built-in Vue DevTools integration
- Vuex: Built-in Vue DevTools integration

**Time-travel debugging:**
Track action history and state snapshots for debugging.

### Testing Strategies

**Unit Testing:**
- Test reducers/mutations as pure functions
- Test selectors/getters independently
- Mock async actions

**Integration Testing:**
- Test store with components
- Test async workflows end-to-end
- Verify persistence behavior

See `examples/` for working test examples.

## Common Patterns

### Optimistic Updates

Update UI immediately, revert on error:

1. Apply optimistic state change
2. Trigger async action
3. Confirm on success or revert on failure

### Polling

Periodically fetch fresh data:

1. Start interval on component mount
2. Clear interval on unmount
3. Handle race conditions

### WebSocket Integration

Real-time state updates:

1. Connect WebSocket in store initialization
2. Dispatch actions on incoming messages
3. Handle reconnection logic

### Undo/Redo

Track state history:

1. Store past states in array
2. Implement undo (restore previous state)
3. Implement redo (move forward in history)

See `references/advanced-patterns.md` for detailed implementations of these patterns.

## Migration Strategies

### Context to Zustand/Pinia

1. Identify Context providers to migrate
2. Create equivalent stores
3. Replace Context usage with store hooks/composables
4. Remove Context providers

### Redux to Redux Toolkit

1. Install Redux Toolkit
2. Replace createStore with configureStore
3. Convert reducers to slices with createSlice
4. Replace thunks with createAsyncThunk
5. Update component usage (minimal changes)

### Vuex to Pinia

1. Install Pinia
2. Convert modules to defineStore
3. Replace mutations with actions (Pinia only has actions)
4. Update component imports and usage
5. Remove Vuex

See `references/migration-guides.md` for step-by-step migration instructions.

## Additional Resources

### Reference Files

Detailed patterns and configurations:
- **`references/redux-toolkit-patterns.md`** - Complete Redux Toolkit implementation patterns
- **`references/zustand-patterns.md`** - Zustand store patterns and middleware
- **`references/pinia-patterns.md`** - Pinia setup and composition patterns
- **`references/vuex-patterns.md`** - Vuex modules and classic patterns
- **`references/async-patterns.md`** - Comprehensive async handling patterns
- **`references/persistence-patterns.md`** - Storage and persistence strategies
- **`references/typescript-patterns.md`** - TypeScript integration patterns
- **`references/advanced-patterns.md`** - Optimistic updates, polling, WebSocket, undo/redo
- **`references/migration-guides.md`** - Framework migration strategies

### Example Files

Working implementations:
- **`examples/redux-toolkit-store.ts`** - Complete Redux Toolkit store setup
- **`examples/zustand-store.ts`** - Zustand store with middleware
- **`examples/pinia-store.ts`** - Pinia store with TypeScript
- **`examples/persistence-example.ts`** - Persistence configuration examples
- **`examples/async-example.ts`** - Async action patterns
- **`examples/store.test.ts`** - Store testing examples

## Quick Start Checklist

When implementing state management:

- [ ] Choose appropriate library based on app complexity
- [ ] Design store structure by domain
- [ ] Implement core state and actions
- [ ] Add async action handling with loading/error states
- [ ] Configure persistence for relevant state
- [ ] Set up TypeScript types
- [ ] Enable DevTools integration
- [ ] Write tests for critical state logic
- [ ] Document store usage for team

Consult references for detailed implementation patterns and examples for working code.
