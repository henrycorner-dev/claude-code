---
name: gameplay-mechanics
description: This skill should be used when the user asks to "implement a game loop", "add physics", "use Box2D", "use Matter.js", "implement pathfinding", "create A* algorithm", "add FSM", "implement finite state machine", "create AI behavior", "add game physics", or mentions core game mechanics, physics engines, pathfinding algorithms, or state machines for game development.
version: 0.1.0
---

# Gameplay Mechanics Development

This skill provides guidance for implementing core gameplay mechanics in game development, including game loops, physics simulation using industry-standard engines (Box2D, Matter.js), and AI systems (pathfinding algorithms, finite state machines).

## When to Use This Skill

Use this skill when implementing fundamental game systems:

- Core game loops with proper timing and frame management
- Physics simulation and collision detection
- Pathfinding for character navigation
- AI behavior systems using state machines
- Game state management and update cycles

## Core Game Loop Implementation

### Fixed Timestep Loop

Implement a game loop with fixed timestep for deterministic physics and gameplay:

```javascript
const FIXED_TIMESTEP = 1 / 60; // 60 FPS
let accumulator = 0;
let lastTime = performance.now();

function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  accumulator += deltaTime;

  // Fixed update for physics and gameplay
  while (accumulator >= FIXED_TIMESTEP) {
    update(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }

  // Render with interpolation
  const alpha = accumulator / FIXED_TIMESTEP;
  render(alpha);

  requestAnimationFrame(gameLoop);
}
```

### Key Principles

**Separation of concerns**: Keep update logic separate from rendering. Update handles game state, physics, and AI. Rendering handles visual representation.

**Frame-rate independence**: Use delta time for smooth gameplay across different refresh rates. Never tie gameplay logic directly to frame rate.

**Accumulator pattern**: Prevent spiral of death where slow frames cause even slower frames. Cap the accumulator to maintain responsiveness.

For detailed patterns including variable timestep, semi-fixed timestep, and frame interpolation, consult `references/game-loop-patterns.md`.

## Physics Integration

### Matter.js Integration

Matter.js is a 2D physics engine for web-based games, offering excellent performance and ease of use.

**Basic setup:**

```javascript
const { Engine, Render, Bodies, World } = Matter;

// Create engine and world
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: { width: 800, height: 600 },
});

// Create physics bodies
const ground = Bodies.rectangle(400, 580, 810, 60, { isStatic: true });
const ball = Bodies.circle(400, 200, 40, { restitution: 0.9 });

// Add to world
World.add(world, [ground, ball]);

// Run engine and renderer
Engine.run(engine);
Render.run(render);
```

**Integration with game loop:**

When integrating Matter.js with a custom game loop, disable the automatic runner and step the engine manually:

```javascript
function update(deltaTime) {
  Engine.update(engine, deltaTime * 1000); // Convert to milliseconds
  // Your game logic here
}
```

### Box2D Integration

Box2D is a powerful 2D physics engine originally written in C++, with JavaScript ports available (box2d.js, planck.js).

**Key concepts:**

- **World**: Contains all physics bodies and handles simulation
- **Bodies**: Dynamic, static, or kinematic entities
- **Fixtures**: Attach shapes and material properties to bodies
- **Joints**: Connect bodies with constraints

**Basic setup pattern:**

```javascript
// Create world with gravity
const world = new b2World(new b2Vec2(0, -10));

// Create body definition
const bodyDef = new b2BodyDef();
bodyDef.type = b2Body.b2_dynamicBody;
bodyDef.position.Set(x, y);

// Create body
const body = world.CreateBody(bodyDef);

// Create fixture with shape
const shape = new b2CircleShape(radius);
const fixtureDef = new b2FixtureDef();
fixtureDef.shape = shape;
fixtureDef.density = 1.0;
fixtureDef.friction = 0.3;
fixtureDef.restitution = 0.5;

body.CreateFixture(fixtureDef);

// Step simulation
world.Step(timeStep, velocityIterations, positionIterations);
```

**Coordinate system considerations**: Box2D uses meters as units. Scale between pixel coordinates and physics coordinates appropriately (typically 1 meter = 30-100 pixels).

For detailed integration patterns, performance optimization, and common gotchas, consult `references/physics-engines.md`.

## Pathfinding Implementation

### A\* Algorithm

A\* (A-star) is the most widely used pathfinding algorithm, offering optimal paths with excellent performance.

**Core algorithm structure:**

```javascript
function aStar(start, goal, grid) {
  const openSet = new PriorityQueue();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(start, 0);
  fScore.set(start, heuristic(start, goal));
  openSet.enqueue(start, fScore.get(start));

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (current === goal) {
      return reconstructPath(cameFrom, current);
    }

    for (const neighbor of getNeighbors(current, grid)) {
      const tentativeGScore = gScore.get(current) + distance(current, neighbor);

      if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        fScore.set(neighbor, tentativeGScore + heuristic(neighbor, goal));
        openSet.enqueue(neighbor, fScore.get(neighbor));
      }
    }
  }

  return null; // No path found
}
```

**Heuristic selection**: Use Manhattan distance for grid-based movement with 4 directions, Euclidean distance for free movement, or Chebyshev distance for 8-directional movement.

**Optimization techniques:**

- **Jump Point Search**: For uniform-cost grids, dramatically reduces nodes explored
- **Hierarchical pathfinding**: Pre-compute high-level paths, refine locally
- **Path smoothing**: Post-process paths to remove unnecessary waypoints

### Grid-Based Navigation

Structure the navigation grid efficiently:

```javascript
class NavGrid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = Array(height)
      .fill()
      .map(() => Array(width).fill(true));
  }

  worldToGrid(x, y) {
    return {
      x: Math.floor(x / this.cellSize),
      y: Math.floor(y / this.cellSize),
    };
  }

  gridToWorld(gridX, gridY) {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2,
    };
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
    return this.grid[y][x];
  }
}
```

For alternative algorithms (Dijkstra, Jump Point Search, navmesh-based pathfinding), consult `references/pathfinding-algorithms.md`.

## Finite State Machines (FSMs)

FSMs provide structured AI behavior by defining discrete states and transitions between them.

### Basic FSM Pattern

```javascript
class StateMachine {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = new Map();
  }

  addState(name, state) {
    this.states.set(name, state);
  }

  transition(newStateName) {
    const newState = this.states.get(newStateName);
    if (!newState) return;

    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    this.currentState = newState;

    if (this.currentState.enter) {
      this.currentState.enter();
    }
  }

  update(deltaTime) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(deltaTime);
    }
  }
}
```

### State Definition

Define states with enter, update, and exit methods:

```javascript
const idleState = {
  enter() {
    this.animation = 'idle';
  },
  update(deltaTime) {
    // Check for state transitions
    if (this.input.isMoving) {
      this.fsm.transition('walk');
    }
    if (this.input.jump) {
      this.fsm.transition('jump');
    }
  },
  exit() {
    // Cleanup
  },
};

const walkState = {
  enter() {
    this.animation = 'walk';
  },
  update(deltaTime) {
    this.velocity.x = this.input.direction * this.speed;

    if (!this.input.isMoving) {
      this.fsm.transition('idle');
    }
    if (this.input.jump) {
      this.fsm.transition('jump');
    }
  },
  exit() {
    this.velocity.x = 0;
  },
};
```

### Character Controller Integration

Integrate FSM with physics and input:

```javascript
class Character {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.input = new InputController();
    this.fsm = new StateMachine(idleState);

    // Bind states to character context
    idleState.fsm = this.fsm;
    walkState.fsm = this.fsm;
    idleState.input = this.input;
    walkState.input = this.input;
  }

  update(deltaTime) {
    this.input.update();
    this.fsm.update(deltaTime);

    // Apply physics
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }
}
```

For advanced patterns including hierarchical FSMs, pushdown automata, and behavior trees, consult `references/fsm-patterns.md`.

## Integration Best Practices

### Coordinate Systems

Maintain clear separation between different coordinate systems:

- **World coordinates**: Game world position (meters or game units)
- **Screen coordinates**: Pixel positions for rendering
- **Grid coordinates**: Navigation grid cells

Create utility functions for conversions and use them consistently.

### Performance Optimization

**Spatial partitioning**: Use quadtrees or spatial hashing for collision detection and entity queries. Avoid checking all entities against all entities.

**Update frequency**: Not all systems need to run every frame. Consider running AI pathfinding at 10-20 Hz while maintaining 60 FPS rendering.

**Object pooling**: Reuse objects for projectiles, particles, and temporary entities instead of creating/destroying constantly.

**Profiling**: Use browser DevTools or game-specific profilers to identify bottlenecks. Optimize what matters, not what seems slow.

### Determinism

For networked games or replay systems, ensure deterministic physics:

- Use fixed timestep for physics updates
- Avoid platform-specific floating-point operations
- Seed random number generators consistently
- Keep game logic separate from rendering

### Debugging

**Visual debugging**: Draw physics shapes, pathfinding grids, and AI state information during development.

```javascript
function debugRender(ctx) {
  // Draw physics bodies
  for (const body of bodies) {
    ctx.strokeStyle = body.isStatic ? 'blue' : 'red';
    ctx.strokeRect(body.x, body.y, body.width, body.height);
  }

  // Draw pathfinding grid
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      ctx.fillStyle = grid.isWalkable(x, y) ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  // Draw current AI state
  ctx.fillStyle = 'white';
  ctx.fillText(character.fsm.currentState.name, character.x, character.y - 20);
}
```

**Logging and telemetry**: Log state transitions, pathfinding requests, and performance metrics to identify issues.

## Additional Resources

### Reference Files

For detailed implementation guides and advanced techniques, consult:

- **`references/game-loop-patterns.md`** - Comprehensive game loop architectures, interpolation, and timing strategies
- **`references/physics-engines.md`** - Deep dive into Box2D and Matter.js with integration patterns and optimization
- **`references/pathfinding-algorithms.md`** - A\*, Dijkstra, JPS, navmesh pathfinding with performance comparisons
- **`references/fsm-patterns.md`** - Advanced FSM patterns, hierarchical states, behavior trees

### Example Files

Working examples demonstrating complete implementations:

- **`examples/game-loop.js`** - Complete game loop with fixed timestep and interpolation
- **`examples/matter-physics-setup.js`** - Full Matter.js integration with custom game loop
- **`examples/box2d-setup.js`** - Box2D setup with proper scaling and coordinate conversion
- **`examples/astar-pathfinding.js`** - Production-ready A\* implementation with priority queue
- **`examples/fsm-character.js`** - Character controller with FSM for player/NPC behavior
- **`examples/spatial-grid.js`** - Spatial partitioning for efficient collision detection

## Common Patterns

### Game Loop Structure

Organize the game loop with clear phases:

1. **Input**: Process user input and events
2. **Update**: Run game logic, physics, AI
3. **Render**: Draw the current frame

Maintain this order consistently to avoid subtle bugs.

### Entity Component System (ECS) Integration

When using ECS architecture, integrate gameplay mechanics as systems:

- **PhysicsSystem**: Updates physics bodies and resolves collisions
- **MovementSystem**: Handles character movement and navigation
- **AISystem**: Runs pathfinding and state machine updates
- **RenderSystem**: Draws entities based on their components

### Async Pathfinding

For complex pathfinding that might take multiple frames:

```javascript
class PathfindingSystem {
  constructor() {
    this.requests = [];
  }

  requestPath(start, goal, callback) {
    this.requests.push({ start, goal, callback });
  }

  update(maxTimeMs = 16) {
    const startTime = performance.now();

    while (this.requests.length > 0 && performance.now() - startTime < maxTimeMs) {
      const request = this.requests.shift();
      const path = aStar(request.start, request.goal, this.grid);
      request.callback(path);
    }
  }
}
```

This prevents pathfinding from blocking the main game loop.

## Error Handling

**Physics explosions**: Cap velocity and forces to prevent physics instability. If entities move too fast, increase substeps or reduce timestep.

**Pathfinding failures**: Always handle null path returns. Implement fallback behavior (move toward goal, stay idle, or use simpler movement).

**State machine edge cases**: Ensure all states have valid transitions. Log unexpected transition attempts during development.

**Frame timing issues**: Monitor actual frame times and adjust accumulator behavior if frame times become inconsistent.

## Testing Considerations

**Physics determinism**: Test that identical inputs produce identical results across multiple runs.

**Pathfinding correctness**: Verify paths are optimal and walkable. Test edge cases (unreachable goals, blocked paths).

**State machine coverage**: Ensure all state transitions work correctly and states have appropriate entry/exit logic.

**Performance benchmarks**: Establish baseline performance metrics and detect regressions through automated tests.

## Platform-Specific Considerations

**Web/JavaScript**: Use `requestAnimationFrame` for game loop. Consider Web Workers for heavy pathfinding computation.

**Canvas vs WebGL**: Use Canvas 2D for simpler games. Switch to WebGL (Pixi.js, Three.js) for complex rendering or many entities.

**Mobile considerations**: Reduce physics complexity and pathfinding frequency on mobile devices. Consider touch-specific input handling.

## Getting Started Checklist

When implementing gameplay mechanics in a new project:

1. **Set up game loop** with fixed timestep and proper timing
2. **Choose physics engine** (Matter.js for simplicity, Box2D for advanced features)
3. **Implement coordinate conversion** utilities between world/screen/grid systems
4. **Create navigation grid** for pathfinding with appropriate cell size
5. **Implement A\* pathfinding** with proper heuristic for your game
6. **Design state machines** for AI behavior with clear states and transitions
7. **Add visual debugging** for physics, pathfinding, and AI states
8. **Profile and optimize** based on actual performance metrics

Consult the reference files and examples for detailed implementation guidance on each component.
