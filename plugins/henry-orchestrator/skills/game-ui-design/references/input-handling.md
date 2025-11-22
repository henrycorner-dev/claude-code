# Input Handling for Game UI

## Input Methods

### Keyboard and Mouse

**Standard PC Controls:**
- WASD: Movement
- Mouse: Look/aim
- Left Click: Primary action
- Right Click: Secondary action
- E/F: Interact
- ESC: Pause/menu
- Tab: Inventory/map
- Space: Jump

**Menu Navigation:**
- Arrow Keys: Navigate options
- Enter: Confirm
- ESC: Back/cancel
- Tab/Shift+Tab: Cycle through elements
- Mouse hover + click: Direct selection

**Best Practices:**
- Support both keyboard-only and mouse-only navigation
- Show keyboard shortcuts on buttons (e.g., "[E] Interact")
- Highlight focused element for keyboard navigation
- Allow rebinding of all keys
- Provide default presets (WASD, ESDF, Arrow Keys)

### Controller/Gamepad

**Standard Controller Layout (Xbox/PlayStation):**
```
    [Y/△]              [RB/R1]
[X/□]   [B/◯]          [RT/R2]
    [A/×]

  [D-Pad]              [Thumbsticks]
                       L3/R3 (click)

[LB/L1]
[LT/L2]

[View/Share] [Menu/Options]
```

**Common Mappings:**
- A/×: Confirm, jump
- B/◯: Cancel, back
- X/□: Reload, interact
- Y/△: Switch weapon, special action
- LB/L1, RB/R1: Shoulder buttons for quick actions
- LT/L2, RT/R2: Aim, shoot
- D-Pad: Quick item selection, emotes
- Left Stick: Movement
- Right Stick: Camera/aim
- Left Stick Click (L3): Sprint
- Right Stick Click (R3): Melee

**Menu Navigation with Controller:**
- Left Stick/D-Pad: Navigate options
- A/×: Confirm
- B/◯: Back
- LB/RB: Tab switching
- LT/RT: Fast scroll

**Design Guidelines:**
- Show controller button icons (not keyboard keys)
- Support both D-Pad and analog stick for menus
- Implement wrap-around navigation (last → first)
- Provide haptic feedback for selections
- Default to "A" button position (bottom button) for confirm
- Use "B" button (right button) for cancel

### Touch Input (Mobile/Tablet)

**Touch Gestures:**
- Tap: Select, interact
- Double-tap: Zoom, quick action
- Long-press: Context menu, hold action
- Swipe: Scroll, navigate, dodge
- Pinch: Zoom in/out
- Two-finger swipe: Rotate camera
- Three-finger swipe: Special actions

**Virtual Controls:**
```
┌─────────────────────────┐
│                     [X] │  (Close button)
│                         │
│                         │
│  [D-Pad]         [○]    │  (Action buttons)
│   or          [○] [○]   │
│ [Joystick]      [○]     │
│                         │
└─────────────────────────┘
```

**Design Considerations:**
- Minimum touch target: 44x44 pixels (Apple) or 48x48dp (Android)
- Adequate spacing between buttons (8px minimum)
- Semi-transparent controls (don't obstruct view)
- Customizable position and size
- Haptic feedback on touch
- Support swipe gestures for common actions
- Context-sensitive buttons (show only when needed)

### Motion/Gyroscope

**Use Cases:**
- Camera control (aim assist)
- Steering in racing games
- Fine-tuning aim
- VR head tracking

**Design Guidelines:**
- Provide toggle to enable/disable
- Adjustable sensitivity
- Calibration option
- Combine with traditional controls (hybrid)

### Voice Input

**Use Cases:**
- Menu navigation ("Open inventory")
- Commands ("Attack", "Heal")
- Chat/communication

**Design Guidelines:**
- Provide visual feedback for recognized commands
- Show available voice commands
- Fallback to traditional input
- Privacy toggle

## Input Systems

### Unity New Input System

**Input Actions Asset:**
```csharp
using UnityEngine.InputSystem;

public class PlayerInput : MonoBehaviour
{
    private PlayerInputActions inputActions;

    private void Awake()
    {
        inputActions = new PlayerInputActions();
    }

    private void OnEnable()
    {
        inputActions.Player.Enable();
        inputActions.UI.Enable();

        inputActions.UI.Navigate.performed += OnNavigate;
        inputActions.UI.Submit.performed += OnSubmit;
        inputActions.UI.Cancel.performed += OnCancel;
    }

    private void OnDisable()
    {
        inputActions.Player.Disable();
        inputActions.UI.Disable();

        inputActions.UI.Navigate.performed -= OnNavigate;
        inputActions.UI.Submit.performed -= OnSubmit;
        inputActions.UI.Cancel.performed -= OnCancel;
    }

    private void OnNavigate(InputAction.CallbackContext context)
    {
        Vector2 navigation = context.ReadValue<Vector2>();
        // Handle menu navigation
    }

    private void OnSubmit(InputAction.CallbackContext context)
    {
        // Handle confirm
    }

    private void OnCancel(InputAction.CallbackContext context)
    {
        // Handle back/cancel
    }
}
```

**Action Maps:**
- Player: Gameplay controls
- UI: Menu navigation
- Vehicle: Vehicle-specific controls

**Switching Contexts:**
```csharp
// Disable player controls when menu is open
inputActions.Player.Disable();
inputActions.UI.Enable();

// Re-enable player controls when menu closes
inputActions.UI.Disable();
inputActions.Player.Enable();
```

### Unreal Enhanced Input System

**Input Action Setup:**
```cpp
// InputActions
IA_Navigate
IA_Confirm
IA_Cancel
IA_TabLeft
IA_TabRight

// Input Mapping Context
IMC_UI
```

**Binding Actions:**
```cpp
void AMyPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();

    if (UEnhancedInputComponent* EnhancedInput = Cast<UEnhancedInputComponent>(InputComponent))
    {
        EnhancedInput->BindAction(IA_Navigate, ETriggerEvent::Triggered, this, &AMyPlayerController::Navigate);
        EnhancedInput->BindAction(IA_Confirm, ETriggerEvent::Started, this, &AMyPlayerController::Confirm);
        EnhancedInput->BindAction(IA_Cancel, ETriggerEvent::Started, this, &AMyPlayerController::Cancel);
    }
}

void AMyPlayerController::Navigate(const FInputActionValue& Value)
{
    FVector2D NavigationValue = Value.Get<FVector2D>();
    // Handle navigation
}
```

### Web-Based Input (JavaScript)

**Keyboard Input:**
```javascript
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            navigateUp();
            break;
        case 'ArrowDown':
            navigateDown();
            break;
        case 'Enter':
            confirm();
            break;
        case 'Escape':
            cancel();
            break;
    }
});
```

**Gamepad API:**
```javascript
window.addEventListener("gamepadconnected", (event) => {
    console.log("Gamepad connected:", event.gamepad);
});

function updateGamepad() {
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
        const gp = gamepads[0];

        // Buttons
        if (gp.buttons[0].pressed) {
            // A button pressed
            confirm();
        }

        // Axes
        const horizontal = gp.axes[0];
        const vertical = gp.axes[1];

        if (Math.abs(horizontal) > 0.5) {
            navigateHorizontal(horizontal);
        }
    }

    requestAnimationFrame(updateGamepad);
}
```

**Touch Events:**
```javascript
element.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

element.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    // Handle swipe
    if (Math.abs(deltaX) > swipeThreshold) {
        handleSwipe(deltaX > 0 ? 'right' : 'left');
    }
});

element.addEventListener('touchend', (event) => {
    // Handle tap or release
});
```

## Controller-Specific UI Patterns

### Button Prompts

**Context-Sensitive Prompts:**
```
[A] Select
[B] Back
[X] Details
[Y] Sort
```

**Dynamic Platform Detection:**
```csharp
public enum ControllerType
{
    KeyboardMouse,
    Xbox,
    PlayStation,
    Switch,
    Generic
}

public class InputIconManager
{
    public Sprite GetButtonIcon(string action, ControllerType controller)
    {
        switch (controller)
        {
            case ControllerType.Xbox:
                return action == "Confirm" ? aButtonIcon : /* ... */;
            case ControllerType.PlayStation:
                return action == "Confirm" ? crossButtonIcon : /* ... */;
            // ... other cases
        }
    }
}
```

**Auto-Switching:**
- Detect last input method used
- Switch icons dynamically (keyboard → controller)
- Show appropriate prompts

### Radial Menus

**Controller-Optimized:**
```
        [Item 1]
          /   \
   [Item 8]   [Item 2]
      |         |
   [Item 7] ● [Item 3]
      |         |
   [Item 6]   [Item 4]
          \   /
        [Item 5]
```

**Implementation:**
- Use right analog stick for selection
- Highlight sector as stick moves
- Release to confirm
- Center to cancel

**Design Guidelines:**
- 4-8 items maximum
- Clear visual sectors
- Large enough selection zones
- Snap-to-sector for precision

### Tab/Page Navigation

**Shoulder Button Switching:**
```
[LB] ← [Current Tab] → [RB]

Tab 1: Weapons
Tab 2: Armor
Tab 3: Consumables
```

**Trigger Scrolling:**
```
[LT] Scroll Up
[RT] Scroll Down
```

### Nested Menus

**Hierarchical Navigation:**
```
Main Menu
  → Settings (A to enter)
      → Graphics (A to enter)
          ← (B to go back to Settings)
      ← (B to go back to Main Menu)
```

**Breadcrumb Indicator:**
```
Main > Settings > Graphics
```

## Touch-Specific UI Patterns

### Swipe Navigation

**Full-Screen Swipe:**
```
Swipe Right → Previous screen
Swipe Left → Next screen
Swipe Down → Close menu
Swipe Up → More options
```

**List Swipe Actions:**
```
Swipe Left on Item → [Delete] [Archive]
Swipe Right on Item → [Star] [Share]
```

### Pull-to-Refresh

**Common Pattern:**
- Pull down from top of list
- Release when threshold reached
- Show loading indicator
- Refresh content

### Drag and Drop

**Inventory Management:**
```javascript
item.addEventListener('touchstart', (e) => {
    isDragging = true;
    dragItem = e.target;
});

item.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const touch = e.touches[0];
        dragItem.style.left = touch.clientX + 'px';
        dragItem.style.top = touch.clientY + 'px';
    }
});

slot.addEventListener('touchend', (e) => {
    if (isDragging && isOverSlot(dragItem, slot)) {
        dropItemInSlot(dragItem, slot);
    }
    isDragging = false;
});
```

### Pinch and Zoom

**Map Zoom:**
```javascript
let initialDistance = 0;

map.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
});

map.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        applyZoom(scale);
    }
});

function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
```

### Long-Press

**Context Menu:**
```javascript
let pressTimer;

element.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
        showContextMenu(e.touches[0].clientX, e.touches[0].clientY);
    }, 500); // 500ms for long press
});

element.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
});

element.addEventListener('touchmove', () => {
    clearTimeout(pressTimer); // Cancel if finger moves
});
```

### Virtual Joystick

**Implementation:**
```javascript
class VirtualJoystick {
    constructor(container) {
        this.container = container;
        this.stick = container.querySelector('.stick');
        this.maxDistance = 50; // pixels

        this.active = false;
        this.startX = 0;
        this.startY = 0;

        this.setupEvents();
    }

    setupEvents() {
        this.container.addEventListener('touchstart', (e) => {
            this.active = true;
            const touch = e.touches[0];
            this.startX = touch.clientX;
            this.startY = touch.clientY;
        });

        this.container.addEventListener('touchmove', (e) => {
            if (!this.active) return;

            const touch = e.touches[0];
            let deltaX = touch.clientX - this.startX;
            let deltaY = touch.clientY - this.startY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > this.maxDistance) {
                deltaX = (deltaX / distance) * this.maxDistance;
                deltaY = (deltaY / distance) * this.maxDistance;
            }

            this.stick.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

            // Normalize to -1 to 1
            const normalizedX = deltaX / this.maxDistance;
            const normalizedY = deltaY / this.maxDistance;

            this.onMove(normalizedX, normalizedY);
        });

        this.container.addEventListener('touchend', () => {
            this.active = false;
            this.stick.style.transform = 'translate(0, 0)';
            this.onMove(0, 0);
        });
    }

    onMove(x, y) {
        // Override this method to handle joystick movement
    }
}
```

## Input Remapping

### Key Binding UI

**Rebind Interface:**
```
┌────────────────────────────────┐
│ Action        │ Binding         │
├────────────────────────────────┤
│ Jump          │ [Space]  [Edit] │
│ Crouch        │ [C]      [Edit] │
│ Interact      │ [E]      [Edit] │
│ Reload        │ [R]      [Edit] │
└────────────────────────────────┘
[Reset to Defaults]
```

**Rebinding Flow:**
1. Click [Edit]
2. Show "Press any key..." prompt
3. Capture key press
4. Check for conflicts
5. Confirm or cancel
6. Update binding

**Implementation Example:**
```csharp
public class KeyRebinder : MonoBehaviour
{
    private bool isWaitingForInput = false;
    private string actionToRebind;

    public void StartRebind(string action)
    {
        isWaitingForInput = true;
        actionToRebind = action;
        // Show "Press any key" UI
    }

    private void Update()
    {
        if (isWaitingForInput)
        {
            if (Input.anyKeyDown)
            {
                foreach (KeyCode key in System.Enum.GetValues(typeof(KeyCode)))
                {
                    if (Input.GetKeyDown(key))
                    {
                        RebindKey(actionToRebind, key);
                        isWaitingForInput = false;
                        break;
                    }
                }
            }
        }
    }

    private void RebindKey(string action, KeyCode newKey)
    {
        // Check for conflicts
        if (IsKeyAlreadyBound(newKey))
        {
            ShowConflictDialog(newKey);
            return;
        }

        // Update binding
        InputManager.SetBinding(action, newKey);
        SaveBindings();
    }
}
```

### Controller Remapping

**Challenges:**
- Different controller layouts (Xbox, PlayStation, Switch)
- Limited number of buttons
- Analog vs digital inputs

**Design Considerations:**
- Show controller diagram
- Highlight button being remapped
- Test binding immediately
- Provide presets for common configs

### Saving Bindings

**Persistence:**
```csharp
public class InputSettings
{
    public Dictionary<string, KeyCode> keyboardBindings;
    public Dictionary<string, int> controllerBindings;

    public void Save()
    {
        string json = JsonUtility.ToJson(this);
        PlayerPrefs.SetString("InputSettings", json);
        PlayerPrefs.Save();
    }

    public static InputSettings Load()
    {
        string json = PlayerPrefs.GetString("InputSettings", "");
        if (string.IsNullOrEmpty(json))
        {
            return GetDefaults();
        }
        return JsonUtility.FromJson<InputSettings>(json);
    }
}
```

## Input Feedback

### Visual Feedback

**Button Press:**
- Scale down slightly
- Change color/brightness
- Show press animation
- Highlight border

**Hover:**
- Scale up slightly
- Change color
- Show tooltip
- Glow effect

**Focus (Keyboard/Controller):**
- Outline or border
- Animated highlight
- Color change
- Pulsing effect

### Audio Feedback

**Sound Effects:**
- Navigate: Subtle tick or beep
- Confirm: Positive chime
- Cancel: Negative beep or whoosh
- Error: Alert sound
- Hover: Quiet click

**Volume Considerations:**
- UI sounds should be quieter than gameplay
- Provide volume slider for UI sounds
- Don't play sound on every hover (only on change)

### Haptic Feedback

**Controller Rumble:**
- Light rumble on selection
- Medium rumble on confirm
- No rumble on cancel
- Strong rumble on error

**Mobile Haptics:**
- Tap: Light haptic
- Long-press: Medium haptic
- Error: Strong haptic pattern
- Success: Success haptic pattern

**Implementation (Unity):**
```csharp
#if UNITY_ANDROID || UNITY_IOS
Handheld.Vibrate();
#endif

// Using newer API
if (SystemInfo.supportsVibration)
{
    // Light haptic
    Handheld.Vibrate();
}
```

## Accessibility

### Input Alternatives

**Options to Provide:**
- Rebindable keys/buttons
- Toggle vs hold (e.g., crouch)
- Auto-run option
- Button mashing alternatives
- Aim assist levels
- Sticky keys support

### Input Assists

**Aim Assist:**
- Magnetism (pull towards targets)
- Slowdown (reduce sensitivity near targets)
- Sticky reticle (stick to target)

**Navigation Assist:**
- Larger selection areas
- Sticky focus (harder to move off)
- Auto-scroll to focused element

**Timing Assists:**
- Extended input windows
- Button hold alternatives to rapid press
- Reduced precision requirements

### One-Handed Mode

**Considerations:**
- Cluster important actions
- Provide one-handed layouts
- Allow control scheme switching
- Support external adaptive controllers

## Cross-Platform Input

### Input Detection

**Automatic Detection:**
```csharp
public enum InputDevice
{
    KeyboardMouse,
    Controller,
    Touch
}

public class InputDetector : MonoBehaviour
{
    public InputDevice CurrentDevice { get; private set; }

    private void Update()
    {
        // Check for mouse movement
        if (Input.GetAxis("Mouse X") != 0 || Input.GetAxis("Mouse Y") != 0)
        {
            SetDevice(InputDevice.KeyboardMouse);
        }
        // Check for controller input
        else if (Input.GetJoystickNames().Length > 0 &&
                 (Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0))
        {
            SetDevice(InputDevice.Controller);
        }
        // Check for touch input
        else if (Input.touchCount > 0)
        {
            SetDevice(InputDevice.Touch);
        }
    }

    private void SetDevice(InputDevice device)
    {
        if (CurrentDevice != device)
        {
            CurrentDevice = device;
            OnInputDeviceChanged?.Invoke(device);
        }
    }

    public event Action<InputDevice> OnInputDeviceChanged;
}
```

### Unified Input Handling

**Abstraction Layer:**
```csharp
public interface IInputProvider
{
    Vector2 GetNavigationInput();
    bool GetConfirmInput();
    bool GetCancelInput();
}

public class KeyboardMouseInput : IInputProvider
{
    public Vector2 GetNavigationInput()
    {
        return new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));
    }

    public bool GetConfirmInput() => Input.GetKeyDown(KeyCode.Return);
    public bool GetCancelInput() => Input.GetKeyDown(KeyCode.Escape);
}

public class ControllerInput : IInputProvider
{
    public Vector2 GetNavigationInput()
    {
        return new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical"));
    }

    public bool GetConfirmInput() => Input.GetButtonDown("Submit");
    public bool GetCancelInput() => Input.GetButtonDown("Cancel");
}
```

## Best Practices Summary

✅ **DO:**
- Support multiple input methods simultaneously
- Provide clear visual feedback for all inputs
- Allow full key/button remapping
- Test with actual controllers and touch devices
- Implement input buffering for responsive feel
- Show appropriate button prompts per platform
- Provide accessibility options
- Save input preferences
- Handle disconnected controllers gracefully
- Use deadzone for analog sticks

❌ **DON'T:**
- Assume only one input method
- Hardcode button labels
- Ignore input when menu is transitioning
- Use tiny touch targets
- Make rapid button mashing required
- Forget to disable gameplay input in menus
- Remove haptic feedback options
- Ignore analog input precision
- Make destructive actions easy to trigger
- Use platform-specific buttons without alternatives

## Conclusion

Effective input handling ensures players can interact with game UI seamlessly regardless of their preferred input method. Provide flexibility through remapping, support multiple simultaneous inputs, and always give clear feedback. Test extensively with real devices and consider accessibility needs for all players.
