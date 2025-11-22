/**
 * Matter.js Physics Integration with Custom Game Loop
 *
 * This example demonstrates:
 * - Setting up Matter.js physics engine
 * - Integrating with custom game loop
 * - Creating various body types
 * - Handling collisions
 * - Character controller with physics
 */

// Assumes Matter.js is loaded via CDN or npm install matter-js
// import Matter from 'matter-js'; // If using modules

const { Engine, Render, World, Bodies, Body, Events, Constraint, Query } = Matter;

class PhysicsGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Create Matter.js engine
    this.engine = Engine.create({
      gravity: { x: 0, y: 1 }
    });

    this.world = this.engine.world;

    // Game state
    this.entities = [];
    this.running = false;
    this.lastTime = performance.now();

    // Optional: Create debug renderer
    this.debugMode = false;
    if (this.debugMode) {
      this.createDebugRenderer();
    }

    this.setupInput();
    this.createWorld();
  }

  createDebugRenderer() {
    this.render = Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: 800,
        height: 600,
        wireframes: true,
        showCollisions: true,
        showVelocity: true,
        showAngleIndicator: true
      }
    });

    Render.run(this.render);
  }

  setupInput() {
    this.keys = {};

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse input for spawning objects
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.spawnBox(x, y);
    });
  }

  createWorld() {
    // Create ground
    const ground = Bodies.rectangle(400, 580, 810, 60, {
      isStatic: true,
      friction: 0.8,
      render: { fillStyle: '#444' }
    });
    ground.label = 'ground';
    World.add(this.world, ground);

    // Create walls
    const leftWall = Bodies.rectangle(0, 300, 60, 600, {
      isStatic: true
    });
    const rightWall = Bodies.rectangle(800, 300, 60, 600, {
      isStatic: true
    });
    World.add(this.world, [leftWall, rightWall]);

    // Create platforms
    const platform1 = Bodies.rectangle(200, 400, 200, 20, {
      isStatic: true,
      friction: 0.5
    });
    platform1.label = 'platform';

    const platform2 = Bodies.rectangle(600, 300, 200, 20, {
      isStatic: true,
      friction: 0.5
    });
    platform2.label = 'platform';

    World.add(this.world, [platform1, platform2]);

    // Create character
    this.player = new CharacterController(this, 400, 100);

    // Create some dynamic objects
    this.createPyramid(150, 200, 5);

    // Setup collision events
    this.setupCollisionHandling();
  }

  createPyramid(x, y, rows) {
    const boxSize = 30;

    for (let row = 0; row < rows; row++) {
      const cols = rows - row;
      const rowY = y + row * boxSize;

      for (let col = 0; col < cols; col++) {
        const boxX = x + col * boxSize + (row * boxSize / 2);
        const box = Bodies.rectangle(boxX, rowY, boxSize, boxSize, {
          friction: 0.3,
          restitution: 0.2,
          render: { fillStyle: '#ff6b6b' }
        });
        box.label = 'box';
        World.add(this.world, box);
      }
    }
  }

  spawnBox(x, y) {
    const box = Bodies.rectangle(x, y, 40, 40, {
      friction: 0.3,
      restitution: 0.6,
      render: { fillStyle: '#4ecdc4' }
    });
    box.label = 'box';
    World.add(this.world, box);
  }

  setupCollisionHandling() {
    Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;

      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;

        // Player collision with ground/platforms
        if ((bodyA === this.player.body || bodyB === this.player.body)) {
          const other = bodyA === this.player.body ? bodyB : bodyA;
          if (other.label === 'ground' || other.label === 'platform') {
            this.player.onGround = true;
          }
        }
      }
    });

    Events.on(this.engine, 'collisionEnd', (event) => {
      const pairs = event.pairs;

      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;

        if ((bodyA === this.player.body || bodyB === this.player.body)) {
          const other = bodyA === this.player.body ? bodyB : bodyA;
          if (other.label === 'ground' || other.label === 'platform') {
            // Check if still grounded with raycast
            setTimeout(() => this.player.checkGrounded(), 10);
          }
        }
      }
    });
  }

  update(deltaTime) {
    // Update physics engine manually
    Engine.update(this.engine, deltaTime * 1000);

    // Update character
    this.player.update(deltaTime);

    // Remove bodies that fall off screen
    const bodies = this.world.bodies;
    for (const body of bodies) {
      if (body.position.y > 700 && !body.isStatic) {
        World.remove(this.world, body);
      }
    }
  }

  render() {
    if (this.debugMode) return; // Debug renderer handles it

    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all physics bodies
    const bodies = this.world.bodies;
    for (const body of bodies) {
      this.drawBody(ctx, body);
    }

    // Draw character
    this.player.render(ctx);

    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Arrow keys or WASD: Move', 10, 20);
    ctx.fillText('Space: Jump', 10, 40);
    ctx.fillText('Click: Spawn box', 10, 60);
  }

  drawBody(ctx, body) {
    const vertices = body.vertices;

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(vertices[i].x, vertices[i].y);
    }

    ctx.closePath();

    // Fill
    ctx.fillStyle = body.render.fillStyle || '#00ff00';
    ctx.fill();

    // Stroke
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time
    const dt = Math.min(deltaTime, 0.1);

    this.update(dt);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  stop() {
    this.running = false;
  }
}

class CharacterController {
  constructor(game, x, y) {
    this.game = game;

    // Create physics body
    this.body = Bodies.rectangle(x, y, 40, 60, {
      inertia: Infinity,        // Prevent rotation
      friction: 0,              // No surface friction
      frictionAir: 0.02,
      restitution: 0,
      density: 0.002
    });
    this.body.label = 'player';

    World.add(game.world, this.body);

    // Character properties
    this.moveSpeed = 5;
    this.jumpForce = 0.08;
    this.onGround = false;
    this.airControl = 0.5;
  }

  update(deltaTime) {
    const keys = this.game.keys;

    // Horizontal movement
    let targetVelocityX = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) {
      targetVelocityX = -this.moveSpeed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
      targetVelocityX = this.moveSpeed;
    }

    // Apply movement with appropriate control
    const control = this.onGround ? 1.0 : this.airControl;
    const currentVelX = this.body.velocity.x;
    const newVelX = currentVelX + (targetVelocityX - currentVelX) * control * 0.5;

    Body.setVelocity(this.body, {
      x: newVelX,
      y: this.body.velocity.y
    });

    // Jumping
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && this.onGround) {
      Body.applyForce(this.body, this.body.position, {
        x: 0,
        y: -this.jumpForce
      });
      this.onGround = false;
    }

    // Check if grounded
    this.checkGrounded();
  }

  checkGrounded() {
    // Raycast downward to check for ground
    const rayStart = {
      x: this.body.position.x,
      y: this.body.position.y + 30
    };
    const rayEnd = {
      x: this.body.position.x,
      y: this.body.position.y + 35
    };

    const collisions = Query.ray(
      this.game.world.bodies,
      rayStart,
      rayEnd
    );

    this.onGround = collisions.length > 0 &&
                    collisions.some(c => c.body !== this.body);
  }

  render(ctx) {
    const pos = this.body.position;

    // Draw character
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(pos.x - 20, pos.y - 30, 40, 60);

    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(pos.x - 12, pos.y - 15, 8, 8);
    ctx.fillRect(pos.x + 4, pos.y - 15, 8, 8);

    // Ground indicator
    if (this.onGround) {
      ctx.fillStyle = 'lime';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + 35, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Initialize game when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') || createCanvas();
    const game = new PhysicsGame(canvas);
    game.start();
  });

  function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    return canvas;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhysicsGame, CharacterController };
}
