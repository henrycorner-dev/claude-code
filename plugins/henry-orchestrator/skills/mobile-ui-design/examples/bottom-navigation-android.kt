// Android Bottom Navigation Implementation
// Complete working example with Jetpack Compose and Material 3

package com.example.app

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController

// MARK: - Navigation Items
sealed class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector = icon
) {
    object Home : BottomNavItem(
        route = "home",
        label = "Home",
        icon = Icons.Default.Home,
        selectedIcon = Icons.Filled.Home
    )

    object Search : BottomNavItem(
        route = "search",
        label = "Search",
        icon = Icons.Default.Search
    )

    object Notifications : BottomNavItem(
        route = "notifications",
        label = "Notifications",
        icon = Icons.Default.Notifications
    )

    object Profile : BottomNavItem(
        route = "profile",
        label = "Profile",
        icon = Icons.Default.Person
    )
}

// MARK: - Main App Composable
@Composable
fun MainApp() {
    val navController = rememberNavController()
    var notificationCount by remember { mutableStateOf(3) }

    Scaffold(
        bottomBar = {
            BottomNavigationBar(
                navController = navController,
                notificationCount = notificationCount
            )
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = BottomNavItem.Home.route,
            modifier = Modifier.padding(paddingValues)
        ) {
            composable(BottomNavItem.Home.route) {
                HomeScreen(navController)
            }
            composable(BottomNavItem.Search.route) {
                SearchScreen(navController)
            }
            composable(BottomNavItem.Notifications.route) {
                NotificationsScreen(
                    onNotificationCountChange = { notificationCount = it }
                )
            }
            composable(BottomNavItem.Profile.route) {
                ProfileScreen(navController)
            }
            composable("detail/{itemId}") { backStackEntry ->
                val itemId = backStackEntry.arguments?.getString("itemId")
                ItemDetailScreen(
                    itemId = itemId,
                    navController = navController
                )
            }
        }
    }
}

// MARK: - Bottom Navigation Bar
@Composable
fun BottomNavigationBar(
    navController: NavController,
    notificationCount: Int
) {
    val items = listOf(
        BottomNavItem.Home,
        BottomNavItem.Search,
        BottomNavItem.Notifications,
        BottomNavItem.Profile
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surfaceContainer
    ) {
        items.forEach { item ->
            val isSelected = currentRoute == item.route

            NavigationBarItem(
                icon = {
                    if (item == BottomNavItem.Notifications && notificationCount > 0) {
                        BadgedBox(
                            badge = {
                                Badge { Text(notificationCount.toString()) }
                            }
                        ) {
                            Icon(
                                imageVector = if (isSelected) item.selectedIcon else item.icon,
                                contentDescription = item.label
                            )
                        }
                    } else {
                        Icon(
                            imageVector = if (isSelected) item.selectedIcon else item.icon,
                            contentDescription = item.label
                        )
                    }
                },
                label = { Text(item.label) },
                selected = isSelected,
                onClick = {
                    navController.navigate(item.route) {
                        // Pop up to the start destination
                        popUpTo(navController.graph.findStartDestination().id) {
                            saveState = true
                        }
                        // Avoid multiple copies of the same destination
                        launchSingleTop = true
                        // Restore state when reselecting a previously selected item
                        restoreState = true
                    }
                }
            )
        }
    }
}

// MARK: - Home Screen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {
    val items = remember {
        listOf(
            Item("1", "First Item", "Details about first item"),
            Item("2", "Second Item", "Details about second item"),
            Item("3", "Third Item", "Details about third item"),
            Item("4", "Fourth Item", "Details about fourth item")
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Home") },
                actions = {
                    IconButton(onClick = { /* Add action */ }) {
                        Icon(Icons.Default.Add, contentDescription = "Add")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(items) { item ->
                Card(
                    onClick = {
                        navController.navigate("detail/${item.id}")
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = item.title,
                            style = MaterialTheme.typography.titleMedium
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = item.subtitle,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

// MARK: - Item Detail Screen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ItemDetailScreen(
    itemId: String?,
    navController: NavController
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Item Detail") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Item #$itemId",
                style = MaterialTheme.typography.headlineMedium
            )

            Text(
                text = "This is the detail view for item $itemId. This demonstrates how stack navigation works within a tab.",
                style = MaterialTheme.typography.bodyLarge
            )

            HorizontalDivider()

            Button(
                onClick = { /* Action */ },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Take Action")
            }
        }
    }
}

// MARK: - Search Screen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(navController: NavController) {
    var searchText by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<Item>>(emptyList()) }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Search") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search bar
            OutlinedTextField(
                value = searchText,
                onValueChange = { query ->
                    searchText = query
                    // Simulate search
                    searchResults = if (query.isEmpty()) {
                        emptyList()
                    } else {
                        listOf(
                            Item("s1", "Search Result 1", "Matching: $query"),
                            Item("s2", "Search Result 2", "Matching: $query")
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search items...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null)
                },
                trailingIcon = {
                    if (searchText.isNotEmpty()) {
                        IconButton(onClick = { searchText = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true
            )

            // Search results
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(searchResults) { item ->
                    ListItem(
                        headlineContent = { Text(item.title) },
                        supportingContent = { Text(item.subtitle) },
                        leadingContent = {
                            Icon(Icons.Default.Article, contentDescription = null)
                        },
                        modifier = Modifier.clickable {
                            navController.navigate("detail/${item.id}")
                        }
                    )
                }
            }
        }
    }
}

// MARK: - Notifications Screen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNotificationCountChange: (Int) -> Unit
) {
    var notifications by remember {
        mutableStateOf(
            listOf(
                NotificationItem("1", "New message", "5m ago", false),
                NotificationItem("2", "Update available", "1h ago", false),
                NotificationItem("3", "Friend request", "2h ago", true)
            )
        )
    }

    LaunchedEffect(notifications) {
        val unreadCount = notifications.count { !it.isRead }
        onNotificationCountChange(unreadCount)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                actions = {
                    TextButton(onClick = {
                        notifications = emptyList()
                    }) {
                        Text("Clear All")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            items(notifications) { notification ->
                ListItem(
                    headlineContent = {
                        Text(
                            text = notification.title,
                            style = if (notification.isRead) {
                                MaterialTheme.typography.bodyLarge.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            } else {
                                MaterialTheme.typography.bodyLarge
                            }
                        )
                    },
                    supportingContent = {
                        Text(notification.time)
                    },
                    trailingContent = {
                        if (!notification.isRead) {
                            Badge {
                                Text("")
                            }
                        }
                    },
                    modifier = Modifier.clickable {
                        notifications = notifications.map {
                            if (it.id == notification.id) {
                                it.copy(isRead = true)
                            } else {
                                it
                            }
                        }
                    }
                )
                HorizontalDivider()
            }
        }
    }
}

// MARK: - Profile Screen
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Profile") })
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Profile header
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        modifier = Modifier.size(80.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "John Doe",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    Text(
                        text = "john.doe@example.com",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                HorizontalDivider()
            }

            // Account section
            item {
                Text(
                    text = "Account",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            item {
                ListItem(
                    headlineContent = { Text("Edit Profile") },
                    leadingContent = {
                        Icon(Icons.Default.Edit, contentDescription = null)
                    },
                    trailingContent = {
                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                    },
                    modifier = Modifier.clickable { /* Navigate */ }
                )
            }

            item {
                ListItem(
                    headlineContent = { Text("Privacy") },
                    leadingContent = {
                        Icon(Icons.Default.Lock, contentDescription = null)
                    },
                    trailingContent = {
                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                    },
                    modifier = Modifier.clickable { /* Navigate */ }
                )
            }

            // Preferences section
            item {
                Text(
                    text = "Preferences",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }

            item {
                ListItem(
                    headlineContent = { Text("Settings") },
                    leadingContent = {
                        Icon(Icons.Default.Settings, contentDescription = null)
                    },
                    trailingContent = {
                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                    },
                    modifier = Modifier.clickable { /* Navigate */ }
                )
            }

            item {
                ListItem(
                    headlineContent = { Text("Help & Support") },
                    leadingContent = {
                        Icon(Icons.Default.Help, contentDescription = null)
                    },
                    trailingContent = {
                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                    },
                    modifier = Modifier.clickable { /* Navigate */ }
                )
            }

            // Logout
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { /* Logout */ },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Text("Log Out")
                }
            }
        }
    }
}

// MARK: - Data Models
data class Item(
    val id: String,
    val title: String,
    val subtitle: String
)

data class NotificationItem(
    val id: String,
    val title: String,
    val time: String,
    val isRead: Boolean
)
