/**
 * A* Pathfinding Implementation
 *
 * This example demonstrates:
 * - Complete A* algorithm implementation
 * - Priority queue for efficient node selection
 * - Grid-based navigation
 * - Path smoothing
 * - Visual debugging
 */

class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    const element = { item, priority };

    // Binary heap insertion
    this.elements.push(element);
    this.bubbleUp(this.elements.length - 1);
  }

  dequeue() {
    if (this.isEmpty()) return null;

    const min = this.elements[0];
    const last = this.elements.pop();

    if (this.elements.length > 0) {
      this.elements[0] = last;
      this.bubbleDown(0);
    }

    return min.item;
  }

  bubbleUp(index) {
    const element = this.elements[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.elements[parentIndex];

      if (element.priority >= parent.priority) break;

      this.elements[index] = parent;
      index = parentIndex;
    }

    this.elements[index] = element;
  }

  bubbleDown(index) {
    const length = this.elements.length;
    const element = this.elements[index];

    while (true) {
      let minIndex = index;
      const leftIndex = 2 * index + 1;
      const rightIndex = 2 * index + 2;

      if (leftIndex < length &&
          this.elements[leftIndex].priority < this.elements[minIndex].priority) {
        minIndex = leftIndex;
      }

      if (rightIndex < length &&
          this.elements[rightIndex].priority < this.elements[minIndex].priority) {
        minIndex = rightIndex;
      }

      if (minIndex === index) break;

      this.elements[index] = this.elements[minIndex];
      index = minIndex;
    }

    this.elements[index] = element;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

class NavGrid {
  constructor(width, height, cellSize) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.floor(width / cellSize);
    this.rows = Math.floor(height / cellSize);
    this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(true));
  }

  worldToGrid(x, y) {
    return {
      x: Math.floor(x / this.cellSize),
      y: Math.floor(y / this.cellSize)
    };
  }

  gridToWorld(gridX, gridY) {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2
    };
  }

  isWalkable(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
      return false;
    }
    return this.grid[y][x];
  }

  setWalkable(x, y, walkable) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.grid[y][x] = walkable;
    }
  }

  toggleWalkable(x, y) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.grid[y][x] = !this.grid[y][x];
    }
  }
}

function coordToKey(coord) {
  return `${coord.x},${coord.y}`;
}

function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function euclideanDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getNeighbors(node, grid, allowDiagonal = true) {
  const neighbors = [];
  const directions = [
    { x: 1, y: 0, cost: 1 },
    { x: -1, y: 0, cost: 1 },
    { x: 0, y: 1, cost: 1 },
    { x: 0, y: -1, cost: 1 }
  ];

  if (allowDiagonal) {
    directions.push(
      { x: 1, y: 1, cost: 1.414 },
      { x: -1, y: 1, cost: 1.414 },
      { x: 1, y: -1, cost: 1.414 },
      { x: -1, y: -1, cost: 1.414 }
    );
  }

  for (const dir of directions) {
    const neighbor = {
      x: node.x + dir.x,
      y: node.y + dir.y,
      cost: dir.cost
    };

    if (!grid.isWalkable(neighbor.x, neighbor.y)) {
      continue;
    }

    // Check diagonal movement - prevent cutting corners
    if (allowDiagonal && Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) {
      const horizontal = grid.isWalkable(node.x + dir.x, node.y);
      const vertical = grid.isWalkable(node.x, node.y + dir.y);

      if (!horizontal || !vertical) {
        continue;
      }
    }

    neighbors.push(neighbor);
  }

  return neighbors;
}

function aStar(start, goal, grid, heuristic = manhattanDistance) {
  const openSet = new PriorityQueue();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  const startKey = coordToKey(start);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, goal));
  openSet.enqueue(start, fScore.get(startKey));

  const closedSet = new Set();

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    const currentKey = coordToKey(current);

    if (current.x === goal.x && current.y === goal.y) {
      return {
        path: reconstructPath(cameFrom, current),
        explored: closedSet.size
      };
    }

    closedSet.add(currentKey);

    for (const neighbor of getNeighbors(current, grid, true)) {
      const neighborKey = coordToKey(neighbor);

      if (closedSet.has(neighborKey)) {
        continue;
      }

      const tentativeGScore = gScore.get(currentKey) + neighbor.cost;

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));
        openSet.enqueue(neighbor, fScore.get(neighborKey));
      }
    }
  }

  return { path: null, explored: closedSet.size };
}

function reconstructPath(cameFrom, current) {
  const path = [current];
  let currentKey = coordToKey(current);

  while (cameFrom.has(currentKey)) {
    current = cameFrom.get(currentKey);
    path.unshift(current);
    currentKey = coordToKey(current);
  }

  return path;
}

function smoothPath(path, grid) {
  if (!path || path.length <= 2) return path;

  const smoothed = [path[0]];
  let current = 0;

  while (current < path.length - 1) {
    // Try to skip waypoints
    let farthest = current + 1;

    for (let lookahead = path.length - 1; lookahead > current + 1; lookahead--) {
      if (hasLineOfSight(path[current], path[lookahead], grid)) {
        farthest = lookahead;
        break;
      }
    }

    smoothed.push(path[farthest]);
    current = farthest;
  }

  return smoothed;
}

function hasLineOfSight(start, end, grid) {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;
  let x = start.x;
  let y = start.y;

  while (true) {
    if (!grid.isWalkable(x, y)) {
      return false;
    }

    if (x === end.x && y === end.y) {
      return true;
    }

    const e2 = 2 * err;

    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }

    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

// Visualization
class PathfindingDemo {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.cellSize = 20;
    this.grid = new NavGrid(canvas.width, canvas.height, this.cellSize);

    this.start = null;
    this.goal = null;
    this.path = null;
    this.smoothedPath = null;

    this.mode = 'wall'; // 'start', 'goal', 'wall'
    this.isDrawing = false;

    this.setupInput();
    this.createMaze();
    this.render();
  }

  createMaze() {
    // Create some walls
    for (let y = 5; y < 10; y++) {
      for (let x = 10; x < 25; x++) {
        this.grid.setWalkable(x, y, false);
      }
    }

    // Opening in wall
    for (let x = 15; x < 20; x++) {
      this.grid.setWalkable(x, 7, true);
    }

    // More obstacles
    for (let y = 15; y < 25; y++) {
      this.grid.setWalkable(10, y, false);
    }

    // Set default start and goal
    this.start = { x: 5, y: 5 };
    this.goal = { x: 35, y: 25 };
    this.findPath();
  }

  setupInput() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      this.handleClick(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDrawing && this.mode === 'wall') {
        this.handleClick(e);
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });

    // Mode buttons
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Digit1') this.mode = 'start';
      if (e.code === 'Digit2') this.mode = 'goal';
      if (e.code === 'Digit3') this.mode = 'wall';
      if (e.code === 'KeyC') this.clearGrid();
      this.render();
    });
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridPos = this.grid.worldToGrid(x, y);

    if (this.mode === 'start') {
      this.start = gridPos;
      this.findPath();
    } else if (this.mode === 'goal') {
      this.goal = gridPos;
      this.findPath();
    } else if (this.mode === 'wall') {
      this.grid.toggleWalkable(gridPos.x, gridPos.y);
      this.findPath();
    }

    this.render();
  }

  clearGrid() {
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        this.grid.setWalkable(x, y, true);
      }
    }
    this.findPath();
  }

  findPath() {
    if (!this.start || !this.goal) return;

    const result = aStar(this.start, this.goal, this.grid);
    this.path = result.path;
    this.explored = result.explored;

    if (this.path) {
      this.smoothedPath = smoothPath(this.path, this.grid);
    } else {
      this.smoothedPath = null;
    }
  }

  render() {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const worldPos = this.grid.gridToWorld(x, y);
        const isWalkable = this.grid.isWalkable(x, y);

        ctx.fillStyle = isWalkable ? '#2a2a2a' : '#555';
        ctx.fillRect(
          x * this.cellSize,
          y * this.cellSize,
          this.cellSize - 1,
          this.cellSize - 1
        );
      }
    }

    // Draw path
    if (this.path) {
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < this.path.length; i++) {
        const worldPos = this.grid.gridToWorld(this.path[i].x, this.path[i].y);

        if (i === 0) {
          ctx.moveTo(worldPos.x, worldPos.y);
        } else {
          ctx.lineTo(worldPos.x, worldPos.y);
        }
      }

      ctx.stroke();
    }

    // Draw smoothed path
    if (this.smoothedPath) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();

      for (let i = 0; i < this.smoothedPath.length; i++) {
        const worldPos = this.grid.gridToWorld(
          this.smoothedPath[i].x,
          this.smoothedPath[i].y
        );

        if (i === 0) {
          ctx.moveTo(worldPos.x, worldPos.y);
        } else {
          ctx.lineTo(worldPos.x, worldPos.y);
        }
      }

      ctx.stroke();

      // Draw waypoints
      for (const waypoint of this.smoothedPath) {
        const worldPos = this.grid.gridToWorld(waypoint.x, waypoint.y);
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(worldPos.x, worldPos.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw start
    if (this.start) {
      const worldPos = this.grid.gridToWorld(this.start.x, this.start.y);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(
        this.start.x * this.cellSize,
        this.start.y * this.cellSize,
        this.cellSize - 1,
        this.cellSize - 1
      );

      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('S', worldPos.x - 5, worldPos.y + 5);
    }

    // Draw goal
    if (this.goal) {
      const worldPos = this.grid.gridToWorld(this.goal.x, this.goal.y);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(
        this.goal.x * this.cellSize,
        this.goal.y * this.cellSize,
        this.cellSize - 1,
        this.cellSize - 1
      );

      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText('G', worldPos.x - 5, worldPos.y + 5);
    }

    // Draw instructions
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`Mode: ${this.mode.toUpperCase()} | 1:Start 2:Goal 3:Wall C:Clear`, 10, 20);

    if (this.path) {
      ctx.fillText(`Path length: ${this.path.length} | Smoothed: ${this.smoothedPath.length} | Explored: ${this.explored}`, 10, 40);
    } else {
      ctx.fillText('No path found!', 10, 40);
    }
  }
}

// Initialize demo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas') || createCanvas();
    new PathfindingDemo(canvas);
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
  module.exports = {
    aStar,
    NavGrid,
    PriorityQueue,
    smoothPath,
    hasLineOfSight,
    manhattanDistance,
    euclideanDistance
  };
}
