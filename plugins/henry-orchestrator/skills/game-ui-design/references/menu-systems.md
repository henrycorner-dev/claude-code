# Menu Systems

## Menu Architecture

### Core Menu Structure

**Typical Game Menu Hierarchy:**
```
Main Menu
├── New Game
│   ├── Difficulty Selection
│   ├── Character Creation
│   └── Tutorial Prompt
├── Continue
├── Load Game
│   └── Save Slot Selection
├── Settings
│   ├── Graphics
│   ├── Audio
│   ├── Controls
│   ├── Gameplay
│   └── Accessibility
├── Extras
│   ├── Achievements
│   ├── Statistics
│   ├── Gallery
│   └── Credits
└── Quit

Pause Menu (In-Game)
├── Resume
├── Settings (subset of main settings)
├── Controls/Help
├── Save Game
└── Exit to Main Menu
```

### Menu States

**State Machine Pattern:**
```
MainMenu → NewGame → CharacterCreation → Gameplay
   ↓          ↓             ↓                ↓
Settings   Settings     Settings        PauseMenu
   ↓          ↑             ↑                ↓
MainMenu ────┘             └────────────────┘
```

**State Properties:**
- **Current State**: Which menu is active
- **Previous State**: For back button navigation
- **State Stack**: For nested menus (breadcrumb trail)
- **Transition**: Animation between states

### Navigation Patterns

**Linear Navigation:**
```
[Option 1] → [Option 2] → [Option 3]
    ↑                           ↓
    └───────────────────────────┘
```

**Grid Navigation:**
```
[1,1] → [1,2] → [1,3]
  ↓       ↓       ↓
[2,1] → [2,2] → [2,3]
  ↓       ↓       ↓
[3,1] → [3,2] → [3,3]
```

**Radial Navigation:**
```
        [Top]
          ↑
[Left] ← [•] → [Right]
          ↓
       [Bottom]
```

**Tabbed Navigation:**
```
[Graphics] [Audio] [Controls] [Gameplay]
    ↓
[Graphics Settings Panel]
```

## Menu Components

### Buttons

**Standard Button:**
```
┌──────────────────┐
│   Start Game     │
└──────────────────┘
```

**States:**
- Normal: Default appearance
- Hover: Highlighted (brightness increase, scale up)
- Pressed: Visual depression (scale down, color change)
- Disabled: Grayed out, no interaction
- Selected: Controller/keyboard focus indicator

**Design Guidelines:**
- Minimum touch target: 44x44 pixels
- Clear hover state (color change, glow, scale)
- Press feedback (scale down slightly, darker color)
- Disabled state (50% opacity, grayscale)
- Use consistent button sizes within a menu

### Text Input Fields

**Username Field:**
```
┌────────────────────────┐
│ Player Name: [______|] │
└────────────────────────┘
```

**Design Considerations:**
- Clear placeholder text
- Character limit indicator (15/20)
- Validation feedback (invalid characters, length)
- Virtual keyboard support on mobile/console
- Auto-focus on field entry

### Sliders

**Volume Slider:**
```
Volume: [━━━━━━━━━○━━━━━] 75%
```

**Types:**
- Continuous: Smooth values (0-100)
- Discrete: Step values (Low, Medium, High)
- Dual-handle: Range selection

**Design Guidelines:**
- Show current value (percentage or label)
- Handle large enough for touch/controller
- Immediate feedback (audio for volume, visual for brightness)
- Snap-to-default option (double-click/press)

### Dropdowns/Comboboxes

**Resolution Selector:**
```
Resolution: [1920x1080 ▼]
            ├ 1280x720
            ├ 1920x1080 ✓
            ├ 2560x1440
            └ 3840x2160
```

**Design Guidelines:**
- Clear selected value
- Checkmark or highlight for current selection
- Scrollable for long lists
- Keyboard navigation (arrow keys, type to search)

### Toggle Switches

**Boolean Option:**
```
V-Sync: [●═══] ON
```

**States:**
- ON: Handle on right, green/blue color
- OFF: Handle on left, gray color
- Animate transition smoothly

### Tabs

**Settings Categories:**
```
╔═════════╗ ┌─────────┐ ┌─────────┐
║ Graphics║ │  Audio  │ │ Controls│
╚═════════╝ └─────────┘ └─────────┘
├───────────────────────────────────┤
│                                   │
│     [Graphics Settings]           │
│                                   │
└───────────────────────────────────┘
```

**Design Guidelines:**
- Clear active tab indicator (underline, bold, color)
- Consistent tab sizes
- Visual separation from content area
- Remember last active tab when returning

### Modal Dialogs

**Confirmation Dialog:**
```
┌─────────────────────────────┐
│  Are you sure you want to   │
│  quit without saving?        │
│                              │
│  [Cancel]        [Quit]      │
└─────────────────────────────┘
```

**Types:**
- Confirmation: Yes/No choices
- Alert: Single OK button
- Input: Requires user input
- Progress: Loading bar

**Design Guidelines:**
- Darken/blur background
- Clear action buttons
- Default button highlighted
- ESC key closes modal
- Click outside to cancel (optional)

### List Views

**Save Slot List:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Save 1 - Level 15           │ │
│ │ 2025-01-15  10:30          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Save 2 - Level 8            │ │
│ │ 2025-01-14  18:45          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ Empty Slot                  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Design Guidelines:**
- Clear selection highlight
- Hover preview for additional info
- Scrollable for long lists
- Empty state messaging
- Delete/rename options

## Menu Flow Patterns

### Progressive Disclosure

**Don't Show Everything at Once:**

❌ **Bad:**
```
Settings (50 options on one screen)
```

✅ **Good:**
```
Settings
├── Graphics (10 options)
├── Audio (8 options)
└── Controls (12 options)
```

### Breadcrumb Navigation

**Show Current Location:**
```
Main Menu > Settings > Graphics > Advanced
                                      ↓
                                  [← Back]
```

### Confirmation for Destructive Actions

**Always Confirm:**
```
Delete Save → [Confirmation Dialog] → Deleted
Quit Game → [Are you sure?] → Exit
Reset Settings → [Warning] → Reset
```

### Loading States

**Asynchronous Operations:**
```
[Loading...] → [Progress Bar] → [Success/Error]
```

**Design Guidelines:**
- Show progress when possible
- Provide estimated time remaining
- Allow cancellation if applicable
- Clear success/error states

## Visual Design

### Layout Principles

**Alignment:**
- Left-align text for readability
- Center-align titles and single buttons
- Right-align numerical values
- Use grid systems for consistency

**Spacing:**
- Consistent padding within elements (8px, 16px, 24px)
- Adequate spacing between elements (16px minimum)
- Grouping related items closer together
- White space for visual breathing room

**Hierarchy:**
- Title: Largest, bold, high contrast
- Section headers: Medium, bold
- Body text: Standard size, regular weight
- Secondary info: Smaller, reduced opacity

### Typography

**Font Choices:**
- Readable sans-serif for UI (Roboto, Inter, Helvetica)
- Stylized fonts only for titles
- Monospace for numerical values
- Minimum size: 16px for body, 12px for secondary

**Text Guidelines:**
- High contrast with background (4.5:1 minimum)
- Avoid all caps for long text
- Use bold for emphasis, not underlining
- Line height: 1.4-1.6 for readability

### Color Scheme

**Purpose-Driven Colors:**
- Primary: Main actions (Start Game, Confirm)
- Secondary: Supporting actions (Back, Cancel)
- Success: Green for positive actions
- Warning: Yellow/orange for caution
- Danger: Red for destructive actions (Delete, Quit)
- Neutral: Gray for disabled states

**Consistency:**
- Use the same color for the same purpose across all menus
- Maintain color contrast ratios
- Test with colorblind simulations

### Animations and Transitions

**Menu Transitions:**
```
Fade In/Out: Opacity 0 → 1 (200-300ms)
Slide In: Transform translateX(-100%) → 0 (300-400ms)
Scale In: Scale 0.9 → 1 (200ms)
```

**Button Feedback:**
```
Hover: Scale 1.0 → 1.05 (150ms)
Press: Scale 1.0 → 0.95 (100ms)
```

**Timing:**
- Quick interactions: 100-200ms
- Menu transitions: 200-400ms
- Loading states: Indefinite with progress

**Easing:**
- Ease-out: Natural, starts fast and slows down
- Ease-in-out: Smooth, gentle on both ends
- Linear: Constant speed (use sparingly)

## Accessibility

### Keyboard/Controller Navigation

**Navigation Keys:**
- Arrow Keys/D-Pad: Move between options
- Enter/A Button: Select/Confirm
- Escape/B Button: Back/Cancel
- Tab: Move through sections
- Home/End: Jump to first/last option

**Focus Indicators:**
- Clear outline or highlight on focused element
- High contrast (2px border, bright color)
- Animate focus transitions smoothly

**Navigation Logic:**
- Wrap-around: Last item → First item
- Remember last selected item when returning
- Skip disabled items
- Provide shortcuts for common actions

### Screen Reader Support

**Semantic Markup:**
- Label all buttons with descriptive text
- Provide alt text for icons
- Use ARIA labels where appropriate
- Announce state changes

**Reading Order:**
- Logical tab order (top-to-bottom, left-to-right)
- Group related items
- Skip decorative elements

### Visual Accessibility

**Colorblind Modes:**
- Don't rely solely on color to convey information
- Use shapes, icons, or text in addition to color
- Provide colorblind filter options

**Text Scaling:**
- Allow UI scaling (75%, 100%, 125%, 150%)
- Test at different scales
- Don't break layout at larger sizes

**High Contrast Mode:**
- Increase contrast ratios
- Thicker outlines and borders
- Remove subtle gradients

### Customization Options

**Essential Settings:**
- UI Scale
- Text Size
- Color Schemes
- Motion Reduction (disable animations)
- Button Remapping

## Menu State Management

### Data Persistence

**Save Menu State:**
```json
{
  "lastMenuState": "Settings.Graphics",
  "selectedTab": "Graphics",
  "scrollPosition": 120,
  "formValues": {
    "resolution": "1920x1080",
    "vsync": true,
    "quality": "High"
  }
}
```

**What to Persist:**
- Last active menu/tab
- Scroll positions
- Partial form inputs
- Sort/filter preferences

### Undo/Redo

**Settings Changes:**
- Track changes before applying
- "Revert" button to undo changes
- "Apply" vs "OK" (apply without closing)
- Confirm before leaving with unsaved changes

### Validation

**Input Validation:**
```
Username: [Player_Name]
✓ Valid characters
✓ Length 3-20
✗ Must be unique
```

**Real-time Feedback:**
- Check validity as user types
- Clear error messages
- Disable submit until valid
- Suggest corrections

## Common Menu Types

### Main Menu

**Essential Elements:**
- Game title/logo
- Start/Continue button (prominent)
- Settings
- Quit
- Optional: Extras, Credits, Patch notes

**Design Focus:**
- First impression of the game
- Set tone and atmosphere
- Clear call-to-action (Start Game)
- Animated background or video

### Pause Menu

**Essential Elements:**
- Resume (most prominent)
- Settings (subset of options)
- Help/Controls
- Exit to main menu

**Design Focus:**
- Quick access to resume
- Don't obscure gameplay completely
- Blur or darken background
- Reduce options compared to main menu

### Settings Menu

**Categories:**
- Graphics: Resolution, quality, effects
- Audio: Master, music, SFX, voice volumes
- Controls: Key bindings, sensitivity, invert axis
- Gameplay: Difficulty, subtitles, HUD
- Accessibility: Colorblind mode, text size, etc.

**Design Focus:**
- Organized by category
- Immediate feedback for changes
- Reset to defaults option
- Apply vs OK vs Cancel buttons

### Inventory Menu

**Essential Elements:**
- Item grid or list
- Item details panel
- Quick slots/favorites
- Filter/sort options
- Compare items (for RPGs)

**Design Focus:**
- Quick item access
- Clear item information
- Drag-and-drop or quick-equip
- Visual item icons

### Character/Loadout Menu

**Essential Elements:**
- Character model viewer (3D)
- Equipment slots
- Stats display
- Skill tree or abilities
- Appearance customization

**Design Focus:**
- Visual representation of changes
- Clear stat impacts
- Save loadout presets
- Quick switch between loadouts

### Map/Navigation Menu

**Essential Elements:**
- World map or mini-map
- Objective markers
- Fast travel points
- Legend/key
- Zoom controls

**Design Focus:**
- Clear navigation
- Discoverable locations
- Fog of war for unexplored areas
- Quick travel options

## Implementation Patterns

### Menu Manager Pattern

**Singleton Menu Manager:**
```csharp
public class MenuManager : MonoBehaviour
{
    public static MenuManager Instance;

    private Stack<Menu> menuStack = new Stack<Menu>();

    public void OpenMenu(Menu menu)
    {
        if (menuStack.Count > 0)
        {
            menuStack.Peek().OnMenuExit();
        }

        menu.OnMenuEnter();
        menuStack.Push(menu);
    }

    public void CloseMenu()
    {
        if (menuStack.Count == 0) return;

        Menu menu = menuStack.Pop();
        menu.OnMenuExit();

        if (menuStack.Count > 0)
        {
            menuStack.Peek().OnMenuEnter();
        }
    }
}
```

### State Machine Pattern

**Finite State Machine:**
```csharp
public enum MenuState
{
    MainMenu,
    Settings,
    Pause,
    Inventory,
    None
}

public class MenuStateMachine
{
    private MenuState currentState = MenuState.None;
    private Dictionary<MenuState, Menu> menus;

    public void ChangeState(MenuState newState)
    {
        if (currentState != MenuState.None)
        {
            menus[currentState].Hide();
        }

        currentState = newState;
        menus[currentState].Show();
    }
}
```

### Event-Driven Architecture

**Menu Events:**
```csharp
public class MenuEvents
{
    public static event Action OnMenuOpened;
    public static event Action OnMenuClosed;
    public static event Action<string> OnMenuChanged;

    public static void MenuOpened() => OnMenuOpened?.Invoke();
    public static void MenuClosed() => OnMenuClosed?.Invoke();
    public static void MenuChanged(string menuName) => OnMenuChanged?.Invoke(menuName);
}
```

## Performance Optimization

### Lazy Loading

**Load Menus on Demand:**
- Don't instantiate all menus at start
- Load menu prefabs when first accessed
- Cache after first load

### Object Pooling

**Reuse Menu Elements:**
- Pool list items for scrollable lists
- Reuse button instances
- Cache frequently opened menus

### Canvas Optimization

**Reduce Rebuilds:**
- Separate static and dynamic canvases
- Use nested canvases for frequently updated sections
- Disable raycasts on non-interactive elements
- Use CanvasGroup for fade in/out

## Testing and Debugging

### Usability Testing

**Questions to Ask:**
- Can players find all options?
- Is navigation intuitive?
- Are button labels clear?
- Do players understand what each setting does?
- Can players complete tasks without help?

### Testing Checklist

- [ ] All buttons respond correctly
- [ ] Navigation works with keyboard/controller
- [ ] Back button returns to previous menu
- [ ] Settings persist after game restart
- [ ] Confirmation dialogs work properly
- [ ] Text is readable at all UI scales
- [ ] No broken or missing images
- [ ] Animations play smoothly
- [ ] Audio feedback works
- [ ] Tooltips appear correctly

### Common Issues

**Problem: Navigation gets stuck**
- Solution: Ensure all navigation paths are bidirectional
- Check for null references in navigation logic

**Problem: Settings don't save**
- Solution: Verify PlayerPrefs or save file writes
- Check for permissions issues

**Problem: Menu lags when opening**
- Solution: Profile canvas rebuilds
- Optimize layout groups and content size fitters
- Consider lazy loading

## Best Practices Summary

✅ **DO:**
- Keep menu hierarchy shallow (3-4 levels max)
- Provide clear back/cancel options
- Use consistent button placement
- Animate transitions smoothly
- Test with keyboard/controller
- Provide accessibility options
- Save user preferences
- Show loading states
- Confirm destructive actions
- Use progressive disclosure

❌ **DON'T:**
- Nest menus too deeply
- Use ambiguous button labels
- Ignore keyboard/controller input
- Make text too small
- Rely only on color for information
- Remove all visual feedback
- Auto-play loud audio
- Skip loading indicators
- Make irreversible actions easy
- Overwhelm with information

## Resources

### UI Frameworks
- Unity UI Toolkit (UI Builder)
- TextMeshPro for advanced text
- UMG (Unreal Motion Graphics)
- Dear ImGui for debug menus

### Design Tools
- Figma: UI prototyping
- Adobe XD: Interactive mockups
- Balsamiq: Wireframing

### Inspiration
- Game UI Database (gameuidatabase.com)
- Interface In Game (interfaceingame.com)
- Behance game UI projects

## Conclusion

Effective menu systems balance functionality with aesthetics, prioritize usability, and adapt to various input methods. Always test with real players, iterate based on feedback, and ensure accessibility for all users. A well-designed menu system enhances the overall game experience by providing seamless access to game features and settings.
