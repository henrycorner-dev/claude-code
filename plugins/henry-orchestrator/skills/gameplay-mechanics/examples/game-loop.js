/**
 * Complete Game Loop with Fixed Timestep and Interpolation
 *
 * This example demonstrates a production-ready game loop that:
 * - Uses fixed timestep for deterministic physics
 * - Interpolates rendering for smooth visuals
 * - Prevents spiral of death
 * - Tracks performance metrics
 */

const FIXED_TIMESTEP = 1/60; // 60 updates per second
const MAX_UPDATES_PER_FRAME = 5;

class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.updateTimes = [];
    this.renderTimes = [];
    this.maxSamples = 60;
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
    if (this.updateTimes.length > this.maxSamples) {
      this.updateTimes.shift();
    }
  }

  startRender() {
    this.renderStart = performance.now();
  }

  endRender() {
    const renderTime = performance.now() - this.renderStart;
    this.renderTimes.push(renderTime);
    if (this.renderTimes.length > this.maxSamples) {
      this.renderTimes.shift();
    }
  }

  endFrame() {
    const frameTime = performance.now() - this.frameStart;
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
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
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
}

class GameObject {
  constructor(x, y) {
    this.position = { x, y };
    this.previousPosition = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.width = 50;
    this.height = 50;
    this.color = '#00ff00';
  }

  update(dt) {
    // Store previous position for interpolation
    this.previousPosition.x = this.position.x;
    this.previousPosition.y = this.position.y;

    // Update position based on velocity
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Wrap around screen
    if (this.position.x > 800) this.position.x = 0;
    if (this.position.x < 0) this.position.x = 800;
    if (this.position.y > 600) this.position.y = 0;
    if (this.position.y < 0) this.position.y = 600;
  }

  getRenderPosition(alpha) {
    // Linear interpolation between previous and current position
    return {
      x: this.previousPosition.x * (1 - alpha) + this.position.x * alpha,
      y: this.previousPosition.y * (1 - alpha) + this.position.y * alpha
    };
  }

  draw(ctx, alpha) {
    const pos = this.getRenderPosition(alpha);
    ctx.fillStyle = this.color;
    ctx.fillRect(pos.x - this.width / 2, pos.y - this.height / 2, this.width, this.height);
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entities = [];
    this.perfMonitor = new PerformanceMonitor();
    this.accumulator = 0;
    this.lastTime = performance.now();
    this.running = false;

    this.setupInput();
    this.createEntities();
  }

  setupInput() {
    this.keys = {};

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  createEntities() {
    // Create a player-controlled entity
    this.player = new GameObject(400, 300);
    this.player.color = '#0088ff';
    this.entities.push(this.player);

    // Create some moving entities
    for (let i = 0; i < 10; i++) {
      const entity = new GameObject(
        Math.random() * 800,
        Math.random() * 600
      );
      entity.velocity.x = (Math.random() - 0.5) * 200;
      entity.velocity.y = (Math.random() - 0.5) * 200;
      entity.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      this.entities.push(entity);
    }
  }

  processInput() {
    const speed = 200; // pixels per second

    this.player.velocity.x = 0;
    this.player.velocity.y = 0;

    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.velocity.x = -speed;
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.velocity.x = speed;
    }
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.player.velocity.y = -speed;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      this.player.velocity.y = speed;
    }
  }

  update(dt) {
    this.processInput();

    for (const entity of this.entities) {
      entity.update(dt);
    }
  }

  render(alpha) {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all entities with interpolation
    for (const entity of this.entities) {
      entity.draw(this.ctx, alpha);
    }

    // Draw debug info
    this.renderDebugInfo();
  }

  renderDebugInfo() {
    const stats = this.perfMonitor.getStats();

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 120);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`FPS: ${stats.fps.toFixed(1)}`, 20, 30);
    this.ctx.fillText(`Frame: ${stats.avgFrameTime.toFixed(2)}ms`, 20, 50);
    this.ctx.fillText(`Update: ${stats.avgUpdateTime.toFixed(2)}ms`, 20, 70);
    this.ctx.fillText(`Render: ${stats.avgRenderTime.toFixed(2)}ms`, 20, 90);
    this.ctx.fillText(`Entities: ${this.entities.length}`, 20, 110);
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    this.perfMonitor.startFrame();

    // Calculate delta time in seconds
    let deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death
    if (deltaTime > 0.25) {
      deltaTime = 0.25;
    }

    this.accumulator += deltaTime;

    // Fixed timestep updates
    this.perfMonitor.startUpdate();
    let updateCount = 0;
    while (this.accumulator >= FIXED_TIMESTEP && updateCount < MAX_UPDATES_PER_FRAME) {
      this.update(FIXED_TIMESTEP);
      this.accumulator -= FIXED_TIMESTEP;
      updateCount++;
    }

    // If we hit max updates, discard remaining accumulator
    if (updateCount >= MAX_UPDATES_PER_FRAME) {
      this.accumulator = 0;
    }
    this.perfMonitor.endUpdate();

    // Render with interpolation
    this.perfMonitor.startRender();
    const alpha = this.accumulator / FIXED_TIMESTEP;
    this.render(alpha);
    this.perfMonitor.endRender();

    this.perfMonitor.endFrame();

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

// Initialize game when DOM is ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') || createCanvas();
    const game = new Game(canvas);
    game.start();

    // Add stop/start controls
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (game.running) {
          game.stop();
          console.log('Game paused');
        } else {
          game.start();
          console.log('Game resumed');
        }
      }
    });
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
  module.exports = { Game, GameObject, PerformanceMonitor };
}
