# Unreal Engine Project Setup Guide

Complete guide to setting up, organizing, and working with Unreal Engine projects. Covers project initialization, Content folder organization, Blueprints, C++ integration, Actor/Component patterns, and Unreal-specific workflows.

## Project Initialization

### Creating a New Project

**Using Epic Games Launcher:**
1. Open Epic Games Launcher
2. Navigate to Unreal Engine → Library
3. Click "Launch" on desired engine version
4. In Unreal Project Browser, select template:
   - **Games → First Person**: FPS template with player controller
   - **Games → Third Person**: Third-person template
   - **Games → Blank**: Empty project
   - **Film/Video → Blank**: Cinematic/architectural viz
5. Configure:
   - Blueprint or C++
   - Target Platform (Desktop, Mobile, Console)
   - Quality (Maximum, Scalable)
   - Starter Content (include for quick prototyping)
6. Name project and choose location
7. Click "Create"

**Template Selection Guide:**
- **Prototype/Learning**: First Person or Third Person (includes player controller)
- **Custom Game**: Blank (start from scratch)
- **Mobile Game**: Blank → Mobile/Tablet, Scalable quality
- **AAA PC/Console**: Blank → Desktop/Console, Maximum quality
- **Architectural Viz**: Blank → Desktop, Maximum quality, include Starter Content

### Blueprint vs C++ Project

**Blueprint Project:**
- Pure visual scripting
- Faster prototyping
- Designer-friendly
- Can add C++ later

**C++ Project:**
- Performance-critical code in C++
- Blueprint for designers
- Requires Visual Studio (Windows) or Xcode (Mac)
- Recommended for large/complex projects

**Hybrid Approach (Recommended):**
- Core systems in C++
- Game logic in Blueprints
- Best of both worlds

## Content Folder Structure

Organize Content/ folder for scalability.

### Recommended Structure

```
Content/
├── _Core/                     # Core systems (prefixed for top sorting)
│   ├── GameModes/
│   ├── PlayerControllers/
│   ├── GameStates/
│   └── GameInstances/
├── Characters/
│   ├── Player/
│   │   ├── Animations/
│   │   ├── Blueprints/
│   │   ├── Materials/
│   │   └── Meshes/
│   └── Enemies/
│       ├── Zombie/
│       └── Soldier/
├── Environment/
│   ├── Props/
│   ├── Foliage/
│   ├── Landscapes/
│   └── Architecture/
├── UI/
│   ├── Widgets/
│   ├── Textures/
│   └── Fonts/
├── Audio/
│   ├── Music/
│   ├── SFX/
│   └── Dialogues/
├── VFX/                       # Visual effects
│   ├── Particles/
│   ├── Niagara/
│   └── Materials/
├── Levels/
│   ├── _MainMenu
│   ├── Level01
│   └── TestMaps/
├── Materials/
│   ├── Master/                # Master materials
│   ├── Instances/             # Material instances
│   ├── Functions/             # Material functions
│   └── Textures/
└── Blueprints/
    ├── Core/
    ├── Gameplay/
    ├── Utilities/
    └── Interfaces/
```

### Naming Conventions

**Prefixes by asset type:**
- **BP_** - Blueprint: `BP_PlayerCharacter`, `BP_GameMode`
- **M_** - Material: `M_CharacterSkin`, `M_Wall`
- **MI_** - Material Instance: `MI_CharacterSkin_Red`
- **T_** - Texture: `T_Character_Diffuse`, `T_Wall_Normal`
- **SM_** - Static Mesh: `SM_Rock`, `SM_Building`
- **SK_** - Skeletal Mesh: `SK_Character`, `SK_Enemy`
- **AC_** - Animation Composite: `AC_Character_Idle`
- **AM_** - Animation Montage: `AM_Character_Attack`
- **ABP_** - Animation Blueprint: `ABP_Character`
- **WBP_** - Widget Blueprint (UI): `WBP_MainMenu`, `WBP_HealthBar`
- **BPI_** - Blueprint Interface: `BPI_Damageable`
- **E_** - Enum: `E_WeaponType`
- **S_** - Struct: `S_WeaponData`
- **SFX_** - Sound Effect: `SFX_Gunshot`, `SFX_Footstep`
- **MUS_** - Music: `MUS_MainTheme`

**PascalCase for everything:** `BP_PlayerCharacter`, `M_MetalShiny`

## Level Organization

### Level (Map) Hierarchy

**Organizing actors in levels:**

```
Level01 (Persistent Level)
├── Lighting
│   ├── DirectionalLight (Sun)
│   ├── SkyLight
│   ├── LightmassImportanceVolume
│   └── PostProcessVolume
├── Environment
│   ├── Landscape
│   ├── Foliage
│   └── StaticMeshes
│       ├── Buildings
│       ├── Props
│       └── Terrain
├── Gameplay
│   ├── PlayerStart
│   ├── Triggers
│   ├── Pickups
│   └── Enemies
├── Audio
│   ├── AmbientSoundActors
│   └── AudioVolumes
└── NavMesh
    └── NavMeshBoundsVolume
```

**Use folders in World Outliner:**
- Right-click → Create Folder
- Drag actors into folders
- Collapse folders for clean outliner

### Level Streaming

Use level streaming for large worlds:

**Types:**
- **Always Loaded**: Core level with lighting, game mode
- **Blueprint Streaming**: Load/unload via Blueprint
- **Distance Streaming**: Auto-load based on player proximity

**Example setup:**
1. Create persistent level: `Level01_Persistent`
2. Create sub-levels:
   - `Level01_Lighting` (always loaded)
   - `Level01_Geometry` (blueprint streaming)
   - `Level01_Audio` (distance streaming)
3. Window → Levels → Add existing level
4. Right-click level → Change Streaming Method

**Loading level via Blueprint:**
```
Load Stream Level (Level01_Geometry, Make Visible After Load, Should Block on Load)
```

## Blueprint Basics

### Blueprint Types

**Level Blueprint:**
- One per level
- Level-specific logic
- Access via Blueprints → Open Level Blueprint

**Blueprint Class:**
- Reusable actor/object
- Placed in levels
- Create: Content Browser → Blueprint Class

**Common Blueprint Classes:**
- **Actor**: Placeable in level (props, pickups)
- **Pawn**: Controlled by player/AI (characters, vehicles)
- **Character**: Pawn with movement component (humanoid characters)
- **PlayerController**: Handles player input
- **Game Mode**: Defines game rules
- **Widget**: UI elements

### Creating a Blueprint

**Example: Pickup Item Actor**

1. Content Browser → Right-click → Blueprint Class → Actor
2. Name: `BP_Pickup`
3. Double-click to open Blueprint Editor

**Blueprint Editor sections:**
- **Viewport**: Visual preview
- **Components**: Hierarchy of components
- **Event Graph**: Visual scripting
- **Construction Script**: Runs when placed/moved

**Add components:**
1. Components panel → Add Component → Static Mesh
2. Rename to "Mesh"
3. In Details, set Static Mesh to desired mesh
4. Add Component → Box Collision
5. Rename to "CollisionBox"

**Add logic in Event Graph:**
```
Event BeginPlay
  → Set Actor Enable Collision (Enabled)

Event ActorBeginOverlap
  → Cast to (ThirdPersonCharacter)
    → [Success] Call Function (OnPickup)
    → Destroy Actor
```

### Blueprint Variables

**Creating variables:**
1. My Blueprint panel → + Variable
2. Name: `PickupValue`
3. Variable Type: Integer
4. Default Value: 100
5. Make Public: Eye icon (expose to editor)
6. Category: "Pickup Settings"

**Variable types:**
- **Boolean**: True/false
- **Integer**: Whole numbers
- **Float**: Decimals
- **String**: Text
- **Vector**: 3D coordinates
- **Object Reference**: Reference to actor/component
- **Array**: List of values

### Blueprint Functions

**Creating custom functions:**
1. My Blueprint → + Function
2. Name: `GivePoints`
3. Add input: `Points` (Integer)
4. Drag from entry node to add logic

**Using functions:**
```
Event ActorBeginOverlap
  → Cast to PlayerCharacter
    → [Success] Call GivePoints (PickupValue)
    → Destroy Actor
```

### Blueprint Events

**Common events:**
- **Event BeginPlay**: Actor spawned/level loaded
- **Event Tick**: Every frame
- **Event ActorBeginOverlap**: Collision starts
- **Event ActorEndOverlap**: Collision ends
- **Event AnyDamage**: Actor takes damage

**Custom events:**
1. My Blueprint → + Event Dispatcher or Custom Event
2. Use to trigger logic from other Blueprints

## C++ Integration

### Setting Up C++ Development

**Requirements:**
- **Windows**: Visual Studio 2019/2022 with C++ tools
- **Mac**: Xcode with command-line tools

**Generate Visual Studio files:**
1. Right-click .uproject file → Generate Visual Studio project files
2. Open .sln file in Visual Studio

### Creating C++ Class

**From Unreal Editor:**
1. Tools → New C++ Class
2. Choose parent class (Actor, Pawn, Character, etc.)
3. Name class (e.g., `PickupBase`)
4. Public or Private
5. Click Create Class

**Editor generates:**
- `PickupBase.h` (header)
- `PickupBase.cpp` (implementation)

### Basic C++ Actor

**PickupBase.h:**
```cpp
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "PickupBase.generated.h"

UCLASS()
class MYGAME_API APickupBase : public AActor
{
    GENERATED_BODY()

public:
    APickupBase();

    // Exposed to Blueprint
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Pickup")
    int32 PickupValue;

    // Called by Blueprint
    UFUNCTION(BlueprintCallable, Category = "Pickup")
    void OnPickup(AActor* Collector);

protected:
    virtual void BeginPlay() override;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UStaticMeshComponent* MeshComponent;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    class UBoxComponent* CollisionBox;

public:
    virtual void Tick(float DeltaTime) override;

private:
    UFUNCTION()
    void OnOverlapBegin(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
        UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
        const FHitResult& SweepResult);
};
```

**PickupBase.cpp:**
```cpp
#include "PickupBase.h"
#include "Components/StaticMeshComponent.h"
#include "Components/BoxComponent.h"

APickupBase::APickupBase()
{
    PrimaryActorTick.bCanEverTick = false;

    // Create components
    MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("Mesh"));
    RootComponent = MeshComponent;

    CollisionBox = CreateDefaultSubobject<UBoxComponent>(TEXT("CollisionBox"));
    CollisionBox->SetupAttachment(MeshComponent);

    // Default values
    PickupValue = 100;
}

void APickupBase::BeginPlay()
{
    Super::BeginPlay();

    // Bind overlap event
    CollisionBox->OnComponentBeginOverlap.AddDynamic(this, &APickupBase::OnOverlapBegin);
}

void APickupBase::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void APickupBase::OnOverlapBegin(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
    UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, bool bFromSweep,
    const FHitResult& SweepResult)
{
    if (OtherActor && OtherActor != this)
    {
        OnPickup(OtherActor);
        Destroy();
    }
}

void APickupBase::OnPickup(AActor* Collector)
{
    // Implement pickup logic or override in Blueprint
    UE_LOG(LogTemp, Warning, TEXT("Pickup collected!"));
}
```

### UPROPERTY Specifiers

**Common specifiers:**
- `EditAnywhere`: Editable in details panel and Blueprint defaults
- `EditDefaultsOnly`: Only in Blueprint defaults
- `EditInstanceOnly`: Only in placed instances
- `VisibleAnywhere`: Visible but not editable
- `BlueprintReadOnly`: Readable in Blueprint
- `BlueprintReadWrite`: Readable and writable in Blueprint
- `Category = "CategoryName"`: Organize in details panel

### UFUNCTION Specifiers

**Common specifiers:**
- `BlueprintCallable`: Can call from Blueprint
- `BlueprintPure`: Pure function (no execution pin)
- `BlueprintImplementableEvent`: Implemented in Blueprint
- `BlueprintNativeEvent`: C++ base, can override in Blueprint
- `Category = "CategoryName"`: Organize in Blueprint palette

### Blueprint Extending C++ Classes

**Create Blueprint from C++ class:**
1. Content Browser → Right-click C++ class (`PickupBase`)
2. Create Blueprint class based on PickupBase
3. Name: `BP_Pickup_Coin`

**Override functions in Blueprint:**
- If function is `BlueprintImplementableEvent`, implement in Blueprint Event Graph
- C++ provides default, Blueprint can customize

## Actor and Component Architecture

### Actor Lifecycle

**Order of execution:**
1. **Constructor** (`AMyActor::AMyActor()`) - Create components, set defaults
2. **PostInitializeComponents()** - After all components initialized
3. **BeginPlay()** - Actor spawned and ready
4. **Tick()** - Every frame (if enabled)
5. **EndPlay()** - Actor destroyed or level unloaded
6. **Destructor** - Cleanup

### Component Pattern

**Creating custom component (C++):**

**MyMovementComponent.h:**
```cpp
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "MyMovementComponent.generated.h"

UCLASS( ClassGroup=(Custom), meta=(BlueprintSpawnableComponent) )
class MYGAME_API UMyMovementComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UMyMovementComponent();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
    float Speed;

    UFUNCTION(BlueprintCallable, Category = "Movement")
    void MoveForward(float Value);

protected:
    virtual void BeginPlay() override;

public:
    virtual void TickComponent(float DeltaTime, ELevelTick TickType,
        FActorComponentTickFunction* ThisTickFunction) override;

private:
    AActor* OwnerActor;
};
```

**Using component:**
```cpp
// In Actor constructor
MyMovementComponent = CreateDefaultSubobject<UMyMovementComponent>(TEXT("MyMovement"));

// In BeginPlay or elsewhere
MyMovementComponent->MoveForward(1.0f);
```

### Blueprint Interfaces

**Create Blueprint Interface:**
1. Content Browser → Blueprint → Blueprint Interface
2. Name: `BPI_Damageable`
3. Add function: `TakeDamage` with input `DamageAmount` (Float)

**Implement in Blueprint:**
1. Open Blueprint → Class Settings → Interfaces → Add `BPI_Damageable`
2. My Blueprint → Interfaces → TakeDamage → Implement

**Call interface from another Blueprint:**
```
Target Actor → Does Implement Interface (BPI_Damageable)
  → [True] Send Message (TakeDamage, DamageAmount = 50.0)
```

**Benefits:**
- Communicate between Blueprints without direct references
- Polymorphism (different actors respond differently)

## Game Framework Classes

### Game Mode

**Purpose:** Defines game rules, win conditions, spawning

**Create custom Game Mode:**
1. Blueprint Class → Game Mode Base
2. Name: `BP_GameMode`

**Set as default:**
- Project Settings → Maps & Modes → Default GameMode → `BP_GameMode`

**Override in level:**
- World Settings → Game Mode Override → `BP_GameMode`

**Common overrides:**
- `BeginPlay`: Initialize game state
- `PostLogin`: Player joins
- `Logout`: Player leaves

### Player Controller

**Purpose:** Handles player input, camera control

**Create custom Player Controller:**
1. Blueprint Class → Player Controller
2. Name: `BP_PlayerController`

**Assign in Game Mode:**
- `BP_GameMode` → Details → Player Controller Class → `BP_PlayerController`

**Input handling:**
```
Event InputAction Fire
  → Get Controlled Pawn
    → Cast to BP_PlayerCharacter
      → Call Fire Weapon
```

### Game State and Player State

**Game State:**
- Replicated game data (score, time remaining)
- Create: Blueprint Class → Game State Base

**Player State:**
- Per-player data (kills, deaths, level)
- Create: Blueprint Class → Player State

## Enhanced Input System (UE5)

### Setting Up Enhanced Input

**Enable plugin:**
1. Edit → Plugins → Search "Enhanced Input"
2. Enable and restart

**Create Input Action:**
1. Content Browser → Input → Input Action
2. Name: `IA_Move`
3. Value Type: Axis2D (for movement)

**Create Input Mapping Context:**
1. Input → Input Mapping Context
2. Name: `IMC_Default`
3. Add mapping: `IA_Move` → Keyboard `W/A/S/D`

### Using Enhanced Input in C++

**PlayerController setup:**
```cpp
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "InputMappingContext.h"

void AMyPlayerController::BeginPlay()
{
    Super::BeginPlay();

    // Get Enhanced Input Subsystem
    if (UEnhancedInputLocalPlayerSubsystem* Subsystem =
        ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(GetLocalPlayer()))
    {
        // Add mapping context
        Subsystem->AddMappingContext(DefaultMappingContext, 0);
    }
}

void AMyPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();

    if (UEnhancedInputComponent* EnhancedInput = CastChecked<UEnhancedInputComponent>(InputComponent))
    {
        // Bind actions
        EnhancedInput->BindAction(MoveAction, ETriggerEvent::Triggered, this, &AMyPlayerController::Move);
        EnhancedInput->BindAction(JumpAction, ETriggerEvent::Started, this, &AMyPlayerController::Jump);
    }
}

void AMyPlayerController::Move(const FInputActionValue& Value)
{
    FVector2D MovementVector = Value.Get<FVector2D>();

    // Forward/backward
    AddMovementInput(GetActorForwardVector(), MovementVector.Y);

    // Left/right
    AddMovementInput(GetActorRightVector(), MovementVector.X);
}
```

## Animation Blueprint

### Creating Animation Blueprint

1. Content Browser → Animation → Animation Blueprint
2. Skeleton: Select character skeleton
3. Name: `ABP_Character`

**Animation Blueprint sections:**
- **AnimGraph**: Blend animations
- **EventGraph**: Logic and calculations

### State Machine

**AnimGraph setup:**
1. Add node: State Machine
2. Double-click to enter state machine
3. Add states: Idle, Walk, Jump
4. Create transitions between states

**Transition rules:**
```
Idle → Walk
  Rule: Speed > 0.1

Walk → Idle
  Rule: Speed < 0.1
```

### Blend Spaces

**Create Blend Space (1D or 2D):**
1. Animation → Blend Space 1D
2. Add animations to grid
3. Preview by moving marker

**Use in AnimGraph:**
- Add Blend Space node
- Connect Speed variable to input

## Performance Best Practices

**Blueprints:**
- Minimize Event Tick usage (use timers instead)
- Cache references (don't use GetAllActorsOfClass every frame)
- Use Blueprint Nativization for shipping builds

**C++:**
- Prefer C++ for performance-critical code
- Use object pooling for frequently spawned actors
- Profile with Unreal Insights (Window → Developer Tools → Insights)

**Rendering:**
- Use LODs (Level of Detail) for meshes
- Enable Hierarchical LOD (HLOD) for large scenes
- Bake lighting (Lightmass) for static scenes
- Use Nanite and Lumen (UE5) for auto-LOD and dynamic lighting

## Troubleshooting

**Blueprint not compiling:**
- Check for red error nodes
- Ensure variable types match
- Click "Compile" button

**C++ compile errors:**
- Ensure #include statements correct
- Regenerate project files (right-click .uproject)
- Clean and rebuild solution

**Actor not visible in level:**
- Check Hidden in Game setting (Details → Rendering)
- Ensure mesh assigned to Static/Skeletal Mesh Component
- Check collision (may be hidden by geometry)

**Hot reload not working:**
- Close editor
- Compile in Visual Studio
- Reopen editor (more reliable than hot reload)

## Further Reading

- **Unreal Engine Documentation**: Official docs
- **Unreal Online Learning**: Free courses
- **Unreal C++ API**: Complete API reference
- **Unreal Community Wiki**: Community tutorials

## See Also

- `build-pipelines.md` - Packaging Unreal projects for platforms
- `version-control.md` - Git/Perforce setup for Unreal
- `scripting-patterns.md` - Advanced Blueprint and C++ patterns
- `performance.md` - Profiling and optimization techniques
