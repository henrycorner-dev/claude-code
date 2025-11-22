---
name: cross-platform-dev
description: This skill should be used when the user asks to "share code between platforms", "set up cross-platform project", "organize Flutter codebase", "structure React Native app", "share business logic across platforms", "implement platform-agnostic code", or mentions cross-platform development strategies for Flutter/Dart or React Native.
version: 0.1.0
---

# Cross-Platform Development

This skill provides guidance for building maintainable cross-platform applications with shared codebases, focusing on Flutter/Dart and React Native strategies.

## When to Use This Skill

Use this skill when:
- Setting up a new cross-platform project (Flutter or React Native)
- Refactoring an existing app to share more code between platforms
- Designing architecture for platform-independent business logic
- Deciding what code should be shared vs. platform-specific
- Implementing code sharing patterns between mobile and web

## Core Principles

### Platform-Agnostic Architecture

Organize code into layers with clear separation:

1. **Business Logic Layer** - Pure logic with no platform dependencies
2. **Platform Abstraction Layer** - Interfaces/protocols for platform features
3. **Platform Implementation Layer** - Platform-specific implementations
4. **UI Layer** - Platform-specific or shared UI components

### Code Sharing Strategies

**Maximum Sharing:**
- Business rules and algorithms
- Data models and schemas
- API clients and networking
- State management
- Validation logic
- Utility functions

**Platform-Specific:**
- Native platform APIs (camera, sensors, etc.)
- Platform-specific UI/UX patterns
- Performance optimizations
- Deep platform integrations

## Flutter/Dart Cross-Platform

### Project Structure

Organize Flutter projects to maximize code reuse:

```
lib/
├── core/                    # Shared business logic
│   ├── models/             # Data models
│   ├── services/           # Business services
│   ├── repositories/       # Data access
│   └── utils/              # Utilities
├── features/               # Feature modules
│   └── feature_name/
│       ├── domain/         # Business logic
│       ├── data/           # Data layer
│       └── presentation/   # UI layer
├── platform/               # Platform abstractions
│   ├── interfaces/         # Abstract interfaces
│   └── implementations/    # Platform implementations
└── ui/                     # UI components
    ├── shared/            # Shared widgets
    └── platform/          # Platform-specific UI
```

### Flutter Web + Mobile Sharing

Share code between Flutter mobile and web:

```dart
// Shared business logic (works everywhere)
class UserRepository {
  final ApiClient _client;

  Future<User> getUser(String id) async {
    final data = await _client.get('/users/$id');
    return User.fromJson(data);
  }
}

// Platform abstraction
abstract class StorageService {
  Future<void> save(String key, String value);
  Future<String?> read(String key);
}

// Mobile implementation
class MobileStorage implements StorageService {
  // Uses shared_preferences
}

// Web implementation
class WebStorage implements StorageService {
  // Uses localStorage
}
```

### Conditional Compilation

Use conditional imports for platform-specific code:

```dart
// storage.dart (interface)
export 'storage_mobile.dart' if (dart.library.html) 'storage_web.dart';

// storage_mobile.dart
class Storage implements StorageService { /* mobile impl */ }

// storage_web.dart
class Storage implements StorageService { /* web impl */ }
```

### Package Organization

For large projects, use multiple packages:

```
packages/
├── core/                  # Pure Dart, no Flutter
│   ├── models/
│   ├── services/
│   └── utils/
├── mobile_app/           # Flutter mobile
├── web_app/              # Flutter web
└── shared_ui/            # Shared Flutter widgets
```

## React Native Cross-Platform

### Project Structure

Organize React Native projects for maximum sharing:

```
src/
├── core/                    # Platform-agnostic logic
│   ├── models/             # TypeScript interfaces/types
│   ├── services/           # Business services
│   ├── api/                # API clients
│   └── utils/              # Utilities
├── features/               # Feature modules
│   └── feature-name/
│       ├── hooks/          # React hooks
│       ├── screens/        # Screen components
│       └── components/     # Feature components
├── platform/               # Platform abstraction
│   ├── storage/           # Storage abstraction
│   ├── navigation/        # Navigation abstraction
│   └── native-modules/    # Native module bridges
└── components/             # Shared UI components
    ├── common/            # Fully shared
    ├── ios/               # iOS-specific
    └── android/           # Android-specific
```

### React Native + Web Sharing

Share code between React Native and React web using react-native-web:

```typescript
// Shared business logic
export class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
}

// Platform-agnostic storage interface
export interface Storage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
}

// Mobile implementation (AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage: Storage = {
  setItem: AsyncStorage.setItem,
  getItem: AsyncStorage.getItem,
};

// Web implementation (localStorage)
export const storage: Storage = {
  setItem: async (key, value) => localStorage.setItem(key, value),
  getItem: async (key) => localStorage.getItem(key),
};
```

### Platform-Specific Files

Use platform extensions for platform-specific code:

```
Button.tsx           # Shared component
Button.ios.tsx       # iOS-specific override
Button.android.tsx   # Android-specific override
Button.web.tsx       # Web-specific override
```

### Monorepo Structure

For React Native + web apps, use a monorepo:

```
packages/
├── core/                  # Pure TypeScript/JavaScript
│   ├── models/
│   ├── services/
│   └── api/
├── mobile/               # React Native app
│   ├── ios/
│   ├── android/
│   └── src/
├── web/                  # React web app
│   └── src/
└── ui-components/        # Shared React components
    └── src/
```

## Best Practices

### 1. Define Clear Boundaries

Establish what code belongs in each layer:

- **Core/Domain**: Pure business logic, no platform dependencies
- **Platform Abstraction**: Interfaces for platform features
- **Platform Implementation**: Actual platform-specific code
- **UI**: Presentation layer

### 2. Use Dependency Injection

Inject platform implementations into shared code:

```dart
// Flutter example
class MyApp extends StatelessWidget {
  final StorageService storage;

  const MyApp({required this.storage});

  @override
  Widget build(BuildContext context) {
    return Provider<StorageService>.value(
      value: storage,
      child: MaterialApp(/* ... */),
    );
  }
}

// Instantiate with platform-specific implementation
void main() {
  final storage = kIsWeb ? WebStorage() : MobileStorage();
  runApp(MyApp(storage: storage));
}
```

```typescript
// React Native example
interface AppDependencies {
  storage: Storage;
  analytics: Analytics;
}

const DependencyContext = createContext<AppDependencies | null>(null);

function App() {
  const deps: AppDependencies = {
    storage: Platform.OS === 'web' ? webStorage : mobileStorage,
    analytics: Platform.OS === 'web' ? webAnalytics : mobileAnalytics,
  };

  return (
    <DependencyContext.Provider value={deps}>
      <Navigation />
    </DependencyContext.Provider>
  );
}
```

### 3. Test Shared Code Independently

Write unit tests for shared business logic without platform dependencies:

```dart
// Flutter test
test('UserRepository fetches user correctly', () async {
  final mockClient = MockApiClient();
  final repository = UserRepository(mockClient);

  when(mockClient.get('/users/1'))
    .thenAnswer((_) async => {'id': '1', 'name': 'John'});

  final user = await repository.getUser('1');
  expect(user.name, 'John');
});
```

```typescript
// React Native test
describe('AuthService', () => {
  it('logs in user successfully', async () => {
    const mockApi = createMockApi();
    mockApi.post.mockResolvedValue({ data: { id: '1', name: 'John' } });

    const service = new AuthService(mockApi);
    const user = await service.login('test@example.com', 'password');

    expect(user.name).toBe('John');
  });
});
```

### 4. Minimize Platform Checks

Avoid scattered platform checks throughout the codebase. Instead, use dependency injection and abstraction layers:

**Bad:**
```typescript
// Platform checks scattered everywhere
function saveData(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    AsyncStorage.setItem(key, value);
  }
}
```

**Good:**
```typescript
// Single platform-specific implementation
const storage: Storage = Platform.OS === 'web'
  ? webStorage
  : mobileStorage;

// Use abstraction everywhere
function saveData(key: string, value: string) {
  storage.setItem(key, value);
}
```

### 5. Share State Management

Use platform-agnostic state management:

**Flutter:**
- Riverpod (pure Dart, works everywhere)
- Bloc (platform-independent)
- Provider (Flutter, but works on all Flutter platforms)

**React Native:**
- Redux (JavaScript, works everywhere)
- MobX (JavaScript, works everywhere)
- Zustand (JavaScript, works everywhere)
- React Context (React, works with React Native and web)

### 6. Version Platform Dependencies Together

Keep platform-specific implementations in sync:

```yaml
# pubspec.yaml (Flutter)
dependencies:
  shared_preferences: ^2.2.0        # Mobile + desktop
  shared_preferences_web: ^2.2.0    # Web

# Ensure compatible versions
```

```json
// package.json (React Native)
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.19.0",  // Mobile
    // Web uses localStorage (built-in)
  }
}
```

## Common Patterns

### Repository Pattern

Centralize data access with platform-agnostic repositories:

```dart
// Flutter
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<void> saveUser(User user);
}

class UserRepositoryImpl implements UserRepository {
  final ApiClient _api;
  final StorageService _storage;

  UserRepositoryImpl(this._api, this._storage);

  @override
  Future<User> getUser(String id) async {
    // Try cache first
    final cached = await _storage.read('user_$id');
    if (cached != null) return User.fromJson(jsonDecode(cached));

    // Fetch from API
    final data = await _api.get('/users/$id');
    final user = User.fromJson(data);

    // Update cache
    await _storage.save('user_$id', jsonEncode(user.toJson()));

    return user;
  }
}
```

### Service Layer Pattern

Encapsulate business logic in services:

```typescript
// React Native
export class OrderService {
  constructor(
    private api: ApiClient,
    private storage: Storage,
    private analytics: Analytics
  ) {}

  async createOrder(items: CartItem[]): Promise<Order> {
    // Validate (shared logic)
    if (items.length === 0) throw new Error('Cart is empty');

    // Calculate total (shared logic)
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order via API (shared logic)
    const order = await this.api.post<Order>('/orders', { items, total });

    // Track analytics (platform-agnostic)
    await this.analytics.track('order_created', { orderId: order.id, total });

    return order;
  }
}
```

### Factory Pattern

Create platform-specific instances:

```dart
// Flutter
abstract class StorageFactory {
  static StorageService create() {
    if (kIsWeb) {
      return WebStorage();
    } else if (Platform.isIOS || Platform.isAndroid) {
      return MobileStorage();
    } else {
      return DesktopStorage();
    }
  }
}
```

## Migration Strategies

### Extracting Shared Code from Existing Apps

When refactoring existing platform-specific apps to share code:

1. **Identify pure business logic** - Find code with no UI or platform dependencies
2. **Extract to separate modules/packages** - Move to core/domain layer
3. **Define abstractions** - Create interfaces for platform features
4. **Implement platform adapters** - Create platform-specific implementations
5. **Test thoroughly** - Ensure behavior is preserved across platforms

### Incremental Adoption

Adopt cross-platform sharing incrementally:

1. Start with new features (implement with sharing from the start)
2. Extract utilities and helpers
3. Share data models and API clients
4. Migrate business logic services
5. Consider shared UI components last

## Additional Resources

### Reference Files

For detailed architecture patterns and advanced techniques:
- **`references/architecture-patterns.md`** - Comprehensive architecture patterns, detailed examples, and advanced sharing techniques
- **`references/platform-specific-apis.md`** - Guidance on abstracting platform-specific APIs

### Example Files

Working examples in `examples/`:
- **`flutter-project-structure/`** - Complete Flutter project structure example
- **`react-native-project-structure/`** - Complete React Native project structure example
- **`monorepo-example/`** - Monorepo structure for shared codebase

## Quick Decision Guide

**Should this code be shared?**

| Code Type | Share? | Reason |
|-----------|--------|--------|
| Data models | ✅ Yes | Platform-agnostic |
| API clients | ✅ Yes | Platform-agnostic |
| Business logic | ✅ Yes | Platform-agnostic |
| Validation rules | ✅ Yes | Platform-agnostic |
| State management | ✅ Yes | Can be platform-agnostic |
| Utilities | ✅ Yes | Usually platform-agnostic |
| Navigation logic | ⚠️ Maybe | Abstract if patterns differ |
| Storage/persistence | ⚠️ Maybe | Abstract the interface |
| UI components | ⚠️ Maybe | Depends on design requirements |
| Platform APIs | ❌ No | Platform-specific by nature |
| Native modules | ❌ No | Platform-specific |
| Platform UX patterns | ❌ No | Should respect platform conventions |

Focus on extracting and sharing business logic while respecting platform-specific UI/UX conventions for the best user experience.
