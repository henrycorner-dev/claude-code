# Multiplayer Architecture Patterns

This reference provides complete architecture examples for different types of multiplayer games, showing how to combine the core netcode techniques (client prediction, server reconciliation, lag compensation, entity interpolation) into cohesive systems.

## Pattern 1: Fast-Paced Competitive Shooter

**Requirements:**
- Responsive local player movement (no input lag)
- Accurate hit detection despite latency
- Smooth rendering of other players
- High tickrate for competitive play
- Authoritative server (no cheating)

**Architecture:**

```
Client:
- Client-side prediction for local player movement
- Server reconciliation for local player corrections
- Entity interpolation for other players (100ms delay)
- Instant local feedback for shooting (predicted hit markers)
- Receive server-authoritative hit confirmations

Server:
- Authoritative server at 60Hz tickrate
- Validate all client inputs (movement speed, ability cooldowns)
- Lag compensation for hitscan weapons
- Broadcast state snapshots to all clients at 20Hz
- Send critical events immediately (damage, death)
```

### Complete Data Flow

**Player Movement:**
1. Client: Process input → Apply locally (predict) → Send to server
2. Server: Receive input → Validate → Apply → Include in next snapshot
3. Client: Receive snapshot → Reconcile if mismatch → Replay inputs

**Shooting:**
1. Client: Fire weapon → Raycast locally (show hit marker) → Send fire command
2. Server: Receive fire → Rewind state by client latency → Validate hit → Apply damage
3. All Clients: Receive damage event → Update health bars, show hit effects

**Other Players:**
1. Server: Broadcast state snapshots at 20Hz with all player positions
2. Client: Buffer snapshots → Interpolate between buffered states at 100ms delay
3. Client: Render smooth movement at 60fps from 20Hz data

### Code Structure

```javascript
class ShooterClient {
  constructor() {
    this.localPlayer = new PredictedPlayer();
    this.otherPlayers = new Map(); // id -> InterpolatedPlayer
    this.stateBuffer = new StateBuffer();
    this.inputSystem = new InputSystem();
    this.reconciliation = new Reconciliation();
  }

  update(deltaTime) {
    // Local player: predict
    const input = this.inputSystem.getInput();
    this.localPlayer.processInput(input, deltaTime);
    this.sendInputToServer(input);

    // Other players: interpolate
    const renderTime = Date.now() - 100; // 100ms interpolation delay
    for (const [id, player] of this.otherPlayers) {
      const interpolated = this.interpolatePlayer(id, renderTime);
      player.setRenderState(interpolated);
    }
  }

  onServerState(state) {
    // Reconcile local player
    this.reconciliation.reconcile(this.localPlayer, state.localPlayerState);

    // Buffer state for interpolation
    this.stateBuffer.add(state);
  }
}

class ShooterServer {
  constructor() {
    this.players = new Map(); // id -> ServerPlayer
    this.stateHistory = new StateHistory();
    this.tickRate = 60; // Hz
    this.broadcastRate = 20; // Hz
  }

  tick(deltaTime) {
    // Process queued inputs
    for (const input of this.inputQueue) {
      const player = this.players.get(input.playerId);
      this.validateAndApplyInput(player, input);
    }

    // Physics simulation
    this.simulatePhysics(deltaTime);

    // Record state for lag compensation
    this.stateHistory.record(this.captureState());
  }

  onFireCommand(playerId, fireData) {
    const player = this.players.get(playerId);

    // Lag compensation
    const compensatedState = this.stateHistory.getStateAt(
      Date.now() - player.latency / 2
    );

    // Validate hit
    const hit = this.validateShot(fireData, compensatedState);

    if (hit) {
      // Apply damage
      const target = this.players.get(hit.targetId);
      target.takeDamage(fireData.damage);

      // Broadcast hit event immediately (not waiting for next snapshot)
      this.broadcastHit(playerId, hit);
    }
  }
}
```

### Tuning Parameters

```javascript
const ShooterConfig = {
  // Server
  serverTickRate: 60,        // Hz - simulation rate
  snapshotRate: 20,          // Hz - network update rate
  maxCompensation: 200,      // ms - max lag compensation

  // Client
  interpolationDelay: 100,   // ms - render delay for other players
  reconciliationThreshold: 0.1, // m - min error before reconciling
  inputBufferSize: 60,       // frames - inputs stored for reconciliation

  // Network
  targetLatency: 50,         // ms - assumed minimum latency
  maxLatency: 200            // ms - disconnect if exceeded
};
```

## Pattern 2: Racing Game

**Requirements:**
- Smooth vehicle physics
- Close racing with tight gaps between cars
- Handle connections dropping gracefully
- Lower tickrate acceptable (not competitive shooter)

**Architecture:**

```
Client:
- Client-side prediction for own vehicle physics
- Server reconciliation with smoothing (physics differences acceptable)
- Entity interpolation + extrapolation for other vehicles
- Dead reckoning when server updates are delayed

Server:
- Authoritative server at 20-30Hz
- Validate positions (anti-cheat: max speed, wall clipping)
- Broadcast all vehicle states
- Ghost mode for disconnected players (continue simulation briefly)
```

### Extrapolation for Racing

Racing games benefit from extrapolation since vehicles move predictably.

```javascript
class RacingCarInterpolator {
  interpolate(carId, renderTime, buffer) {
    const { before, after } = buffer.getSnapshotsForInterpolation(renderTime);

    // If we have data, interpolate normally
    if (before && after && renderTime < after.timestamp) {
      return this.lerpCar(before, after, renderTime);
    }

    // If we've run out of data, extrapolate using velocity
    if (after) {
      return this.extrapolateCar(after, renderTime);
    }

    return null;
  }

  extrapolateCar(lastState, renderTime) {
    const car = lastState.cars.find(c => c.id === carId);
    if (!car) return null;

    const dt = (renderTime - lastState.timestamp) / 1000;

    // Extrapolate position based on velocity and acceleration
    const position = {
      x: car.position.x + car.velocity.x * dt + 0.5 * car.acceleration.x * dt * dt,
      y: car.position.y + car.velocity.y * dt + 0.5 * car.acceleration.y * dt * dt,
      z: car.position.z + car.velocity.z * dt + 0.5 * car.acceleration.z * dt * dt
    };

    // Extrapolate velocity
    const velocity = {
      x: car.velocity.x + car.acceleration.x * dt,
      y: car.velocity.y + car.acceleration.y * dt,
      z: car.velocity.z + car.acceleration.z * dt
    };

    return {
      id: car.id,
      position: position,
      velocity: velocity,
      rotation: car.rotation // Keep last known rotation
    };
  }
}
```

### Smoothing Physics Corrections

Racing games need smoother reconciliation since cars have momentum.

```javascript
class SmoothPhysicsReconciliation {
  reconcile(localCar, serverState) {
    const error = this.calculateError(localCar, serverState);

    if (error.position > 2.0) {
      // Large error, snap immediately
      localCar.position = serverState.position;
      localCar.velocity = serverState.velocity;
    } else if (error.position > 0.5) {
      // Medium error, apply corrective force over time
      const correctionDuration = 0.2; // 200ms
      const correctionForce = this.calculateCorrectionForce(
        localCar.position,
        serverState.position,
        correctionDuration
      );

      localCar.applyCorrectionForce(correctionForce, correctionDuration);
    }
    // Small errors: ignore (within acceptable range)
  }
}
```

## Pattern 3: Top-Down MOBA/RTS

**Requirements:**
- Many units on screen (10-100+)
- Click-to-move gameplay (less sensitive to input lag)
- Strategic gameplay (precision less critical than shooters)
- Lower bandwidth per entity

**Architecture:**

```
Client:
- Client-side prediction for player-controlled units only
- Server reconciliation for player units
- Simple interpolation for other units (no extrapolation needed)
- Interest management (only sync nearby entities)

Server:
- Authoritative server at 20Hz
- Spatial interest management (only send visible entities)
- Delta compression (only send changed entities)
- Priority system (player units highest priority)
```

### Interest Management

Only sync entities near the player's view.

```javascript
class InterestManager {
  getRelevantEntities(player, allEntities) {
    const viewRadius = 50; // meters
    const playerPos = player.position;

    return allEntities.filter(entity => {
      const distance = this.calculateDistance(playerPos, entity.position);
      return distance <= viewRadius;
    });
  }

  buildSnapshot(player, gameState) {
    const relevantEntities = this.getRelevantEntities(player, gameState.entities);

    return {
      timestamp: Date.now(),
      playerUnits: relevantEntities.filter(e => e.ownerId === player.id),
      otherUnits: relevantEntities.filter(e => e.ownerId !== player.id)
    };
  }
}
```

### Delta Compression

Only send entities that changed since last update.

```javascript
class DeltaCompression {
  constructor() {
    this.lastSentState = new Map(); // clientId -> lastState
  }

  buildDeltaSnapshot(clientId, currentState) {
    const lastState = this.lastSentState.get(clientId) || {};

    const delta = {
      timestamp: Date.now(),
      added: [],
      updated: [],
      removed: []
    };

    // Find added and updated entities
    for (const entity of currentState.entities) {
      const lastEntity = lastState.entities?.find(e => e.id === entity.id);

      if (!lastEntity) {
        delta.added.push(entity);
      } else if (this.hasChanged(entity, lastEntity)) {
        delta.updated.push(this.getDiff(entity, lastEntity));
      }
    }

    // Find removed entities
    if (lastState.entities) {
      for (const lastEntity of lastState.entities) {
        if (!currentState.entities.find(e => e.id === lastEntity.id)) {
          delta.removed.push(lastEntity.id);
        }
      }
    }

    this.lastSentState.set(clientId, currentState);
    return delta;
  }

  hasChanged(entity, lastEntity) {
    const positionThreshold = 0.1;
    const dx = Math.abs(entity.position.x - lastEntity.position.x);
    const dy = Math.abs(entity.position.y - lastEntity.position.y);

    return dx > positionThreshold || dy > positionThreshold ||
           entity.health !== lastEntity.health ||
           entity.state !== lastEntity.state;
  }
}
```

## Pattern 4: Turn-Based Game

**Requirements:**
- Discrete turns, no real-time movement
- Reliable delivery (no input loss)
- Low bandwidth (infrequent updates)
- Simple latency handling (turns wait for all players)

**Architecture:**

```
Client:
- No prediction (turns are sequential)
- Request-response pattern for actions
- Optimistic UI updates (show pending actions)
- Rollback if action rejected by server

Server:
- Authoritative game state
- Validate all actions (legal moves, resource costs)
- Synchronize turn progression
- Persist game state (allow reconnection)
```

### Simple Turn-Based Protocol

```javascript
class TurnBasedClient {
  async playAction(action) {
    // Show optimistic UI update
    this.ui.showPendingAction(action);

    try {
      // Send action and wait for server response
      const result = await this.sendAction(action);

      if (result.success) {
        // Action accepted, commit UI
        this.ui.commitAction(action, result);
      } else {
        // Action rejected, rollback UI
        this.ui.rollbackAction(action);
        this.ui.showError(result.error);
      }
    } catch (error) {
      // Network error, rollback
      this.ui.rollbackAction(action);
      this.ui.showError('Connection error');
    }
  }

  onTurnAdvanced(turnData) {
    // Server has advanced to next turn
    this.gameState.applyTurn(turnData);
    this.ui.render(this.gameState);

    if (turnData.currentPlayer === this.playerId) {
      this.ui.enableInput();
    } else {
      this.ui.disableInput();
      this.ui.showWaitingForPlayer(turnData.currentPlayer);
    }
  }
}

class TurnBasedServer {
  async handleAction(playerId, action) {
    // Validate it's this player's turn
    if (this.currentPlayer !== playerId) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate action is legal
    const validation = this.gameRules.validate(action, this.gameState);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Apply action
    this.gameState.applyAction(action);

    // Advance turn
    this.advanceTurn();

    // Broadcast new state
    this.broadcastTurnState();

    return { success: true, newState: this.gameState };
  }
}
```

## Pattern 5: Peer-to-Peer Co-op

**Requirements:**
- No dedicated server (peer-to-peer)
- Trusted players (co-op, not competitive)
- Lower latency between peers
- One peer acts as host (authoritative)

**Architecture:**

```
Host Peer:
- Acts as authoritative server
- Processes all inputs
- Broadcasts state to other peers
- Handles enemy AI

Client Peers:
- Send inputs to host
- Client-side prediction for local player
- Interpolation for other players and enemies
- Reconnect if host changes
```

### Host Selection

```javascript
class PeerToPeerManager {
  selectHost(peers) {
    // Select host based on criteria
    // 1. Best connection quality
    // 2. Highest stability score
    // 3. Fallback: lowest peer ID

    let bestHost = peers[0];
    let bestScore = this.calculateHostScore(bestHost);

    for (const peer of peers) {
      const score = this.calculateHostScore(peer);
      if (score > bestScore) {
        bestHost = peer;
        bestScore = score;
      }
    }

    return bestHost;
  }

  calculateHostScore(peer) {
    return (
      (100 - peer.averageLatency) * 0.4 +  // Lower latency better
      peer.connectionStability * 0.3 +      // Fewer disconnects better
      peer.bandwidth * 0.3                  // Higher bandwidth better
    );
  }

  onHostDisconnect() {
    console.log('Host disconnected, electing new host');

    // Pause game
    this.pauseGame();

    // Select new host
    const remainingPeers = this.getConnectedPeers();
    const newHost = this.selectHost(remainingPeers);

    // Migrate game state
    this.migrateToNewHost(newHost);

    // Resume game
    this.resumeGame();
  }
}
```

## Bandwidth Optimization

All patterns benefit from bandwidth optimization.

### Message Packing

Pack multiple messages into single packets.

```javascript
class MessagePacker {
  constructor() {
    this.pendingMessages = [];
    this.maxPacketSize = 1200; // bytes (safe for most MTUs)
  }

  queueMessage(message) {
    this.pendingMessages.push(message);
  }

  flush() {
    if (this.pendingMessages.length === 0) return;

    const packets = [];
    let currentPacket = [];
    let currentSize = 0;

    for (const message of this.pendingMessages) {
      const messageSize = this.estimateSize(message);

      if (currentSize + messageSize > this.maxPacketSize) {
        // Packet full, start new one
        packets.push(currentPacket);
        currentPacket = [message];
        currentSize = messageSize;
      } else {
        currentPacket.push(message);
        currentSize += messageSize;
      }
    }

    if (currentPacket.length > 0) {
      packets.push(currentPacket);
    }

    // Send all packets
    for (const packet of packets) {
      this.socket.send(this.serializePacket(packet));
    }

    this.pendingMessages = [];
  }
}
```

### Snapshot Compression

Compress position data with quantization.

```javascript
class SnapshotCompressor {
  compressPosition(position, worldBounds) {
    // Quantize position to 16-bit integers
    const xNorm = (position.x - worldBounds.min.x) / (worldBounds.max.x - worldBounds.min.x);
    const yNorm = (position.y - worldBounds.min.y) / (worldBounds.max.y - worldBounds.min.y);
    const zNorm = (position.z - worldBounds.min.z) / (worldBounds.max.z - worldBounds.min.z);

    return {
      x: Math.floor(xNorm * 65535), // 16-bit
      y: Math.floor(yNorm * 65535),
      z: Math.floor(zNorm * 65535)
    };
  }

  decompressPosition(compressed, worldBounds) {
    const xNorm = compressed.x / 65535;
    const yNorm = compressed.y / 65535;
    const zNorm = compressed.z / 65535;

    return {
      x: worldBounds.min.x + xNorm * (worldBounds.max.x - worldBounds.min.x),
      y: worldBounds.min.y + yNorm * (worldBounds.max.y - worldBounds.min.y),
      z: worldBounds.min.z + zNorm * (worldBounds.max.z - worldBounds.min.z)
    };
  }
}
```

Reduces position from 12 bytes (3 floats) to 6 bytes (3 shorts) with minimal precision loss.

## Choosing the Right Pattern

| Game Type | Pattern | Tickrate | Techniques |
|-----------|---------|----------|------------|
| Competitive Shooter | #1 Shooter | 60Hz | All techniques, high precision |
| Racing | #2 Racing | 20-30Hz | Prediction + Extrapolation |
| MOBA/RTS | #3 MOBA | 20Hz | Interest management + Delta compression |
| Turn-Based | #4 Turn-Based | Event-driven | Request-response, no prediction |
| Co-op PvE | #5 P2P Co-op | 20-30Hz | Peer-to-peer, trusted clients |

## Further Reading

- **Overwatch Netcode** (GDC): Competitive shooter architecture
- **Rocket League Netcode** (GDC): Racing/sports game architecture
- **Dota 2 Networking** (Valve): MOBA with many entities
- **Age of Empires Networking** (Gamasutra): RTS lockstep

## See Also

- `client-prediction.md` - Core technique used in most patterns
- `server-reconciliation.md` - Correction mechanism
- `lag-compensation.md` - Hit detection technique
- `entity-interpolation.md` - Rendering other entities
- `troubleshooting.md` - Debugging netcode issues
