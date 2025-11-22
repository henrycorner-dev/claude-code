# Design Systems: Material Design and Human Interface Guidelines

This reference provides detailed specifications for Material Design (Android) and Human Interface Guidelines (iOS), including component guidelines, spacing systems, typography, colors, and platform-specific patterns.

## Material Design (Android)

### Material Design 3 (Material You)

Material Design 3 is the latest evolution of Material Design, introducing dynamic color, enhanced personalization, and updated components.

#### Color System

**Color Roles:**
- **Primary:** Main brand color, used for primary actions and components
- **Secondary:** Supporting color for less prominent components
- **Tertiary:** Accent color for highlights and special elements
- **Error:** For error states and destructive actions
- **Surface:** Background colors for components
- **On-[color]:** Text/icons that appear on top of color surfaces

**Dynamic Color:**
Material You generates color schemes from user's wallpaper or chosen seed color:
- Light and dark schemes auto-generated
- Maintains 4.5:1 contrast ratio for accessibility
- Harmonious color relationships

**Color Palette Structure:**
Each color role has tonal variations (0-100):
- 0: Black
- 10: Very dark
- 20-40: Dark variants
- 50-60: Mid-tone
- 80-90: Light variants
- 95: Very light
- 100: White

**Implementation Example:**
```kotlin
// Using Material 3 color scheme
MaterialTheme(
    colorScheme = if (isDarkTheme) darkColorScheme() else lightColorScheme()
) {
    // Your composables
}

// Custom color scheme
val customColorScheme = lightColorScheme(
    primary = Color(0xFF6750A4),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFEADDFF),
    onPrimaryContainer = Color(0xFF21005D),
    secondary = Color(0xFF625B71),
    // ... more colors
)
```

#### Typography Scale

Material Design 3 type scale with 15 roles:

**Display (Large headlines):**
- Display Large: 57sp, Regular weight
- Display Medium: 45sp, Regular weight
- Display Small: 36sp, Regular weight

**Headline:**
- Headline Large: 32sp, Regular weight
- Headline Medium: 28sp, Regular weight
- Headline Small: 24sp, Regular weight

**Title:**
- Title Large: 22sp, Regular weight (400)
- Title Medium: 16sp, Medium weight (500)
- Title Small: 14sp, Medium weight (500)

**Body:**
- Body Large: 16sp, Regular weight
- Body Medium: 14sp, Regular weight
- Body Small: 12sp, Regular weight

**Label:**
- Label Large: 14sp, Medium weight
- Label Medium: 12sp, Medium weight
- Label Small: 11sp, Medium weight

**Default Font:** Roboto

**Implementation:**
```kotlin
Text(
    text = "Headline",
    style = MaterialTheme.typography.headlineMedium
)
Text(
    text = "Body text",
    style = MaterialTheme.typography.bodyLarge
)
```

#### Spacing and Layout

**8dp Grid System:**
All spacing and sizing should be multiples of 8dp:
- 4dp: Tight spacing (within small components)
- 8dp: Default small spacing
- 16dp: Default medium spacing (most common)
- 24dp: Large spacing
- 32dp: Extra large spacing
- 48dp: Section spacing

**Screen Margins:**
- Phone portrait: 16dp left/right margins
- Tablet: 24dp or more
- Large screens: Use responsive layout with max-width containers

**Component Padding:**
- Buttons: 24dp horizontal, 10dp vertical (40dp height total)
- Cards: 16dp all around
- List items: 16dp horizontal, 8-16dp vertical

**Grid Layouts:**
- Use ConstraintLayout or Column/Row with weights
- Minimum touch target: 48dp × 48dp
- Space between cards: 8dp-16dp

#### Elevation and Shadows

Material Design uses elevation (Z-axis) to show hierarchy:

**Elevation Levels:**
- 0dp: Surface level (default background)
- 1dp: Cards at rest, switches
- 2dp: Buttons (resting elevation)
- 3dp: Refresh indicators, Quick entry / Search bar (resting)
- 4dp: App bar
- 6dp: FAB (resting), Snackbar
- 8dp: Bottom navigation bar, Menu, Card (picked up), FAB (pressed)
- 12dp: Drawer
- 16dp: Modal bottom sheet
- 24dp: Dialog

**Implementation:**
```kotlin
Card(
    elevation = CardDefaults.cardElevation(
        defaultElevation = 2.dp,
        pressedElevation = 8.dp
    )
) {
    // Content
}
```

**Material 3 Elevation Tones:**
In Material 3, elevation is expressed through tonal surface colors rather than just shadows.

#### Components

##### App Bars

**Top App Bar:**
- Height: 64dp (regular), 128dp (large), 152dp (medium with image)
- Horizontal padding: 16dp
- Title typography: Title Large
- Icon buttons: 48dp × 48dp touch target

**Types:**
- Small (Center-aligned or leading-aligned)
- Medium (Collapsing with larger title)
- Large (Extra large title area)

```kotlin
TopAppBar(
    title = { Text("Screen Title") },
    navigationIcon = {
        IconButton(onClick = { /* Navigate back */ }) {
            Icon(Icons.Default.ArrowBack, "Back")
        }
    },
    actions = {
        IconButton(onClick = { /* Search */ }) {
            Icon(Icons.Default.Search, "Search")
        }
    }
)
```

##### Bottom Navigation

- Height: 80dp
- Minimum 3, maximum 5 items
- Icon size: 24dp
- Label typography: Label Medium
- Active indicator: Pill-shaped background

```kotlin
NavigationBar {
    items.forEachIndexed { index, item ->
        NavigationBarItem(
            icon = { Icon(item.icon, contentDescription = item.label) },
            label = { Text(item.label) },
            selected = selectedItem == index,
            onClick = { selectedItem = index }
        )
    }
}
```

##### Navigation Drawer

**Modal Drawer:**
- Width: 256dp (mobile), 320dp (tablet)
- Elevation: 16dp
- Opens from left edge
- Includes scrim overlay (black at 32% opacity)

**Standard Drawer:**
- Permanent drawer for tablets/desktop
- Width: 360dp typical
- No scrim overlay

```kotlin
ModalNavigationDrawer(
    drawerContent = {
        ModalDrawerSheet {
            Text("Drawer Header", modifier = Modifier.padding(16.dp))
            Divider()
            NavigationDrawerItem(
                label = { Text("Item 1") },
                selected = false,
                onClick = { /* Handle click */ }
            )
        }
    }
) {
    // Main content
}
```

##### Floating Action Button (FAB)

- Size: 56dp × 56dp (standard), 40dp × 40dp (small), 96dp × 96dp (large)
- Icon size: 24dp
- Elevation: 6dp (rest), 12dp (pressed)
- Position: 16dp from edges

**Types:**
- FAB: Standard circular
- Extended FAB: Includes text label
- Small FAB: Compact version

```kotlin
FloatingActionButton(
    onClick = { /* Primary action */ },
    modifier = Modifier.padding(16.dp)
) {
    Icon(Icons.Default.Add, "Add")
}

// Extended FAB
ExtendedFloatingActionButton(
    onClick = { /* Action */ },
    icon = { Icon(Icons.Default.Add, "Add") },
    text = { Text("Create New") }
)
```

##### Cards

- Elevation: 1dp-2dp (rest), 8dp (dragged)
- Corner radius: 12dp (Material 3)
- Padding: 16dp content padding
- Minimum touch target for interactive cards: 48dp height

**Types:**
- Filled: Default with subtle elevation
- Elevated: More prominent elevation
- Outlined: Border instead of elevation

```kotlin
Card(
    modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Card Title", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Card content", style = MaterialTheme.typography.bodyMedium)
    }
}
```

##### Buttons

**Filled Button (Primary):**
- Height: 40dp
- Horizontal padding: 24dp
- Corner radius: 20dp (fully rounded)
- Typography: Label Large

**Outlined Button:**
- 1dp border
- Same dimensions as filled

**Text Button:**
- No background or border
- Same typography and padding

```kotlin
Button(onClick = { /* Action */ }) {
    Text("Filled Button")
}

OutlinedButton(onClick = { /* Action */ }) {
    Text("Outlined")
}

TextButton(onClick = { /* Action */ }) {
    Text("Text Button")
}
```

##### Lists

**List Item Heights:**
- One line: 56dp
- Two lines: 72dp
- Three lines: 88dp

**List Item Padding:**
- Horizontal: 16dp
- Vertical: 8dp between text lines
- Icon to text spacing: 16dp
- Icon size: 24dp (standard), 40dp (large avatar)

```kotlin
LazyColumn {
    items(itemsList) { item ->
        ListItem(
            headlineContent = { Text(item.title) },
            supportingContent = { Text(item.subtitle) },
            leadingContent = {
                Icon(item.icon, contentDescription = null)
            },
            trailingContent = {
                Icon(Icons.Default.ChevronRight, "Navigate")
            }
        )
    }
}
```

##### Dialogs

**Alert Dialog:**
- Min width: 280dp
- Max width: 560dp
- Corner radius: 28dp
- Padding: 24dp

```kotlin
AlertDialog(
    onDismissRequest = { /* Close dialog */ },
    title = { Text("Dialog Title") },
    text = { Text("Dialog message content goes here.") },
    confirmButton = {
        TextButton(onClick = { /* Confirm */ }) {
            Text("Confirm")
        }
    },
    dismissButton = {
        TextButton(onClick = { /* Cancel */ }) {
            Text("Cancel")
        }
    }
)
```

##### Bottom Sheets

**Modal Bottom Sheet:**
- Corner radius: 28dp (top corners)
- Elevation: 16dp
- Drag handle: 32dp × 4dp, 12dp from top

```kotlin
ModalBottomSheet(
    onDismissRequest = { showBottomSheet = false }
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Bottom Sheet Title", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))
        // Content
    }
}
```

#### Motion and Animation

**Duration Standards:**
- Simple transitions: 100ms
- Standard transitions: 300ms
- Complex transitions: 500ms
- Entering screen: 300ms
- Exiting screen: 200ms

**Easing:**
- Standard: Emphasized easing (cubic bezier)
- Entering: Decelerate easing
- Exiting: Accelerate easing

```kotlin
// Animate visibility
AnimatedVisibility(
    visible = isVisible,
    enter = fadeIn(animationSpec = tween(300)),
    exit = fadeOut(animationSpec = tween(200))
) {
    // Content
}
```

---

## Human Interface Guidelines (iOS)

### iOS Design System

Apple's Human Interface Guidelines define the iOS platform's design language with emphasis on clarity, deference, and depth.

#### Color System

**System Colors:**
iOS provides semantic colors that automatically adapt to light/dark mode:

**UI Element Colors:**
- `systemBackground`: Primary background
- `secondarySystemBackground`: Grouped content background
- `tertiarySystemBackground`: Tertiary grouped content
- `systemFill`: Fill for thin/small shapes
- `label`: Primary text
- `secondaryLabel`: Secondary text
- `tertiaryLabel`: Tertiary text/placeholders

**Accent Colors:**
- `systemBlue`: Default tint color
- `systemGreen`, `systemRed`, `systemOrange`, `systemYellow`, `systemPink`, `systemPurple`, `systemTeal`, `systemIndigo`

**Implementation:**
```swift
// SwiftUI
Text("Hello")
    .foregroundColor(.primary) // Uses label color
    .background(Color(.systemBackground))

// Accent color
Button("Action") { }
    .tintColor(.accentColor)
```

**Custom Colors:**
```swift
// Define colors in asset catalog with light/dark variants
Color("BrandColor") // Automatically adapts to appearance
```

#### Typography

**SF Pro Text / SF Pro Display:**
Apple's system font, optimized for readability.

**Text Styles (Dynamic Type):**
- Large Title: 34pt (Regular)
- Title 1: 28pt (Regular)
- Title 2: 22pt (Regular)
- Title 3: 20pt (Regular)
- Headline: 17pt (Semibold)
- Body: 17pt (Regular)
- Callout: 16pt (Regular)
- Subheadline: 15pt (Regular)
- Footnote: 13pt (Regular)
- Caption 1: 12pt (Regular)
- Caption 2: 11pt (Regular)

**Implementation:**
```swift
Text("Large Title")
    .font(.largeTitle)

Text("Body text")
    .font(.body)

Text("Headline")
    .font(.headline)

// Custom with weight
Text("Custom")
    .font(.system(size: 17, weight: .semibold))
```

**Dynamic Type Support:**
Always use text styles to support user's preferred font size (accessibility requirement).

```swift
// Scales with user's Dynamic Type setting
Text("Scales with user preference")
    .font(.body)

// Fixed size (avoid unless necessary)
Text("Fixed size")
    .font(.system(size: 17))
```

#### Spacing and Layout

**Safe Area:**
Respect safe area insets for notch, home indicator, and edges:
- Top safe area: Status bar + notch
- Bottom safe area: Home indicator area
- Side safe areas: Rounded corners

```swift
VStack {
    // Content
}
.padding() // Respects safe area automatically

// Ignore safe area for specific edges
.ignoresSafeArea(.container, edges: .bottom)
```

**Spacing Guidelines:**
- Minimum: 8pt
- Standard: 16pt
- Large: 20pt
- Section spacing: 32pt+

**Margins:**
- Screen edges: 16pt-20pt (iPhone), 20pt+ (iPad)
- Reading width: Max 672pt for text-heavy content

#### Components

##### Navigation Bar

**Height:**
- Regular: 44pt
- Large title: 96pt
- Status bar: 44pt (standard), 47pt (with notch)

**Elements:**
- Leading: Back button or leading buttons
- Center: Title (standard) or nothing (large title)
- Trailing: Action buttons (typically 1-2)

```swift
NavigationView {
    List {
        // Content
    }
    .navigationTitle("Screen Title")
    .navigationBarTitleDisplayMode(.large) // or .inline
    .toolbar {
        ToolbarItem(placement: .navigationBarLeading) {
            Button("Cancel") { }
        }
        ToolbarItem(placement: .navigationBarTrailing) {
            Button("Save") { }
        }
    }
}
```

##### Tab Bar

**Dimensions:**
- Height: 49pt (50pt with divider)
- Icon size: 25pt × 25pt (max 30pt × 30pt)
- Minimum 2, maximum 5 tabs
- More than 5: Use "More" tab with list

**Typography:**
- Label: 10pt Regular

```swift
TabView {
    HomeView()
        .tabItem {
            Label("Home", systemImage: "house.fill")
        }

    SearchView()
        .tabItem {
            Label("Search", systemImage: "magnifyingglass")
        }

    ProfileView()
        .tabItem {
            Label("Profile", systemImage: "person.fill")
        }
}
```

**SF Symbols:**
Use SF Symbols for tab bar icons - they're designed for consistency:
```swift
Image(systemName: "house.fill")
Image(systemName: "magnifyingglass")
Image(systemName: "person.crop.circle")
```

##### Lists

**List Styles:**
- Inset Grouped (iOS 14+): Default, rounded corners
- Grouped: Full-width sections with headers
- Plain: Edge-to-edge rows

**Row Heights:**
- Default: 44pt minimum
- With subtitle: 44pt-60pt
- Custom: Variable height with constraints

```swift
List {
    Section(header: Text("Section 1")) {
        ForEach(items) { item in
            NavigationLink(destination: DetailView(item: item)) {
                HStack {
                    Image(systemName: item.icon)
                    VStack(alignment: .leading) {
                        Text(item.title)
                            .font(.headline)
                        Text(item.subtitle)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
    }
}
.listStyle(.insetGrouped)
```

**Swipe Actions:**
```swift
List {
    ForEach(items) { item in
        Text(item.name)
            .swipeActions(edge: .trailing) {
                Button(role: .destructive) {
                    // Delete
                } label: {
                    Label("Delete", systemImage: "trash")
                }
            }
            .swipeActions(edge: .leading) {
                Button {
                    // Archive
                } label: {
                    Label("Archive", systemImage: "archivebox")
                }
                .tint(.blue)
            }
    }
}
```

##### Buttons

**Button Styles:**
- Borderless: Default, tinted text
- Bordered: Rounded rectangle background
- Prominent: Filled with accent color
- Plain: No styling

**Sizing:**
- Minimum touch target: 44pt × 44pt
- Button padding: 16pt horizontal typical
- Corner radius: 10pt-13pt for bordered

```swift
// Primary action
Button("Continue") { }
    .buttonStyle(.borderedProminent)
    .controlSize(.large)

// Secondary action
Button("Cancel") { }
    .buttonStyle(.bordered)

// Text button
Button("Learn More") { }
    .buttonStyle(.plain)
```

##### Sheets and Modals

**Sheet Presentation:**
- Corner radius: 10pt
- Detent support: medium, large, custom
- Drag indicator visible
- Dismiss via swipe down

```swift
.sheet(isPresented: $showSheet) {
    NavigationView {
        SheetContentView()
            .navigationTitle("Sheet Title")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        showSheet = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        // Save and dismiss
                    }
                }
            }
    }
    .presentationDetents([.medium, .large])
}
```

##### Alerts and Dialogs

**Alert:**
- Max width: ~270pt
- Title: 17pt Semibold
- Message: 13pt Regular
- Buttons: 17pt Regular/Semibold

```swift
.alert("Alert Title", isPresented: $showAlert) {
    Button("Cancel", role: .cancel) { }
    Button("Confirm", role: .destructive) {
        // Perform action
    }
} message: {
    Text("Alert message explaining the situation.")
}
```

**Confirmation Dialog (Action Sheet):**
```swift
.confirmationDialog("Choose Action", isPresented: $showDialog) {
    Button("Option 1") { }
    Button("Option 2") { }
    Button("Delete", role: .destructive) { }
    Button("Cancel", role: .cancel) { }
}
```

##### Forms and Controls

**Form Style:**
```swift
Form {
    Section(header: Text("Profile")) {
        TextField("Name", text: $name)
        TextField("Email", text: $email)
            .keyboardType(.emailAddress)
            .textContentType(.emailAddress)
    }

    Section(header: Text("Preferences")) {
        Toggle("Enable Notifications", isOn: $notifications)
        Picker("Theme", selection: $theme) {
            Text("Light").tag(0)
            Text("Dark").tag(1)
            Text("Auto").tag(2)
        }
    }

    Section {
        Button("Save Changes") {
            // Save
        }
    }
}
```

**Control Sizes:**
- Toggle: 51pt × 31pt
- Slider: 44pt minimum height
- Stepper: 44pt height
- TextField: 44pt minimum height

##### Cards (Custom)

iOS doesn't have built-in Card component, but common pattern:

```swift
VStack(alignment: .leading, spacing: 12) {
    Text("Card Title")
        .font(.headline)
    Text("Card content goes here with more information.")
        .font(.body)
        .foregroundColor(.secondary)
}
.padding(16)
.background(Color(.secondarySystemBackground))
.cornerRadius(12)
.shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
```

#### Motion and Animation

**Animation Duration:**
- Quick: 0.2-0.3 seconds
- Standard: 0.3-0.4 seconds
- Slow: 0.5-0.6 seconds

**Easing:**
- Default: Ease in/out
- Spring: Natural, bouncy feel

```swift
// Implicit animation
Button("Animate") {
    withAnimation(.spring()) {
        isExpanded.toggle()
    }
}

// Explicit animation
Text("Hello")
    .scaleEffect(isPressed ? 0.95 : 1.0)
    .animation(.spring(response: 0.3), value: isPressed)
```

**Transitions:**
```swift
if showView {
    DetailView()
        .transition(.move(edge: .trailing))
}

// Custom transition
.transition(.asymmetric(
    insertion: .move(edge: .trailing),
    removal: .move(edge: .leading)
))
```

#### Gestures

**Standard Gestures:**
- Tap: Primary action
- Long press: Context menu or secondary action
- Swipe: Delete, archive, navigate
- Drag: Reorder, move
- Pinch: Zoom
- Rotate: Rotate content

```swift
// Long press
Text("Press me")
    .onLongPressGesture {
        // Show context menu
    }

// Swipe
.gesture(
    DragGesture()
        .onEnded { value in
            if value.translation.width < -100 {
                // Swiped left
            }
        }
)
```

#### Context Menus

```swift
Text("Long press for menu")
    .contextMenu {
        Button {
            // Action 1
        } label: {
            Label("Edit", systemImage: "pencil")
        }

        Button {
            // Action 2
        } label: {
            Label("Share", systemImage: "square.and.arrow.up")
        }

        Button(role: .destructive) {
            // Delete
        } label: {
            Label("Delete", systemImage: "trash")
        }
    }
```

---

## Platform Comparison Quick Reference

| Aspect | iOS (HIG) | Android (Material) |
|--------|-----------|-------------------|
| **Primary Navigation** | Tab Bar (bottom) | Bottom Navigation |
| **Secondary Navigation** | More tab / Sidebar | Navigation Drawer |
| **App Bar** | Navigation Bar (top) | Top App Bar |
| **Primary Action** | Prominent Button | FAB (Floating Action Button) |
| **Touch Target** | 44pt × 44pt | 48dp × 48dp |
| **Grid System** | 8pt base | 8dp base |
| **Screen Margins** | 16-20pt | 16dp |
| **Default Font** | SF Pro | Roboto |
| **Body Text Size** | 17pt | 16sp |
| **Corner Radius** | 10-13pt | 12-28dp (varies) |
| **Cards** | Custom (rounded containers) | Card component with elevation |
| **Elevation** | Shadows (subtle) | Z-axis with elevation levels |
| **Icons** | SF Symbols | Material Icons |
| **Back Navigation** | Swipe from left edge | Back button / gesture |
| **Modal Sheets** | Sheet with detents | Bottom Sheet |
| **Destructive Actions** | Red color | Error color (red theme) |

## Best Practices Summary

### Material Design Best Practices

1. Use dynamic color theming for personalization
2. Implement proper elevation hierarchy
3. Follow 8dp grid system strictly
4. Use Material 3 components from library
5. Support light and dark themes
6. Provide proper touch targets (48dp minimum)
7. Use appropriate motion duration and easing
8. Implement proper accessibility labels

### iOS Best Practices

1. Use SF Symbols for consistent iconography
2. Support Dynamic Type for accessibility
3. Respect safe area insets always
4. Use system colors for automatic dark mode
5. Follow native navigation patterns (swipe back)
6. Provide proper touch targets (44pt minimum)
7. Use native controls and components
8. Implement proper haptic feedback

### Cross-Platform Considerations

1. **Don't mix patterns:** Use platform-appropriate components
2. **Adapt navigation:** Tab bar (iOS) vs Bottom nav (Android)
3. **Icon systems:** SF Symbols (iOS) vs Material Icons (Android)
4. **Typography:** Respect platform font sizes and weights
5. **Gestures:** iOS swipe-back vs Android back button
6. **Terminology:** iOS "Settings" vs Android "Settings", iOS "Cancel" vs Android "Back"
7. **Action placement:** iOS trailing actions vs Android FAB
8. **Color psychology:** Understand platform color meanings
