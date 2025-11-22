# Server Reconciliation

Server reconciliation is the process of correcting client-side predictions when they differ from the authoritative server state. It works hand-in-hand with client-side prediction to provide responsive gameplay while maintaining server authority.

## The Problem

Client-side prediction assumes the server will confirm predictions. But what if:
- Another player hits you (server applies damage client didn't predict)
- Server has different game logic or fixed a bug
- Packet loss causes misalignment
- Floating-point differences accumulate

Without reconciliation, client and server states diverge, causing desyncs and cheating opportunities.

## The Solution

When server state differs from predicted state:
1. Accept server state as truth (server is authoritative)
2. Correct client state to match server
3. Replay all inputs sent after the server's state timestamp
4. Result: Client state matches what server will compute next

This keeps client and server synchronized while maintaining responsive prediction.

## How It Works

### Server Side: Track Last Processed Input

Server must tell clients which input it last processed.

```javascript
class ServerPlayerState {
  constructor(playerId) {
    this.playerId = playerId;
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.lastProcessedInput = 0; // Sequence number of last input processed
  }

  processInput(input, deltaTime) {
    // Apply input to authoritative state
    this.applyMovement(input, deltaTime);
    this.applyPhysics(deltaTime);

    // Record that this input was processed
    this.lastProcessedInput = input.sequenceNumber;
  }

  getState() {
    return {
      playerId: this.playerId,
      position: this.position,
      velocity: this.velocity,
      lastProcessedInput: this.lastProcessedInput, // Critical for reconciliation
      timestamp: Date.now()
    };
  }
}
```

### Client Side: Reconcile with Server State

When receiving server state, reconcile prediction.

```javascript
class ClientReconciliation {
  constructor(player, inputSystem) {
    this.player = player;
    this.inputSystem = inputSystem;
  }

  reconcileWithServer(serverState) {
    // Server state reflects game state after processing input N
    const lastProcessedInput = serverState.lastProcessedInput;

    // Get all inputs sent after the server's state
    const unprocessedInputs = this.inputSystem.pendingInputs.filter(
      input => input.sequenceNumber > lastProcessedInput
    );

    // Check if our prediction matches server
    const positionError = this.calculateError(this.player.position, serverState.position);

    if (positionError > this.reconciliationThreshold) {
      // Prediction was wrong, correct it
      console.log(`Reconciling: error=${positionError.toFixed(2)}m`);

      // Step 1: Snap to server state
      this.player.position = { ...serverState.position };
      this.player.velocity = { ...serverState.velocity };

      // Step 2: Replay unprocessed inputs
      for (const input of unprocessedInputs) {
        this.player.processInput(input, input.deltaTime);
      }
    }

    // Clean up inputs confirmed by server
    this.inputSystem.pendingInputs = unprocessedInputs;
  }

  calculateError(clientPos, serverPos) {
    const dx = clientPos.x - serverPos.x;
    const dy = clientPos.y - serverPos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
```

### Reconciliation Threshold

Only reconcile if the error exceeds a threshold. This avoids corrections for tiny floating-point differences.

```javascript
class ReconciliationConfig {
  // Only reconcile if position differs by more than this
  static POSITION_THRESHOLD = 0.1; // meters

  // Only reconcile if velocity differs by more than this
  static VELOCITY_THRESHOLD = 0.5; // m/s

  // Smoothing options
  static SMOOTH_CORRECTIONS = true;
  static SMOOTHING_DURATION = 100; // ms
}
```

Common thresholds:
- **Position**: 0.1-0.5 meters (depends on game scale)
- **Velocity**: 0.5-1.0 m/s
- **Rotation**: 1-5 degrees

## Input Replay

Replaying inputs is critical for accurate reconciliation.

### Storing Input Timing

Store delta time with each input to replay accurately.

```javascript
class InputWithTiming {
  constructor(input, deltaTime) {
    this.sequenceNumber = input.sequenceNumber;
    this.movement = input.movement;
    this.actions = input.actions;
    this.deltaTime = deltaTime; // Critical for replay
    this.timestamp = Date.now();
  }
}
```

### Replaying Inputs

```javascript
replayInputs(fromSequenceNumber) {
  const inputsToReplay = this.pendingInputs.filter(
    input => input.sequenceNumber > fromSequenceNumber
  );

  console.log(`Replaying ${inputsToReplay.length} inputs`);

  for (const input of inputsToReplay) {
    // Apply same logic as during prediction
    this.player.processInput(input, input.deltaTime);
  }
}
```

**Important**: Use the original delta time from when the input was first applied. Don't recalculate delta time during replay.

## Smoothing Corrections

Snapping directly to server state can be jarring. Smooth corrections visually.

### Instant Correction (Gameplay State)

Always instantly correct gameplay-critical state (position, velocity). This ensures accuracy.

```javascript
// Immediately correct gameplay state
this.player.position = serverState.position;
this.player.velocity = serverState.velocity;
```

### Smooth Visual Correction

Smoothly interpolate the visual representation while keeping gameplay state accurate.

```javascript
class SmoothedPlayer {
  constructor() {
    this.gameplayPosition = { x: 0, y: 0 }; // Used for collision, gameplay
    this.displayPosition = { x: 0, y: 0 };   // Used for rendering
    this.smoothingTarget = null;
    this.smoothingProgress = 0;
  }

  reconcile(serverState, replayedPosition) {
    // Instantly correct gameplay state
    this.gameplayPosition = replayedPosition;

    // Smooth display position
    const error = this.calculateDistance(this.displayPosition, this.gameplayPosition);

    if (error > 0.1) {
      // Start smoothing
      this.smoothingTarget = this.gameplayPosition;
      this.smoothingProgress = 0;
    }
  }

  update(deltaTime) {
    if (this.smoothingTarget) {
      // Lerp display position toward gameplay position
      this.smoothingProgress += deltaTime / 0.1; // Smooth over 100ms

      this.displayPosition = this.lerp(
        this.displayPosition,
        this.smoothingTarget,
        this.smoothingProgress
      );

      if (this.smoothingProgress >= 1) {
        this.displayPosition = this.smoothingTarget;
        this.smoothingTarget = null;
      }
    } else {
      // No correction, display matches gameplay
      this.displayPosition = this.gameplayPosition;
    }
  }

  render() {
    // Render at display position (smoothed)
    renderPlayer(this.displayPosition);
  }
}
```

This technique keeps gameplay accurate while preventing visual "snapping."

## Handling Large Corrections

If the error is very large (e.g., >1 meter), it indicates:
- Severe packet loss
- Server applied an unexpected event (damage, teleport)
- Bug in client or server code

For large errors, skip smoothing and snap immediately.

```javascript
reconcile(serverState) {
  const error = this.calculateError(this.player.position, serverState.position);

  if (error > 1.0) {
    // Large error, snap immediately
    console.warn(`Large reconciliation error: ${error.toFixed(2)}m - snapping`);
    this.player.position = serverState.position;
    this.player.displayPosition = serverState.position; // No smoothing
  } else if (error > 0.1) {
    // Small error, reconcile with smoothing
    this.reconcileWithSmoothing(serverState);
  }
  // else: error within threshold, no action needed
}
```

## Debugging Reconciliation

Log reconciliation events to understand prediction accuracy.

```javascript
class ReconciliationDebugger {
  constructor() {
    this.corrections = [];
    this.totalCorrections = 0;
    this.totalError = 0;
  }

  logCorrection(error, inputsReplayed) {
    this.corrections.push({
      error: error,
      inputsReplayed: inputsReplayed,
      timestamp: Date.now()
    });

    this.totalCorrections++;
    this.totalError += error;

    console.log(`Reconciliation #${this.totalCorrections}: error=${error.toFixed(3)}m, replayed=${inputsReplayed} inputs`);
  }

  getStats() {
    return {
      totalCorrections: this.totalCorrections,
      averageError: this.totalError / this.totalCorrections,
      recentCorrections: this.corrections.slice(-10)
    };
  }
}
```

Good prediction has:
- **Low correction frequency**: <5% of updates
- **Small errors**: <0.5m average
- **Few replays**: 1-3 inputs replayed per correction

High correction frequency indicates client-server logic mismatch or excessive latency.

## Advanced: State Snapshots

For complex game state, store full snapshots instead of just positions.

```javascript
class GameStateSnapshot {
  static captureState(player) {
    return {
      position: { ...player.position },
      velocity: { ...player.velocity },
      health: player.health,
      ammo: player.ammo,
      buffs: [...player.buffs],
      // ... other state
      timestamp: Date.now()
    };
  }

  static restoreState(player, snapshot) {
    player.position = { ...snapshot.position };
    player.velocity = { ...snapshot.velocity };
    player.health = snapshot.health;
    player.ammo = snapshot.ammo;
    player.buffs = [...snapshot.buffs];
    // ... restore other state
  }
}
```

This enables reconciliation of all game state, not just movement.

## Common Pitfalls

**Pitfall 1: Not Storing Delta Time**
- Symptom: Replayed inputs produce different results
- Solution: Store delta time with each input and use it during replay

**Pitfall 2: Replaying All Inputs**
- Symptom: Performance issues, especially with high latency
- Solution: Only replay inputs after the server's last processed input

**Pitfall 3: No Reconciliation Threshold**
- Symptom: Constant tiny corrections, jittery movement
- Solution: Only reconcile if error exceeds threshold (0.1m+)

**Pitfall 4: Smoothing Gameplay State**
- Symptom: Collision detection bugs, hitting invisible walls
- Solution: Only smooth display state, never gameplay state

**Pitfall 5: Not Cleaning Up Pending Inputs**
- Symptom: Memory leak, increasing replay cost over time
- Solution: Remove inputs confirmed by server from pending buffer

## Integration with Other Techniques

**Server Reconciliation + Client Prediction**: Always paired. Prediction requires reconciliation.

**Server Reconciliation + Lag Compensation**: Independent. Reconciliation for local player, lag compensation for shooting other players.

**Server Reconciliation + Entity Interpolation**: Use reconciliation for local player, interpolation for other entities.

## Unity-Specific Notes

Unity's `FixedUpdate` simplifies input replay with consistent timesteps.

```csharp
public class ServerReconciliation : MonoBehaviour {
    private List<PlayerInput> pendingInputs = new List<PlayerInput>();
    private const float RECONCILIATION_THRESHOLD = 0.1f;

    public void OnServerStateReceived(ServerState state) {
        // Calculate error
        float error = Vector3.Distance(player.transform.position, state.position);

        if (error > RECONCILIATION_THRESHOLD) {
            // Reconcile
            player.transform.position = state.position;
            player.velocity = state.velocity;

            // Replay unprocessed inputs
            var inputsToReplay = pendingInputs.FindAll(
                input => input.sequenceNumber > state.lastProcessedInput
            );

            foreach (var input in inputsToReplay) {
                player.ProcessInput(input, Time.fixedDeltaTime);
            }
        }

        // Clean up confirmed inputs
        pendingInputs.RemoveAll(input => input.sequenceNumber <= state.lastProcessedInput);
    }
}
```

## Performance Considerations

**CPU Cost**: Minimal in common case (no reconciliation). Replay cost scales with number of inputs replayed (typically 1-5).

**Memory Cost**: Storing pending inputs is cheap. At 60Hz with 200ms latency: 60 * 0.2 = 12 inputs buffered.

**When to Optimize**: If replaying >10 inputs frequently, reduce update rate or optimize physics simulation.

## Further Reading

- **Fast-Paced Multiplayer (Part 2)** by Gabriel Gambetta: Deep dive into reconciliation
- **Overwatch Netcode** (GDC Talk): How Blizzard handles reconciliation at scale
- **Source Engine Networking**: Classic implementation in Valve games

## See Also

- `client-prediction.md` - The technique reconciliation corrects
- `lag-compensation.md` - Server-side reconciliation for hit detection
- `entity-interpolation.md` - Different technique for other players
- `troubleshooting.md` - Debugging prediction and reconciliation issues
