# Entity Interpolation

Entity interpolation is the technique of smoothly rendering networked entities (other players, NPCs, vehicles) by interpolating between discrete server state updates. This eliminates visual stuttering despite the server sending updates at a relatively low frequency (10-60Hz).

## The Problem

Without interpolation:

1. Server sends position updates at 20Hz (every 50ms)
2. Client renders at 60fps (every 16ms)
3. Entity position updates only every 50ms
4. For 34ms between updates, entity appears frozen
5. Then suddenly "jumps" to new position
6. Result: Stuttery, jarring movement

## The Solution

With interpolation:

1. Server sends updates at 20Hz
2. Client buffers recent updates
3. Client renders entity at a slight delay (e.g., 100ms in the past)
4. Client smoothly interpolates between buffered positions
5. Result: Smooth 60fps animation from 20Hz updates

The key insight: **Render entities slightly in the past** to ensure you always have future position data to interpolate toward.

## Core Concept: Interpolation Delay

Render entities in the past relative to server time.

```
Server Time:          t=1000ms
Interpolation Delay:  100ms
Render Time:          t=900ms

Client interpolates between server updates at t=850ms and t=900ms
```

This delay ensures smooth interpolation at the cost of slightly outdated information (acceptable for other players, not for local player).

## Implementation Steps

### Step 1: Buffer Server Updates

Store recent server state snapshots.

```javascript
class EntityStateBuffer {
  constructor() {
    this.snapshots = [];
    this.maxSnapshots = 30; // ~1 second at 30Hz
  }

  addSnapshot(state) {
    this.snapshots.push({
      timestamp: Date.now(),
      serverTime: state.serverTime,
      entities: state.entities.map(e => ({
        id: e.id,
        position: { ...e.position },
        rotation: e.rotation,
        velocity: { ...e.velocity },
      })),
    });

    // Sort by timestamp
    this.snapshots.sort((a, b) => a.timestamp - b.timestamp);

    // Prune old snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  getSnapshotsForInterpolation(renderTime) {
    // Find snapshots bracketing the render time
    let before = null;
    let after = null;

    for (let i = 0; i < this.snapshots.length - 1; i++) {
      if (
        this.snapshots[i].timestamp <= renderTime &&
        this.snapshots[i + 1].timestamp >= renderTime
      ) {
        before = this.snapshots[i];
        after = this.snapshots[i + 1];
        break;
      }
    }

    return { before, after };
  }
}
```

### Step 2: Calculate Render Time

Render entities at interpolation delay in the past.

```javascript
class InterpolationConfig {
  static INTERPOLATION_DELAY = 100; // ms

  static getRenderTime() {
    return Date.now() - this.INTERPOLATION_DELAY;
  }

  static calculateInterpolationDelay(serverUpdateRate) {
    // Rule of thumb: 2-3x server update interval
    const updateInterval = 1000 / serverUpdateRate;
    return updateInterval * 2.5;
  }
}

// Example: Server sends 20Hz (every 50ms)
// Interpolation delay: 50ms * 2.5 = 125ms
```

### Step 3: Interpolate Between Snapshots

Linearly interpolate (lerp) position and rotation.

```javascript
class EntityInterpolator {
  interpolateEntity(entityId, renderTime, buffer) {
    const { before, after } = buffer.getSnapshotsForInterpolation(renderTime);

    if (!before || !after) {
      // Not enough snapshots to interpolate
      return this.fallbackRender(entityId, buffer);
    }

    // Find entity in both snapshots
    const entityBefore = before.entities.find(e => e.id === entityId);
    const entityAfter = after.entities.find(e => e.id === entityId);

    if (!entityBefore || !entityAfter) {
      return null; // Entity doesn't exist in one of the snapshots
    }

    // Calculate interpolation factor (0 to 1)
    const t = (renderTime - before.timestamp) / (after.timestamp - before.timestamp);

    // Interpolate position
    const position = this.lerpVec3(entityBefore.position, entityAfter.position, t);

    // Interpolate rotation
    const rotation = this.lerpRotation(entityBefore.rotation, entityAfter.rotation, t);

    return {
      id: entityId,
      position: position,
      rotation: rotation,
    };
  }

  lerpVec3(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  }

  lerpRotation(a, b, t) {
    // Lerp for simple rotation, use slerp for quaternions
    return a + (b - a) * t;
  }

  fallbackRender(entityId, buffer) {
    // Use most recent snapshot if interpolation not possible
    const latest = buffer.snapshots[buffer.snapshots.length - 1];
    return latest?.entities.find(e => e.id === entityId);
  }
}
```

### Step 4: Render Interpolated State

Update entity visuals with interpolated state.

```javascript
class EntityRenderer {
  update() {
    const renderTime = InterpolationConfig.getRenderTime();

    for (const entity of this.entities) {
      const interpolated = this.interpolator.interpolateEntity(
        entity.id,
        renderTime,
        this.stateBuffer
      );

      if (interpolated) {
        entity.setRenderPosition(interpolated.position);
        entity.setRenderRotation(interpolated.rotation);
      }
    }
  }
}
```

## Handling Edge Cases

### Case 1: Entity Not in Snapshot (Spawned/Despawned)

If entity exists in one snapshot but not the other, don't interpolate.

```javascript
interpolateEntity(entityId, renderTime, buffer) {
  const { before, after } = buffer.getSnapshotsForInterpolation(renderTime);

  const entityBefore = before?.entities.find(e => e.id === entityId);
  const entityAfter = after?.entities.find(e => e.id === entityId);

  // Entity just spawned (in after, not before)
  if (!entityBefore && entityAfter) {
    return entityAfter; // Snap to spawned position
  }

  // Entity just despawned (in before, not after)
  if (entityBefore && !entityAfter) {
    return entityBefore; // Keep at last known position briefly
  }

  // Entity in both, interpolate normally
  if (entityBefore && entityAfter) {
    return this.interpolate(entityBefore, entityAfter, renderTime, before, after);
  }

  // Entity doesn't exist
  return null;
}
```

### Case 2: Insufficient Snapshots

If only one snapshot is buffered, render without interpolation.

```javascript
getSnapshotsForInterpolation(renderTime) {
  if (this.snapshots.length < 2) {
    // Not enough snapshots, use latest
    return {
      before: this.snapshots[0],
      after: this.snapshots[0]
    };
  }

  // ... normal interpolation logic
}
```

### Case 3: Extrapolation (Running Out of Future Data)

If render time catches up to latest snapshot, extrapolate forward.

```javascript
interpolateEntity(entityId, renderTime, buffer) {
  const { before, after } = buffer.getSnapshotsForInterpolation(renderTime);

  // If render time is past latest snapshot, extrapolate
  if (renderTime > after.timestamp) {
    return this.extrapolate(entityId, before, after, renderTime);
  }

  // Normal interpolation
  return this.interpolate(entityId, before, after, renderTime);
}

extrapolate(entityId, before, after, renderTime) {
  const entityBefore = before.entities.find(e => e.id === entityId);
  const entityAfter = after.entities.find(e => e.id === entityId);

  if (!entityBefore || !entityAfter) return entityAfter;

  // Calculate velocity
  const dt = (after.timestamp - before.timestamp) / 1000; // seconds
  const velocity = {
    x: (entityAfter.position.x - entityBefore.position.x) / dt,
    y: (entityAfter.position.y - entityBefore.position.y) / dt,
    z: (entityAfter.position.z - entityBefore.position.z) / dt
  };

  // Extrapolate forward
  const extrapolationTime = (renderTime - after.timestamp) / 1000;
  const extrapolatedPosition = {
    x: entityAfter.position.x + velocity.x * extrapolationTime,
    y: entityAfter.position.y + velocity.y * extrapolationTime,
    z: entityAfter.position.z + velocity.z * extrapolationTime
  };

  return {
    id: entityId,
    position: extrapolatedPosition,
    rotation: entityAfter.rotation
  };
}
```

Extrapolation is a fallback for packet loss or jitter. Use sparingly.

## Interpolation Delay Tuning

### Too Short Delay

- Symptom: Frequent extrapolation, stuttering during packet loss
- Solution: Increase delay to 2-3x server update interval

### Too Long Delay

- Symptom: Entities feel "laggy," slow to respond to actual movement
- Solution: Decrease delay, but not below 2x server update interval

### Dynamic Adjustment

Adjust delay based on network conditions.

```javascript
class AdaptiveInterpolation {
  constructor() {
    this.currentDelay = 100; // Start at 100ms
    this.minDelay = 50;
    this.maxDelay = 200;
  }

  update(stateBuffer) {
    const renderTime = Date.now() - this.currentDelay;
    const { before, after } = stateBuffer.getSnapshotsForInterpolation(renderTime);

    if (!after || renderTime > after.timestamp) {
      // Extrapolating, increase delay
      this.currentDelay = Math.min(this.currentDelay + 5, this.maxDelay);
    } else if (stateBuffer.snapshots.length > 10) {
      // Have plenty of snapshots, can decrease delay
      this.currentDelay = Math.max(this.currentDelay - 1, this.minDelay);
    }
  }

  getRenderTime() {
    return Date.now() - this.currentDelay;
  }
}
```

This adapts to varying network conditions automatically.

## Quaternion Interpolation (Slerp)

For 3D rotations, use spherical linear interpolation (slerp) instead of lerp.

```javascript
slerpQuaternion(a, b, t) {
  // Quaternion slerp for smooth rotation interpolation
  const dot = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;

  // If quaternions are very close, use lerp (cheaper)
  if (Math.abs(dot) > 0.9995) {
    return this.lerpQuaternion(a, b, t);
  }

  // Clamp dot to valid range
  const clampedDot = Math.max(-1, Math.min(1, dot));

  // Calculate angle
  const theta = Math.acos(clampedDot) * t;

  // Calculate slerp components
  const qRelative = {
    x: b.x - a.x * clampedDot,
    y: b.y - a.y * clampedDot,
    z: b.z - a.z * clampedDot,
    w: b.w - a.w * clampedDot
  };

  // Normalize
  const len = Math.sqrt(
    qRelative.x * qRelative.x +
    qRelative.y * qRelative.y +
    qRelative.z * qRelative.z +
    qRelative.w * qRelative.w
  );

  qRelative.x /= len;
  qRelative.y /= len;
  qRelative.z /= len;
  qRelative.w /= len;

  // Slerp result
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);

  return {
    x: a.x * cosTheta + qRelative.x * sinTheta,
    y: a.y * cosTheta + qRelative.y * sinTheta,
    z: a.z * cosTheta + qRelative.z * sinTheta,
    w: a.w * cosTheta + qRelative.w * sinTheta
  };
}
```

Slerp provides smoother rotations, especially for large angular changes.

## Dead Reckoning

For very low update rates or poor connections, use dead reckoning (predictive extrapolation).

```javascript
class DeadReckoningEntity {
  constructor(id) {
    this.id = id;
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.lastUpdateTime = Date.now();
  }

  onServerUpdate(state) {
    this.position = state.position;
    this.velocity = state.velocity;
    this.lastUpdateTime = Date.now();
  }

  getEstimatedPosition() {
    const dt = (Date.now() - this.lastUpdateTime) / 1000;

    // Extrapolate based on last known velocity
    return {
      x: this.position.x + this.velocity.x * dt,
      y: this.position.y + this.velocity.y * dt,
      z: this.position.z + this.velocity.z * dt,
    };
  }
}
```

Dead reckoning continues movement prediction between updates. Useful for racing games or vehicle physics.

## Common Pitfalls

**Pitfall 1: Interpolating Local Player**

- Symptom: Local player movement feels laggy
- Solution: Never interpolate local player; use client prediction instead

**Pitfall 2: Interpolation Delay Too Short**

- Symptom: Stuttering, frequent extrapolation
- Solution: Use 2-3x server update interval as delay

**Pitfall 3: Not Handling Entity Spawn/Despawn**

- Symptom: Entities interpolate from (0,0,0) when spawning
- Solution: Snap to position on spawn, don't interpolate

**Pitfall 4: Interpolating Fast-Changing Values**

- Symptom: Actions (shooting, jumping) look delayed
- Solution: Send discrete events for actions, don't interpolate them

**Pitfall 5: Lerping Angles Incorrectly**

- Symptom: Rotation takes the long path (e.g., 350° → 10° goes backwards)
- Solution: Normalize angle differences, or use quaternions with slerp

## Visualization for Debugging

Visualize interpolation state for debugging.

```javascript
class InterpolationDebugger {
  visualize(entity, stateBuffer) {
    const renderTime = InterpolationConfig.getRenderTime();
    const { before, after } = stateBuffer.getSnapshotsForInterpolation(renderTime);

    if (before && after) {
      console.log(`Entity ${entity.id}:`);
      console.log(`  Before: t=${before.timestamp}, pos=${JSON.stringify(before.position)}`);
      console.log(`  After:  t=${after.timestamp}, pos=${JSON.stringify(after.position)}`);
      console.log(`  Render: t=${renderTime}`);
      console.log(
        `  Interp factor: ${(renderTime - before.timestamp) / (after.timestamp - before.timestamp)}`
      );
    }
  }
}
```

## Integration with Other Techniques

**Entity Interpolation + Client Prediction**: Use prediction for local player, interpolation for other entities. Never interpolate local player.

**Entity Interpolation + Lag Compensation**: Lag compensation for hit detection, interpolation for rendering. Independent techniques.

**Entity Interpolation + Server Reconciliation**: Reconciliation for local player corrections, interpolation for other players.

## Performance Considerations

**CPU**: Interpolation is cheap (simple lerp calculations). Cost scales linearly with entity count.

**Memory**: Storing snapshot buffer. At 20Hz for 1 second: 20 snapshots _ (entities _ 50 bytes). Very manageable.

**Optimization**: Use spatial culling to avoid interpolating off-screen entities.

## Unity-Specific Notes

Unity provides `Vector3.Lerp` and `Quaternion.Slerp` built-in.

```csharp
public class EntityInterpolator : MonoBehaviour {
    private Queue<StateSnapshot> snapshots = new Queue<StateSnapshot>();
    private float interpolationDelay = 0.1f; // 100ms

    public void OnServerStateReceived(StateSnapshot snapshot) {
        snapshots.Enqueue(snapshot);

        // Keep only recent snapshots
        while (snapshots.Count > 30) {
            snapshots.Dequeue();
        }
    }

    void Update() {
        float renderTime = Time.time - interpolationDelay;

        var (before, after) = GetSnapshotsForTime(renderTime);

        if (before != null && after != null) {
            float t = (renderTime - before.timestamp) / (after.timestamp - before.timestamp);

            transform.position = Vector3.Lerp(before.position, after.position, t);
            transform.rotation = Quaternion.Slerp(before.rotation, after.rotation, t);
        }
    }
}
```

## Further Reading

- **Fast-Paced Multiplayer (Part 3)** by Gabriel Gambetta: Entity interpolation deep dive
- **Overwatch Netcode** (GDC): Interpolation in a modern shooter
- **Source Engine Networking**: Classic interpolation implementation

## See Also

- `client-prediction.md` - Don't use interpolation for local player; use this instead
- `server-reconciliation.md` - Correcting local player prediction
- `lag-compensation.md` - Hit detection technique complementing interpolation
- `troubleshooting.md` - Debugging stuttering and jitter
