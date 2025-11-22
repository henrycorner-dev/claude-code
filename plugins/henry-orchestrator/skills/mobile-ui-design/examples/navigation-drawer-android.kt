// Android Navigation Drawer Implementation
// Complete working example with Jetpack Compose and Material 3

package com.example.app

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

// MARK: - Drawer Items
sealed class DrawerItem(
    val id: String,
    val title: String,
    val icon: ImageVector,
    val section: DrawerSection = DrawerSection.PRIMARY
) {
    // Primary navigation items
    object Home : DrawerItem("home", "Home", Icons.Default.Home)
    object Starred : DrawerItem("starred", "Starred", Icons.Default.Star)
    object Sent : DrawerItem("sent", "Sent", Icons.Default.Send)
    object Drafts : DrawerItem("drafts", "Drafts", Icons.Default.Drafts)

    // Label items
    object Work : DrawerItem("work", "Work", Icons.Default.Label, DrawerSection.LABELS)
    object Personal : DrawerItem("personal", "Personal", Icons.Default.Label, DrawerSection.LABELS)
    object Travel : DrawerItem("travel", "Travel", Icons.Default.Label, DrawerSection.LABELS)

    // Settings items
    object Settings : DrawerItem("settings", "Settings", Icons.Default.Settings, DrawerSection.SETTINGS)
    object Help : DrawerItem("help", "Help & Feedback", Icons.Default.Help, DrawerSection.SETTINGS)
}

enum class DrawerSection {
    PRIMARY, LABELS, SETTINGS
}

// MARK: - Main App with Drawer
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NavigationDrawerApp() {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    var selectedItem by remember { mutableStateOf<DrawerItem>(DrawerItem.Home) }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                modifier = Modifier.width(320.dp)
            ) {
                DrawerContent(
                    selectedItem = selectedItem,
                    onItemSelected = { item ->
                        selectedItem = item
                        scope.launch {
                            drawerState.close()
                        }
                    },
                    onLogout = {
                        scope.launch {
                            drawerState.close()
                        }
                        // Handle logout
                    }
                )
            }
        },
        gesturesEnabled = drawerState.isOpen || drawerState.targetValue == DrawerValue.Open
    ) {
        MainContentWithDrawer(
            selectedItem = selectedItem,
            onMenuClick = {
                scope.launch {
                    drawerState.open()
                }
            }
        )
    }
}

// MARK: - Drawer Content
@Composable
fun DrawerContent(
    selectedItem: DrawerItem,
    onItemSelected: (DrawerItem) -> Unit,
    onLogout: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Drawer Header
        DrawerHeader()

        HorizontalDivider()

        // Drawer Items
        LazyColumn(
            modifier = Modifier.weight(1f)
        ) {
            // Primary Section
            item {
                DrawerSectionHeader(text = "Primary")
            }

            items(
                listOf(
                    DrawerItem.Home,
                    DrawerItem.Starred,
                    DrawerItem.Sent,
                    DrawerItem.Drafts
                )
            ) { item ->
                NavigationDrawerItem(
                    icon = { Icon(item.icon, contentDescription = null) },
                    label = { Text(item.title) },
                    selected = selectedItem.id == item.id,
                    onClick = { onItemSelected(item) },
                    modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                )
            }

            // Labels Section
            item {
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider()
                DrawerSectionHeader(text = "Labels")
            }

            items(
                listOf(
                    DrawerItem.Work,
                    DrawerItem.Personal,
                    DrawerItem.Travel
                )
            ) { item ->
                NavigationDrawerItem(
                    icon = { Icon(item.icon, contentDescription = null) },
                    label = { Text(item.title) },
                    selected = selectedItem.id == item.id,
                    onClick = { onItemSelected(item) },
                    modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                )
            }

            // Settings Section
            item {
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider()
            }

            items(
                listOf(
                    DrawerItem.Settings,
                    DrawerItem.Help
                )
            ) { item ->
                NavigationDrawerItem(
                    icon = { Icon(item.icon, contentDescription = null) },
                    label = { Text(item.title) },
                    selected = selectedItem.id == item.id,
                    onClick = { onItemSelected(item) },
                    modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
                )
            }
        }

        // Logout at bottom
        HorizontalDivider()
        NavigationDrawerItem(
            icon = { Icon(Icons.Default.ExitToApp, contentDescription = null) },
            label = { Text("Logout") },
            selected = false,
            onClick = onLogout,
            modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding),
            colors = NavigationDrawerItemDefaults.colors(
                unselectedTextColor = MaterialTheme.colorScheme.error,
                unselectedIconColor = MaterialTheme.colorScheme.error
            )
        )
    }
}

// MARK: - Drawer Header
@Composable
fun DrawerHeader() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        Icon(
            imageVector = Icons.Default.AccountCircle,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "John Doe",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface
        )

        Text(
            text = "john.doe@example.com",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// MARK: - Section Header
@Composable
fun DrawerSectionHeader(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = Modifier.padding(
            horizontal = 28.dp,
            vertical = 16.dp
        )
    )
}

// MARK: - Main Content with App Bar
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainContentWithDrawer(
    selectedItem: DrawerItem,
    onMenuClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(selectedItem.title) },
                navigationIcon = {
                    IconButton(onClick = onMenuClick) {
                        Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Open Navigation Drawer"
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { /* Search */ }) {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    }
                    IconButton(onClick = { /* More options */ }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                }
            )
        }
    ) { padding ->
        // Content based on selected item
        Box(modifier = Modifier.padding(padding)) {
            when (selectedItem) {
                DrawerItem.Home -> HomeContent()
                DrawerItem.Starred -> StarredContent()
                DrawerItem.Sent -> SentContent()
                DrawerItem.Drafts -> DraftsContent()
                DrawerItem.Work -> LabelContent("Work")
                DrawerItem.Personal -> LabelContent("Personal")
                DrawerItem.Travel -> LabelContent("Travel")
                DrawerItem.Settings -> SettingsContent()
                DrawerItem.Help -> HelpContent()
            }
        }
    }
}

// MARK: - Content Screens
@Composable
fun HomeContent() {
    val items = remember {
        listOf(
            ContentItem("1", "Email from Alice", "Hey, how are you doing?"),
            ContentItem("2", "Meeting reminder", "Don't forget about the meeting at 3pm"),
            ContentItem("3", "Newsletter", "This week's top stories"),
            ContentItem("4", "Update available", "A new version is available")
        )
    }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(items) { item ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { /* Open item */ }
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = item.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun StarredContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Star,
            contentDescription = null,
            modifier = Modifier
                .size(64.dp)
                .align(androidx.compose.ui.Alignment.CenterHorizontally),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Starred Items",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterHorizontally)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Your starred items will appear here",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterHorizontally)
        )
    }
}

@Composable
fun SentContent() {
    EmptyStateContent(
        icon = Icons.Default.Send,
        title = "Sent Items",
        description = "Your sent items will appear here"
    )
}

@Composable
fun DraftsContent() {
    EmptyStateContent(
        icon = Icons.Default.Drafts,
        title = "Drafts",
        description = "Your draft items will appear here"
    )
}

@Composable
fun LabelContent(label: String) {
    EmptyStateContent(
        icon = Icons.Default.Label,
        title = "$label Items",
        description = "Items tagged with $label will appear here"
    )
}

@Composable
fun SettingsContent() {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "General",
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        item {
            var notificationsEnabled by remember { mutableStateOf(true) }
            ListItem(
                headlineContent = { Text("Enable Notifications") },
                supportingContent = { Text("Receive push notifications") },
                trailingContent = {
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = { notificationsEnabled = it }
                    )
                }
            )
        }

        item {
            var darkMode by remember { mutableStateOf(false) }
            ListItem(
                headlineContent = { Text("Dark Mode") },
                supportingContent = { Text("Use dark theme") },
                trailingContent = {
                    Switch(
                        checked = darkMode,
                        onCheckedChange = { darkMode = it }
                    )
                }
            )
        }
    }
}

@Composable
fun HelpContent() {
    EmptyStateContent(
        icon = Icons.Default.Help,
        title = "Help & Feedback",
        description = "Get help or send us feedback"
    )
}

@Composable
fun EmptyStateContent(
    icon: ImageVector,
    title: String,
    description: String
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier
                .size(64.dp)
                .align(androidx.compose.ui.Alignment.CenterHorizontally),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterHorizontally)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.align(androidx.compose.ui.Alignment.CenterHorizontally)
        )
    }
}

// MARK: - Data Models
data class ContentItem(
    val id: String,
    val title: String,
    val content: String
)

// MARK: - Adaptive Drawer (Responsive for Tablets)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdaptiveNavigationDrawer() {
    // Check window size
    val windowSizeClass = rememberWindowSizeClass()
    var selectedItem by remember { mutableStateOf<DrawerItem>(DrawerItem.Home) }

    if (windowSizeClass == WindowSizeClass.Expanded) {
        // Tablet: Use permanent drawer
        PermanentNavigationDrawer(
            drawerContent = {
                PermanentDrawerSheet(
                    modifier = Modifier.width(360.dp)
                ) {
                    DrawerContent(
                        selectedItem = selectedItem,
                        onItemSelected = { selectedItem = it },
                        onLogout = { /* Logout */ }
                    )
                }
            }
        ) {
            MainContentWithDrawer(
                selectedItem = selectedItem,
                onMenuClick = { /* No-op for permanent drawer */ }
            )
        }
    } else {
        // Phone: Use modal drawer
        NavigationDrawerApp()
    }
}

// Simulated window size class
@Composable
fun rememberWindowSizeClass(): WindowSizeClass {
    // In a real app, calculate based on actual window metrics
    return WindowSizeClass.Compact
}

enum class WindowSizeClass {
    Compact, Medium, Expanded
}
