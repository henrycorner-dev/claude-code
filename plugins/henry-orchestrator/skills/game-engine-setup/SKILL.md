---
name: game-engine-setup
description: This skill should be used when the user asks to "set up Unity project", "create Unity scene", "configure build pipeline", "build for iOS", "build for Android", "create player controller", "set up Git for Unity", "Unreal Blueprint", "Unreal C++", "Godot project", "set up game engine", or mentions Unity scenes, Unreal levels, build configurations, or cross-platform builds.
version: 0.1.0
---

# Game Engine Setup Skill

This skill provides specialized knowledge for setting up, configuring, and building game projects in Unity, Unreal Engine, and Godot. It covers project initialization, scene/level organization, scripting patterns, build pipelines for multiple platforms, and version control integration.

## Purpose

Game engine setup is complex because it involves:
- Engine-specific project structures and conventions
- Organizing scenes, prefabs, assets, and scripts
- Platform-specific build configurations (iOS, Android, Windows, Mac, consoles)
- Version control setup tailored to game engines (large files, binary assets)
- Scripting patterns that vary by engine (MonoBehaviours, Actors, Nodes)
- Performance considerations and optimization workflows

This skill guides the setup and configuration of game projects using industry best practices.

## Core Concepts

### Engine Comparison

**Unity:**
- C# scripting with MonoBehaviour component system
- Scene-based architecture with GameObjects and Prefabs
- Mature asset store and extensive third-party support
- Strong for 2D, mobile, and cross-platform games
- Inspector-based workflow

**Unreal Engine:**
- Blueprint visual scripting or C++ programming
- Level-based architecture with Actors and Components
- High-fidelity graphics and AAA game focus
- Strong for 3D, console, and PC games
- Editor-based workflow with powerful tools

**Godot:**
- GDScript (Python-like) or C# scripting
- Scene-based architecture with Nodes
- Lightweight, open-source, no licensing fees
- Strong for indie games and 2D projects
- Simple, intuitive editor

### Project Structure Best Practices

All engines benefit from consistent folder organization:

```
ProjectRoot/
├── Assets/          (Unity) or Content/ (Unreal) or res:// (Godot)
│   ├── Scenes/      Game scenes/levels
│   ├── Scripts/     Code files
│   ├── Prefabs/     Reusable objects
│   ├── Materials/   Material files
│   ├── Textures/    Image assets
│   ├── Models/      3D meshes
│   ├── Audio/       Sound effects and music
│   └── UI/          UI assets
├── Builds/          Build outputs
├── Docs/            Documentation
└── Tools/           Custom scripts and utilities
```

### Component-Based Architecture

All three engines use entity-component systems:

**Unity GameObject:**
```
GameObject
├── Transform (position, rotation, scale)
├── MeshRenderer (visual representation)
├── Collider (physics)
└── Custom MonoBehaviour scripts
```

**Unreal Actor:**
```
Actor
├── SceneComponent (transform hierarchy)
├── StaticMeshComponent (visual)
├── CollisionComponent (physics)
└── Custom Components or Blueprint logic
```

**Godot Node:**
```
Node
├── Spatial/Node2D (transform)
├── MeshInstance/Sprite (visual)
├── CollisionShape (physics)
└── Custom GDScript
```

## When to Use This Skill

Use this skill when:
- Initializing a new game project in Unity, Unreal, or Godot
- Setting up scenes, levels, or organizing project assets
- Creating player controllers, character scripts, or game mechanics
- Configuring build pipelines for iOS, Android, Windows, Mac, or consoles
- Setting up version control (Git) for game projects
- Optimizing builds for size or performance
- Choosing between engines for a new project

## Engine Selection Guide

### Question 1: What Type of Game?

**2D Game:**
- **Unity**: Excellent 2D tooling, Tilemap system
- **Godot**: Lightweight, great 2D performance
- **Unreal**: Overkill for 2D (use Unity or Godot)

**3D Game:**
- **Unity**: Good for stylized 3D, mobile 3D
- **Unreal**: Best for photorealistic, AAA-quality 3D
- **Godot**: Suitable for stylized 3D, indie games

**Mobile Game:**
- **Unity**: Industry standard for mobile
- **Godot**: Lightweight, good performance
- **Unreal**: Heavy, but possible for high-end mobile

### Question 2: Team Experience?

**C# Developers:**
- Unity (native C#)
- Godot (C# support available)

**C++ Developers:**
- Unreal (native C++)
- Godot (GDNative C++ bindings)

**Python/Scripting Background:**
- Godot (GDScript is Python-like)
- Unity (C# is approachable)

**Visual/Non-Programmers:**
- Unreal (Blueprints visual scripting)
- Unity (visual scripting with Bolt/Visual Scripting)

### Question 3: Budget and Licensing?

**Free/Open Source:**
- Godot (MIT license, completely free)
- Unity (free Personal license <$100k revenue)
- Unreal (5% royalty after $1M gross revenue)

**Commercial:**
- Unity (Plus/Pro subscriptions)
- Unreal (5% royalty or custom license)
- Godot (always free)

## Quick Reference by Task

### Initialize New Project

**Unity:**
1. Use Unity Hub to create project with template
2. Set up folder structure in Assets/
3. Configure Project Settings (Player, Quality)
4. See `references/unity-setup.md` for details

**Unreal:**
1. Launch Unreal Engine, select project template
2. Configure project settings (Platform, Rendering)
3. Organize Content/ folders
4. See `references/unreal-setup.md` for details

**Godot:**
1. Create new project, select renderer (Vulkan/OpenGL)
2. Set up folder structure in res://
3. Configure Project Settings
4. See `references/godot-setup.md` for details

### Create Player Controller

**Unity (C#):**
```csharp
// MonoBehaviour pattern
public class PlayerController : MonoBehaviour {
    public float speed = 5.0f;

    void Update() {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");
        transform.Translate(new Vector3(h, 0, v) * speed * Time.deltaTime);
    }
}
```

**Unreal (Blueprint/C++):**
- Blueprint: Create Character Blueprint, add InputAction events
- C++: Inherit from ACharacter, override SetupPlayerInputComponent
- See `references/unreal-setup.md` for complete examples

**Godot (GDScript):**
```gdscript
extends KinematicBody2D

var speed = 200

func _process(delta):
    var velocity = Vector2()
    velocity.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
    velocity.y = Input.get_action_strength("ui_down") - Input.get_action_strength("ui_up")
    move_and_slide(velocity.normalized() * speed)
```

See `examples/player-controllers/` for complete implementations.

### Configure Build for Platforms

**iOS:**
- Unity: Player Settings → iOS, configure Bundle ID, signing
- Unreal: Project Settings → iOS, provision profiles
- See `references/build-pipelines.md` for complete guide

**Android:**
- Unity: Player Settings → Android, configure keystore
- Unreal: Project Settings → Android, SDK/NDK paths
- See `references/build-pipelines.md` for complete guide

**Windows/Mac/Linux:**
- Unity: Build Settings → Select platform, switch
- Unreal: File → Package Project → Platform
- Godot: Export → Add export template → Configure

**Consoles (PS5, Xbox, Switch):**
- Requires platform-specific SDKs and NDAs
- See `references/build-pipelines.md` for workflow

### Set Up Version Control

**Git for Unity:**
1. Force text serialization: Edit → Project Settings → Asset Serialization → Force Text
2. Enable Visible Meta Files: Edit → Project Settings → Version Control → Mode: Visible Meta Files
3. Use .gitignore from `scripts/generate-gitignore.py unity`
4. Set up Git LFS for large files
5. See `references/version-control.md` for complete setup

**Git for Unreal:**
1. Use Unreal's built-in Perforce support for teams
2. For Git: Use .gitignore from `scripts/generate-gitignore.py unreal`
3. Git LFS critical for Unreal (large binary assets)
4. See `references/version-control.md` for complete setup

**Git for Godot:**
1. Use .gitignore from `scripts/generate-gitignore.py godot`
2. Godot stores assets as text by default (Git-friendly)
3. See `references/version-control.md` for complete setup

## Common Patterns by Engine

### Unity Patterns

**Singleton Manager:**
```csharp
public class GameManager : MonoBehaviour {
    public static GameManager Instance { get; private set; }

    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }
}
```

**State Machine:**
- Use Animator Controller for animation-driven states
- Custom enum-based state machine for game logic
- See `references/scripting-patterns.md` for details

### Unreal Patterns

**Blueprint Interface:**
- Create Blueprint Interface for common behaviors (IDamageable)
- Implement interface on actors
- Call interface functions without casting

**C++ Component Pattern:**
- Create UActorComponent subclasses for reusable logic
- Attach to actors in editor or code
- See `references/unreal-setup.md` for examples

### Godot Patterns

**Signal System:**
```gdscript
# Define signal
signal health_changed(new_health)

# Emit signal
emit_signal("health_changed", health)

# Connect in other script
player.connect("health_changed", self, "_on_player_health_changed")
```

**Autoload Singletons:**
- Project Settings → AutoLoad → Add global script
- Access from anywhere: GlobalScript.method()

## Build Pipeline Workflows

### Local Development Builds

**Unity:**
```bash
# Command-line build
Unity -quit -batchmode -projectPath /path/to/project -buildTarget Android -executeMethod BuildScript.Build
```

**Unreal:**
```bash
# Command-line build
RunUAT BuildCookRun -project="MyProject.uproject" -platform=Win64 -build -cook -stage -pak
```

See `references/build-pipelines.md` for complete build scripts.

### CI/CD Integration

**Unity with GitHub Actions:**
```yaml
- uses: game-ci/unity-builder@v2
  with:
    targetPlatform: StandaloneWindows64
```

**Unreal with Jenkins:**
- Set up dedicated build machines
- Use BuildGraph scripts
- See `references/build-pipelines.md` for complete CI setup

### Build Optimization

**Reduce Build Size:**
- Strip unused code (IL2CPP stripping in Unity)
- Compress textures (DXT, ASTC formats)
- Use asset bundles/addressables for on-demand loading
- See `references/performance.md` for optimization techniques

**Build Performance:**
- Incremental builds when possible
- Cache dependencies
- Parallelize build steps
- See `references/build-pipelines.md` for optimization

## Performance Considerations

### Unity Performance

**Profiling:**
- Window → Analysis → Profiler
- Check CPU, GPU, Memory, Rendering

**Common Optimizations:**
- Object pooling for frequently instantiated objects
- Occlusion culling for large scenes
- LOD (Level of Detail) for 3D models
- Atlas textures to reduce draw calls
- See `references/performance.md` for complete guide

### Unreal Performance

**Profiling:**
- stat fps, stat unit, stat gpu
- Session Frontend for detailed profiling

**Common Optimizations:**
- Hierarchical LOD (HLOD)
- Lightmap baking
- Nanite and Lumen for UE5
- See `references/performance.md` for complete guide

### Godot Performance

**Profiling:**
- Debug → Profiler
- Monitor frame time and memory

**Common Optimizations:**
- VisibilityNotifier for off-screen culling
- Simplified collision shapes
- Texture compression
- See `references/performance.md` for complete guide

## Additional Resources

### Reference Files

Detailed setup guides for each engine and workflow:

- **`references/unity-setup.md`** - Complete Unity project setup: folder structure, scenes, prefabs, C# scripting patterns, Inspector usage
- **`references/unreal-setup.md`** - Complete Unreal setup: level design, Blueprints, C++ integration, Actor/Component patterns
- **`references/godot-setup.md`** - Complete Godot setup: scene tree, GDScript patterns, signals, autoloads
- **`references/build-pipelines.md`** - Multi-platform build configurations, CI/CD setup, command-line builds, optimization
- **`references/version-control.md`** - Git setup for game engines: .gitignore, Git LFS, file organization, merge strategies
- **`references/scripting-patterns.md`** - Common game patterns: player controllers, state machines, inventory systems, AI
- **`references/performance.md`** - Performance optimization: profiling, reducing draw calls, memory management, build size

### Example Projects

Working project templates and code examples:

- **`examples/unity-starter/`** - Unity project template with folder structure, example scenes, and scripts
- **`examples/unreal-starter/`** - Unreal project template with organized Content/ folder
- **`examples/godot-starter/`** - Godot project template with scene organization
- **`examples/player-controllers/`** - Complete player controller examples for Unity (C#), Unreal (Blueprint + C++), Godot (GDScript)
- **`examples/build-configs/`** - Example build configuration files for different platforms

### Utility Scripts

Tools for project setup and validation:

- **`scripts/generate-unity-project.sh`** - Scaffold new Unity project with best-practice folder structure
- **`scripts/generate-gitignore.py`** - Generate .gitignore file for specific game engine
- **`scripts/validate-build-config.py`** - Validate build settings and identify common issues
- **`scripts/optimize-assets.py`** - Batch optimize textures and audio for build size

## Implementation Workflow

When setting up a new game project:

1. **Choose engine**: Use engine selection guide above
2. **Initialize project**: Follow engine-specific initialization in references
3. **Set up folder structure**: Organize Assets/Content/res:// with clear naming
4. **Configure version control**: Run `scripts/generate-gitignore.py`, set up Git LFS
5. **Create initial scene**: Set up first playable scene with player controller
6. **Configure build settings**: Set up target platforms in project settings
7. **Test builds**: Build for target platforms early and often
8. **Profile performance**: Use engine profilers to identify bottlenecks
9. **Set up CI/CD**: Automate builds for multiple platforms
10. **Document setup**: Maintain README with engine version, setup steps, build instructions

## Best Practices

**Project Organization:**
- Use clear, consistent naming conventions (PascalCase for C#, snake_case for GDScript)
- Organize assets by type (Scripts, Textures, Models) not by feature
- Keep scenes small and modular
- Use prefabs/blueprints for reusable objects

**Version Control:**
- Commit early and often
- Use Git LFS for files >100MB
- Never commit build artifacts or engine binaries
- Use meaningful commit messages

**Build Management:**
- Test builds on target hardware early
- Automate builds with CI/CD
- Version your builds (semantic versioning)
- Keep build logs for debugging

**Performance:**
- Profile regularly during development
- Optimize early for target platform constraints (mobile, VR)
- Use asset compression appropriate for platform
- Implement LOD and culling systems

**Collaboration:**
- Document project setup in README
- Use consistent coding standards (linters, formatters)
- Communicate engine and SDK version requirements
- Provide clear onboarding for new team members

## Troubleshooting Common Issues

**Unity:**
- "Assembly not found": Check .asmdef files or reimport project
- "Scene is not in build": Add scene to Build Settings
- "Platform not installed": Install module via Unity Hub

**Unreal:**
- "Missing DLL": Regenerate Visual Studio project files
- "Cooking failed": Clear intermediate and saved folders
- "Can't package": Check project settings for platform

**Godot:**
- "Invalid resource path": Use res:// prefix
- "Export template missing": Download export templates for engine version
- "Script error": Check for typos, Godot is case-sensitive

See `references/build-pipelines.md` for comprehensive troubleshooting.

## Next Steps

To begin game development:

1. Review engine selection guide to choose Unity, Unreal, or Godot
2. Follow detailed setup in `references/[engine]-setup.md`
3. Use `scripts/generate-[engine]-project.sh` to scaffold project
4. Study player controller examples in `examples/player-controllers/`
5. Configure version control with `scripts/generate-gitignore.py`
6. Set up build pipeline following `references/build-pipelines.md`
7. Profile and optimize using `references/performance.md`

Focus on getting a minimal playable build early, then iterate on features and performance.
