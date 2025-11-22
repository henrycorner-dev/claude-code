# Unity Project Setup Guide

Complete guide to setting up, organizing, and working with Unity projects. Covers project initialization, folder structure, scenes, prefabs, C# scripting patterns, and Unity-specific workflows.

## Project Initialization

### Creating a New Project

**Using Unity Hub (Recommended):**

1. Open Unity Hub
2. Click "New Project"
3. Select template:
   - **3D (URP)**: Modern 3D with Universal Render Pipeline
   - **3D (HDRP)**: High-definition graphics for PC/console
   - **2D**: 2D games with Tilemap support
   - **3D (Built-in)**: Legacy renderer
4. Name project and choose location
5. Click "Create Project"

**Template Selection Guide:**

- **Mobile game**: 3D (URP) or 2D
- **PC/Console AAA**: 3D (HDRP)
- **Stylized 3D**: 3D (URP)
- **2D platformer/puzzle**: 2D
- **VR/AR**: 3D (URP) with XR packages

### Initial Project Configuration

After creating project, configure essential settings:

**Editor Preferences:**

```
Edit → Preferences → External Tools
- Set External Script Editor (Visual Studio, VS Code, Rider)

Edit → Preferences → Colors
- Adjust Playmode tint for visual feedback
```

**Project Settings:**

```
Edit → Project Settings → Editor
- Version Control Mode: Visible Meta Files
- Asset Serialization: Force Text
- Enter Play Mode Options: Enable for faster iteration

Edit → Project Settings → Player
- Company Name
- Product Name
- Default Icon
```

## Folder Structure

Organize Assets/ folder for scalability and clarity.

### Recommended Structure

```
Assets/
├── _Project/                  # Project-specific assets (prefixed for top sorting)
│   ├── Scenes/
│   │   ├── _MainMenu.unity
│   │   ├── Level01.unity
│   │   └── Level02.unity
│   ├── Scripts/
│   │   ├── Core/              # Core game systems
│   │   ├── Player/            # Player-related scripts
│   │   ├── Enemies/           # Enemy scripts
│   │   ├── UI/                # UI scripts
│   │   └── Utilities/         # Helper scripts
│   ├── Prefabs/
│   │   ├── Characters/
│   │   ├── Environment/
│   │   ├── UI/
│   │   └── Effects/
│   ├── Materials/
│   ├── Textures/
│   ├── Models/
│   ├── Audio/
│   │   ├── Music/
│   │   ├── SFX/
│   │   └── Mixers/
│   ├── Animations/
│   │   ├── Controllers/       # Animator Controllers
│   │   └── Clips/             # Animation clips
│   ├── UI/
│   │   ├── Sprites/
│   │   ├── Fonts/
│   │   └── Prefabs/
│   └── Resources/             # Runtime-loaded assets (use sparingly)
├── Plugins/                   # Third-party plugins
├── StreamingAssets/           # Files loaded at runtime as-is
└── Editor/                    # Editor-only scripts
```

### Naming Conventions

**Files and Folders:**

- **PascalCase** for scripts: `PlayerController.cs`, `GameManager.cs`
- **PascalCase** for prefabs: `PlayerCharacter.prefab`, `EnemyZombie.prefab`
- **PascalCase** for scenes: `MainMenu.unity`, `Level01.unity`
- **lowercase with underscores** for textures: `player_diffuse.png`, `wall_normal.png`

**Prefixes for Organization:**

- Scenes: `_` prefix for main scenes: `_MainMenu.unity`, `_GameScene.unity`
- UI: `UI_` prefix: `UI_HealthBar.prefab`
- Managers: `Manager` suffix: `AudioManager.cs`, `GameManager.cs`

## Scene Organization

### Scene Hierarchy Structure

Organize GameObjects in scenes using empty parents:

```
SampleScene
├── --- MANAGERS ---
│   ├── GameManager
│   ├── AudioManager
│   └── UIManager
├── --- ENVIRONMENT ---
│   ├── Terrain
│   ├── Props
│   │   ├── Building01
│   │   └── Building02
│   └── Lighting
│       ├── Directional Light
│       └── ReflectionProbe
├── --- GAMEPLAY ---
│   ├── Player
│   ├── Enemies
│   │   ├── Enemy01
│   │   └── Enemy02
│   ├── Pickups
│   └── Triggers
├── --- UI ---
│   ├── Canvas
│   │   ├── HUD
│   │   ├── PauseMenu
│   │   └── GameOverScreen
│   └── EventSystem
└── --- CAMERAS ---
    ├── Main Camera
    └── Minimap Camera
```

**Benefits:**

- Clear visual separation
- Easy to find objects
- Collapsible sections
- Consistent across scenes

### Multi-Scene Setup

Use additive scene loading for large projects:

**Scene Structure:**

- `_Persistent.unity` - Managers, never unloaded
- `MainMenu.unity` - Main menu UI
- `Level01.unity` - Gameplay level
- `Level01_Lighting.unity` - Baked lighting data
- `Level01_Audio.unity` - Audio sources

**Loading Scenes:**

```csharp
using UnityEngine.SceneManagement;

// Load scene additively
SceneManager.LoadScene("Level01", LoadSceneMode.Additive);

// Unload scene
SceneManager.UnloadSceneAsync("MainMenu");

// Set active scene (for lighting)
Scene scene = SceneManager.GetSceneByName("Level01");
SceneManager.SetActiveScene(scene);
```

## C# Scripting Patterns

### MonoBehaviour Basics

**Standard MonoBehaviour Template:**

```csharp
using UnityEngine;

public class ExampleScript : MonoBehaviour
{
    [Header("Configuration")]
    [SerializeField] private float speed = 5f;
    [SerializeField] private int health = 100;

    [Header("References")]
    [SerializeField] private GameObject target;
    [SerializeField] private AudioClip soundEffect;

    private Rigidbody rb;
    private bool isInitialized;

    private void Awake()
    {
        // Get components and initialize
        rb = GetComponent<Rigidbody>();
    }

    private void Start()
    {
        // Setup after all Awake() calls
        isInitialized = true;
    }

    private void Update()
    {
        // Per-frame logic (input, non-physics)
        if (isInitialized)
        {
            HandleInput();
        }
    }

    private void FixedUpdate()
    {
        // Physics-based logic (runs at fixed timestep)
        ApplyMovement();
    }

    private void OnEnable()
    {
        // Subscribe to events
    }

    private void OnDisable()
    {
        // Unsubscribe from events
    }

    private void OnDestroy()
    {
        // Cleanup
    }

    private void HandleInput()
    {
        // Input logic here
    }

    private void ApplyMovement()
    {
        // Movement logic here
    }
}
```

### Lifecycle Methods Order

Unity calls MonoBehaviour methods in specific order:

1. `Awake()` - First call, get components
2. `OnEnable()` - When object/script enabled
3. `Start()` - Before first frame, after all Awake()
4. `FixedUpdate()` - Fixed timestep (physics)
5. `Update()` - Every frame
6. `LateUpdate()` - After all Update()
7. `OnDisable()` - When object/script disabled
8. `OnDestroy()` - When object destroyed

### Singleton Pattern (Manager)

**Persistent singleton manager:**

```csharp
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Game State")]
    public int Score { get; private set; }
    public int Lives { get; private set; }

    private void Awake()
    {
        // Singleton pattern
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeManager();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeManager()
    {
        Score = 0;
        Lives = 3;
    }

    public void AddScore(int points)
    {
        Score += points;
        Debug.Log($"Score: {Score}");
    }

    public void LoseLife()
    {
        Lives--;
        if (Lives <= 0)
        {
            GameOver();
        }
    }

    private void GameOver()
    {
        Debug.Log("Game Over!");
        // Handle game over logic
    }
}
```

**Usage:**

```csharp
GameManager.Instance.AddScore(100);
```

### ScriptableObject for Data

**Defining data container:**

```csharp
using UnityEngine;

[CreateAssetMenu(fileName = "NewWeapon", menuName = "Game/Weapon")]
public class WeaponData : ScriptableObject
{
    [Header("Weapon Stats")]
    public string weaponName;
    public int damage = 10;
    public float fireRate = 0.5f;
    public int ammoCapacity = 30;

    [Header("Visuals")]
    public GameObject prefab;
    public Sprite icon;
    public AudioClip fireSound;

    [Header("Effects")]
    public GameObject muzzleFlash;
    public GameObject impactEffect;
}
```

**Using ScriptableObject:**

```csharp
public class Gun : MonoBehaviour
{
    [SerializeField] private WeaponData weaponData;
    private int currentAmmo;

    private void Start()
    {
        currentAmmo = weaponData.ammoCapacity;
    }

    public void Fire()
    {
        if (currentAmmo > 0)
        {
            // Use weaponData.damage, weaponData.fireSound, etc.
            currentAmmo--;
        }
    }
}
```

**Benefits:**

- Reusable data across scenes
- Easy to tweak in Inspector
- Saves memory (single instance)
- Designer-friendly

### Event System

**Using UnityEvents:**

```csharp
using UnityEngine;
using UnityEngine.Events;

public class Health : MonoBehaviour
{
    [SerializeField] private int maxHealth = 100;
    private int currentHealth;

    [Header("Events")]
    public UnityEvent<int> OnHealthChanged;
    public UnityEvent OnDeath;

    private void Start()
    {
        currentHealth = maxHealth;
    }

    public void TakeDamage(int damage)
    {
        currentHealth -= damage;
        currentHealth = Mathf.Max(0, currentHealth);

        OnHealthChanged?.Invoke(currentHealth);

        if (currentHealth <= 0)
        {
            OnDeath?.Invoke();
        }
    }

    public void Heal(int amount)
    {
        currentHealth += amount;
        currentHealth = Mathf.Min(maxHealth, currentHealth);
        OnHealthChanged?.Invoke(currentHealth);
    }
}
```

**Connecting in Inspector or Code:**

```csharp
health.OnHealthChanged.AddListener(UpdateHealthBar);
health.OnDeath.AddListener(HandlePlayerDeath);
```

### Coroutines

**Basic coroutine pattern:**

```csharp
using System.Collections;
using UnityEngine;

public class CoroutineExample : MonoBehaviour
{
    private void Start()
    {
        StartCoroutine(CountdownCoroutine(5f));
    }

    private IEnumerator CountdownCoroutine(float duration)
    {
        float elapsed = 0f;

        while (elapsed < duration)
        {
            Debug.Log($"Time remaining: {duration - elapsed:F1}");
            yield return new WaitForSeconds(1f);
            elapsed += 1f;
        }

        Debug.Log("Countdown complete!");
    }

    // Stopping coroutines
    private Coroutine myCoroutine;

    private void StartMyCoroutine()
    {
        if (myCoroutine != null)
        {
            StopCoroutine(myCoroutine);
        }
        myCoroutine = StartCoroutine(MyCoroutine());
    }

    private IEnumerator MyCoroutine()
    {
        // Coroutine logic
        yield return null;
    }
}
```

**Common yield types:**

- `yield return null;` - Wait one frame
- `yield return new WaitForSeconds(1f);` - Wait 1 second
- `yield return new WaitForFixedUpdate();` - Wait for next FixedUpdate
- `yield return new WaitUntil(() => condition);` - Wait until condition true
- `yield return StartCoroutine(OtherCoroutine());` - Wait for another coroutine

## Prefab Workflows

### Creating Prefabs

**Method 1: Drag to Project:**

1. Configure GameObject in scene
2. Drag from Hierarchy to Project window (Assets/Prefabs/)
3. GameObject becomes blue (prefab instance)

**Method 2: Prefab Mode:**

1. Right-click in Project → Create → Prefab
2. Double-click prefab to enter Prefab Mode
3. Add components and configure
4. Save and exit

### Prefab Variants

Create variations of base prefabs:

1. Create base prefab: `Enemy.prefab`
2. Right-click prefab → Create → Prefab Variant
3. Name variant: `EnemyFast.prefab`
4. Override properties (e.g., speed = 10)

**Benefits:**

- Inherit changes from base prefab
- Override specific properties
- Maintain consistency across variants

### Nested Prefabs

Compose complex prefabs from simpler ones:

```
CarPrefab
├── Body (nested prefab: CarBody.prefab)
├── Wheels
│   ├── WheelFrontLeft (nested prefab: Wheel.prefab)
│   ├── WheelFrontRight (nested prefab: Wheel.prefab)
│   ├── WheelBackLeft (nested prefab: Wheel.prefab)
│   └── WheelBackRight (nested prefab: Wheel.prefab)
└── Engine (nested prefab: EngineV8.prefab)
```

Changes to `Wheel.prefab` propagate to all car prefabs.

### Instantiating Prefabs

**At runtime:**

```csharp
[SerializeField] private GameObject enemyPrefab;
[SerializeField] private Transform spawnPoint;

private void SpawnEnemy()
{
    GameObject enemy = Instantiate(enemyPrefab, spawnPoint.position, spawnPoint.rotation);

    // Optionally parent to an object
    enemy.transform.SetParent(enemiesContainer);

    // Access components
    Enemy enemyScript = enemy.GetComponent<Enemy>();
    enemyScript.Initialize(100);
}
```

**Object pooling for performance:**

```csharp
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool : MonoBehaviour
{
    [SerializeField] private GameObject prefab;
    [SerializeField] private int poolSize = 10;

    private Queue<GameObject> pool = new Queue<GameObject>();

    private void Start()
    {
        // Pre-instantiate objects
        for (int i = 0; i < poolSize; i++)
        {
            GameObject obj = Instantiate(prefab);
            obj.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public GameObject Get()
    {
        if (pool.Count > 0)
        {
            GameObject obj = pool.Dequeue();
            obj.SetActive(true);
            return obj;
        }
        else
        {
            // Pool empty, instantiate new
            return Instantiate(prefab);
        }
    }

    public void Return(GameObject obj)
    {
        obj.SetActive(false);
        pool.Enqueue(obj);
    }
}
```

## Inspector Customization

### Attributes for Better Inspector

**Common attributes:**

```csharp
using UnityEngine;

public class InspectorExample : MonoBehaviour
{
    [Header("Movement Settings")]
    [Tooltip("Speed in units per second")]
    [SerializeField] private float speed = 5f;

    [Range(0f, 10f)]
    [SerializeField] private float jumpHeight = 2f;

    [Space(10)]

    [Header("References")]
    [SerializeField] private GameObject target;

    [Header("Hidden in Inspector")]
    [HideInInspector] public int hiddenValue;

    [Header("Read-Only Display")]
    [SerializeField] private int score; // Can view but not edit at runtime

    [Header("Multi-line Text")]
    [TextArea(3, 10)]
    [SerializeField] private string description;

    [Header("Color Picker")]
    [ColorUsage(true, true)] // HDR color
    [SerializeField] private Color glowColor;
}
```

### Custom Property Drawers

**Simple custom drawer:**

```csharp
using UnityEngine;

// Define attribute
public class ReadOnlyAttribute : PropertyAttribute { }

#if UNITY_EDITOR
using UnityEditor;

// Custom drawer
[CustomPropertyDrawer(typeof(ReadOnlyAttribute))]
public class ReadOnlyDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        GUI.enabled = false;
        EditorGUI.PropertyField(position, property, label, true);
        GUI.enabled = true;
    }
}
#endif
```

**Usage:**

```csharp
[ReadOnly]
[SerializeField] private int currentScore;
```

## Package Management

### Installing Packages

**Package Manager:**

```
Window → Package Manager
- Unity Registry: Official Unity packages
- My Assets: Asset Store downloads
- In Project: Currently installed
```

**Common packages:**

- **TextMeshPro**: Better text rendering
- **Cinemachine**: Advanced camera system
- **Input System**: Modern input handling
- **Addressables**: Asset loading and management
- **Universal RP**: Modern rendering pipeline

**Install via manifest.json:**

```json
{
  "dependencies": {
    "com.unity.textmeshpro": "3.0.6",
    "com.unity.cinemachine": "2.8.9",
    "com.unity.inputsystem": "1.4.4"
  }
}
```

## Build Settings

### Configuring Scenes

```
File → Build Settings
- Add Open Scenes (or drag scenes)
- Scene 0 is the entry point (usually MainMenu)
```

### Player Settings

```
Edit → Project Settings → Player

Company Name: YourCompany
Product Name: YourGame
Version: 1.0.0
Default Icon: (set icon)

Per-Platform Settings:
- Standalone: Resolution, splash screen
- iOS: Bundle ID, signing
- Android: Package name, keystore
```

## Common Workflows

### Input Handling (New Input System)

**Install Input System package, then:**

```csharp
using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerInput : MonoBehaviour
{
    private PlayerInputActions inputActions;
    private Vector2 moveInput;

    private void Awake()
    {
        inputActions = new PlayerInputActions();
    }

    private void OnEnable()
    {
        inputActions.Player.Enable();
        inputActions.Player.Move.performed += OnMove;
        inputActions.Player.Move.canceled += OnMove;
        inputActions.Player.Jump.performed += OnJump;
    }

    private void OnDisable()
    {
        inputActions.Player.Disable();
    }

    private void OnMove(InputAction.CallbackContext context)
    {
        moveInput = context.ReadValue<Vector2>();
    }

    private void OnJump(InputAction.CallbackContext context)
    {
        // Handle jump
    }
}
```

### Animation with Animator

**Set up Animator Controller:**

1. Create Animator Controller: Assets → Create → Animator Controller
2. Open Animator window: Window → Animation → Animator
3. Create states: Right-click → Create State → Empty
4. Add transitions: Right-click state → Make Transition
5. Add parameters: Parameters tab → + → Float/Int/Bool/Trigger

**Controlling from code:**

```csharp
private Animator animator;

private void Start()
{
    animator = GetComponent<Animator>();
}

private void Update()
{
    // Set parameters
    animator.SetFloat("Speed", speed);
    animator.SetBool("IsGrounded", isGrounded);
    animator.SetTrigger("Jump");

    // Get current state
    AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);
    if (stateInfo.IsName("Idle"))
    {
        // Currently in Idle state
    }
}
```

## Performance Best Practices

**General:**

- Cache component references in Awake/Start (don't use GetComponent every frame)
- Use object pooling for frequently instantiated objects
- Disable unnecessary components when not needed
- Use layers and tags for efficient queries

**Physics:**

- Use FixedUpdate() for physics
- Reduce Rigidbody.maxAngularVelocity if not needed
- Use Discrete collision detection for fast-moving objects
- Simplify collision meshes

**Rendering:**

- Use static batching for non-moving objects
- Enable GPU instancing on materials
- Use atlased textures
- Reduce draw calls with batching

## Troubleshooting

**Script not working:**

- Check Console for errors (Window → General → Console)
- Ensure script attached to GameObject
- Check spelling of methods (case-sensitive)

**Prefab overrides not applying:**

- Check if value is overridden (blue indicator)
- Use "Apply All" to push changes to prefab

**NullReferenceException:**

- Component not assigned in Inspector
- GetComponent() returning null
- Object destroyed but still referenced

**Scene not loading:**

- Scene not added to Build Settings
- Incorrect scene name in LoadScene()

## Further Reading

- **Unity Manual**: Official documentation
- **Unity Learn**: Free tutorials and courses
- **Unity Scripting API**: Complete API reference
- **Unity Blog**: Best practices and updates

## See Also

- `build-pipelines.md` - Building Unity projects for multiple platforms
- `version-control.md` - Git setup for Unity
- `scripting-patterns.md` - Advanced C# patterns
- `performance.md` - Profiling and optimization
