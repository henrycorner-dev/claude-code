# React Native Cross-Platform Project Structure Example

This example demonstrates a complete React Native project structure optimized for cross-platform development (iOS, Android, Web).

## Directory Structure

```
my-react-native-app/
├── src/
│   ├── core/                           # Shared core functionality (Pure TS/JS)
│   │   ├── di/                        # Dependency injection
│   │   │   └── container.ts
│   │   ├── errors/                    # Error handling
│   │   │   ├── Failures.ts
│   │   │   ├── Exceptions.ts
│   │   │   └── ErrorHandler.ts
│   │   ├── api/                       # API client
│   │   │   ├── ApiClient.ts
│   │   │   └── ApiClientImpl.ts
│   │   └── utils/                     # Utilities
│   │       ├── constants.ts
│   │       ├── validators.ts
│   │       └── formatters.ts
│   │
│   ├── infrastructure/                 # Platform abstractions
│   │   ├── storage/
│   │   │   ├── Storage.ts            # Interface
│   │   │   ├── MobileStorage.ts      # AsyncStorage implementation
│   │   │   ├── WebStorage.ts         # localStorage implementation
│   │   │   └── index.ts              # Platform-specific export
│   │   ├── analytics/
│   │   │   ├── Analytics.ts
│   │   │   ├── MobileAnalytics.ts
│   │   │   ├── WebAnalytics.ts
│   │   │   └── index.ts
│   │   └── navigation/
│   │       ├── NavigationService.ts
│   │       └── linking.ts
│   │
│   ├── features/                       # Feature modules
│   │   ├── authentication/
│   │   │   ├── domain/               # Business logic (Pure TypeScript)
│   │   │   │   ├── entities/
│   │   │   │   │   └── User.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── AuthRepository.ts
│   │   │   │   └── usecases/
│   │   │   │       ├── Login.ts
│   │   │   │       ├── Logout.ts
│   │   │   │       └── Register.ts
│   │   │   │
│   │   │   ├── data/                 # Data layer
│   │   │   │   ├── models/
│   │   │   │   │   └── UserModel.ts
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── AuthRemoteDataSource.ts
│   │   │   │   │   └── AuthLocalDataSource.ts
│   │   │   │   └── repositories/
│   │   │   │       └── AuthRepositoryImpl.ts
│   │   │   │
│   │   │   ├── presentation/         # UI layer
│   │   │   │   ├── screens/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   └── RegisterScreen.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── AuthButton.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.ts
│   │   │   │   └── store/
│   │   │   │       └── authStore.ts
│   │   │   │
│   │   │   ├── di.ts                 # Feature DI
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   ├── profile/
│   │   │   ├── domain/
│   │   │   ├── data/
│   │   │   ├── presentation/
│   │   │   ├── di.ts
│   │   │   └── index.ts
│   │   │
│   │   └── orders/
│   │       ├── domain/
│   │       ├── data/
│   │       ├── presentation/
│   │       ├── di.ts
│   │       └── index.ts
│   │
│   ├── shared/                         # Shared UI components
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.ios.tsx    # iOS-specific
│   │   │   │   ├── Button.android.tsx # Android-specific
│   │   │   │   └── Button.web.tsx    # Web-specific
│   │   │   ├── TextInput/
│   │   │   │   └── TextInput.tsx
│   │   │   ├── LoadingIndicator/
│   │   │   │   └── LoadingIndicator.tsx
│   │   │   └── ErrorView/
│   │   │       └── ErrorView.tsx
│   │   ├── layouts/
│   │   │   ├── ResponsiveLayout.tsx
│   │   │   └── ScreenContainer.tsx
│   │   ├── hooks/
│   │   │   ├── useResponsive.ts
│   │   │   └── useKeyboard.ts
│   │   └── theme/
│   │       ├── theme.ts
│   │       ├── colors.ts
│   │       ├── spacing.ts
│   │       └── typography.ts
│   │
│   ├── navigation/                     # Navigation
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   │
│   ├── App.tsx                         # App entry point
│   └── index.ts                        # Root index
│
├── __tests__/                          # Tests
│   ├── core/
│   ├── features/
│   │   └── authentication/
│   │       ├── domain/
│   │       │   └── usecases/
│   │       │       └── Login.test.ts
│   │       ├── data/
│   │       │   └── repositories/
│   │       │       └── AuthRepositoryImpl.test.ts
│   │       └── presentation/
│   │           └── hooks/
│   │               └── useAuth.test.ts
│   └── fixtures/
│       └── user.json
│
├── e2e/                                # E2E tests
│   └── app.test.js
│
├── android/                            # Android-specific
├── ios/                                # iOS-specific
├── web/                                # Web-specific (if using react-native-web)
│   ├── public/
│   │   └── index.html
│   └── webpack.config.js
│
├── index.js                            # Entry point (mobile)
├── index.web.js                        # Entry point (web)
├── package.json
├── tsconfig.json
└── babel.config.js
```

## Key Files

### index.js (Mobile Entry Point)

```javascript
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### index.web.js (Web Entry Point)

```javascript
import { AppRegistry } from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', {
  rootTag: document.getElementById('root'),
});
```

### src/App.tsx

```typescript
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './navigation/AppNavigator';
import { setupDI } from './core/di/container';
import { ThemeProvider } from './shared/theme/ThemeProvider';
import { linking } from './infrastructure/navigation/linking';

export default function App() {
  useEffect(() => {
    // Setup dependency injection
    setupDI();
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer linking={linking}>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}
```

### src/core/di/container.ts

```typescript
import { Platform } from 'react-native';
import { ApiClientImpl } from '../api/ApiClientImpl';
import { mobileStorage, webStorage } from '../../infrastructure/storage';
import { mobileAnalytics, webAnalytics } from '../../infrastructure/analytics';
import { setupAuthDI } from '../../features/authentication/di';
import { setupProfileDI } from '../../features/profile/di';

class DIContainer {
  private instances = new Map<string, any>();

  register<T>(key: string, factory: () => T): void {
    this.instances.set(key, factory());
  }

  get<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`No instance registered for ${key}`);
    }
    return instance;
  }
}

export const container = new DIContainer();

export function setupDI() {
  // Core infrastructure
  const apiClient = new ApiClientImpl();
  const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
  const analytics = Platform.OS === 'web' ? webAnalytics : mobileAnalytics;

  container.register('apiClient', () => apiClient);
  container.register('storage', () => storage);
  container.register('analytics', () => analytics);

  // Feature modules
  setupAuthDI(container);
  setupProfileDI(container);
}
```

### src/infrastructure/storage/Storage.ts

```typescript
export interface Storage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### src/infrastructure/storage/MobileStorage.ts

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Storage } from './Storage';

export class MobileStorage implements Storage {
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export const mobileStorage = new MobileStorage();
```

### src/infrastructure/storage/WebStorage.ts

```typescript
import { Storage } from './Storage';

export class WebStorage implements Storage {
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

export const webStorage = new WebStorage();
```

### src/infrastructure/storage/index.ts

```typescript
import { Platform } from 'react-native';
import { mobileStorage } from './MobileStorage';
import { webStorage } from './WebStorage';

export * from './Storage';
export * from './MobileStorage';
export * from './WebStorage';

// Platform-specific export
export const storage = Platform.OS === 'web' ? webStorage : mobileStorage;
```

### src/features/authentication/domain/entities/User.ts

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}
```

### src/features/authentication/domain/repositories/AuthRepository.ts

```typescript
import { User } from '../entities/User';

export interface AuthRepository {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  register(name: string, email: string, password: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;
}
```

### src/features/authentication/domain/usecases/Login.ts

```typescript
import { User } from '../entities/User';
import { AuthRepository } from '../repositories/AuthRepository';

export class Login {
  constructor(private repository: AuthRepository) {}

  async execute(email: string, password: string): Promise<User> {
    return await this.repository.login(email, password);
  }
}
```

### src/features/authentication/data/models/UserModel.ts

```typescript
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
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }

  toEntity(): User {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }

  static fromEntity(user: User): UserModel {
    return new UserModel(user.id, user.name, user.email);
  }
}
```

### src/features/authentication/data/repositories/AuthRepositoryImpl.ts

```typescript
import { User } from '../../domain/entities/User';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AuthRemoteDataSource } from '../datasources/AuthRemoteDataSource';
import { AuthLocalDataSource } from '../datasources/AuthLocalDataSource';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private remoteDataSource: AuthRemoteDataSource,
    private localDataSource: AuthLocalDataSource
  ) {}

  async login(email: string, password: string): Promise<User> {
    const userModel = await this.remoteDataSource.login(email, password);
    await this.localDataSource.cacheUser(userModel);
    return userModel.toEntity();
  }

  async logout(): Promise<void> {
    await this.remoteDataSource.logout();
    await this.localDataSource.clearCache();
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const userModel = await this.remoteDataSource.register(name, email, password);
    await this.localDataSource.cacheUser(userModel);
    return userModel.toEntity();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userModel = await this.localDataSource.getCachedUser();
      return userModel ? userModel.toEntity() : null;
    } catch {
      return null;
    }
  }
}
```

### src/features/authentication/presentation/hooks/useAuth.ts

```typescript
import { useState, useEffect } from 'react';
import { container } from '../../../core/di/container';
import { Login } from '../../domain/usecases/Login';
import { Logout } from '../../domain/usecases/Logout';
import { User } from '../../domain/entities/User';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUseCase = container.get<Login>('login');
  const logoutUseCase = container.get<Logout>('logout');

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginUseCase.execute(email, password);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUseCase.execute();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, login, logout };
}
```

### src/features/authentication/presentation/screens/LoginScreen.tsx

```typescript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { TextInput } from '../../../shared/components/TextInput/TextInput';
import { Button } from '../../../shared/components/Button/Button';
import { ErrorView } from '../../../shared/components/ErrorView/ErrorView';
import { LoadingIndicator } from '../../../shared/components/LoadingIndicator/LoadingIndicator';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = () => {
    login(email, password);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      {error && <ErrorView message={error} />}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});
```

### src/features/authentication/di.ts

```typescript
import { DIContainer } from '../../core/di/container';
import { Login } from './domain/usecases/Login';
import { Logout } from './domain/usecases/Logout';
import { Register } from './domain/usecases/Register';
import { AuthRepositoryImpl } from './data/repositories/AuthRepositoryImpl';
import { AuthRemoteDataSourceImpl } from './data/datasources/AuthRemoteDataSource';
import { AuthLocalDataSourceImpl } from './data/datasources/AuthLocalDataSource';

export function setupAuthDI(container: DIContainer) {
  // Data sources
  container.register(
    'authRemoteDataSource',
    () => new AuthRemoteDataSourceImpl(container.get('apiClient'))
  );
  container.register(
    'authLocalDataSource',
    () => new AuthLocalDataSourceImpl(container.get('storage'))
  );

  // Repository
  container.register(
    'authRepository',
    () => new AuthRepositoryImpl(
      container.get('authRemoteDataSource'),
      container.get('authLocalDataSource')
    )
  );

  // Use cases
  container.register('login', () => new Login(container.get('authRepository')));
  container.register('logout', () => new Logout(container.get('authRepository')));
  container.register('register', () => new Register(container.get('authRepository')));
}
```

### src/features/authentication/index.ts (Barrel Export)

```typescript
// Domain
export * from './domain/entities/User';
export * from './domain/repositories/AuthRepository';

// Presentation
export { LoginScreen } from './presentation/screens/LoginScreen';
export { RegisterScreen } from './presentation/screens/RegisterScreen';
export { useAuth } from './presentation/hooks/useAuth';

// DI
export { setupAuthDI } from './di';
```

### src/navigation/AppNavigator.tsx

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../features/authentication';
import { HomeScreen } from '../features/home';
import { ProfileScreen } from '../features/profile';
import { useAuth } from '../features/authentication';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
```

### src/infrastructure/navigation/linking.ts

```typescript
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Login: 'login',
      Home: '',
      Profile: 'profile/:userId',
    },
  },
};
```

### src/shared/components/Button/Button.tsx

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function Button({ title, onPress, disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### src/shared/layouts/ResponsiveLayout.tsx

```typescript
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

interface ResponsiveLayoutProps {
  mobile: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
}

export function ResponsiveLayout({ mobile, tablet, desktop }: ResponsiveLayoutProps) {
  const { width } = useWindowDimensions();

  if (width >= 1200 && desktop) {
    return <View style={styles.container}>{desktop}</View>;
  } else if (width >= 768 && tablet) {
    return <View style={styles.container}>{tablet}</View>;
  } else {
    return <View style={styles.container}>{mobile}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## package.json

```json
{
  "name": "my-react-native-app",
  "version": "1.0.0",
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "web": "webpack serve --config web/webpack.config.js",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "react-native-web": "^0.19.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/native-stack": "^6.9.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.73.0",
    "typescript": "^5.3.0",
    "@testing-library/react-native": "^12.4.0",
    "jest": "^29.7.0",
    "webpack": "^5.89.0",
    "webpack-dev-server": "^4.15.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "isolatedModules": true,
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "./src",
    "paths": {
      "@core/*": ["core/*"],
      "@features/*": ["features/*"],
      "@shared/*": ["shared/*"],
      "@infrastructure/*": ["infrastructure/*"]
    }
  },
  "exclude": ["node_modules"]
}
```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Web
```bash
npm run web
```

## Key Benefits of This Structure

1. **Clean Architecture** - Strict separation of concerns (domain, data, presentation)
2. **Platform Agnostic Core** - Business logic is pure TypeScript with no React Native dependencies
3. **Feature-First** - Related code grouped by feature, not by technical layer
4. **Dependency Injection** - Easy to test and swap implementations
5. **Type Safety** - Full TypeScript support across all layers
6. **Scalable** - Easy to add features following the same pattern
7. **Testable** - Each layer can be unit tested independently
8. **Cross-Platform Ready** - Support for iOS, Android, and Web with shared code
