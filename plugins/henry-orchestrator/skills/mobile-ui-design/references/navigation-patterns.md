# Navigation Patterns: In-Depth Implementation Guide

This reference provides comprehensive guidance on implementing mobile navigation patterns, including bottom navigation, navigation drawers, stack navigation, and hybrid approaches.

## Table of Contents

1. [Bottom Navigation / Tab Bars](#bottom-navigation--tab-bars)
2. [Navigation Drawer](#navigation-drawer)
3. [Stack Navigation](#stack-navigation)
4. [Hybrid Navigation Patterns](#hybrid-navigation-patterns)
5. [Navigation Best Practices](#navigation-best-practices)
6. [Navigation State Management](#navigation-state-management)
7. [Deep Linking](#deep-linking)

---

## Bottom Navigation / Tab Bars

Bottom navigation is the primary navigation pattern for mobile apps with 3-5 top-level destinations. Users can quickly switch between these sections with a single tap.

### When to Use

**Ideal for:**

- Apps with 3-5 top-level sections of equal importance
- Frequent switching between sections
- Apps where users need quick access to all main features
- Consumer-facing apps (social media, shopping, productivity)

**Avoid when:**

- Only 2 sections (use a different pattern)
- More than 5 sections (consider reorganizing or using navigation drawer)
- One section is significantly more important (make it a primary screen)
- Complex hierarchies within sections (combine with stack navigation)

### iOS Tab Bar Implementation

#### Basic Tab Bar (SwiftUI)

```swift
import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
                .tag(1)

            NotificationsView()
                .tabItem {
                    Label("Notifications", systemImage: "bell.fill")
                }
                .badge(notificationCount) // iOS 15+
                .tag(2)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(3)
        }
        .accentColor(.blue) // Customize tint color
    }
}
```

#### Tab Bar with Navigation (SwiftUI)

Combine TabView with NavigationView for each tab:

```swift
struct ContentView: View {
    var body: some View {
        TabView {
            // Tab 1: Home with navigation
            NavigationView {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }

            // Tab 2: Search with navigation
            NavigationView {
                SearchView()
            }
            .tabItem {
                Label("Search", systemImage: "magnifyingglass")
            }

            // Tab 3: Profile with navigation
            NavigationView {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
    }
}
```

#### UIKit Tab Bar Controller

```swift
import UIKit

class MainTabBarController: UITabBarController {
    override func viewDidLoad() {
        super.viewDidLoad()

        // Configure tab bar appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = .systemBackground

        tabBar.standardAppearance = appearance
        tabBar.scrollEdgeAppearance = appearance

        // Create view controllers
        let homeVC = UINavigationController(rootViewController: HomeViewController())
        homeVC.tabBarItem = UITabBarItem(
            title: "Home",
            image: UIImage(systemName: "house"),
            selectedImage: UIImage(systemName: "house.fill")
        )

        let searchVC = UINavigationController(rootViewController: SearchViewController())
        searchVC.tabBarItem = UITabBarItem(
            title: "Search",
            image: UIImage(systemName: "magnifyingglass"),
            tag: 1
        )

        let profileVC = UINavigationController(rootViewController: ProfileViewController())
        profileVC.tabBarItem = UITabBarItem(
            title: "Profile",
            image: UIImage(systemName: "person"),
            selectedImage: UIImage(systemName: "person.fill")
        )

        viewControllers = [homeVC, searchVC, profileVC]
    }
}
```

#### iOS Tab Bar Customization

```swift
// Custom tab bar appearance
struct CustomTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            // Tabs...
        }
        .onAppear {
            // Customize appearance
            let appearance = UITabBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor.systemGray6

            // Selected item appearance
            appearance.stackedLayoutAppearance.selected.iconColor = .systemBlue
            appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
                .foregroundColor: UIColor.systemBlue
            ]

            // Normal item appearance
            appearance.stackedLayoutAppearance.normal.iconColor = .systemGray
            appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
                .foregroundColor: UIColor.systemGray
            ]

            UITabBar.appearance().standardAppearance = appearance
            UITabBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}
```

### Android Bottom Navigation Implementation

#### Basic Bottom Navigation (Jetpack Compose)

```kotlin
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

data class NavigationItem(
    val label: String,
    val icon: ImageVector,
    val route: String
)

@Composable
fun MainScreen() {
    var selectedItem by remember { mutableStateOf(0) }
    val navController = rememberNavController()

    val items = listOf(
        NavigationItem("Home", Icons.Default.Home, "home"),
        NavigationItem("Search", Icons.Default.Search, "search"),
        NavigationItem("Notifications", Icons.Default.Notifications, "notifications"),
        NavigationItem("Profile", Icons.Default.Person, "profile")
    )

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = {
                            Icon(item.icon, contentDescription = item.label)
                        },
                        label = { Text(item.label) },
                        selected = selectedItem == index,
                        onClick = {
                            selectedItem = index
                            navController.navigate(item.route) {
                                // Pop up to start destination
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                // Avoid multiple copies
                                launchSingleTop = true
                                // Restore state when reselecting
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("home") { HomeScreen() }
            composable("search") { SearchScreen() }
            composable("notifications") { NotificationsScreen() }
            composable("profile") { ProfileScreen() }
        }
    }
}
```

#### Bottom Navigation with Badges

```kotlin
@Composable
fun BottomNavigationWithBadges() {
    var selectedItem by remember { mutableStateOf(0) }
    val notificationCount = 5

    NavigationBar {
        NavigationBarItem(
            icon = { Icon(Icons.Default.Home, "Home") },
            label = { Text("Home") },
            selected = selectedItem == 0,
            onClick = { selectedItem = 0 }
        )

        NavigationBarItem(
            icon = {
                BadgedBox(
                    badge = {
                        if (notificationCount > 0) {
                            Badge { Text(notificationCount.toString()) }
                        }
                    }
                ) {
                    Icon(Icons.Default.Notifications, "Notifications")
                }
            },
            label = { Text("Notifications") },
            selected = selectedItem == 1,
            onClick = { selectedItem = 1 }
        )

        NavigationBarItem(
            icon = { Icon(Icons.Default.Person, "Profile") },
            label = { Text("Profile") },
            selected = selectedItem == 2,
            onClick = { selectedItem = 2 }
        )
    }
}
```

#### Android Navigation Component (XML-based)

```xml
<!-- res/menu/bottom_nav_menu.xml -->
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:id="@+id/navigation_home"
        android:icon="@drawable/ic_home"
        android:title="@string/title_home" />

    <item
        android:id="@+id/navigation_search"
        android:icon="@drawable/ic_search"
        android:title="@string/title_search" />

    <item
        android:id="@+id/navigation_profile"
        android:icon="@drawable/ic_profile"
        android:title="@string/title_profile" />
</menu>
```

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val navView: BottomNavigationView = findViewById(R.id.nav_view)
        val navController = findNavController(R.id.nav_host_fragment)

        // Setup bottom navigation with Navigation component
        navView.setupWithNavController(navController)
    }
}
```

### Best Practices for Bottom Navigation

**Do:**

- Use 3-5 items only
- Use clear, concise labels (one word preferred)
- Use recognizable icons that match labels
- Show badges for notifications or updates
- Keep destinations at the same hierarchy level
- Maintain selection state across app lifecycle
- Provide haptic feedback on selection (iOS)

**Don't:**

- Use for fewer than 3 or more than 5 items
- Use long labels (truncation looks bad)
- Mix different icon styles
- Navigate to nested screens from bottom nav
- Use for sequential flows (use stack navigation)
- Change items dynamically
- Hide bottom navigation on scroll (generally discouraged)

---

## Navigation Drawer

The navigation drawer (Android) provides access to app destinations and functionality. It's a panel that slides in from the left edge of the screen.

### When to Use

**Ideal for:**

- Apps with 5+ sections
- Hierarchical navigation structures
- Secondary navigation supplementing bottom nav
- Apps targeting larger screens (tablets)
- Enterprise or productivity apps
- Account switching functionality

**Avoid when:**

- App has fewer than 5 sections (use bottom nav instead)
- Users need constant access to all sections
- Navigation is the primary interaction
- Building for iOS primarily (not a standard iOS pattern)

### Modal Navigation Drawer (Android)

#### Material 3 Modal Drawer (Compose)

```kotlin
import androidx.compose.material3.*
import androidx.compose.runtime.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppWithDrawer() {
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    var selectedItem by remember { mutableStateOf("Home") }

    val drawerItems = listOf(
        DrawerItem("Home", Icons.Default.Home),
        DrawerItem("Favorites", Icons.Default.Favorite),
        DrawerItem("Settings", Icons.Default.Settings),
        DrawerItem("Help", Icons.Default.Help)
    )

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                // Drawer header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 64.dp, horizontal = 16.dp)
                ) {
                    Column {
                        Icon(
                            Icons.Default.AccountCircle,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("John Doe", style = MaterialTheme.typography.titleMedium)
                        Text(
                            "john.doe@example.com",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Divider()

                // Drawer items
                drawerItems.forEach { item ->
                    NavigationDrawerItem(
                        icon = { Icon(item.icon, contentDescription = null) },
                        label = { Text(item.title) },
                        selected = item.title == selectedItem,
                        onClick = {
                            selectedItem = item.title
                            scope.launch { drawerState.close() }
                        },
                        modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                    )
                }

                Divider(modifier = Modifier.padding(vertical = 8.dp))

                // Bottom section
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.ExitToApp, contentDescription = null) },
                    label = { Text("Logout") },
                    selected = false,
                    onClick = { /* Handle logout */ },
                    modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                )
            }
        }
    ) {
        // Main content with app bar
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text(selectedItem) },
                    navigationIcon = {
                        IconButton(onClick = {
                            scope.launch { drawerState.open() }
                        }) {
                            Icon(Icons.Default.Menu, "Open Drawer")
                        }
                    }
                )
            }
        ) { paddingValues ->
            // Screen content
            Box(modifier = Modifier.padding(paddingValues)) {
                when (selectedItem) {
                    "Home" -> HomeScreen()
                    "Favorites" -> FavoritesScreen()
                    "Settings" -> SettingsScreen()
                    "Help" -> HelpScreen()
                }
            }
        }
    }
}

data class DrawerItem(val title: String, val icon: ImageVector)
```

#### Drawer with Sections and Dividers

```kotlin
@Composable
fun DrawerWithSections() {
    ModalDrawerSheet {
        // Header
        DrawerHeader()

        Divider()

        // Primary section
        Text(
            "Primary",
            modifier = Modifier.padding(horizontal = 28.dp, vertical = 16.dp),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        NavigationDrawerItem(
            icon = { Icon(Icons.Default.Home, null) },
            label = { Text("Home") },
            selected = true,
            onClick = { }
        )
        NavigationDrawerItem(
            icon = { Icon(Icons.Default.Star, null) },
            label = { Text("Starred") },
            selected = false,
            onClick = { }
        )

        Divider(modifier = Modifier.padding(vertical = 8.dp))

        // Secondary section
        Text(
            "Labels",
            modifier = Modifier.padding(horizontal = 28.dp, vertical = 16.dp),
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        NavigationDrawerItem(
            icon = { Icon(Icons.Default.Label, null) },
            label = { Text("Work") },
            selected = false,
            onClick = { }
        )
        NavigationDrawerItem(
            icon = { Icon(Icons.Default.Label, null) },
            label = { Text("Personal") },
            selected = false,
            onClick = { }
        )
    }
}
```

### Permanent Navigation Drawer (Tablets)

For larger screens, use a permanent drawer that's always visible:

```kotlin
@Composable
fun PermanentDrawerApp() {
    val windowSize = rememberWindowSizeClass()

    if (windowSize == WindowSize.Expanded) {
        // Tablet: Permanent drawer
        PermanentNavigationDrawer(
            drawerContent = {
                PermanentDrawerSheet(Modifier.width(256.dp)) {
                    DrawerContent()
                }
            }
        ) {
            MainContent()
        }
    } else {
        // Phone: Modal drawer
        ModalNavigationDrawer(
            drawerContent = { DrawerContent() }
        ) {
            MainContent()
        }
    }
}
```

### iOS Alternative: Sidebar (iPad)

While navigation drawers aren't standard on iOS, iPadOS uses sidebars:

```swift
struct ContentView: View {
    @State private var selectedItem: String? = "Home"

    var body: some View {
        NavigationSplitView {
            // Sidebar
            List(selection: $selectedItem) {
                Section("Primary") {
                    NavigationLink(value: "Home") {
                        Label("Home", systemImage: "house")
                    }
                    NavigationLink(value: "Starred") {
                        Label("Starred", systemImage: "star")
                    }
                }

                Section("Labels") {
                    NavigationLink(value: "Work") {
                        Label("Work", systemImage: "briefcase")
                    }
                    NavigationLink(value: "Personal") {
                        Label("Personal", systemImage: "person")
                    }
                }
            }
            .listStyle(.sidebar)
            .navigationTitle("App")
        } detail: {
            // Detail view
            if let selectedItem = selectedItem {
                DetailView(item: selectedItem)
            } else {
                Text("Select an item")
            }
        }
    }
}
```

### Drawer Best Practices

**Do:**

- Place navigation at the top
- Group related items with sections
- Use clear labels and icons
- Include user profile/account info in header
- Show current selection
- Use dividers to separate sections
- Close drawer after navigation
- Support swipe-to-open gesture

**Don't:**

- Overload with too many items (keep under 10-12)
- Mix navigation and actions
- Use as primary navigation (prefer bottom nav)
- Forget to show hamburger menu icon
- Use for time-sensitive actions
- Hide critical functionality in drawer

---

## Stack Navigation

Stack navigation represents hierarchical navigation where screens are pushed and popped from a navigation stack.

### When to Use

**Ideal for:**

- Drilling into content hierarchies
- Master-detail flows
- Multi-step processes
- Content browsing (articles, products, etc.)
- Settings and preferences

**Characteristics:**

- Linear, sequential navigation
- Back button/gesture to return
- Clear parent-child relationships
- Maintains navigation history

### iOS Stack Navigation

#### SwiftUI NavigationStack (iOS 16+)

```swift
struct NavigationStackExample: View {
    @State private var path = NavigationPath()

    var body: some View {
        NavigationStack(path: $path) {
            List {
                ForEach(items) { item in
                    NavigationLink(value: item) {
                        Text(item.name)
                    }
                }
            }
            .navigationTitle("Items")
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
        }
    }
}

struct ItemDetailView: View {
    let item: Item

    var body: some View {
        VStack {
            Text(item.name)
                .font(.title)
            Text(item.description)
                .font(.body)

            NavigationLink(value: item.relatedItem) {
                Text("View Related Item")
            }
        }
        .navigationTitle(item.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
```

#### SwiftUI NavigationView (Pre-iOS 16)

```swift
struct NavigationViewExample: View {
    var body: some View {
        NavigationView {
            List(items) { item in
                NavigationLink(
                    destination: ItemDetailView(item: item)
                ) {
                    HStack {
                        Image(systemName: item.icon)
                        Text(item.name)
                    }
                }
            }
            .navigationTitle("Items")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}
```

#### Programmatic Navigation

```swift
struct ProgrammaticNav: View {
    @State private var isActive = false
    @State private var selectedItem: Item?

    var body: some View {
        NavigationView {
            VStack {
                Button("Navigate to Detail") {
                    selectedItem = someItem
                    isActive = true
                }

                NavigationLink(
                    destination: ItemDetailView(item: selectedItem ?? defaultItem),
                    isActive: $isActive
                ) {
                    EmptyView()
                }
            }
            .navigationTitle("Home")
        }
    }
}
```

### Android Stack Navigation

#### Jetpack Compose Navigation

```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToDetail = { itemId ->
                    navController.navigate("detail/$itemId")
                }
            )
        }

        composable(
            "detail/{itemId}",
            arguments = listOf(
                navArgument("itemId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val itemId = backStackEntry.arguments?.getString("itemId")
            DetailScreen(
                itemId = itemId,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToRelated = { relatedId ->
                    navController.navigate("detail/$relatedId")
                }
            )
        }
    }
}

@Composable
fun HomeScreen(onNavigateToDetail: (String) -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Items") })
        }
    ) { padding ->
        LazyColumn(modifier = Modifier.padding(padding)) {
            items(itemsList) { item ->
                ListItem(
                    headlineContent = { Text(item.name) },
                    modifier = Modifier.clickable {
                        onNavigateToDetail(item.id)
                    }
                )
            }
        }
    }
}

@Composable
fun DetailScreen(
    itemId: String?,
    onNavigateBack: () -> Unit,
    onNavigateToRelated: (String) -> Unit
) {
    val item = getItemById(itemId)

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(item.name) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            Text(item.description)

            Button(onClick = { onNavigateToRelated(item.relatedId) }) {
                Text("View Related")
            }
        }
    }
}
```

#### Deep Linking in Navigation

```kotlin
NavHost(
    navController = navController,
    startDestination = "home"
) {
    composable(
        "detail/{itemId}",
        deepLinks = listOf(
            navDeepLink {
                uriPattern = "myapp://detail/{itemId}"
            }
        )
    ) { backStackEntry ->
        DetailScreen(backStackEntry.arguments?.getString("itemId"))
    }
}
```

### Stack Navigation Best Practices

**Do:**

- Provide clear back navigation
- Use descriptive titles for each screen
- Maintain navigation state properly
- Support system back button/gesture
- Use appropriate transitions
- Deep link to specific screens
- Clear stack when appropriate (logout, reset)

**Don't:**

- Create circular navigation loops
- Break the back button
- Push same screen multiple times
- Use stack nav for equal-level sections
- Forget to handle process death (Android)

---

## Hybrid Navigation Patterns

Real-world apps often combine multiple navigation patterns.

### Bottom Navigation + Stack Navigation

Most common pattern: Bottom nav for top-level sections, stack nav within each section.

#### iOS Example

```swift
struct HybridNavApp: View {
    var body: some View {
        TabView {
            // Each tab has its own navigation stack
            NavigationView {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }

            NavigationView {
                SearchView()
            }
            .tabItem {
                Label("Search", systemImage: "magnifyingglass")
            }

            NavigationView {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
    }
}

// Each section can navigate deeper
struct HomeView: View {
    var body: some View {
        List(items) { item in
            NavigationLink(destination: ItemDetailView(item: item)) {
                Text(item.name)
            }
        }
        .navigationTitle("Home")
    }
}
```

#### Android Example

```kotlin
@Composable
fun HybridNavigationApp() {
    val navController = rememberNavController()
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, "Home") },
                    label = { Text("Home") },
                    selected = selectedTab == 0,
                    onClick = {
                        selectedTab = 0
                        navController.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    }
                )
                // More tabs...
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(padding)
        ) {
            // Home section with nested navigation
            navigation(startDestination = "home_list", route = "home") {
                composable("home_list") {
                    HomeListScreen(
                        onItemClick = { itemId ->
                            navController.navigate("home_detail/$itemId")
                        }
                    )
                }
                composable("home_detail/{itemId}") {
                    HomeDetailScreen()
                }
            }

            // Search section with nested navigation
            navigation(startDestination = "search_list", route = "search") {
                composable("search_list") {
                    SearchScreen()
                }
                composable("search_detail/{query}") {
                    SearchDetailScreen()
                }
            }
        }
    }
}
```

### Drawer + Bottom Navigation + Stack

For complex apps with many sections:

```kotlin
@Composable
fun ComplexNavigationApp() {
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            // Secondary navigation (settings, help, etc.)
            DrawerContent(
                onNavigate = { route ->
                    navController.navigate(route)
                    scope.launch { drawerState.close() }
                }
            )
        }
    ) {
        // Bottom nav + stack for primary sections
        HybridNavigationContent(
            onOpenDrawer = { scope.launch { drawerState.open() } }
        )
    }
}
```

---

## Navigation Best Practices

### Platform-Specific Guidelines

**iOS:**

- Use tab bar for primary navigation (3-5 items)
- Implement swipe-back gesture
- Use large titles that collapse on scroll
- Present modally for tasks, push for content
- Use sheets for temporary focused tasks

**Android:**

- Use bottom navigation for primary (3-5 items)
- Support system back button
- Use navigation drawer for secondary nav
- Follow Material motion patterns
- Implement proper up/back behavior

### State Management

**Preserve Navigation State:**

```swift
// iOS: Use @StateObject or @EnvironmentObject
struct App: View {
    @StateObject private var navigationState = NavigationState()

    var body: some View {
        ContentView()
            .environmentObject(navigationState)
    }
}
```

```kotlin
// Android: Use ViewModel with SavedStateHandle
class NavigationViewModel(
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    var navigationPath: List<String>
        get() = savedStateHandle.get<List<String>>("path") ?: emptyList()
        set(value) { savedStateHandle["path"] = value }
}
```

### Accessibility

- Provide clear navigation labels
- Announce navigation changes to screen readers
- Support keyboard navigation (tablets/external)
- Use semantic navigation structure
- Test with VoiceOver/TalkBack

### Performance

- Lazy load screens
- Clear navigation stack when appropriate
- Avoid deep navigation hierarchies
- Use shared element transitions sparingly
- Profile navigation performance

---

## Deep Linking

### iOS Universal Links

```swift
// Handle deep links
.onOpenURL { url in
    if url.scheme == "myapp" {
        // Parse URL and navigate
        if url.host == "detail" {
            let itemId = url.lastPathComponent
            navigateToDetail(itemId)
        }
    }
}

// AppDelegate
func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
) -> Bool {
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else {
        return false
    }
    // Handle universal link
    return true
}
```

### Android Deep Links

```kotlin
// In AndroidManifest.xml
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="www.myapp.com"
            android:pathPrefix="/detail" />
    </intent-filter>
</activity>

// In Navigation Graph
NavHost(navController, startDestination = "home") {
    composable(
        route = "detail/{itemId}",
        deepLinks = listOf(
            navDeepLink {
                uriPattern = "https://www.myapp.com/detail/{itemId}"
            },
            navDeepLink {
                uriPattern = "myapp://detail/{itemId}"
            }
        )
    ) { backStackEntry ->
        val itemId = backStackEntry.arguments?.getString("itemId")
        DetailScreen(itemId)
    }
}
```

---

## Summary

### Navigation Pattern Selection Matrix

| Scenario             | iOS              | Android              |
| -------------------- | ---------------- | -------------------- |
| 3-5 primary sections | Tab Bar          | Bottom Navigation    |
| 5+ sections          | Tab Bar + More   | Drawer + Bottom Nav  |
| Deep hierarchies     | Navigation Stack | Navigation Component |
| Temporary tasks      | Sheet/Modal      | Bottom Sheet/Dialog  |
| Settings flows       | Push navigation  | Nested navigation    |
| Tablets              | Sidebar          | Permanent Drawer     |

### Key Takeaways

1. **Use platform conventions:** Tab bars (iOS) and bottom navigation (Android) for primary nav
2. **Combine patterns:** Bottom nav + stack navigation is most common
3. **Maintain state:** Preserve navigation across lifecycle events
4. **Support gestures:** Swipe back (iOS), system back (Android)
5. **Deep link support:** Enable navigation from external sources
6. **Test thoroughly:** Navigation bugs are user-facing and critical
7. **Keep it simple:** Don't over-complicate navigation structure
