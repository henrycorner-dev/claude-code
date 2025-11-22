# Cross-Platform Architecture Patterns

This document provides detailed architecture patterns, advanced techniques, and comprehensive examples for building maintainable cross-platform applications.

## Table of Contents

1. [Clean Architecture for Cross-Platform](#clean-architecture-for-cross-platform)
2. [Advanced Flutter Patterns](#advanced-flutter-patterns)
3. [Advanced React Native Patterns](#advanced-react-native-patterns)
4. [State Management Across Platforms](#state-management-across-platforms)
5. [Navigation Patterns](#navigation-patterns)
6. [Error Handling and Logging](#error-handling-and-logging)
7. [Testing Strategies](#testing-strategies)
8. [Performance Optimization](#performance-optimization)
9. [Code Generation](#code-generation)

## Clean Architecture for Cross-Platform

### Layered Architecture

Implement a strict layered architecture to maximize code reuse:

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│  (UI, State Management, Platform-Specific UI)   │
├─────────────────────────────────────────────────┤
│              Application Layer                   │
│     (Use Cases, Business Logic Orchestration)   │
├─────────────────────────────────────────────────┤
│               Domain Layer                       │
│  (Entities, Business Rules, Repository Interfaces)│
├─────────────────────────────────────────────────┤
│               Data Layer                         │
│  (Repository Implementations, Data Sources)     │
├─────────────────────────────────────────────────┤
│           Infrastructure Layer                   │
│  (Platform APIs, Network, Storage, Devices)     │
└─────────────────────────────────────────────────┘
```

**Key Principles:**
- Inner layers should never depend on outer layers
- Domain layer is pure business logic (no framework dependencies)
- Dependencies point inward
- Use interfaces/abstractions to invert dependencies

### Flutter Clean Architecture Example

```dart
// Domain Layer - Pure Dart, no Flutter dependencies
// domain/entities/user.dart
class User {
  final String id;
  final String name;
  final String email;

  User({required this.id, required this.name, required this.email});
}

// domain/repositories/user_repository.dart (interface)
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<void> updateUser(User user);
}

// domain/usecases/get_user_profile.dart
class GetUserProfile {
  final UserRepository repository;

  GetUserProfile(this.repository);

  Future<User> call(String userId) async {
    return await repository.getUser(userId);
  }
}

// Data Layer - Platform-agnostic data access
// data/repositories/user_repository_impl.dart
class UserRepositoryImpl implements UserRepository {
  final UserRemoteDataSource remoteDataSource;
  final UserLocalDataSource localDataSource;

  UserRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
  });

  @override
  Future<User> getUser(String id) async {
    try {
      // Try remote first
      final userModel = await remoteDataSource.getUser(id);
      // Cache locally
      await localDataSource.cacheUser(userModel);
      return userModel.toEntity();
    } catch (e) {
      // Fallback to cache
      final userModel = await localDataSource.getUser(id);
      return userModel.toEntity();
    }
  }

  @override
  Future<void> updateUser(User user) async {
    final userModel = UserModel.fromEntity(user);
    await remoteDataSource.updateUser(userModel);
    await localDataSource.cacheUser(userModel);
  }
}

// data/datasources/user_remote_data_source.dart
abstract class UserRemoteDataSource {
  Future<UserModel> getUser(String id);
  Future<void> updateUser(UserModel user);
}

class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  final ApiClient client;

  UserRemoteDataSourceImpl(this.client);

  @override
  Future<UserModel> getUser(String id) async {
    final response = await client.get('/users/$id');
    return UserModel.fromJson(response);
  }

  @override
  Future<void> updateUser(UserModel user) async {
    await client.put('/users/${user.id}', user.toJson());
  }
}

// data/datasources/user_local_data_source.dart
abstract class UserLocalDataSource {
  Future<UserModel> getUser(String id);
  Future<void> cacheUser(UserModel user);
}

class UserLocalDataSourceImpl implements UserLocalDataSource {
  final StorageService storage;

  UserLocalDataSourceImpl(this.storage);

  @override
  Future<UserModel> getUser(String id) async {
    final json = await storage.read('user_$id');
    if (json == null) throw CacheException();
    return UserModel.fromJson(jsonDecode(json));
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    await storage.save('user_${user.id}', jsonEncode(user.toJson()));
  }
}

// data/models/user_model.dart
class UserModel {
  final String id;
  final String name;
  final String email;

  UserModel({required this.id, required this.name, required this.email});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'email': email};
  }

  User toEntity() {
    return User(id: id, name: name, email: email);
  }

  factory UserModel.fromEntity(User user) {
    return UserModel(id: user.id, name: user.name, email: user.email);
  }
}

// Presentation Layer - Flutter-specific
// presentation/bloc/user_profile_bloc.dart
class UserProfileBloc extends Bloc<UserProfileEvent, UserProfileState> {
  final GetUserProfile getUserProfile;

  UserProfileBloc({required this.getUserProfile}) : super(UserProfileInitial()) {
    on<LoadUserProfile>(_onLoadUserProfile);
  }

  Future<void> _onLoadUserProfile(
    LoadUserProfile event,
    Emitter<UserProfileState> emit,
  ) async {
    emit(UserProfileLoading());
    try {
      final user = await getUserProfile(event.userId);
      emit(UserProfileLoaded(user));
    } catch (e) {
      emit(UserProfileError(e.toString()));
    }
  }
}

// Dependency Injection
// injection_container.dart
final sl = GetIt.instance;

Future<void> init() async {
  // Bloc
  sl.registerFactory(() => UserProfileBloc(getUserProfile: sl()));

  // Use cases
  sl.registerLazySingleton(() => GetUserProfile(sl()));

  // Repository
  sl.registerLazySingleton<UserRepository>(
    () => UserRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  // Data sources
  sl.registerLazySingleton<UserRemoteDataSource>(
    () => UserRemoteDataSourceImpl(sl()),
  );

  sl.registerLazySingleton<UserLocalDataSource>(
    () => UserLocalDataSourceImpl(sl()),
  );

  // Core
  sl.registerLazySingleton<ApiClient>(() => ApiClientImpl());
  sl.registerLazySingleton<StorageService>(
    () => kIsWeb ? WebStorageService() : MobileStorageService(),
  );
}
```

### React Native Clean Architecture Example

```typescript
// Domain Layer - Pure TypeScript
// domain/entities/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// domain/repositories/UserRepository.ts
export interface UserRepository {
  getUser(id: string): Promise<User>;
  updateUser(user: User): Promise<void>;
}

// domain/usecases/GetUserProfile.ts
export class GetUserProfile {
  constructor(private repository: UserRepository) {}

  async execute(userId: string): Promise<User> {
    return await this.repository.getUser(userId);
  }
}

// Data Layer - Platform-agnostic
// data/repositories/UserRepositoryImpl.ts
import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { UserRemoteDataSource } from '../datasources/UserRemoteDataSource';
import { UserLocalDataSource } from '../datasources/UserLocalDataSource';
import { UserModel } from '../models/UserModel';

export class UserRepositoryImpl implements UserRepository {
  constructor(
    private remoteDataSource: UserRemoteDataSource,
    private localDataSource: UserLocalDataSource
  ) {}

  async getUser(id: string): Promise<User> {
    try {
      const userModel = await this.remoteDataSource.getUser(id);
      await this.localDataSource.cacheUser(userModel);
      return userModel.toEntity();
    } catch (error) {
      const userModel = await this.localDataSource.getUser(id);
      return userModel.toEntity();
    }
  }

  async updateUser(user: User): Promise<void> {
    const userModel = UserModel.fromEntity(user);
    await this.remoteDataSource.updateUser(userModel);
    await this.localDataSource.cacheUser(userModel);
  }
}

// data/datasources/UserRemoteDataSource.ts
import { ApiClient } from '../../infrastructure/api/ApiClient';
import { UserModel } from '../models/UserModel';

export interface UserRemoteDataSource {
  getUser(id: string): Promise<UserModel>;
  updateUser(user: UserModel): Promise<void>;
}

export class UserRemoteDataSourceImpl implements UserRemoteDataSource {
  constructor(private client: ApiClient) {}

  async getUser(id: string): Promise<UserModel> {
    const response = await this.client.get(`/users/${id}`);
    return UserModel.fromJson(response);
  }

  async updateUser(user: UserModel): Promise<void> {
    await this.client.put(`/users/${user.id}`, user.toJson());
  }
}

// data/datasources/UserLocalDataSource.ts
import { Storage } from '../../infrastructure/storage/Storage';
import { UserModel } from '../models/UserModel';

export interface UserLocalDataSource {
  getUser(id: string): Promise<UserModel>;
  cacheUser(user: UserModel): Promise<void>;
}

export class UserLocalDataSourceImpl implements UserLocalDataSource {
  constructor(private storage: Storage) {}

  async getUser(id: string): Promise<UserModel> {
    const json = await this.storage.getItem(`user_${id}`);
    if (!json) throw new Error('User not found in cache');
    return UserModel.fromJson(JSON.parse(json));
  }

  async cacheUser(user: UserModel): Promise<void> {
    await this.storage.setItem(`user_${user.id}`, JSON.stringify(user.toJson()));
  }
}

// data/models/UserModel.ts
import { User } from '../../domain/entities/User';

export class UserModel {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  static fromJson(json: any): UserModel {
    return new UserModel(json.id, json.name, json.email);
  }

  toJson(): any {
    return { id: this.id, name: this.name, email: this.email };
  }

  toEntity(): User {
    return { id: this.id, name: this.name, email: this.email };
  }

  static fromEntity(user: User): UserModel {
    return new UserModel(user.id, user.name, user.email);
  }
}

// Presentation Layer - React/React Native
// presentation/hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { User } from '../../domain/entities/User';
import { GetUserProfile } from '../../domain/usecases/GetUserProfile';

export function useUserProfile(getUserProfile: GetUserProfile, userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile.execute(userId);
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, getUserProfile]);

  return { user, loading, error };
}

// Dependency Injection
// di/container.ts
import { Platform } from 'react-native';
import { GetUserProfile } from '../domain/usecases/GetUserProfile';
import { UserRepositoryImpl } from '../data/repositories/UserRepositoryImpl';
import { UserRemoteDataSourceImpl } from '../data/datasources/UserRemoteDataSource';
import { UserLocalDataSourceImpl } from '../data/datasources/UserLocalDataSource';
import { ApiClientImpl } from '../infrastructure/api/ApiClientImpl';
import { mobileStorage, webStorage } from '../infrastructure/storage';

class DIContainer {
  private instances = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.instances.set(key, factory());
  }

  get<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) throw new Error(`No instance registered for ${key}`);
    return instance;
  }
}

export const container = new DIContainer();

// Setup
export function setupDI() {
  // Infrastructure
  const apiClient = new ApiClientImpl();
  const storage = Platform.OS === 'web' ? webStorage : mobileStorage;

  container.register('apiClient', () => apiClient);
  container.register('storage', () => storage);

  // Data sources
  container.register(
    'userRemoteDataSource',
    () => new UserRemoteDataSourceImpl(container.get('apiClient'))
  );
  container.register(
    'userLocalDataSource',
    () => new UserLocalDataSourceImpl(container.get('storage'))
  );

  // Repositories
  container.register(
    'userRepository',
    () => new UserRepositoryImpl(
      container.get('userRemoteDataSource'),
      container.get('userLocalDataSource')
    )
  );

  // Use cases
  container.register(
    'getUserProfile',
    () => new GetUserProfile(container.get('userRepository'))
  );
}
```

## Advanced Flutter Patterns

### Feature-First Organization

Organize by features rather than technical layers:

```
lib/
├── features/
│   ├── authentication/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── datasources/
│   │   │   └── repositories/
│   │   └── presentation/
│   │       ├── bloc/
│   │       ├── pages/
│   │       └── widgets/
│   ├── profile/
│   │   └── [same structure]
│   └── orders/
│       └── [same structure]
├── core/
│   ├── error/
│   ├── network/
│   ├── platform/
│   └── utils/
└── main.dart
```

### Multi-Package Architecture

For large apps, split into multiple packages:

```
my_app/
├── packages/
│   ├── core/                      # Pure Dart
│   │   ├── lib/
│   │   │   ├── entities/
│   │   │   ├── errors/
│   │   │   └── utils/
│   │   └── pubspec.yaml
│   ├── data/                      # Data layer
│   │   ├── lib/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── datasources/
│   │   └── pubspec.yaml
│   ├── domain/                    # Business logic
│   │   ├── lib/
│   │   │   ├── usecases/
│   │   │   └── repositories/
│   │   └── pubspec.yaml
│   └── ui_components/             # Shared widgets
│       ├── lib/
│       │   └── widgets/
│       └── pubspec.yaml
└── apps/
    ├── mobile_app/                # Flutter mobile
    │   └── pubspec.yaml
    └── web_app/                   # Flutter web
        └── pubspec.yaml
```

**Benefits:**
- Clear boundaries and dependencies
- Easier to test individual packages
- Can version packages independently
- Reuse packages across different apps

### Platform Channels for Native Integration

Create a clean abstraction for platform-specific code:

```dart
// lib/platform/battery/battery_service.dart
abstract class BatteryService {
  Future<int> getBatteryLevel();
  Stream<int> get batteryLevelStream;
}

// lib/platform/battery/battery_service_impl.dart
class BatteryServiceImpl implements BatteryService {
  static const platform = MethodChannel('com.example.app/battery');
  static const eventChannel = EventChannel('com.example.app/battery_stream');

  @override
  Future<int> getBatteryLevel() async {
    try {
      final int result = await platform.invokeMethod('getBatteryLevel');
      return result;
    } on PlatformException catch (e) {
      throw BatteryException("Failed to get battery level: '${e.message}'");
    }
  }

  @override
  Stream<int> get batteryLevelStream {
    return eventChannel.receiveBroadcastStream().map((dynamic event) => event as int);
  }
}

// lib/platform/battery/battery_service_web.dart (web implementation)
class BatteryServiceWeb implements BatteryService {
  @override
  Future<int> getBatteryLevel() async {
    // Use battery API or return mock value
    return 100; // Web doesn't have battery
  }

  @override
  Stream<int> get batteryLevelStream {
    return Stream.value(100);
  }
}

// lib/platform/battery/battery_service_factory.dart
class BatteryServiceFactory {
  static BatteryService create() {
    if (kIsWeb) {
      return BatteryServiceWeb();
    } else {
      return BatteryServiceImpl();
    }
  }
}
```

## Advanced React Native Patterns

### Feature Modules with Barrels

Organize features with clear public APIs:

```typescript
// features/authentication/
├── index.ts                    // Barrel export
├── domain/
│   ├── entities/
│   │   └── User.ts
│   ├── repositories/
│   │   └── AuthRepository.ts
│   └── usecases/
│       ├── Login.ts
│       └── Logout.ts
├── data/
│   ├── repositories/
│   │   └── AuthRepositoryImpl.ts
│   └── datasources/
│       └── AuthRemoteDataSource.ts
├── presentation/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── components/
│   │   └── LoginForm.tsx
│   └── hooks/
│       └── useAuth.ts
└── di.ts                       // Feature-specific DI

// features/authentication/index.ts (barrel)
export { LoginScreen, SignupScreen } from './presentation/screens';
export { useAuth } from './presentation/hooks';
export { setupAuthDI } from './di';
```

### Turbo Modules for Native Code

For React Native with new architecture, use Turbo Modules:

```typescript
// specs/NativeBatteryModule.ts
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getBatteryLevel(): Promise<number>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('NativeBatteryModule');

// src/NativeBatteryModule.ts
import NativeBatteryModule from './specs/NativeBatteryModule';
import { NativeEventEmitter } from 'react-native';

const eventEmitter = new NativeEventEmitter(NativeBatteryModule);

export const BatteryService = {
  getBatteryLevel: (): Promise<number> => {
    return NativeBatteryModule.getBatteryLevel();
  },

  onBatteryLevelChange: (callback: (level: number) => void) => {
    const subscription = eventEmitter.addListener('onBatteryLevelChange', callback);
    return subscription;
  },
};

// Platform-specific implementation or web fallback
export const BatteryServiceWeb = {
  getBatteryLevel: async (): Promise<number> => {
    return 100; // Web fallback
  },

  onBatteryLevelChange: (callback: (level: number) => void) => {
    // No-op for web
    return { remove: () => {} };
  },
};

// Conditional export
import { Platform } from 'react-native';

export const Battery = Platform.OS === 'web' ? BatteryServiceWeb : BatteryService;
```

## State Management Across Platforms

### Flutter: Riverpod for All Platforms

```dart
// providers/user_provider.dart
final userRepositoryProvider = Provider<UserRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  final storage = ref.watch(storageProvider);
  return UserRepositoryImpl(
    remoteDataSource: UserRemoteDataSourceImpl(apiClient),
    localDataSource: UserLocalDataSourceImpl(storage),
  );
});

final getUserProfileProvider = Provider<GetUserProfile>((ref) {
  return GetUserProfile(ref.watch(userRepositoryProvider));
});

final userProfileProvider = FutureProvider.family<User, String>((ref, userId) async {
  final getUserProfile = ref.watch(getUserProfileProvider);
  return await getUserProfile(userId);
});

// In widget
class UserProfilePage extends ConsumerWidget {
  final String userId;

  const UserProfilePage({required this.userId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProfileProvider(userId));

    return userAsync.when(
      data: (user) => Text('Hello, ${user.name}'),
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => Text('Error: $error'),
    );
  }
}
```

### React Native: Zustand for All Platforms

```typescript
// stores/userStore.ts
import create from 'zustand';
import { User } from '../domain/entities/User';
import { GetUserProfile } from '../domain/usecases/GetUserProfile';

interface UserStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  loadUser: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  loadUser: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const getUserProfile = container.get<GetUserProfile>('getUserProfile');
      const user = await getUserProfile.execute(userId);
      set({ user, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      });
    }
  },
}));

// In component
import { useUserStore } from '../stores/userStore';

function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error, loadUser } = useUserStore();

  useEffect(() => {
    loadUser(userId);
  }, [userId]);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  if (!user) return null;

  return <Text>Hello, {user.name}</Text>;
}
```

## Navigation Patterns

### Flutter: go_router for Declarative Navigation

```dart
// router/app_router.dart
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => HomePage(),
        routes: [
          GoRoute(
            path: 'profile/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ProfilePage(userId: id);
            },
          ),
          GoRoute(
            path: 'orders',
            builder: (context, state) => OrdersPage(),
          ),
        ],
      ),
    ],
  );
});

// Deep linking configuration (works on mobile and web)
// main.dart
void main() {
  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}

class MyApp extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      routerConfig: router,
    );
  }
}
```

### React Native: React Navigation with Deep Linking

```typescript
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Profile: { userId: string };
  Orders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Profile: 'profile/:userId',
      Orders: 'orders',
    },
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Web-specific configuration
// If using React Native Web, navigation works across mobile and web
```

## Error Handling and Logging

### Centralized Error Handling

```dart
// Flutter
// core/error/failures.dart
abstract class Failure {
  final String message;
  Failure(this.message);
}

class ServerFailure extends Failure {
  ServerFailure(String message) : super(message);
}

class CacheFailure extends Failure {
  CacheFailure(String message) : super(message);
}

class NetworkFailure extends Failure {
  NetworkFailure(String message) : super(message);
}

// core/error/error_handler.dart
class ErrorHandler {
  static Failure handleException(Exception exception) {
    if (exception is ServerException) {
      return ServerFailure(exception.message);
    } else if (exception is CacheException) {
      return CacheFailure(exception.message);
    } else if (exception is NetworkException) {
      return NetworkFailure(exception.message);
    }
    return ServerFailure('Unexpected error');
  }
}

// Use with Either type for functional error handling
import 'package:dartz/dartz.dart';

Future<Either<Failure, User>> getUser(String id) async {
  try {
    final user = await remoteDataSource.getUser(id);
    return Right(user);
  } catch (e) {
    return Left(ErrorHandler.handleException(e as Exception));
  }
}
```

```typescript
// React Native
// core/errors/Failures.ts
export abstract class Failure {
  constructor(public message: string) {}
}

export class ServerFailure extends Failure {}
export class CacheFailure extends Failure {}
export class NetworkFailure extends Failure {}

// core/errors/ErrorHandler.ts
export class ErrorHandler {
  static handleError(error: unknown): Failure {
    if (error instanceof ServerError) {
      return new ServerFailure(error.message);
    } else if (error instanceof CacheError) {
      return new CacheFailure(error.message);
    } else if (error instanceof NetworkError) {
      return new NetworkFailure(error.message);
    }
    return new ServerFailure('Unexpected error');
  }
}

// Use with Result type
export type Result<T> = { success: true; value: T } | { success: false; error: Failure };

async function getUser(id: string): Promise<Result<User>> {
  try {
    const user = await remoteDataSource.getUser(id);
    return { success: true, value: user };
  } catch (error) {
    return { success: false, error: ErrorHandler.handleError(error) };
  }
}
```

## Testing Strategies

### Test Pure Business Logic Independently

```dart
// Flutter test
// test/domain/usecases/get_user_profile_test.dart
void main() {
  late GetUserProfile usecase;
  late MockUserRepository mockRepository;

  setUp(() {
    mockRepository = MockUserRepository();
    usecase = GetUserProfile(mockRepository);
  });

  group('GetUserProfile', () {
    final tUser = User(id: '1', name: 'Test User', email: 'test@example.com');

    test('should get user from repository', () async {
      // arrange
      when(mockRepository.getUser('1')).thenAnswer((_) async => tUser);

      // act
      final result = await usecase('1');

      // assert
      expect(result, tUser);
      verify(mockRepository.getUser('1'));
      verifyNoMoreInteractions(mockRepository);
    });
  });
}
```

```typescript
// React Native test
// __tests__/domain/usecases/GetUserProfile.test.ts
describe('GetUserProfile', () => {
  let usecase: GetUserProfile;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    };
    usecase = new GetUserProfile(mockRepository);
  });

  const testUser: User = { id: '1', name: 'Test User', email: 'test@example.com' };

  it('should get user from repository', async () => {
    mockRepository.getUser.mockResolvedValue(testUser);

    const result = await usecase.execute('1');

    expect(result).toEqual(testUser);
    expect(mockRepository.getUser).toHaveBeenCalledWith('1');
  });
});
```

## Performance Optimization

### Code Splitting and Lazy Loading

```dart
// Flutter - Deferred loading
// lib/features/analytics/analytics_screen.dart
import 'heavy_analytics_library.dart' deferred as analytics;

class AnalyticsScreen extends StatelessWidget {
  Future<void> loadAnalytics() async {
    await analytics.loadLibrary();
    analytics.showDashboard();
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: loadAnalytics,
      child: Text('Load Analytics'),
    );
  }
}
```

```typescript
// React Native - Dynamic imports
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator } from 'react-native';

const AnalyticsScreen = lazy(() => import('./screens/AnalyticsScreen'));

function App() {
  return (
    <Suspense fallback={<ActivityIndicator />}>
      <AnalyticsScreen />
    </Suspense>
  );
}
```

### Memoization and Caching

```dart
// Flutter - Cached computation
class DataProcessor {
  final Map<String, ProcessedData> _cache = {};

  ProcessedData process(String input) {
    if (_cache.containsKey(input)) {
      return _cache[input]!;
    }

    final result = _expensiveComputation(input);
    _cache[input] = result;
    return result;
  }
}
```

```typescript
// React Native - useMemo
import { useMemo } from 'react';

function ExpensiveComponent({ data }: { data: string[] }) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  return <ListView data={processedData} />;
}
```

## Code Generation

### Flutter: freezed and json_serializable

```dart
// lib/data/models/user_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@freezed
class UserModel with _$UserModel {
  const factory UserModel({
    required String id,
    required String name,
    required String email,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) =>
      _$UserModelFromJson(json);
}

// Generate code with:
// flutter pub run build_runner build
```

### React Native: TypeScript Codegen

```typescript
// Use tools like quicktype or json-schema-to-typescript

// schema/user.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "email": { "type": "string" }
  },
  "required": ["id", "name", "email"]
}

// Generated: types/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
}
```

## Conclusion

These advanced patterns enable building maintainable, testable, and scalable cross-platform applications. The key is maintaining clear boundaries between layers, using dependency injection for platform-specific implementations, and sharing as much business logic as possible while respecting platform conventions.
