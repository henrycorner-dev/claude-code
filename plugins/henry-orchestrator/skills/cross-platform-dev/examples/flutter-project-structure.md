# Flutter Cross-Platform Project Structure Example

This example demonstrates a complete Flutter project structure optimized for cross-platform development (mobile, web, desktop).

## Directory Structure

```
my_flutter_app/
├── lib/
│   ├── main.dart
│   ├── main_mobile.dart
│   ├── main_web.dart
│   ├── app.dart
│   │
│   ├── core/                           # Shared core functionality
│   │   ├── di/                        # Dependency injection
│   │   │   └── injection_container.dart
│   │   ├── errors/                    # Error handling
│   │   │   ├── exceptions.dart
│   │   │   └── failures.dart
│   │   ├── network/                   # Networking
│   │   │   └── api_client.dart
│   │   ├── platform/                  # Platform abstractions
│   │   │   ├── storage/
│   │   │   │   ├── storage_service.dart
│   │   │   │   ├── mobile_storage.dart
│   │   │   │   ├── web_storage.dart
│   │   │   │   └── desktop_storage.dart
│   │   │   ├── device_info/
│   │   │   │   ├── device_info_service.dart
│   │   │   │   └── implementations/
│   │   │   └── analytics/
│   │   │       ├── analytics_service.dart
│   │   │       └── implementations/
│   │   └── utils/                     # Utilities
│   │       ├── constants.dart
│   │       ├── validators.dart
│   │       └── formatters.dart
│   │
│   ├── features/                       # Feature modules
│   │   ├── authentication/
│   │   │   ├── domain/               # Business logic (pure Dart)
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── login.dart
│   │   │   │       ├── logout.dart
│   │   │   │       └── register.dart
│   │   │   │
│   │   │   ├── data/                 # Data layer
│   │   │   │   ├── models/
│   │   │   │   │   └── user_model.dart
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_data_source.dart
│   │   │   │   │   └── auth_local_data_source.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   │
│   │   │   └── presentation/         # UI layer
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   └── register_page.dart
│   │   │       └── widgets/
│   │   │           ├── login_form.dart
│   │   │           └── auth_button.dart
│   │   │
│   │   ├── profile/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   └── presentation/
│   │   │
│   │   └── orders/
│   │       ├── domain/
│   │       ├── data/
│   │       └── presentation/
│   │
│   ├── shared/                         # Shared UI components
│   │   ├── widgets/
│   │   │   ├── app_button.dart
│   │   │   ├── app_text_field.dart
│   │   │   ├── loading_indicator.dart
│   │   │   └── error_view.dart
│   │   ├── layouts/
│   │   │   ├── responsive_layout.dart
│   │   │   └── scaffold_with_nav.dart
│   │   └── theme/
│   │       ├── app_theme.dart
│   │       ├── app_colors.dart
│   │       └── app_text_styles.dart
│   │
│   └── router/                         # Navigation
│       ├── app_router.dart
│       └── route_guards.dart
│
├── test/                               # Tests
│   ├── core/
│   ├── features/
│   │   └── authentication/
│   │       ├── domain/
│   │       │   └── usecases/
│   │       │       └── login_test.dart
│   │       ├── data/
│   │       │   └── repositories/
│   │       │       └── auth_repository_impl_test.dart
│   │       └── presentation/
│   │           └── providers/
│   │               └── auth_provider_test.dart
│   └── fixtures/
│       └── user.json
│
├── integration_test/                   # Integration tests
│   └── app_test.dart
│
├── web/                                # Web-specific files
│   ├── index.html
│   └── manifest.json
│
├── ios/                                # iOS-specific
├── android/                            # Android-specific
├── macos/                              # macOS-specific
├── windows/                            # Windows-specific
├── linux/                              # Linux-specific
│
└── pubspec.yaml
```

## Key Files

### main.dart

```dart
import 'package:flutter/foundation.dart';
import 'main_mobile.dart' as mobile;
import 'main_web.dart' as web;

void main() {
  if (kIsWeb) {
    web.main();
  } else {
    mobile.main();
  }
}
```

### main_mobile.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/di/injection_container.dart' as di;
import 'core/platform/storage/mobile_storage.dart';
import 'core/platform/analytics/mobile_analytics.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize platform-specific services
  await di.init(
    storage: MobileStorage(),
    analytics: MobileAnalytics(),
  );

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
```

### main_web.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/di/injection_container.dart' as di;
import 'core/platform/storage/web_storage.dart';
import 'core/platform/analytics/web_analytics.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize platform-specific services for web
  await di.init(
    storage: WebStorage(),
    analytics: WebAnalytics(),
  );

  runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}
```

### app.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router/app_router.dart';
import 'shared/theme/app_theme.dart';

class MyApp extends ConsumerWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'My Flutter App',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: router,
    );
  }
}
```

### core/di/injection_container.dart

```dart
import 'package:get_it/get_it.dart';
import '../platform/storage/storage_service.dart';
import '../platform/analytics/analytics_service.dart';
import '../network/api_client.dart';
import '../../features/authentication/data/datasources/auth_remote_data_source.dart';
import '../../features/authentication/data/datasources/auth_local_data_source.dart';
import '../../features/authentication/data/repositories/auth_repository_impl.dart';
import '../../features/authentication/domain/repositories/auth_repository.dart';
import '../../features/authentication/domain/usecases/login.dart';

final sl = GetIt.instance;

Future<void> init({
  required StorageService storage,
  required AnalyticsService analytics,
}) async {
  // Core
  sl.registerLazySingleton<StorageService>(() => storage);
  sl.registerLazySingleton<AnalyticsService>(() => analytics);
  sl.registerLazySingleton<ApiClient>(() => ApiClient());

  // Features - Authentication
  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl()),
  );
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(sl()),
  );

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
    ),
  );

  // Use cases
  sl.registerLazySingleton(() => Login(sl()));
  sl.registerLazySingleton(() => Logout(sl()));
}
```

### core/platform/storage/storage_service.dart

```dart
abstract class StorageService {
  Future<void> save(String key, String value);
  Future<String?> read(String key);
  Future<void> delete(String key);
  Future<void> clear();
}
```

### core/platform/storage/mobile_storage.dart

```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'storage_service.dart';

class MobileStorage implements StorageService {
  @override
  Future<void> save(String key, String value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, value);
  }

  @override
  Future<String?> read(String key) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(key);
  }

  @override
  Future<void> delete(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  @override
  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}
```

### core/platform/storage/web_storage.dart

```dart
import 'dart:html' as html;
import 'storage_service.dart';

class WebStorage implements StorageService {
  @override
  Future<void> save(String key, String value) async {
    html.window.localStorage[key] = value;
  }

  @override
  Future<String?> read(String key) async {
    return html.window.localStorage[key];
  }

  @override
  Future<void> delete(String key) async {
    html.window.localStorage.remove(key);
  }

  @override
  Future<void> clear() async {
    html.window.localStorage.clear();
  }
}
```

### features/authentication/domain/usecases/login.dart

```dart
import '../entities/user.dart';
import '../repositories/auth_repository.dart';

class Login {
  final AuthRepository repository;

  Login(this.repository);

  Future<User> call({
    required String email,
    required String password,
  }) async {
    return await repository.login(email: email, password: password);
  }
}
```

### features/authentication/presentation/providers/auth_provider.dart

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/user.dart';
import '../../domain/usecases/login.dart';
import '../../domain/usecases/logout.dart';
import '../../../../core/di/injection_container.dart';

final loginUseCaseProvider = Provider<Login>((ref) => sl<Login>());
final logoutUseCaseProvider = Provider<Logout>((ref) => sl<Logout>());

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    login: ref.watch(loginUseCaseProvider),
    logout: ref.watch(logoutUseCaseProvider),
  );
});

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  AuthState({this.user, this.isLoading = false, this.error});

  AuthState copyWith({User? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final Login login;
  final Logout logout;

  AuthNotifier({required this.login, required this.logout}) : super(AuthState());

  Future<void> loginUser(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await login(email: email, password: password);
      state = state.copyWith(user: user, isLoading: false);
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }

  Future<void> logoutUser() async {
    await logout();
    state = AuthState();
  }
}
```

### router/app_router.dart

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/authentication/presentation/pages/login_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/authentication/presentation/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    redirect: (context, state) {
      final isLoggedIn = authState.user != null;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) {
        return '/login';
      }
      if (isLoggedIn && isLoginRoute) {
        return '/';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
        routes: [
          GoRoute(
            path: 'profile/:id',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return ProfilePage(userId: id);
            },
          ),
        ],
      ),
    ],
  );
});
```

### shared/layouts/responsive_layout.dart

```dart
import 'package:flutter/material.dart';

class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    Key? key,
    required this.mobile,
    this.tablet,
    this.desktop,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1200 && desktop != null) {
          return desktop!;
        } else if (constraints.maxWidth >= 600 && tablet != null) {
          return tablet!;
        } else {
          return mobile;
        }
      },
    );
  }
}
```

## pubspec.yaml

```yaml
name: my_flutter_app
description: A cross-platform Flutter application
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter

  # State management
  flutter_riverpod: ^2.4.0

  # Routing
  go_router: ^13.0.0

  # Dependency injection
  get_it: ^7.6.0

  # Network
  dio: ^5.4.0

  # Storage - Mobile
  shared_preferences: ^2.2.0

  # Storage - Web
  shared_preferences_web: ^2.2.0

  # Functional programming
  dartz: ^0.10.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

  # Testing
  mockito: ^5.4.0
  build_runner: ^2.4.0

flutter:
  uses-material-design: true
```

## Running the App

### Mobile

```bash
flutter run -d ios
flutter run -d android
```

### Web

```bash
flutter run -d chrome
```

### Desktop

```bash
flutter run -d macos
flutter run -d windows
flutter run -d linux
```

## Key Benefits of This Structure

1. **Clear Separation** - Domain, data, and presentation layers are clearly separated
2. **Platform Agnostic Core** - Business logic has no platform dependencies
3. **Dependency Injection** - Easy to swap implementations and test
4. **Feature-First** - Related code grouped together by feature
5. **Testable** - Each layer can be tested independently
6. **Scalable** - Easy to add new features following the same pattern
