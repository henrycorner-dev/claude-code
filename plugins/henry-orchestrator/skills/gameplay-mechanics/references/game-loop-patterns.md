# Game Loop Patterns

Comprehensive guide to game loop architectures, timing strategies, and frame management techniques.

## Loop Architecture Patterns

### Fixed Timestep Loop

The fixed timestep loop ensures deterministic physics and gameplay by updating at a constant rate regardless of rendering frame rate.

**Structure:**

```javascript
const FIXED_TIMESTEP = 1/60; // 60 updates per second
const MAX_UPDATES_PER_FRAME = 5; // Prevent spiral of death

let accumulator = 0;
let lastTime = performance.now();

function gameLoop(currentTime) {
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Cap deltaTime to prevent spiral of death
  if (deltaTime > 0.25) {
    deltaTime = 0.25;
  }

  accumulator += deltaTime;

  let updateCount = 0;
  while (accumulator >= FIXED_TIMESTEP && updateCount < MAX_UPDATES_PER_FRAME) {
    update(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
    updateCount++;
  }

  // Render with interpolation factor
  const alpha = accumulator / FIXED_TIMESTEP;
  render(alpha);

  requestAnimationFrame(gameLoop);
}
```

**Advantages:**
- Deterministic gameplay and physics
- Consistent behavior across different hardware
- Simpler replay and networking implementation
- Physics engines work best with fixed timestep

**Disadvantages:**
- Requires interpolation for smooth rendering
- Can waste CPU on fast hardware
- Must handle spiral of death scenarios

**Best for:** Physics-heavy games, networked games, games requiring replays

### Variable Timestep Loop

Updates and renders at the actual frame rate, passing the elapsed time to game logic.

**Structure:**

```javascript
let lastTime = performance.now();

function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Cap deltaTime to prevent huge jumps
  const dt = Math.min(deltaTime, 0.1);

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}
```

**Advantages:**
- Simpler implementation
- No interpolation needed
- Naturally adapts to hardware capability

**Disadvantages:**
- Non-deterministic gameplay
- Physics instability at low frame rates
- Difficult to network or replay
- Different results on different hardware

**Best for:** Simple games without physics, single-player experiences, visual effects

### Semi-Fixed Timestep Loop

Combines fixed and variable timesteps by using a small fixed timestep but allowing fractional updates.

**Structure:**

```javascript
const TIMESTEP = 1/60;
let accumulator = 0;
let lastTime = performance.now();

function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  accumulator += deltaTime;

  // Update with fixed timestep while catching up
  while (accumulator >= TIMESTEP) {
    update(TIMESTEP);
    accumulator -= TIMESTEP;
  }

  // Additional fractional update for smoothness
  if (accumulator > 0) {
    update(accumulator);
    accumulator = 0;
  }

  render();

  requestAnimationFrame(gameLoop);
}
```

**Advantages:**
- Smoother than pure fixed timestep
- More deterministic than variable timestep
- Good for hybrid physics/visual systems

**Disadvantages:**
- More complex than other approaches
- Still requires careful physics handling
- Not perfectly deterministic

**Best for:** Games needing smoothness and reasonable determinism

## Frame Interpolation

Interpolation smooths rendering between fixed physics updates, eliminating visual stutter.

### Linear Interpolation

```javascript
class GameObject {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };
  }

  update(dt) {
    // Store previous position before updating
    this.previousPosition.x = this.position.x;
    this.previousPosition.y = this.position.y;

    // Update position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }

  getRenderPosition(alpha) {
    // Interpolate between previous and current position
    return {
      x: this.previousPosition.x * (1 - alpha) + this.position.x * alpha,
      y: this.previousPosition.y * (1 - alpha) + this.position.y * alpha
    };
  }
}

function render(alpha) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const obj of gameObjects) {
    const pos = obj.getRenderPosition(alpha);
    ctx.fillRect(pos.x, pos.y, obj.width, obj.height);
  }
}
```

**Alpha calculation:** `alpha = accumulator / FIXED_TIMESTEP` represents how far between updates the render occurred (0 = at update, 1 = right before next update).

### Rotation Interpolation

For rotation, use shortest-path interpolation to avoid spinning the wrong direction:

```javascript
function interpolateAngle(previous, current, alpha) {
  let diff = current - previous;

  // Normalize to [-PI, PI]
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  return previous + diff * alpha;
}
```

### Velocity-Based Extrapolation

For networked games, extrapolate position based on velocity when updates are delayed:

```javascript
function extrapolatePosition(lastPosition, velocity, timeSinceUpdate) {
  return {
    x: lastPosition.x + velocity.x * timeSinceUpdate,
    y: lastPosition.y + velocity.y * timeSinceUpdate
  };
}
```

## Timing Strategies

### High-Resolution Timing

Use `performance.now()` for precise timing:

```javascript
const startTime = performance.now();

function gameLoop() {
  const currentTime = performance.now();
  const elapsedTime = (currentTime - startTime) / 1000; // Convert to seconds

  // Use elapsedTime for animations and time-based events
  requestAnimationFrame(gameLoop);
}
```

**Never use `Date.now()`** for game timing—it's low-resolution and can jump due to system clock changes.

### Frame Rate Independence

Ensure all movement and animations scale with delta time:

```javascript
// Wrong - frame rate dependent
position.x += 5;

// Correct - frame rate independent
position.x += speed * deltaTime;

// Example: 200 pixels per second movement
const SPEED = 200;
position.x += SPEED * deltaTime;
```

### Time Scaling

Implement time scaling for slow-motion or fast-forward effects:

```javascript
let timeScale = 1.0;

function update(dt) {
  const scaledDt = dt * timeScale;

  // All game logic uses scaled time
  updatePhysics(scaledDt);
  updateAI(scaledDt);
  updateAnimations(scaledDt);
}

// Slow motion
function activateSlowMotion() {
  timeScale = 0.3;
}

// Normal speed
function normalSpeed() {
  timeScale = 1.0;
}
```

## Preventing Spiral of Death

The spiral of death occurs when a frame takes so long that subsequent frames also take too long, causing a cascade of lag.

### Delta Time Capping

Cap maximum delta time to prevent huge jumps:

```javascript
function gameLoop(currentTime) {
  let deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Cap at 250ms (4 FPS minimum)
  if (deltaTime > 0.25) {
    deltaTime = 0.25;
  }

  accumulator += deltaTime;
  // ... rest of loop
}
```

### Maximum Updates Per Frame

Limit physics updates per frame:

```javascript
const MAX_UPDATES = 5;
let updateCount = 0;

while (accumulator >= FIXED_TIMESTEP && updateCount < MAX_UPDATES) {
  update(FIXED_TIMESTEP);
  accumulator -= FIXED_TIMESTEP;
  updateCount++;
}

// Discard remaining accumulator if we hit the limit
if (updateCount >= MAX_UPDATES) {
  accumulator = 0;
}
```

### Progressive Degradation

Dynamically adjust quality when performance drops:

```javascript
const TARGET_FPS = 60;
const frameTimes = [];

function trackFrameTime(deltaTime) {
  frameTimes.push(deltaTime);
  if (frameTimes.length > 60) frameTimes.shift();

  const averageFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
  const currentFPS = 1 / averageFrameTime;

  if (currentFPS < TARGET_FPS * 0.8) {
    // Reduce quality: fewer particles, lower resolution, etc.
    degradeQuality();
  } else if (currentFPS > TARGET_FPS * 0.95) {
    // Restore quality if performance is good
    restoreQuality();
  }
}
```

## Multi-Phase Update Pattern

Separate update into distinct phases for better organization:

```javascript
function update(dt) {
  // Phase 1: Process input
  inputSystem.update(dt);

  // Phase 2: AI and decision making
  aiSystem.update(dt);

  // Phase 3: Movement and physics simulation
  physicsSystem.update(dt);

  // Phase 4: Collision detection and response
  collisionSystem.update(dt);

  // Phase 5: Animation and effects
  animationSystem.update(dt);

  // Phase 6: Camera and viewport updates
  cameraSystem.update(dt);
}
```

This ensures proper ordering and prevents race conditions.

## Platform-Specific Considerations

### Browser (requestAnimationFrame)

```javascript
function gameLoop(timestamp) {
  // timestamp is DOMHighResTimeStamp from requestAnimationFrame
  const deltaTime = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);
```

**Benefits:**
- Automatically pauses when tab is not visible
- Synchronized with display refresh rate
- Better performance and battery life

### Node.js (setImmediate)

For server-side game loops:

```javascript
let lastTime = Date.now();

function serverGameLoop() {
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  update(deltaTime);

  setImmediate(serverGameLoop);
}

serverGameLoop();
```

### Worker Threads

Offload physics to a Web Worker:

```javascript
// main.js
const physicsWorker = new Worker('physics-worker.js');

physicsWorker.onmessage = (e) => {
  const { bodies } = e.data;
  updateRenderPositions(bodies);
};

function gameLoop() {
  // Send input to physics worker
  physicsWorker.postMessage({ input: currentInput });

  render();
  requestAnimationFrame(gameLoop);
}

// physics-worker.js
onmessage = (e) => {
  const { input } = e.data;
  updatePhysics(input);
  postMessage({ bodies: physicsBodies });
};
```

## Performance Monitoring

### Frame Time Tracking

```javascript
class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.updateTimes = [];
    this.renderTimes = [];
  }

  startFrame() {
    this.frameStart = performance.now();
  }

  startUpdate() {
    this.updateStart = performance.now();
  }

  endUpdate() {
    const updateTime = performance.now() - this.updateStart;
    this.updateTimes.push(updateTime);
    if (this.updateTimes.length > 60) this.updateTimes.shift();
  }

  startRender() {
    this.renderStart = performance.now();
  }

  endRender() {
    const renderTime = performance.now() - this.renderStart;
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > 60) this.renderTimes.shift();
  }

  endFrame() {
    const frameTime = performance.now() - this.frameStart;
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > 60) this.frameTimes.shift();
  }

  getStats() {
    return {
      fps: 1000 / this.average(this.frameTimes),
      avgFrameTime: this.average(this.frameTimes),
      avgUpdateTime: this.average(this.updateTimes),
      avgRenderTime: this.average(this.renderTimes)
    };
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}
```

### Debug Display

```javascript
function renderDebugInfo(ctx, perfMonitor) {
  const stats = perfMonitor.getStats();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 200, 100);

  ctx.fillStyle = 'white';
  ctx.font = '14px monospace';
  ctx.fillText(`FPS: ${stats.fps.toFixed(1)}`, 20, 30);
  ctx.fillText(`Frame: ${stats.avgFrameTime.toFixed(2)}ms`, 20, 50);
  ctx.fillText(`Update: ${stats.avgUpdateTime.toFixed(2)}ms`, 20, 70);
  ctx.fillText(`Render: ${stats.avgRenderTime.toFixed(2)}ms`, 20, 90);
}
```

## Common Pitfalls

**Mixing timesteps**: Don't use variable timestep for physics and fixed for rendering. Choose one approach and stick with it.

**Forgetting to store previous state**: Interpolation requires tracking previous positions before updating.

**Not capping delta time**: Always cap delta time to prevent spiral of death.

**Using Date.now()**: Use `performance.now()` for game timing, never `Date.now()`.

**Frame rate dependent logic**: Always multiply by delta time for movement and time-based effects.

**Updating after render**: Always update game state before rendering to avoid one-frame lag.

## Recommended Pattern

For most games, use the fixed timestep loop with interpolation:

```javascript
const FIXED_TIMESTEP = 1/60;
const MAX_UPDATES = 5;

let accumulator = 0;
let lastTime = performance.now();

class Game {
  constructor() {
    this.entities = [];
    this.perfMonitor = new PerformanceMonitor();
  }

  update(dt) {
    // Store previous state for interpolation
    for (const entity of this.entities) {
      entity.storePreviousState();
    }

    // Update game logic
    this.processInput();
    this.updatePhysics(dt);
    this.updateAI(dt);
    this.resolveCollisions();
  }

  render(alpha) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const entity of this.entities) {
      const pos = entity.getInterpolatedPosition(alpha);
      entity.draw(ctx, pos);
    }

    this.renderDebug();
  }

  gameLoop(currentTime) {
    this.perfMonitor.startFrame();

    let deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Cap delta time
    if (deltaTime > 0.25) deltaTime = 0.25;

    accumulator += deltaTime;

    // Fixed timestep updates
    this.perfMonitor.startUpdate();
    let updateCount = 0;
    while (accumulator >= FIXED_TIMESTEP && updateCount < MAX_UPDATES) {
      this.update(FIXED_TIMESTEP);
      accumulator -= FIXED_TIMESTEP;
      updateCount++;
    }
    this.perfMonitor.endUpdate();

    // Render with interpolation
    this.perfMonitor.startRender();
    const alpha = accumulator / FIXED_TIMESTEP;
    this.render(alpha);
    this.perfMonitor.endRender();

    this.perfMonitor.endFrame();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  start() {
    lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}
```

This pattern provides deterministic physics, smooth rendering, and protection against performance issues.
