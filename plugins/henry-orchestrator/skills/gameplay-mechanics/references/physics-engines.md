# Physics Engines: Box2D and Matter.js

Comprehensive guide to integrating and optimizing 2D physics engines for game development.

## Matter.js

Matter.js is a JavaScript 2D physics engine that runs in the browser, featuring a simple API and good performance.

### Installation and Setup

```bash
npm install matter-js
```

```javascript
import { Engine, Render, Bodies, World, Runner } from 'matter-js';

// Create engine
const engine = Engine.create();
const world = engine.world;

// Create renderer (optional - for debug visualization)
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#1a1a1a'
  }
});

// Create bodies
const ground = Bodies.rectangle(400, 580, 810, 60, {
  isStatic: true,
  render: { fillStyle: '#444' }
});

const ball = Bodies.circle(400, 200, 40, {
  restitution: 0.9,
  friction: 0.001,
  render: { fillStyle: '#ff0000' }
});

// Add bodies to world
World.add(world, [ground, ball]);

// Run the engine (automatic runner)
const runner = Runner.create();
Runner.run(runner, engine);

// Run the renderer
Render.run(render);
```

### Custom Game Loop Integration

Disable automatic runner and control updates manually:

```javascript
const engine = Engine.create();

// Disable Matter's internal runner - we'll update manually
const FIXED_TIMESTEP = 1000 / 60; // 60 FPS in milliseconds

function update(deltaTime) {
  // Update physics engine
  Engine.update(engine, FIXED_TIMESTEP);

  // Your game logic here
  updateGameEntities();
}

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}
```

### Body Types and Properties

**Static bodies**: Don't move, infinite mass

```javascript
const wall = Bodies.rectangle(x, y, width, height, {
  isStatic: true
});
```

**Dynamic bodies**: Affected by forces and collisions

```javascript
const player = Bodies.circle(x, y, radius, {
  density: 1,        // Mass = density * area
  friction: 0.3,     // Surface friction (0-1)
  restitution: 0.5,  // Bounciness (0-1)
  frictionAir: 0.01, // Air resistance
  inertia: Infinity  // Prevents rotation
});
```

**Kinematic bodies**: Move but not affected by forces

```javascript
const platform = Bodies.rectangle(x, y, width, height, {
  isStatic: false,
  collisionFilter: { group: -1 }, // Doesn't collide with other bodies
});

// Move kinematically
Matter.Body.setPosition(platform, { x: newX, y: newY });
Matter.Body.setVelocity(platform, { x: velX, y: velY });
```

### Composite Bodies

Create complex shapes from multiple bodies:

```javascript
const { Bodies, Body, Composite } = Matter;

// Car composite
const car = Composite.create();

const body = Bodies.rectangle(x, y, 100, 40);
const wheelA = Bodies.circle(x - 30, y + 20, 15);
const wheelB = Bodies.circle(x + 30, y + 20, 15);

Composite.add(car, [body, wheelA, wheelB]);

// Add constraints (axles)
const axleA = Constraint.create({
  bodyA: body,
  bodyB: wheelA,
  stiffness: 0.5
});

const axleB = Constraint.create({
  bodyA: body,
  bodyB: wheelB,
  stiffness: 0.5
});

Composite.add(car, [axleA, axleB]);
World.add(world, car);
```

### Constraints and Joints

**Distance constraint**: Maintains fixed distance between bodies

```javascript
const constraint = Constraint.create({
  bodyA: bodyA,
  bodyB: bodyB,
  length: 100,
  stiffness: 0.5
});
```

**Point constraint**: Pins body to world position

```javascript
const pin = Constraint.create({
  bodyA: body,
  pointB: { x: 300, y: 200 },
  stiffness: 0.9
});
```

**Spring constraint**: Elastic connection

```javascript
const spring = Constraint.create({
  bodyA: bodyA,
  bodyB: bodyB,
  stiffness: 0.01,
  damping: 0.1
});
```

### Collision Detection and Response

**Collision events:**

```javascript
const { Events } = Matter;

Events.on(engine, 'collisionStart', (event) => {
  const pairs = event.pairs;

  for (const pair of pairs) {
    const { bodyA, bodyB } = pair;

    // Check body labels or IDs
    if (bodyA.label === 'player' && bodyB.label === 'enemy') {
      handlePlayerEnemyCollision(bodyA, bodyB);
    }
  }
});

Events.on(engine, 'collisionActive', (event) => {
  // While bodies are touching
});

Events.on(engine, 'collisionEnd', (event) => {
  // When bodies separate
});
```

**Collision filtering**: Control which bodies collide

```javascript
const playerCategory = 0x0001;
const enemyCategory = 0x0002;
const wallCategory = 0x0004;

const player = Bodies.circle(x, y, radius, {
  collisionFilter: {
    category: playerCategory,
    mask: enemyCategory | wallCategory // Collides with enemies and walls
  }
});

const enemy = Bodies.circle(x, y, radius, {
  collisionFilter: {
    category: enemyCategory,
    mask: playerCategory | wallCategory // Collides with player and walls
  }
});

const wall = Bodies.rectangle(x, y, width, height, {
  isStatic: true,
  collisionFilter: {
    category: wallCategory,
    mask: playerCategory | enemyCategory // Collides with everything
  }
});
```

**Sensors**: Detect collisions without physical response

```javascript
const trigger = Bodies.rectangle(x, y, width, height, {
  isStatic: true,
  isSensor: true
});

Events.on(engine, 'collisionStart', (event) => {
  for (const pair of event.pairs) {
    if (pair.bodyA === trigger || pair.bodyB === trigger) {
      // Trigger activated
      handleTrigger();
    }
  }
});
```

### Forces and Velocity

**Apply force at world point:**

```javascript
const force = { x: 0.05, y: -0.1 };
const position = { x: body.position.x, y: body.position.y };
Body.applyForce(body, position, force);
```

**Set velocity directly:**

```javascript
Body.setVelocity(body, { x: 5, y: 0 });
```

**Limit velocity:**

```javascript
function limitVelocity(body, maxSpeed) {
  const vel = body.velocity;
  const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);

  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    Body.setVelocity(body, {
      x: vel.x * scale,
      y: vel.y * scale
    });
  }
}
```

### Character Controller Pattern

```javascript
class CharacterController {
  constructor(x, y) {
    this.body = Bodies.rectangle(x, y, 40, 60, {
      inertia: Infinity,        // Prevent rotation
      friction: 0,              // No sliding friction
      frictionAir: 0.02,
      restitution: 0,
      density: 0.002
    });

    this.moveSpeed = 5;
    this.jumpForce = 0.08;
    this.isGrounded = false;

    World.add(world, this.body);
  }

  update() {
    this.checkGrounded();

    // Horizontal movement
    let targetVelocityX = 0;

    if (keys.left) targetVelocityX = -this.moveSpeed;
    if (keys.right) targetVelocityX = this.moveSpeed;

    // Smooth velocity changes
    Body.setVelocity(this.body, {
      x: targetVelocityX,
      y: this.body.velocity.y
    });

    // Jump
    if (keys.space && this.isGrounded) {
      Body.applyForce(this.body, this.body.position, {
        x: 0,
        y: -this.jumpForce
      });
    }
  }

  checkGrounded() {
    // Cast ray downward to check for ground
    const rayStart = { x: this.body.position.x, y: this.body.position.y + 30 };
    const rayEnd = { x: this.body.position.x, y: this.body.position.y + 35 };

    const collisions = Query.ray(world.bodies, rayStart, rayEnd);
    this.isGrounded = collisions.length > 0;
  }
}
```

## Box2D (via box2d.js or planck.js)

Box2D is a powerful physics engine written in C++ with JavaScript ports. Planck.js is a modern, well-maintained port.

### Installation and Setup (Planck.js)

```bash
npm install planck-js
```

```javascript
import planck from 'planck-js';

// Create world with gravity (x, y in m/s²)
const world = planck.World({
  gravity: planck.Vec2(0, -10)
});

// Create ground (static body)
const ground = world.createBody({
  position: planck.Vec2(0, -10)
});

ground.createFixture({
  shape: planck.Box(50, 1),
  friction: 0.3
});

// Create dynamic body
const dynamicBody = world.createDynamicBody({
  position: planck.Vec2(0, 4),
  angle: 0
});

dynamicBody.createFixture({
  shape: planck.Circle(0.5),
  density: 1.0,
  friction: 0.3,
  restitution: 0.6
});

// Simulation step
function update(dt) {
  // Recommended iteration counts
  const velocityIterations = 8;
  const positionIterations = 3;

  world.step(dt, velocityIterations, positionIterations);
  world.clearForces();
}
```

### Coordinate Scaling

Box2D uses meters as units. Scale between pixels and meters:

```javascript
const SCALE = 30; // 1 meter = 30 pixels

function metersToPixels(meters) {
  return meters * SCALE;
}

function pixelsToMeters(pixels) {
  return pixels / SCALE;
}

// Creating a body at pixel coordinates
const pixelX = 400, pixelY = 300;
const body = world.createDynamicBody({
  position: planck.Vec2(pixelsToMeters(pixelX), pixelsToMeters(pixelY))
});

// Rendering a body
const pos = body.getPosition();
const pixelPos = {
  x: metersToPixels(pos.x),
  y: metersToPixels(pos.y)
};
```

### Body Types and Fixtures

**Dynamic body:**

```javascript
const body = world.createDynamicBody({
  position: planck.Vec2(x, y),
  angle: 0,
  linearDamping: 0.5,
  angularDamping: 0.3,
  bullet: false,  // Enable continuous collision detection
  fixedRotation: false
});
```

**Static body:**

```javascript
const body = world.createBody({
  position: planck.Vec2(x, y),
  // Static by default if not specified as dynamic/kinematic
});
```

**Kinematic body:**

```javascript
const body = world.createKinematicBody({
  position: planck.Vec2(x, y)
});

// Set velocity (not affected by forces)
body.setLinearVelocity(planck.Vec2(vx, vy));
```

**Fixtures (shapes attached to bodies):**

```javascript
// Box
body.createFixture({
  shape: planck.Box(halfWidth, halfHeight),
  density: 1.0,
  friction: 0.3,
  restitution: 0.5
});

// Circle
body.createFixture({
  shape: planck.Circle(radius),
  density: 1.0
});

// Polygon (vertices in counter-clockwise order)
body.createFixture({
  shape: planck.Polygon([
    planck.Vec2(-1, 0),
    planck.Vec2(1, 0),
    planck.Vec2(0, 2)
  ]),
  density: 1.0
});

// Chain (for terrain)
body.createFixture({
  shape: planck.Chain([
    planck.Vec2(-10, 0),
    planck.Vec2(-5, 2),
    planck.Vec2(0, 0),
    planck.Vec2(5, -2),
    planck.Vec2(10, 0)
  ], false),  // false = open chain, true = closed loop
  friction: 0.5
});
```

### Joints

**Revolute joint (hinge):**

```javascript
const joint = planck.RevoluteJoint({
  maxMotorTorque: 10.0,
  motorSpeed: 0.0,
  enableMotor: true
}, bodyA, bodyB, anchorPoint);

world.createJoint(joint);
```

**Distance joint:**

```javascript
const joint = planck.DistanceJoint({
  frequencyHz: 4.0,
  dampingRatio: 0.5
}, bodyA, anchorA, bodyB, anchorB);

world.createJoint(joint);
```

**Prismatic joint (slider):**

```javascript
const joint = planck.PrismaticJoint({
  enableMotor: true,
  maxMotorForce: 100.0,
  motorSpeed: 0.0,
  enableLimit: true,
  lowerTranslation: -5.0,
  upperTranslation: 5.0
}, bodyA, bodyB, anchor, axis);

world.createJoint(joint);
```

### Collision Handling

**Contact listener:**

```javascript
world.on('begin-contact', (contact) => {
  const fixtureA = contact.getFixtureA();
  const fixtureB = contact.getFixtureB();
  const bodyA = fixtureA.getBody();
  const bodyB = fixtureB.getBody();

  // Access user data
  if (bodyA.getUserData() === 'player' && bodyB.getUserData() === 'enemy') {
    handlePlayerEnemyCollision();
  }
});

world.on('end-contact', (contact) => {
  // Bodies separated
});

world.on('pre-solve', (contact, oldManifold) => {
  // Called before contact is resolved
  // Can disable contact: contact.setEnabled(false);
});

world.on('post-solve', (contact, impulse) => {
  // After contact resolution
  // Access impulse for damage calculation
});
```

**Collision filtering:**

```javascript
const playerCategory = 0x0001;
const enemyCategory = 0x0002;
const wallCategory = 0x0004;

// Create fixture with filter
body.createFixture({
  shape: planck.Circle(radius),
  filterCategoryBits: playerCategory,
  filterMaskBits: enemyCategory | wallCategory,
  filterGroupIndex: 0
});
```

### Raycasting

```javascript
const point1 = planck.Vec2(startX, startY);
const point2 = planck.Vec2(endX, endY);

const hit = world.rayCast(point1, point2, (fixture, point, normal, fraction) => {
  // fixture: the fixture hit
  // point: point of intersection
  // normal: surface normal at point
  // fraction: distance along ray (0-1)

  // Return value controls ray behavior:
  // -1: ignore this fixture, continue
  // 0: terminate ray cast
  // fraction: clip ray to this point
  // 1: don't clip ray, continue

  if (fixture.getBody().getUserData() === 'enemy') {
    // Hit enemy
    return fraction; // Clip ray at hit point
  }

  return 1; // Continue through this fixture
});
```

### Queries

**AABB query (rectangular area):**

```javascript
const aabb = planck.AABB(
  planck.Vec2(lowerX, lowerY),
  planck.Vec2(upperX, upperY)
);

world.queryAABB(aabb, (fixture) => {
  const body = fixture.getBody();
  // Do something with bodies in area
  return true; // Continue query
});
```

## Performance Optimization

### Sleeping Bodies

Box2D and Matter.js automatically put idle bodies to sleep to save CPU:

```javascript
// Matter.js - adjust sleeping thresholds
const body = Bodies.circle(x, y, radius, {
  sleepThreshold: 60 // Frames before sleeping (default: 60)
});

// Box2D - enable/disable sleeping
body.setAwake(true);  // Wake up body
body.setAwake(false); // Put to sleep
```

### Broad Phase Optimization

**Spatial partitioning**: Physics engines use spatial partitioning automatically, but you can optimize:

```javascript
// Matter.js - use spatial hashing
const engine = Engine.create({
  broadphase: {
    controller: Matter.Grid // or Matter.SAP (Sweep and Prune)
  }
});
```

### Reduce Body Count

**Combine static bodies:**

```javascript
// Instead of many small static bodies
// Use fewer large composite bodies or chain shapes

// Bad: 100 individual wall segments
for (let i = 0; i < 100; i++) {
  World.add(world, Bodies.rectangle(i * 10, 0, 10, 100, { isStatic: true }));
}

// Good: One continuous wall
World.add(world, Bodies.rectangle(500, 0, 1000, 100, { isStatic: true }));
```

### Simulation Frequency

Run physics at lower frequency than rendering:

```javascript
const PHYSICS_FPS = 30; // Run physics at 30 Hz
const PHYSICS_TIMESTEP = 1 / PHYSICS_FPS;

let physicsAccumulator = 0;

function gameLoop(deltaTime) {
  physicsAccumulator += deltaTime;

  while (physicsAccumulator >= PHYSICS_TIMESTEP) {
    Engine.update(engine, PHYSICS_TIMESTEP * 1000);
    physicsAccumulator -= PHYSICS_TIMESTEP;
  }

  // Render at 60 FPS with interpolation
  render();
}
```

### Continuous Collision Detection

Enable CCD for fast-moving objects:

```javascript
// Matter.js - not natively supported, use smaller timesteps or increased iterations

// Box2D
body.setBullet(true); // Enables CCD for this body
```

## Common Pitfalls

**Unit confusion**: Box2D uses meters, Matter.js uses pixels. Be consistent with coordinate conversions.

**Incorrect timestep**: Always use fixed timestep for physics. Variable timestep causes instability.

**Force magnitude**: Forces are accumulated over timestep. Use impulses for instant velocity changes.

**Rotation locking**: Set `inertia: Infinity` (Matter.js) or `fixedRotation: true` (Box2D) for character controllers.

**Collision tunneling**: Fast objects may tunnel through thin walls. Enable CCD or use thicker walls.

**Memory leaks**: Remove bodies from world when destroyed: `World.remove(world, body)` or `world.destroyBody(body)`.

**Sleeping issues**: Bodies may sleep unexpectedly. Wake them when applying forces: `Body.setAwake(body, true)`.

## Debugging Tools

### Visual Debug Rendering

**Matter.js built-in:**

```javascript
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: true,  // Show shapes only
    showCollisions: true,
    showVelocity: true,
    showAngleIndicator: true
  }
});
```

**Custom debug draw:**

```javascript
function debugDraw(ctx, bodies) {
  ctx.strokeStyle = 'lime';
  ctx.lineWidth = 2;

  for (const body of bodies) {
    ctx.save();
    ctx.translate(body.position.x, body.position.y);
    ctx.rotate(body.angle);

    // Draw body shape
    const vertices = body.vertices;
    ctx.beginPath();
    ctx.moveTo(vertices[0].x - body.position.x, vertices[0].y - body.position.y);
    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x - body.position.x, vertices[i].y - body.position.y);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw velocity vector
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(body.velocity.x * 10, body.velocity.y * 10);
    ctx.stroke();

    ctx.restore();
  }
}
```

## Choosing Between Matter.js and Box2D

**Choose Matter.js when:**
- Building web-based games
- Want simpler API and setup
- Need quick prototyping
- Don't require advanced features

**Choose Box2D when:**
- Need advanced features (CCD, complex joints)
- Require maximum performance
- Want industry-standard physics
- Need deterministic simulation (with planck.js)

Both engines are excellent choices for 2D games. Matter.js is easier to get started with, while Box2D offers more control and features for complex simulations.
