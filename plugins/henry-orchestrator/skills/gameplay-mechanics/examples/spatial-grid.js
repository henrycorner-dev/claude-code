/**
 * Spatial Grid for Efficient Collision Detection
 *
 * This example demonstrates:
 * - Spatial partitioning using a grid
 * - Efficient broad-phase collision detection
 * - Query nearby entities
 * - Handle moving entities
 * - Performance comparison with brute force
 */

class SpatialGrid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);

    // Grid cells - each cell contains array of entity IDs
    this.cells = Array(this.rows)
      .fill(null)
      .map(() =>
        Array(this.cols)
          .fill(null)
          .map(() => new Set())
      );

    // Entity tracking
    this.entities = new Map(); // id -> entity
    this.entityCells = new Map(); // id -> Set of cell keys
  }

  cellCoords(x, y) {
    return {
      col: Math.floor(x / this.cellSize),
      row: Math.floor(y / this.cellSize),
    };
  }

  cellKey(col, row) {
    return `${col},${row}`;
  }

  getCellsForBounds(minX, minY, maxX, maxY) {
    const minCell = this.cellCoords(minX, minY);
    const maxCell = this.cellCoords(maxX, maxY);

    const cells = [];

    for (let row = Math.max(0, minCell.row); row <= Math.min(this.rows - 1, maxCell.row); row++) {
      for (let col = Math.max(0, minCell.col); col <= Math.min(this.cols - 1, maxCell.col); col++) {
        cells.push({ col, row });
      }
    }

    return cells;
  }

  insert(entity) {
    // Store entity
    this.entities.set(entity.id, entity);

    // Calculate which cells the entity occupies
    const cells = this.getCellsForBounds(
      entity.x - entity.radius,
      entity.y - entity.radius,
      entity.x + entity.radius,
      entity.y + entity.radius
    );

    // Track cells for this entity
    const cellKeys = new Set();

    // Add entity to cells
    for (const { col, row } of cells) {
      this.cells[row][col].add(entity.id);
      cellKeys.add(this.cellKey(col, row));
    }

    this.entityCells.set(entity.id, cellKeys);
  }

  remove(entityId) {
    // Remove from cells
    const cellKeys = this.entityCells.get(entityId);

    if (cellKeys) {
      for (const key of cellKeys) {
        const [col, row] = key.split(',').map(Number);
        this.cells[row][col].delete(entityId);
      }
    }

    // Remove tracking
    this.entities.delete(entityId);
    this.entityCells.delete(entityId);
  }

  update(entity) {
    // Remove from old cells
    this.remove(entity.id);

    // Re-insert in new position
    this.insert(entity);
  }

  queryNearby(x, y, radius) {
    const nearbyIds = new Set();

    // Get cells in query range
    const cells = this.getCellsForBounds(x - radius, y - radius, x + radius, y + radius);

    // Collect all entities in those cells
    for (const { col, row } of cells) {
      for (const id of this.cells[row][col]) {
        nearbyIds.add(id);
      }
    }

    // Return actual entity objects
    return Array.from(nearbyIds).map(id => this.entities.get(id));
  }

  queryRect(minX, minY, maxX, maxY) {
    const nearbyIds = new Set();

    const cells = this.getCellsForBounds(minX, minY, maxX, maxY);

    for (const { col, row } of cells) {
      for (const id of this.cells[row][col]) {
        nearbyIds.add(id);
      }
    }

    return Array.from(nearbyIds).map(id => this.entities.get(id));
  }

  clear() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col].clear();
      }
    }

    this.entities.clear();
    this.entityCells.clear();
  }

  getStats() {
    let totalEntities = 0;
    let nonEmptyCells = 0;
    let maxEntitiesInCell = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cellSize = this.cells[row][col].size;

        if (cellSize > 0) {
          nonEmptyCells++;
          totalEntities += cellSize;
          maxEntitiesInCell = Math.max(maxEntitiesInCell, cellSize);
        }
      }
    }

    return {
      totalCells: this.rows * this.cols,
      nonEmptyCells,
      totalEntities: this.entities.size,
      maxEntitiesInCell,
      avgEntitiesPerCell: totalEntities / Math.max(1, nonEmptyCells),
    };
  }
}

// Entity class
class Entity {
  constructor(id, x, y, radius, vx = 0, vy = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
    this.color = this.randomColor();
    this.colliding = false;
  }

  randomColor() {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  update(deltaTime, width, height) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Bounce off walls
    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.vx *= -1;
      this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
    }

    if (this.y - this.radius < 0 || this.y + this.radius > height) {
      this.vy *= -1;
      this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.colliding ? '#ff0000' : this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    if (this.colliding) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  collidesWith(other) {
    const distance = this.distanceTo(other);
    return distance < this.radius + other.radius;
  }
}

// Demo
class SpatialGridDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.cellSize = 50;
    this.grid = new SpatialGrid(canvas.width, canvas.height, this.cellSize);

    this.entities = [];
    this.entityIdCounter = 0;

    this.useSpatialGrid = true;
    this.showGrid = true;
    this.showQueryRadius = false;
    this.queryX = 400;
    this.queryY = 300;
    this.queryRadius = 100;

    this.running = false;
    this.lastTime = performance.now();

    this.perfStats = {
      spatialGridTime: 0,
      bruteForceTime: 0,
      collisionsFound: 0,
    };

    this.setupInput();
    this.spawnEntities(100);
  }

  spawnEntities(count) {
    for (let i = 0; i < count; i++) {
      const entity = new Entity(
        this.entityIdCounter++,
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        10 + Math.random() * 15,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );

      this.entities.push(entity);
      this.grid.insert(entity);
    }
  }

  setupInput() {
    this.canvas.addEventListener('click', e => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const entity = new Entity(
        this.entityIdCounter++,
        x,
        y,
        10 + Math.random() * 15,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );

      this.entities.push(entity);
      this.grid.insert(entity);
    });

    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.queryX = e.clientX - rect.left;
      this.queryY = e.clientY - rect.top;
    });

    window.addEventListener('keydown', e => {
      if (e.code === 'KeyG') {
        this.showGrid = !this.showGrid;
      }
      if (e.code === 'KeyS') {
        this.useSpatialGrid = !this.useSpatialGrid;
      }
      if (e.code === 'KeyQ') {
        this.showQueryRadius = !this.showQueryRadius;
      }
      if (e.code === 'KeyC') {
        this.entities = [];
        this.grid.clear();
      }
      if (e.code === 'Space') {
        this.spawnEntities(10);
      }
    });
  }

  update(deltaTime) {
    // Update entities
    for (const entity of this.entities) {
      entity.update(deltaTime, this.canvas.width, this.canvas.height);
      entity.colliding = false;
    }

    // Update spatial grid
    for (const entity of this.entities) {
      this.grid.update(entity);
    }

    // Collision detection
    if (this.useSpatialGrid) {
      this.detectCollisionsSpatialGrid();
    } else {
      this.detectCollisionsBruteForce();
    }
  }

  detectCollisionsSpatialGrid() {
    const startTime = performance.now();

    let collisions = 0;
    const checked = new Set();

    for (const entity of this.entities) {
      // Query nearby entities
      const nearby = this.grid.queryNearby(entity.x, entity.y, entity.radius * 4);

      for (const other of nearby) {
        if (entity.id >= other.id) continue; // Avoid duplicate checks

        const pairKey = `${entity.id},${other.id}`;
        if (checked.has(pairKey)) continue;
        checked.add(pairKey);

        if (entity.collidesWith(other)) {
          entity.colliding = true;
          other.colliding = true;
          collisions++;
        }
      }
    }

    this.perfStats.spatialGridTime = performance.now() - startTime;
    this.perfStats.collisionsFound = collisions;
  }

  detectCollisionsBruteForce() {
    const startTime = performance.now();

    let collisions = 0;

    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const entityA = this.entities[i];
        const entityB = this.entities[j];

        if (entityA.collidesWith(entityB)) {
          entityA.colliding = true;
          entityB.colliding = true;
          collisions++;
        }
      }
    }

    this.perfStats.bruteForceTime = performance.now() - startTime;
    this.perfStats.collisionsFound = collisions;
  }

  render() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    if (this.showGrid) {
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;

      for (let col = 0; col <= this.grid.cols; col++) {
        const x = col * this.cellSize;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();
      }

      for (let row = 0; row <= this.grid.rows; row++) {
        const y = row * this.cellSize;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();
      }

      // Highlight non-empty cells
      const stats = this.grid.getStats();
      for (let row = 0; row < this.grid.rows; row++) {
        for (let col = 0; col < this.grid.cols; col++) {
          const count = this.grid.cells[row][col].size;
          if (count > 0) {
            const intensity = Math.min(count / stats.maxEntitiesInCell, 1);
            ctx.fillStyle = `rgba(0, 255, 0, ${intensity * 0.2})`;
            ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
          }
        }
      }
    }

    // Draw query radius
    if (this.showQueryRadius) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.queryX, this.queryY, this.queryRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Highlight entities in radius
      const nearby = this.grid.queryNearby(this.queryX, this.queryY, this.queryRadius);
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      for (const entity of nearby) {
        ctx.beginPath();
        ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`Nearby: ${nearby.length}`, this.queryX + 10, this.queryY - 10);
    }

    // Draw entities
    for (const entity of this.entities) {
      entity.draw(ctx);
    }

    // Draw stats
    this.renderStats();
  }

  renderStats() {
    const ctx = this.ctx;
    const gridStats = this.grid.getStats();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 200);

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    let y = 30;

    ctx.fillText(`Entities: ${this.entities.length}`, 20, y);
    y += 20;
    ctx.fillText(`Method: ${this.useSpatialGrid ? 'Spatial Grid' : 'Brute Force'}`, 20, y);
    y += 20;
    ctx.fillText(`Collisions: ${this.perfStats.collisionsFound}`, 20, y);
    y += 20;

    if (this.useSpatialGrid) {
      ctx.fillText(`Time: ${this.perfStats.spatialGridTime.toFixed(2)}ms`, 20, y);
    } else {
      ctx.fillText(`Time: ${this.perfStats.bruteForceTime.toFixed(2)}ms`, 20, y);
    }
    y += 25;

    ctx.fillText(
      `Grid: ${this.grid.cols}x${this.grid.rows} (${gridStats.totalCells} cells)`,
      20,
      y
    );
    y += 20;
    ctx.fillText(`Non-empty cells: ${gridStats.nonEmptyCells}`, 20, y);
    y += 20;
    ctx.fillText(`Max per cell: ${gridStats.maxEntitiesInCell}`, 20, y);
    y += 25;

    ctx.font = '12px Arial';
    ctx.fillText('Click: Add entity', 20, y);
    y += 15;
    ctx.fillText('Space: Add 10 entities', 20, y);
    y += 15;
    ctx.fillText('G: Toggle grid', 20, y);
    y += 15;
    ctx.fillText('S: Toggle spatial grid/brute force', 20, y);
    y += 15;
    ctx.fillText('Q: Toggle query radius', 20, y);
    y += 15;
    ctx.fillText('C: Clear entities', 20, y);
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

// Initialize demo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') || createCanvas();
    const demo = new SpatialGridDemo(canvas);
    demo.start();
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
  module.exports = { SpatialGrid, Entity, SpatialGridDemo };
}
