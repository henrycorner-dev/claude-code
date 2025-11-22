# Player Controller Examples

Basic player controller implementations for Unity, Unreal Engine, and Godot demonstrating common patterns like movement, jumping, and camera control.

## Unity Player Controller

**File:** `UnityPlayerController.cs`

**Setup:**
1. Create player GameObject
2. Add CharacterController component
3. Attach PlayerController script
4. Create child GameObject for ground check (at feet position)
5. Assign references in Inspector:
   - Ground Check: Child GameObject
   - Ground Mask: Layer for ground objects
   - Camera Transform: Main Camera transform

**Controls:**
- WASD: Move
- Space: Jump
- Left Shift: Sprint
- Mouse: Look around

## Godot Player Controller

**File:** `GodotPlayerController.gd`

**Setup:**
1. Create KinematicBody node
2. Add CollisionShape child (CapsuleShape)
3. Add Camera child
4. Attach script to KinematicBody
5. Configure Input Map (Project → Project Settings → Input Map):
   - move_forward: W
   - move_back: S
   - move_left: A
   - move_right: D
   - jump: Space
   - sprint: Shift

**Controls:**
- WASD: Move
- Space: Jump
- Shift: Sprint
- Mouse: Look around
- ESC: Toggle mouse capture

## Unreal Player Controller

**Note:** Unreal typically uses the Third Person or First Person template which includes a pre-built player controller. To create a custom one:

**Blueprint Approach:**
1. Create Blueprint Class → Character
2. Add Input Events (Project Settings → Input):
   - MoveForward: W/S
   - MoveRight: A/D
   - Jump: Space
3. Implement movement logic in Event Graph

**C++ Approach:**
See Unreal setup guide (`references/unreal-setup.md`) for complete C++ Character class example.

## Common Patterns

All implementations demonstrate:
- **Input handling**: Getting player input (keyboard/mouse)
- **Movement**: Translating input to character movement
- **Gravity**: Applying downward force when not grounded
- **Jumping**: Impulse upward when grounded
- **Camera control**: First-person mouse look
- **Sprint**: Increased movement speed

## Extending Controllers

Add features:
- **Crouching**: Lower camera, reduce speed, modify collision
- **Climbing**: Detect ladder, override gravity, vertical movement
- **Swimming**: Detect water volume, modify physics
- **Dashing**: Burst speed in direction
- **Stamina**: Resource for sprint/dash
- **Footstep sounds**: Play audio on movement
- **Head bob**: Camera animation while walking
- **Wall running**: Detect wall, apply perpendicular force

## Performance Considerations

**Unity:**
- Use CharacterController instead of Rigidbody for player (simpler physics)
- Cache component references in Awake()
- Avoid GetComponent() in Update()

**Godot:**
- Use KinematicBody.move_and_slide() for predictable movement
- Avoid creating new Vector3 each frame (reuse variables)

**General:**
- Separate input handling from physics (Input in Update, Physics in FixedUpdate/physics_process)
- Use object pooling for frequently spawned objects (footstep particles, etc.)
- Profile performance (Unity Profiler, Godot Debugger)
