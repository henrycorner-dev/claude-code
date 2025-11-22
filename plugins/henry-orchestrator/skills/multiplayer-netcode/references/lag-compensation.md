# Lag Compensation

Lag compensation is a server-side technique that ensures accurate hit detection despite network latency. When a client shoots at a target, the server "rewinds" the game state to what the client saw at the time of firing, validates the shot in that context, then applies results in the present.

## The Problem

Without lag compensation:

1. Client sees enemy at position A (100ms ago due to latency)
2. Client shoots at position A
3. Server receives shot after 50ms (half RTT)
4. Enemy has moved to position B
5. Server checks hit at position B (current server state)
6. Result: Miss, despite client aiming perfectly at what they saw

This makes hit detection feel unfair—players must "lead" targets to account for their own latency, which is unintuitive.

## The Solution

With lag compensation:

1. Client sees enemy at position A
2. Client shoots at position A, sends command with timestamp
3. Server receives shot
4. Server rewinds all player positions to timestamp - client_latency
5. Server validates hit at position A (what client saw)
6. If hit: Apply damage in present time
7. Result: Accurate hit detection matching what the shooter saw

This is often called "favor the shooter" netcode.

## When to Use Lag Compensation

**Use lag compensation for:**

- Hitscan weapons (instant hit: rifles, pistols, lasers)
- Fast projectiles (rockets, arrows where flight time is short)
- Melee attacks
- Any action targeting other entities with timing-critical hit detection

**Don't use lag compensation for:**

- Slow projectiles (the projectile's flight time handles the delay naturally)
- Area-of-effect attacks (too complex to rewind entire game state)
- Non-competitive scenarios where precision isn't critical

## Implementation Steps

### Step 1: Store Historical State

Server must buffer recent game states to enable rewinding.

```javascript
class ServerStateHistory {
  constructor() {
    this.history = [];
    this.maxHistoryDuration = 1000; // 1 second of history
  }

  recordState(gameState) {
    const snapshot = {
      timestamp: Date.now(),
      players: gameState.players.map(player => ({
        id: player.id,
        position: { ...player.position },
        rotation: player.rotation,
        hitboxes: player.getHitboxes(),
      })),
    };

    this.history.push(snapshot);

    // Prune old states
    const cutoff = Date.now() - this.maxHistoryDuration;
    this.history = this.history.filter(s => s.timestamp >= cutoff);
  }

  getStateAt(timestamp) {
    // Find the state snapshot closest to the requested timestamp
    let closestState = this.history[0];
    let minDiff = Math.abs(closestState.timestamp - timestamp);

    for (const state of this.history) {
      const diff = Math.abs(state.timestamp - timestamp);
      if (diff < minDiff) {
        closestState = state;
        minDiff = diff;
      }
    }

    return closestState;
  }
}
```

Record state every server tick (e.g., 20-60 times per second).

### Step 2: Client Sends Timestamp with Actions

When the client performs a hitscan action, include the client's current time.

```javascript
// Client-side
class WeaponSystem {
  fire() {
    const clientTimestamp = Date.now();

    // Raycast locally for immediate feedback
    const localHit = this.performRaycast();

    // Send to server with timestamp
    this.socket.emit('fire', {
      weaponId: this.currentWeapon.id,
      position: this.player.position,
      direction: this.player.aimDirection,
      timestamp: clientTimestamp,
    });

    // Show local hit effect (prediction)
    if (localHit) {
      this.showHitMarker();
    }
  }
}
```

### Step 3: Server Calculates Compensation Time

Server determines how far back to rewind based on the client's latency.

```javascript
// Server-side
class LagCompensation {
  handleFireCommand(player, fireData) {
    // Get client's round-trip time (RTT)
    const clientRTT = this.getClientRTT(player);

    // Estimate one-way latency (half of RTT)
    const latency = clientRTT / 2;

    // Calculate the time to rewind to
    const targetTimestamp = Date.now() - latency;

    // Get historical state at that time
    const historicalState = this.stateHistory.getStateAt(targetTimestamp);

    // Validate the shot in historical context
    const hitResult = this.validateShot(fireData, historicalState);

    if (hitResult.hit) {
      // Apply damage in present time
      const targetPlayer = this.getPlayer(hitResult.targetId);
      targetPlayer.takeDamage(fireData.weaponDamage);

      // Broadcast hit confirmation
      this.broadcastHit(hitResult);
    }
  }

  getClientRTT(player) {
    // Track RTT with ping-pong messages
    return player.lastMeasuredRTT || 100; // default 100ms
  }
}
```

### Step 4: Validate Hit in Historical State

Perform hit detection using rewound entity positions.

```javascript
class HitDetection {
  validateShot(fireData, historicalState) {
    const origin = fireData.position;
    const direction = fireData.direction;
    const maxRange = fireData.weaponRange;

    // Raycast against players in historical state
    for (const historicalPlayer of historicalState.players) {
      // Skip the shooter
      if (historicalPlayer.id === fireData.playerId) continue;

      // Check raycast against this player's historical hitboxes
      const hit = this.raycastAgainstHitboxes(
        origin,
        direction,
        maxRange,
        historicalPlayer.hitboxes
      );

      if (hit) {
        return {
          hit: true,
          targetId: historicalPlayer.id,
          hitPosition: hit.position,
          hitNormal: hit.normal,
          distance: hit.distance,
        };
      }
    }

    return { hit: false };
  }

  raycastAgainstHitboxes(origin, direction, maxRange, hitboxes) {
    let closestHit = null;
    let closestDistance = maxRange;

    for (const hitbox of hitboxes) {
      const hit = this.raycastVsAABB(origin, direction, hitbox);

      if (hit && hit.distance < closestDistance) {
        closestHit = hit;
        closestDistance = hit.distance;
      }
    }

    return closestHit;
  }

  raycastVsAABB(origin, direction, aabb) {
    // Standard ray-AABB intersection
    // Returns { hit: bool, distance: float, position: vec3, normal: vec3 }
    // Implementation details omitted for brevity
  }
}
```

### Step 5: Apply Results in Present

Damage is applied to the target's current state, not the historical state.

```javascript
applyHitResult(hitResult) {
  // Get the target's CURRENT state (not historical)
  const targetPlayer = this.gameState.getPlayer(hitResult.targetId);

  // Apply damage
  targetPlayer.health -= hitResult.damage;

  // Broadcast hit confirmation to all clients
  this.broadcastToAll('playerHit', {
    shooterId: hitResult.shooterId,
    targetId: hitResult.targetId,
    damage: hitResult.damage,
    hitPosition: hitResult.hitPosition,
    timestamp: Date.now()
  });

  // Check for death
  if (targetPlayer.health <= 0) {
    this.handlePlayerDeath(targetPlayer, hitResult.shooterId);
  }
}
```

## Lag Compensation Limits

Limit how far back the server will rewind to prevent abuse.

```javascript
class LagCompensationConfig {
  static MAX_COMPENSATION = 200; // Maximum 200ms compensation
  static MIN_COMPENSATION = 0; // Don't compensate negative latency

  static getCompensationTime(clientRTT) {
    const latency = clientRTT / 2;

    // Clamp to limits
    return Math.max(this.MIN_COMPENSATION, Math.min(this.MAX_COMPENSATION, latency));
  }
}
```

Without limits, high-latency players could "shoot into the past" excessively, creating unfair scenarios.

## Client-Side Latency Tracking

Track client RTT with periodic ping-pong messages.

```javascript
// Server-side
class LatencyTracker {
  constructor() {
    this.clients = new Map(); // clientId -> { lastPing, rtt }
  }

  startTracking(client) {
    this.clients.set(client.id, {
      lastPing: 0,
      rtt: 100, // Default estimate
    });

    // Send ping every 2 seconds
    setInterval(() => this.sendPing(client), 2000);
  }

  sendPing(client) {
    client.emit('ping', { sentAt: Date.now() });
  }

  onPong(client, pongData) {
    const now = Date.now();
    const rtt = now - pongData.sentAt;

    const clientData = this.clients.get(client.id);
    clientData.rtt = rtt;
    clientData.lastPing = now;
  }

  getRTT(clientId) {
    return this.clients.get(clientId)?.rtt || 100;
  }
}

// Client-side
socket.on('ping', data => {
  socket.emit('pong', data);
});
```

This provides up-to-date latency measurements for accurate compensation.

## Hitbox Representation

Store simplified hitboxes for efficient historical queries.

```javascript
class PlayerHitboxes {
  static getHitboxes(player) {
    // Multiple AABB hitboxes for different body parts
    return [
      {
        type: 'head',
        min: { x: player.position.x - 0.2, y: player.position.y + 1.5, z: player.position.z - 0.2 },
        max: { x: player.position.x + 0.2, y: player.position.y + 1.9, z: player.position.z + 0.2 },
        damageMultiplier: 2.0, // Headshot bonus
      },
      {
        type: 'torso',
        min: { x: player.position.x - 0.3, y: player.position.y + 0.5, z: player.position.z - 0.2 },
        max: { x: player.position.x + 0.3, y: player.position.y + 1.5, z: player.position.z + 0.2 },
        damageMultiplier: 1.0,
      },
      {
        type: 'legs',
        min: { x: player.position.x - 0.2, y: player.position.y, z: player.position.z - 0.15 },
        max: {
          x: player.position.x + 0.2,
          y: player.position.y + 0.5,
          z: player.position.z + 0.15,
        },
        damageMultiplier: 0.75,
      },
    ];
  }
}
```

Simplified hitboxes reduce memory usage and hit detection cost.

## "Favor the Shooter" vs "Favor the Victim"

**Favor the Shooter (Lag Compensation)**:

- Pro: Hits register when shooter aims accurately
- Pro: Feels responsive for high-latency players
- Con: Victim might get hit behind cover ("I was behind the wall!")
- **Used by**: Most modern competitive shooters (Overwatch, Valorant, CoD)

**Favor the Victim (No Lag Compensation)**:

- Pro: Victim never hit behind cover
- Pro: Simpler implementation
- Con: Shooter must lead targets (feels bad)
- Con: High-latency players at severe disadvantage
- **Used by**: Older games, non-competitive games

Most games choose "favor the shooter" for better perceived hit registration.

## Visualizing Lag Compensation (Debugging)

Show rewound positions on the server for debugging.

```javascript
class LagCompensationDebugger {
  visualizeCompensation(historicalState, currentState) {
    console.log('Lag Compensation Debug:');

    for (const player of currentState.players) {
      const historical = historicalState.players.find(p => p.id === player.id);

      if (historical) {
        const delta = this.calculateDistance(player.position, historical.position);
        console.log(`Player ${player.id}: moved ${delta.toFixed(2)}m since historical state`);
      }
    }
  }

  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}
```

## Common Pitfalls

**Pitfall 1: Not Limiting Compensation**

- Symptom: High-latency players shooting far into the past
- Solution: Cap max compensation (200ms is common)

**Pitfall 2: Using Client Timestamp Directly**

- Symptom: Clients can cheat by sending fake timestamps
- Solution: Server measures client RTT independently, ignores client timestamps

**Pitfall 3: Compensating Non-Hitscan Weapons**

- Symptom: Complex implementation, minimal benefit
- Solution: Only compensate hitscan; let projectiles handle delay naturally

**Pitfall 4: Not Storing Enough History**

- Symptom: Can't rewind far enough for high-latency clients
- Solution: Store at least 1 second of history (supports up to 500ms RTT)

**Pitfall 5: Excessive Memory Usage**

- Symptom: State history consumes too much memory
- Solution: Store simplified state (positions, hitboxes only), not full game state

## Advanced: Projectile Lag Compensation

For projectiles with non-negligible flight time, combine compensation with prediction.

```javascript
class ProjectileLagCompensation {
  handleProjectileFire(player, fireData) {
    const latency = this.getClientLatency(player);

    // Spawn projectile with historical initial state
    const historicalState = this.stateHistory.getStateAt(Date.now() - latency);

    const projectile = new Projectile({
      position: fireData.position,
      velocity: fireData.direction.multiplyScalar(fireData.speed),
      ownerId: player.id,
    });

    // Simulate projectile forward by latency amount
    // This ensures the projectile spawns where the client predicted
    projectile.simulate(latency / 1000);

    this.gameState.addProjectile(projectile);
  }
}
```

This ensures projectiles spawn at the position the client predicted.

## Integration with Other Techniques

**Lag Compensation + Client Prediction**: Independent. Prediction for local player movement, lag compensation for shooting other players.

**Lag Compensation + Entity Interpolation**: Interpolation for rendering, lag compensation for hit detection. They complement each other.

**Lag Compensation + Server Reconciliation**: Reconciliation for local player prediction errors, lag compensation for shooting.

## Performance Considerations

**Memory**: Storing state history. At 60Hz for 1 second: 60 snapshots _ (players _ 100 bytes) = 6KB per player. Scales with player count.

**CPU**: Raycast hit detection in historical state. Optimize with spatial partitioning (octree, grid).

**Network**: No additional bandwidth. Lag compensation is server-side only.

## Unity-Specific Notes

Unity doesn't have built-in lag compensation. Implement custom solution.

```csharp
public class LagCompensation : MonoBehaviour {
    private Queue<StateSnapshot> stateHistory = new Queue<StateSnapshot>();
    private const int MAX_HISTORY_MS = 1000;

    void FixedUpdate() {
        // Record state each tick
        RecordState();
    }

    void RecordState() {
        var snapshot = new StateSnapshot {
            timestamp = Time.time,
            players = FindObjectsOfType<Player>().Select(p => new PlayerSnapshot {
                id = p.id,
                position = p.transform.position,
                rotation = p.transform.rotation
            }).ToList()
        };

        stateHistory.Enqueue(snapshot);

        // Prune old states
        while (stateHistory.Count > 0 &&
               Time.time - stateHistory.Peek().timestamp > MAX_HISTORY_MS / 1000f) {
            stateHistory.Dequeue();
        }
    }

    public StateSnapshot GetStateAt(float targetTime) {
        StateSnapshot closest = stateHistory.First();
        float minDiff = Mathf.Abs(closest.timestamp - targetTime);

        foreach (var state in stateHistory) {
            float diff = Mathf.Abs(state.timestamp - targetTime);
            if (diff < minDiff) {
                closest = state;
                minDiff = diff;
            }
        }

        return closest;
    }
}
```

## Further Reading

- **Source Engine Lag Compensation** (Valve): Original implementation details
- **Overwatch Gameplay Architecture** (GDC): Modern take on lag compensation
- **Killzone Shadow Fall Networking** (GDC): Handling lag compensation at 60Hz

## See Also

- `client-prediction.md` - Different technique for local player
- `server-reconciliation.md` - Correcting prediction errors
- `entity-interpolation.md` - Rendering other players
- `troubleshooting.md` - Debugging hit detection issues
