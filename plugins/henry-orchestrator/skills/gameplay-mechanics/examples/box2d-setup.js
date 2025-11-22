/**
 * Box2D (Planck.js) Physics Setup
 *
 * This example demonstrates:
 * - Setting up Box2D physics with planck.js
 * - Coordinate scaling between pixels and meters
 * - Creating different body types and fixtures
 * - Implementing a character controller
 * - Handling collisions and contacts
 */

// Assumes planck.js is loaded
// npm install planck-js
// import planck from 'planck-js';

const SCALE = 30; // 1 meter = 30 pixels

function metersToPixels(meters) {
  return meters * SCALE;
}

function pixelsToMeters(pixels) {
  return pixels / SCALE;
}

class Box2DGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Create Box2D world with gravity (m/s²)
    this.world = planck.World({
      gravity: planck.Vec2(0, -10),
    });

    // Game state
    this.running = false;
    this.lastTime = performance.now();
    this.debugDraw = true;

    this.setupInput();
    this.createWorld();
    this.setupCollisionCallbacks();
  }

  setupInput() {
    this.keys = {};

    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('click', e => {
      const rect = this.canvas.getBoundingClientRect();
      const pixelX = e.clientX - rect.left;
      const pixelY = e.clientY - rect.top;
      this.spawnBox(pixelX, pixelY);
    });
  }

  createWorld() {
    // Create ground
    const groundBody = this.world.createBody({
      position: planck.Vec2(pixelsToMeters(400), pixelsToMeters(580)),
    });

    groundBody.createFixture({
      shape: planck.Box(pixelsToMeters(400), pixelsToMeters(30)),
      friction: 0.8,
      density: 0,
    });

    groundBody.setUserData({ type: 'ground', color: '#444' });

    // Create walls
    const leftWall = this.world.createBody({
      position: planck.Vec2(pixelsToMeters(10), pixelsToMeters(300)),
    });
    leftWall.createFixture({
      shape: planck.Box(pixelsToMeters(10), pixelsToMeters(300)),
      friction: 0.5,
    });
    leftWall.setUserData({ type: 'wall', color: '#666' });

    const rightWall = this.world.createBody({
      position: planck.Vec2(pixelsToMeters(790), pixelsToMeters(300)),
    });
    rightWall.createFixture({
      shape: planck.Box(pixelsToMeters(10), pixelsToMeters(300)),
      friction: 0.5,
    });
    rightWall.setUserData({ type: 'wall', color: '#666' });

    // Create platforms
    const platform1 = this.world.createBody({
      position: planck.Vec2(pixelsToMeters(200), pixelsToMeters(400)),
    });
    platform1.createFixture({
      shape: planck.Box(pixelsToMeters(100), pixelsToMeters(10)),
      friction: 0.6,
    });
    platform1.setUserData({ type: 'platform', color: '#888' });

    const platform2 = this.world.createBody({
      position: planck.Vec2(pixelsToMeters(600), pixelsToMeters(300)),
    });
    platform2.createFixture({
      shape: planck.Box(pixelsToMeters(100), pixelsToMeters(10)),
      friction: 0.6,
    });
    platform2.setUserData({ type: 'platform', color: '#888' });

    // Create player
    this.player = new Box2DCharacter(this, 400, 100);

    // Create some boxes
    this.createBoxPyramid(150, 200, 5);
  }

  createBoxPyramid(pixelX, pixelY, rows) {
    const boxSize = 30;

    for (let row = 0; row < rows; row++) {
      const cols = rows - row;
      const rowY = pixelY + row * boxSize;

      for (let col = 0; col < cols; col++) {
        const boxX = pixelX + col * boxSize + (row * boxSize) / 2;
        this.createBox(boxX, rowY, boxSize, boxSize, '#ff6b6b');
      }
    }
  }

  createBox(pixelX, pixelY, pixelWidth, pixelHeight, color = '#4ecdc4') {
    const body = this.world.createDynamicBody({
      position: planck.Vec2(pixelsToMeters(pixelX), pixelsToMeters(pixelY)),
      angle: 0,
    });

    body.createFixture({
      shape: planck.Box(pixelsToMeters(pixelWidth / 2), pixelsToMeters(pixelHeight / 2)),
      density: 1.0,
      friction: 0.3,
      restitution: 0.2,
    });

    body.setUserData({ type: 'box', color });
  }

  spawnBox(pixelX, pixelY) {
    this.createBox(pixelX, pixelY, 40, 40, '#4ecdc4');
  }

  setupCollisionCallbacks() {
    this.world.on('begin-contact', contact => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      const bodyA = fixtureA.getBody();
      const bodyB = fixtureB.getBody();

      const userDataA = bodyA.getUserData();
      const userDataB = bodyB.getUserData();

      // Player landing
      if (
        userDataA &&
        userDataA.type === 'player' &&
        userDataB &&
        (userDataB.type === 'ground' || userDataB.type === 'platform')
      ) {
        this.player.onGround = true;
      }

      if (
        userDataB &&
        userDataB.type === 'player' &&
        userDataA &&
        (userDataA.type === 'ground' || userDataA.type === 'platform')
      ) {
        this.player.onGround = true;
      }
    });

    this.world.on('end-contact', contact => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      const bodyA = fixtureA.getBody();
      const bodyB = fixtureB.getBody();

      const userDataA = bodyA.getUserData();
      const userDataB = bodyB.getUserData();

      // Player leaving ground
      if (userDataA && userDataA.type === 'player') {
        this.player.checkGrounded();
      }

      if (userDataB && userDataB.type === 'player') {
        this.player.checkGrounded();
      }
    });
  }

  update(deltaTime) {
    // Update physics world
    const timeStep = 1 / 60;
    const velocityIterations = 8;
    const positionIterations = 3;

    this.world.step(timeStep, velocityIterations, positionIterations);
    this.world.clearForces();

    // Update player
    this.player.update(deltaTime);

    // Remove bodies that fall off screen
    let body = this.world.getBodyList();
    while (body) {
      const next = body.getNext();
      const pos = body.getPosition();

      if (metersToPixels(pos.y) > 700 && body.isDynamic()) {
        this.world.destroyBody(body);
      }

      body = next;
    }
  }

  render() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all bodies
    let body = this.world.getBodyList();
    while (body) {
      this.drawBody(ctx, body);
      body = body.getNext();
    }

    // Draw player
    this.player.render(ctx);

    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText('Arrow keys or WASD: Move', 10, 20);
    ctx.fillText('Space: Jump', 10, 40);
    ctx.fillText('Click: Spawn box', 10, 60);
  }

  drawBody(ctx, body) {
    const userData = body.getUserData();
    if (userData && userData.type === 'player') return; // Player draws itself

    const pos = body.getPosition();
    const angle = body.getAngle();

    ctx.save();
    ctx.translate(metersToPixels(pos.x), metersToPixels(pos.y));
    ctx.rotate(-angle); // Negative because canvas Y is inverted

    let fixture = body.getFixtureList();
    while (fixture) {
      const shape = fixture.getShape();
      const color = userData ? userData.color : '#00ff00';

      if (shape.getType() === 'polygon') {
        this.drawPolygon(ctx, shape, color);
      } else if (shape.getType() === 'circle') {
        this.drawCircle(ctx, shape, color);
      }

      fixture = fixture.getNext();
    }

    ctx.restore();
  }

  drawPolygon(ctx, shape, color) {
    const vertices = shape.m_vertices;

    ctx.beginPath();
    ctx.moveTo(metersToPixels(vertices[0].x), metersToPixels(vertices[0].y));

    for (let i = 1; i < vertices.length; i++) {
      ctx.lineTo(metersToPixels(vertices[i].x), metersToPixels(vertices[i].y));
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawCircle(ctx, shape, color) {
    const radius = shape.getRadius();
    const center = shape.getCenter();

    ctx.beginPath();
    ctx.arc(
      metersToPixels(center.x),
      metersToPixels(center.y),
      metersToPixels(radius),
      0,
      Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    const dt = Math.min(deltaTime, 0.1);

    this.update(dt);
    this.render();

    requestAnimationFrame(time => this.gameLoop(time));
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(time => this.gameLoop(time));
  }

  stop() {
    this.running = false;
  }
}

class Box2DCharacter {
  constructor(game, pixelX, pixelY) {
    this.game = game;

    // Create dynamic body
    this.body = game.world.createDynamicBody({
      position: planck.Vec2(pixelsToMeters(pixelX), pixelsToMeters(pixelY)),
      fixedRotation: true, // Prevent rotation
    });

    // Create fixture
    this.body.createFixture({
      shape: planck.Box(pixelsToMeters(20), pixelsToMeters(30)),
      density: 1.0,
      friction: 0.3,
      restitution: 0,
    });

    this.body.setUserData({ type: 'player' });

    // Character properties
    this.moveSpeed = 5;
    this.jumpImpulse = 8;
    this.onGround = false;
    this.airControl = 0.3;
  }

  update(deltaTime) {
    const keys = this.game.keys;

    // Get current velocity
    const vel = this.body.getLinearVelocity();

    // Horizontal movement
    let targetVelX = 0;

    if (keys['ArrowLeft'] || keys['KeyA']) {
      targetVelX = -this.moveSpeed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
      targetVelX = this.moveSpeed;
    }

    // Apply movement
    const control = this.onGround ? 1.0 : this.airControl;
    const velChangeX = (targetVelX - vel.x) * control;

    this.body.setLinearVelocity(planck.Vec2(vel.x + velChangeX, vel.y));

    // Jumping
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && this.onGround) {
      this.body.applyLinearImpulse(
        planck.Vec2(0, this.jumpImpulse),
        this.body.getWorldCenter(),
        true
      );
      this.onGround = false;
    }
  }

  checkGrounded() {
    // Raycast downward
    const pos = this.body.getPosition();
    const point1 = planck.Vec2(pos.x, pos.y - pixelsToMeters(30));
    const point2 = planck.Vec2(pos.x, pos.y - pixelsToMeters(35));

    let hit = false;

    this.game.world.rayCast(point1, point2, (fixture, point, normal, fraction) => {
      if (fixture.getBody() !== this.body) {
        hit = true;
        return 0; // Terminate raycast
      }
      return 1; // Continue
    });

    this.onGround = hit;
  }

  render(ctx) {
    const pos = this.body.getPosition();
    const pixelX = metersToPixels(pos.x);
    const pixelY = metersToPixels(pos.y);

    // Draw character
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(pixelX - 20, pixelY - 30, 40, 60);

    // Draw eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(pixelX - 12, pixelY - 15, 8, 8);
    ctx.fillRect(pixelX + 4, pixelY - 15, 8, 8);

    // Ground indicator
    if (this.onGround) {
      ctx.fillStyle = 'lime';
      ctx.beginPath();
      ctx.arc(pixelX, pixelY + 35, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Initialize game when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') || createCanvas();
    const game = new Box2DGame(canvas);
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
  module.exports = { Box2DGame, Box2DCharacter, metersToPixels, pixelsToMeters };
}
