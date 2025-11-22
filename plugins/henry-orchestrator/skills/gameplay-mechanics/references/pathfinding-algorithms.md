# Pathfinding Algorithms

Comprehensive guide to pathfinding algorithms for game AI, including A\*, Dijkstra, Jump Point Search, and navmesh-based pathfinding.

## A\* (A-Star) Algorithm

A\* is the most popular pathfinding algorithm, offering optimal paths with excellent performance through heuristic-guided search.

### Core Implementation

```javascript
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().item;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

function aStar(start, goal, grid) {
  const openSet = new PriorityQueue();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  // Initialize start node
  gScore.set(coordToKey(start), 0);
  fScore.set(coordToKey(start), heuristic(start, goal));
  openSet.enqueue(start, fScore.get(coordToKey(start)));

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    const currentKey = coordToKey(current);

    // Goal reached
    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    // Explore neighbors
    for (const neighbor of getNeighbors(current, grid)) {
      const neighborKey = coordToKey(neighbor);
      const tentativeGScore = gScore.get(currentKey) + distance(current, neighbor);

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        // This path is better than previous one
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));

        // Add to open set if not already there
        if (!isInOpenSet(openSet, neighbor)) {
          openSet.enqueue(neighbor, fScore.get(neighborKey));
        }
      }
    }
  }

  return null; // No path found
}

function coordToKey(coord) {
  return `${coord.x},${coord.y}`;
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

function getNeighbors(node, grid) {
  const neighbors = [];
  const directions = [
    { x: 1, y: 0 }, // Right
    { x: -1, y: 0 }, // Left
    { x: 0, y: 1 }, // Down
    { x: 0, y: -1 }, // Up
  ];

  for (const dir of directions) {
    const neighbor = { x: node.x + dir.x, y: node.y + dir.y };

    if (grid.isWalkable(neighbor.x, neighbor.y)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}
```

### Heuristic Functions

**Manhattan Distance** (4-directional movement):

```javascript
function manhattanDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
```

**Euclidean Distance** (free movement):

```javascript
function euclideanDistance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

**Chebyshev Distance** (8-directional movement):

```javascript
function chebyshevDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
```

**Diagonal Distance** (8-directional with different costs):

```javascript
function diagonalDistance(a, b) {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  const D = 1; // Cost of straight move
  const D2 = 1.414; // Cost of diagonal move (sqrt(2))
  return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
}
```

### 8-Directional Movement

Include diagonal neighbors:

```javascript
function getNeighbors8(node, grid) {
  const neighbors = [];
  const directions = [
    { x: 1, y: 0, cost: 1 }, // Right
    { x: -1, y: 0, cost: 1 }, // Left
    { x: 0, y: 1, cost: 1 }, // Down
    { x: 0, y: -1, cost: 1 }, // Up
    { x: 1, y: 1, cost: 1.414 }, // Down-Right
    { x: -1, y: 1, cost: 1.414 }, // Down-Left
    { x: 1, y: -1, cost: 1.414 }, // Up-Right
    { x: -1, y: -1, cost: 1.414 }, // Up-Left
  ];

  for (const dir of directions) {
    const neighbor = {
      x: node.x + dir.x,
      y: node.y + dir.y,
      cost: dir.cost,
    };

    if (grid.isWalkable(neighbor.x, neighbor.y)) {
      // Check if diagonal movement is blocked by corners
      if (Math.abs(dir.x) === 1 && Math.abs(dir.y) === 1) {
        const horizontal = grid.isWalkable(node.x + dir.x, node.y);
        const vertical = grid.isWalkable(node.x, node.y + dir.y);

        // Allow diagonal only if both adjacent cells are walkable
        if (!horizontal || !vertical) {
          continue;
        }
      }

      neighbors.push(neighbor);
    }
  }

  return neighbors;
}
```

### Weighted A\* (Faster but Suboptimal)

Use weighted heuristic for faster pathfinding at cost of optimality:

```javascript
function weightedAStar(start, goal, grid, weight = 1.5) {
  // ... same as A* but modify fScore calculation:

  fScore.set(neighborKey, tentativeGScore + weight * heuristic(neighbor, goal));

  // weight > 1.0: Faster, potentially suboptimal paths
  // weight = 1.0: Standard A*, optimal paths
  // weight < 1.0: Slower, still optimal
}
```

## Dijkstra's Algorithm

Dijkstra guarantees shortest path but explores more nodes than A\* (no heuristic guidance).

```javascript
function dijkstra(start, goal, grid) {
  const openSet = new PriorityQueue();
  const distances = new Map();
  const cameFrom = new Map();

  distances.set(coordToKey(start), 0);
  openSet.enqueue(start, 0);

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    const currentKey = coordToKey(current);

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    for (const neighbor of getNeighbors(current, grid)) {
      const neighborKey = coordToKey(neighbor);
      const newDistance = distances.get(currentKey) + distance(current, neighbor);

      if (!distances.has(neighborKey) || newDistance < distances.get(neighborKey)) {
        distances.set(neighborKey, newDistance);
        cameFrom.set(neighborKey, current);
        openSet.enqueue(neighbor, newDistance);
      }
    }
  }

  return null;
}
```

**When to use:**

- Need guaranteed shortest path
- Heuristic is unreliable or unavailable
- Finding paths to multiple goals from single start
- Computing all-pairs shortest paths

## Jump Point Search (JPS)

Optimized A\* for uniform-cost grids, dramatically reducing nodes explored.

### Core Concept

JPS skips intermediate nodes in straight lines and diagonals, jumping directly to "jump points" where the path might change direction.

```javascript
function jumpPointSearch(start, goal, grid) {
  const openSet = new PriorityQueue();
  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();

  gScore.set(coordToKey(start), 0);
  fScore.set(coordToKey(start), heuristic(start, goal));
  openSet.enqueue(start, fScore.get(coordToKey(start)));

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();
    const currentKey = coordToKey(current);

    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    // Find jump point successors
    const successors = findSuccessors(current, goal, grid, cameFrom);

    for (const successor of successors) {
      const successorKey = coordToKey(successor);
      const dist = distance(current, successor);
      const tentativeGScore = gScore.get(currentKey) + dist;

      if (!gScore.has(successorKey) || tentativeGScore < gScore.get(successorKey)) {
        gScore.set(successorKey, tentativeGScore);
        fScore.set(successorKey, tentativeGScore + heuristic(successor, goal));
        cameFrom.set(successorKey, current);
        openSet.enqueue(successor, fScore.get(successorKey));
      }
    }
  }

  return null;
}

function jump(current, direction, goal, grid) {
  const next = {
    x: current.x + direction.x,
    y: current.y + direction.y,
  };

  if (!grid.isWalkable(next.x, next.y)) {
    return null;
  }

  if (next.x === goal.x && next.y === goal.y) {
    return next;
  }

  // Check for forced neighbors
  if (direction.x !== 0 && direction.y !== 0) {
    // Diagonal direction
    if (
      (grid.isWalkable(next.x - direction.x, next.y + direction.y) &&
        !grid.isWalkable(next.x - direction.x, next.y)) ||
      (grid.isWalkable(next.x + direction.x, next.y - direction.y) &&
        !grid.isWalkable(next.x, next.y - direction.y))
    ) {
      return next;
    }

    // Check horizontal and vertical
    if (
      jump(next, { x: direction.x, y: 0 }, goal, grid) ||
      jump(next, { x: 0, y: direction.y }, goal, grid)
    ) {
      return next;
    }
  } else {
    // Horizontal or vertical direction
    if (direction.x !== 0) {
      if (
        (grid.isWalkable(next.x + direction.x, next.y + 1) &&
          !grid.isWalkable(next.x, next.y + 1)) ||
        (grid.isWalkable(next.x + direction.x, next.y - 1) && !grid.isWalkable(next.x, next.y - 1))
      ) {
        return next;
      }
    } else {
      if (
        (grid.isWalkable(next.x + 1, next.y + direction.y) &&
          !grid.isWalkable(next.x + 1, next.y)) ||
        (grid.isWalkable(next.x - 1, next.y + direction.y) && !grid.isWalkable(next.x - 1, next.y))
      ) {
        return next;
      }
    }
  }

  return jump(next, direction, goal, grid);
}
```

**Performance:**

- 10-40x faster than A\* on large open grids
- Best for uniform-cost grids
- Less benefit on irregular terrain

## Navmesh Pathfinding

Navigation meshes use polygons to represent walkable areas, ideal for complex 3D environments.

### Navmesh Structure

```javascript
class NavMesh {
  constructor() {
    this.polygons = [];
    this.graph = new Map(); // Polygon adjacency graph
  }

  addPolygon(vertices) {
    const polygon = {
      id: this.polygons.length,
      vertices: vertices,
      center: this.calculateCenter(vertices),
      neighbors: [],
    };

    this.polygons.push(polygon);
    return polygon;
  }

  connectPolygons(poly1, poly2) {
    poly1.neighbors.push(poly2.id);
    poly2.neighbors.push(poly1.id);

    // Store shared edge for portal algorithm
    const edge = this.findSharedEdge(poly1, poly2);
    this.graph.set(`${poly1.id}-${poly2.id}`, edge);
    this.graph.set(`${poly2.id}-${poly1.id}`, edge);
  }

  findPolygonContainingPoint(point) {
    for (const polygon of this.polygons) {
      if (this.pointInPolygon(point, polygon.vertices)) {
        return polygon;
      }
    }
    return null;
  }

  pointInPolygon(point, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x,
        yi = vertices[i].y;
      const xj = vertices[j].x,
        yj = vertices[j].y;

      if (
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  calculateCenter(vertices) {
    let sumX = 0,
      sumY = 0;
    for (const v of vertices) {
      sumX += v.x;
      sumY += v.y;
    }
    return { x: sumX / vertices.length, y: sumY / vertices.length };
  }

  findSharedEdge(poly1, poly2) {
    const verts1 = poly1.vertices;
    const verts2 = poly2.vertices;

    for (let i = 0; i < verts1.length; i++) {
      const v1 = verts1[i];
      const v2 = verts1[(i + 1) % verts1.length];

      for (let j = 0; j < verts2.length; j++) {
        const v3 = verts2[j];
        const v4 = verts2[(j + 1) % verts2.length];

        if (this.edgesEqual(v1, v2, v3, v4)) {
          return { start: v1, end: v2 };
        }
      }
    }

    return null;
  }

  edgesEqual(a1, a2, b1, b2) {
    return (
      (this.pointsEqual(a1, b1) && this.pointsEqual(a2, b2)) ||
      (this.pointsEqual(a1, b2) && this.pointsEqual(a2, b1))
    );
  }

  pointsEqual(p1, p2) {
    const epsilon = 0.001;
    return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
  }
}
```

### A\* on Navmesh

```javascript
function navmeshAStar(start, goal, navmesh) {
  const startPoly = navmesh.findPolygonContainingPoint(start);
  const goalPoly = navmesh.findPolygonContainingPoint(goal);

  if (!startPoly || !goalPoly) {
    return null; // Point not on navmesh
  }

  if (startPoly === goalPoly) {
    return [start, goal]; // Direct path
  }

  // Run A* on polygon graph
  const polyPath = aStarPolygons(startPoly, goalPoly, navmesh);

  if (!polyPath) {
    return null;
  }

  // Convert polygon path to waypoints using funnel algorithm
  return funnelAlgorithm(start, goal, polyPath, navmesh);
}

function aStarPolygons(startPoly, goalPoly, navmesh) {
  const openSet = new PriorityQueue();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(startPoly.id, 0);
  fScore.set(startPoly.id, distance(startPoly.center, goalPoly.center));
  openSet.enqueue(startPoly, fScore.get(startPoly.id));

  while (!openSet.isEmpty()) {
    const current = openSet.dequeue();

    if (current.id === goalPoly.id) {
      return reconstructPolyPath(cameFrom, current);
    }

    for (const neighborId of current.neighbors) {
      const neighbor = navmesh.polygons[neighborId];
      const tentativeGScore = gScore.get(current.id) + distance(current.center, neighbor.center);

      if (!gScore.has(neighbor.id) || tentativeGScore < gScore.get(neighbor.id)) {
        cameFrom.set(neighbor.id, current);
        gScore.set(neighbor.id, tentativeGScore);
        fScore.set(neighbor.id, tentativeGScore + distance(neighbor.center, goalPoly.center));
        openSet.enqueue(neighbor, fScore.get(neighbor.id));
      }
    }
  }

  return null;
}

function reconstructPolyPath(cameFrom, current) {
  const path = [current];

  while (cameFrom.has(current.id)) {
    current = cameFrom.get(current.id);
    path.unshift(current);
  }

  return path;
}
```

### Funnel Algorithm (String Pulling)

Converts polygon corridor into optimal path:

```javascript
function funnelAlgorithm(start, goal, polyPath, navmesh) {
  if (polyPath.length < 2) {
    return [start, goal];
  }

  const path = [start];
  let apex = start;
  let left = start;
  let right = start;

  for (let i = 0; i < polyPath.length - 1; i++) {
    const edge = navmesh.graph.get(`${polyPath[i].id}-${polyPath[i + 1].id}`);

    // Update funnel
    const newLeft = edge.start;
    const newRight = edge.end;

    // Narrow funnel from left
    if (cross(apex, left, newLeft) >= 0) {
      if (apex === left || cross(apex, left, newLeft) >= 0) {
        left = newLeft;
      } else {
        // Narrow funnel from right crossed, add point and restart
        path.push(right);
        apex = right;
        left = apex;
        right = apex;
        i--; // Reprocess this edge
        continue;
      }
    }

    // Narrow funnel from right
    if (cross(apex, right, newRight) <= 0) {
      if (apex === right || cross(apex, right, newRight) <= 0) {
        right = newRight;
      } else {
        path.push(left);
        apex = left;
        left = apex;
        right = apex;
        i--;
        continue;
      }
    }
  }

  path.push(goal);
  return path;
}

function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
```

## Path Smoothing

### Line-of-Sight Smoothing

Remove unnecessary waypoints when direct path exists:

```javascript
function smoothPath(path, grid) {
  if (path.length <= 2) return path;

  const smoothed = [path[0]];
  let current = 0;

  while (current < path.length - 1) {
    // Try to skip waypoints
    for (let lookahead = path.length - 1; lookahead > current + 1; lookahead--) {
      if (hasLineOfSight(path[current], path[lookahead], grid)) {
        smoothed.push(path[lookahead]);
        current = lookahead;
        break;
      }
    }

    if (current === smoothed.length - 1) {
      // Couldn't skip any waypoints
      current++;
      if (current < path.length) {
        smoothed.push(path[current]);
      }
    }
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
```

### Bezier Curve Smoothing

Create curved paths:

```javascript
function bezierSmooth(path) {
  if (path.length < 3) return path;

  const smoothed = [];
  const segments = 10; // Points per segment

  for (let i = 0; i < path.length - 2; i++) {
    const p0 = path[i];
    const p1 = path[i + 1];
    const p2 = path[i + 2];

    for (let t = 0; t <= segments; t++) {
      const u = t / segments;
      const point = quadraticBezier(p0, p1, p2, u);
      smoothed.push(point);
    }
  }

  smoothed.push(path[path.length - 1]);
  return smoothed;
}

function quadraticBezier(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}
```

## Dynamic Pathfinding

### Hierarchical Pathfinding

Split map into regions for faster long-distance pathfinding:

```javascript
class HierarchicalPathfinder {
  constructor(grid, regionSize) {
    this.grid = grid;
    this.regionSize = regionSize;
    this.regions = this.buildRegions();
    this.regionGraph = this.buildRegionGraph();
  }

  findPath(start, goal) {
    const startRegion = this.getRegion(start);
    const goalRegion = this.getRegion(goal);

    if (startRegion === goalRegion) {
      // Same region - use low-level pathfinding
      return aStar(start, goal, this.grid);
    }

    // High-level path through regions
    const regionPath = aStar(startRegion, goalRegion, this.regionGraph);

    if (!regionPath) return null;

    // Low-level path through each region
    let fullPath = [];
    let currentPos = start;

    for (let i = 1; i < regionPath.length; i++) {
      const regionGoal = this.getRegionEntryPoint(regionPath[i]);
      const segment = aStar(currentPos, regionGoal, this.grid);

      if (!segment) return null;

      fullPath = fullPath.concat(segment.slice(1)); // Avoid duplicating points
      currentPos = regionGoal;
    }

    // Final segment to goal
    const finalSegment = aStar(currentPos, goal, this.grid);
    if (!finalSegment) return null;

    fullPath = fullPath.concat(finalSegment.slice(1));
    return fullPath;
  }

  buildRegions() {
    // Divide grid into regions
    // Implementation depends on grid structure
  }

  buildRegionGraph() {
    // Create graph of region connections
  }

  getRegion(point) {
    return {
      x: Math.floor(point.x / this.regionSize),
      y: Math.floor(point.y / this.regionSize),
    };
  }

  getRegionEntryPoint(region) {
    // Find best entry point for region
    return {
      x: region.x * this.regionSize + this.regionSize / 2,
      y: region.y * this.regionSize + this.regionSize / 2,
    };
  }
}
```

### Incremental Pathfinding (D\* Lite)

Efficiently recompute paths when environment changes:

```javascript
// D* Lite is complex - simplified version
class DStarLite {
  constructor(grid, start, goal) {
    this.grid = grid;
    this.start = start;
    this.goal = goal;
    this.km = 0;
    this.openSet = new PriorityQueue();
    this.rhs = new Map();
    this.g = new Map();

    this.initialize();
  }

  initialize() {
    this.rhs.set(coordToKey(this.goal), 0);
    this.openSet.enqueue(this.goal, this.calculateKey(this.goal));
  }

  calculateKey(node) {
    const gVal = this.g.get(coordToKey(node)) || Infinity;
    const rhsVal = this.rhs.get(coordToKey(node)) || Infinity;
    const minVal = Math.min(gVal, rhsVal);
    return [minVal + this.heuristic(this.start, node) + this.km, minVal];
  }

  // Update costs when terrain changes
  updateVertex(node) {
    const nodeKey = coordToKey(node);

    if (!this.isGoal(node)) {
      let minRhs = Infinity;

      for (const neighbor of getNeighbors(node, this.grid)) {
        const cost = this.g.get(coordToKey(neighbor)) || Infinity;
        minRhs = Math.min(minRhs, cost + this.moveCost(node, neighbor));
      }

      this.rhs.set(nodeKey, minRhs);
    }

    this.openSet.remove(node);

    if ((this.g.get(nodeKey) || Infinity) !== (this.rhs.get(nodeKey) || Infinity)) {
      this.openSet.enqueue(node, this.calculateKey(node));
    }
  }

  // Main computation step
  computeShortestPath() {
    while (!this.openSet.isEmpty()) {
      const node = this.openSet.dequeue();
      const nodeKey = coordToKey(node);

      if (this.g.get(nodeKey) > this.rhs.get(nodeKey)) {
        this.g.set(nodeKey, this.rhs.get(nodeKey));

        for (const neighbor of getNeighbors(node, this.grid)) {
          this.updateVertex(neighbor);
        }
      } else {
        this.g.set(nodeKey, Infinity);
        this.updateVertex(node);

        for (const neighbor of getNeighbors(node, this.grid)) {
          this.updateVertex(neighbor);
        }
      }
    }
  }
}
```

## Performance Optimization

### Caching and Reuse

```javascript
class PathfindingCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  getPath(start, goal) {
    const key = `${coordToKey(start)}-${coordToKey(goal)}`;
    return this.cache.get(key);
  }

  cachePath(start, goal, path) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const key = `${coordToKey(start)}-${coordToKey(goal)}`;
    this.cache.set(key, path);
  }

  invalidate(region) {
    // Remove cached paths affected by terrain change
    for (const [key, path] of this.cache.entries()) {
      if (this.pathIntersectsRegion(path, region)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### Async Pathfinding

Spread computation across multiple frames:

```javascript
class AsyncPathfinder {
  constructor() {
    this.requests = [];
  }

  requestPath(start, goal, callback) {
    this.requests.push({
      start,
      goal,
      callback,
      openSet: new PriorityQueue(),
      gScore: new Map(),
      fScore: new Map(),
      cameFrom: new Map(),
      initialized: false,
    });
  }

  update(maxTimeMs = 16) {
    const startTime = performance.now();

    while (this.requests.length > 0 && performance.now() - startTime < maxTimeMs) {
      const request = this.requests[0];

      if (!request.initialized) {
        // Initialize request
        const startKey = coordToKey(request.start);
        request.gScore.set(startKey, 0);
        request.fScore.set(startKey, heuristic(request.start, request.goal));
        request.openSet.enqueue(request.start, request.fScore.get(startKey));
        request.initialized = true;
      }

      // Process some nodes
      const nodesPerStep = 50;
      for (let i = 0; i < nodesPerStep && !request.openSet.isEmpty(); i++) {
        const current = request.openSet.dequeue();

        if (current.x === request.goal.x && current.y === request.goal.y) {
          // Path found
          const path = reconstructPath(request.cameFrom, current);
          request.callback(path);
          this.requests.shift();
          break;
        }

        // Expand neighbors
        for (const neighbor of getNeighbors(current, grid)) {
          const neighborKey = coordToKey(neighbor);
          const currentKey = coordToKey(current);
          const tentativeGScore = request.gScore.get(currentKey) + distance(current, neighbor);

          if (
            !request.gScore.has(neighborKey) ||
            tentativeGScore < request.gScore.get(neighborKey)
          ) {
            request.cameFrom.set(neighborKey, current);
            request.gScore.set(neighborKey, tentativeGScore);
            request.fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, request.goal));
            request.openSet.enqueue(neighbor, request.fScore.get(neighborKey));
          }
        }
      }

      if (request.openSet.isEmpty()) {
        // No path found
        request.callback(null);
        this.requests.shift();
      }
    }
  }
}
```

## Algorithm Comparison

| Algorithm    | Optimality   | Speed          | Memory | Best Use Case                     |
| ------------ | ------------ | -------------- | ------ | --------------------------------- |
| A\*          | Optimal      | Fast           | Medium | General purpose, most games       |
| Dijkstra     | Optimal      | Slow           | High   | Multiple goals, all-pairs         |
| JPS          | Optimal      | Very Fast      | Medium | Uniform grids, large maps         |
| Weighted A\* | Suboptimal   | Very Fast      | Medium | Real-time, less critical paths    |
| Navmesh      | Near-optimal | Fast           | Low    | 3D environments, complex geometry |
| Hierarchical | Near-optimal | Very Fast      | High   | Very large maps, MMOs             |
| D\* Lite     | Optimal      | Fast (updates) | High   | Dynamic environments              |

## Common Pitfalls

**Not validating path**: Always check if returned path is null before using it.

**Inefficient priority queue**: Use binary heap or Fibonacci heap, not simple array sorting.

**Wrong heuristic**: Heuristic must be admissible (never overestimate) for optimal paths.

**Memory leaks**: Clear data structures between pathfinding requests.

**Grid resolution**: Too fine wastes CPU, too coarse limits movement options. Balance based on game needs.

**Not caching paths**: Recompute infrequently, reuse when possible.

**Synchronous pathfinding**: Long paths can freeze game. Use async pathfinding or Web Workers.
