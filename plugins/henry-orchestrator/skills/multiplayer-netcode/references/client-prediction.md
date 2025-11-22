# Client-Side Prediction

Client-side prediction is the technique of immediately applying local player inputs without waiting for server confirmation. This eliminates perceived input lag and makes games feel responsive even with significant network latency.

## The Problem

Without prediction:

1. Player presses "move forward"
2. Client sends input to server
3. Wait for round-trip time (RTT: 50-200ms)
4. Server processes input, sends updated position
5. Client renders new position

Result: Player experiences 50-200ms delay between pressing a key and seeing movement. This feels sluggish and unplayable.

## The Solution

With client-side prediction:

1. Player presses "move forward"
2. Client **immediately** applies input to local state (predicts)
3. Client also sends input to server
4. Player sees instant feedback (0ms perceived lag)
5. Server eventually confirms/corrects (see server reconciliation)

Result: Game feels responsive. Any prediction errors are corrected later.

## Implementation Steps

### Step 1: Input Handling with Sequence Numbers

Attach a sequence number to each input. This allows matching server confirmations with predicted inputs.

```javascript
class ClientInputSystem {
  constructor() {
    this.inputSequenceNumber = 0;
    this.pendingInputs = []; // Buffer of inputs awaiting server confirmation
  }

  processInput(input) {
    // Assign sequence number
    const sequencedInput = {
      ...input,
      sequenceNumber: this.inputSequenceNumber++,
      timestamp: Date.now(),
    };

    // Store for later reconciliation
    this.pendingInputs.push(sequencedInput);

    // Apply input immediately (prediction)
    this.applyInput(sequencedInput);

    // Send to server
    this.sendToServer(sequencedInput);
  }

  applyInput(input) {
    // Apply input to local player state
    // Example: player.position += input.movement * deltaTime
    this.localPlayer.processInput(input);
  }

  sendToServer(input) {
    this.socket.emit('playerInput', {
      sequenceNumber: input.sequenceNumber,
      timestamp: input.timestamp,
      movement: input.movement,
      actions: input.actions,
    });
  }
}
```

### Step 2: Local State Application

Apply inputs to local player state using the same logic the server will use. This ensures prediction accuracy.

```javascript
class Player {
  processInput(input, deltaTime) {
    // Movement
    const speed = 5.0; // Must match server's speed constant
    this.position.x += input.movement.x * speed * deltaTime;
    this.position.y += input.movement.y * speed * deltaTime;

    // Actions
    if (input.actions.jump && this.isGrounded) {
      this.velocity.y = 10; // Must match server's jump velocity
      this.isGrounded = false;
    }

    // Apply physics (must match server)
    this.velocity.y -= 9.8 * deltaTime; // Gravity
    this.position.y += this.velocity.y * deltaTime;
  }
}
```

**Critical**: The client's simulation must use **identical** game logic and constants as the server. Any differences cause prediction errors.

### Step 3: Storing Predicted States

Keep a buffer of recent predicted states for reconciliation.

```javascript
class ClientGameState {
  constructor() {
    this.stateHistory = []; // Buffer of predicted states
    this.maxHistorySize = 60; // Keep ~1 second at 60fps
  }

  saveState(sequenceNumber) {
    const state = {
      sequenceNumber: sequenceNumber,
      position: this.player.position.clone(),
      velocity: this.player.velocity.clone(),
      timestamp: Date.now(),
    };

    this.stateHistory.push(state);

    // Prune old states
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }
}
```

### Step 4: Receiving Server Confirmation

When the server sends authoritative state, use the sequence number to reconcile.

```javascript
handleServerUpdate(serverState) {
  // Server state includes the last processed input sequence number
  const lastProcessedSeq = serverState.lastProcessedInput;

  // Remove confirmed inputs from pending buffer
  this.pendingInputs = this.pendingInputs.filter(
    input => input.sequenceNumber > lastProcessedSeq
  );

  // Check if prediction was correct
  const predictedState = this.stateHistory.find(
    state => state.sequenceNumber === lastProcessedSeq
  );

  if (predictedState) {
    const positionError = predictedState.position.distanceTo(serverState.position);

    if (positionError > 0.1) {
      // Prediction was wrong, reconcile
      this.reconcile(serverState, lastProcessedSeq);
    } else {
      // Prediction was accurate, no correction needed
    }
  }

  // Clean up old state history
  this.stateHistory = this.stateHistory.filter(
    state => state.sequenceNumber > lastProcessedSeq
  );
}
```

## Prediction Accuracy

Prediction is accurate when:

- Client and server use identical game logic
- No server-side events affect the player (e.g., being hit by another player)
- Constant tick rate and deterministic simulation

Prediction is inaccurate when:

- Server applies an action client didn't predict (e.g., damage from another player)
- Client and server logic diverges (bug or intentional)
- Non-deterministic behavior (floating point differences, race conditions)

Handle inaccuracies with server reconciliation (see `server-reconciliation.md`).

## What to Predict

**Do predict:**

- Local player movement
- Local player actions with local effects (jumping, crouching)
- Projectile firing (spawn projectile immediately)

**Don't predict:**

- Other players' positions (use entity interpolation)
- Server-authoritative events (damage, pickups, game state changes)
- Physics involving multiple entities (collisions with other players)

Only predict local player actions where the client has all the information needed.

## Advanced: Fixed Timestep Prediction

For deterministic simulations, use a fixed timestep matching the server.

```javascript
class FixedStepPredictor {
  constructor() {
    this.timestep = 1000 / 60; // 60Hz to match server
    this.accumulator = 0;
  }

  update(deltaTime) {
    this.accumulator += deltaTime;

    // Process inputs at fixed timestep
    while (this.accumulator >= this.timestep) {
      const input = this.getCurrentInput();
      this.processInput(input);
      this.accumulator -= this.timestep;
    }
  }

  processInput(input) {
    // Apply input with fixed timestep
    this.player.processInput(input, this.timestep / 1000);
  }
}
```

This ensures the client's simulation steps match the server's, improving prediction accuracy.

## Input Buffering

Buffer inputs locally to handle frame timing variations.

```javascript
class InputBuffer {
  constructor() {
    this.buffer = [];
  }

  addInput(input) {
    this.buffer.push({
      ...input,
      timestamp: performance.now(),
    });
  }

  getInputsForFrame() {
    // Return all inputs since last frame
    const inputs = [...this.buffer];
    this.buffer = [];
    return inputs;
  }
}
```

This ensures no inputs are lost between frames and enables input replaying during reconciliation.

## Common Pitfalls

**Pitfall 1: Client-Server Logic Mismatch**

- Symptom: Constant prediction corrections, "rubber-banding"
- Solution: Ensure identical logic on client and server. Share code or use deterministic rules.

**Pitfall 2: Not Predicting Enough**

- Symptom: Input lag for local player actions
- Solution: Predict all local player actions that don't depend on server state.

**Pitfall 3: Predicting Too Much**

- Symptom: Frequent, jarring corrections
- Solution: Only predict local player. Use interpolation for other entities.

**Pitfall 4: Missing Reconciliation**

- Symptom: Client state diverges from server over time
- Solution: Implement server reconciliation (see `server-reconciliation.md`).

## Testing Client Prediction

Test prediction under various conditions:

1. **Zero Latency**: Prediction should be perfect (no corrections)
2. **Constant Latency**: Prediction accurate, smooth confirmations
3. **Variable Latency**: Occasional corrections, but generally smooth
4. **Packet Loss**: Missing confirmations handled gracefully

Use `scripts/latency-simulator.py` to test these conditions locally.

## Performance Considerations

**Memory**: Storing input and state buffers is cheap. 60 states \* 100 bytes = 6KB.

**CPU**: Prediction adds minimal CPU cost (one extra game logic pass). Reconciliation (replay) is more expensive but infrequent.

**Bandwidth**: Sending inputs is cheap (10-50 bytes per input). Much cheaper than sending full state updates.

## Integration with Other Techniques

**Client Prediction + Server Reconciliation**: Always used together. Prediction without reconciliation causes divergence.

**Client Prediction + Entity Interpolation**: Predict local player, interpolate other entities. Never predict other players.

**Client Prediction + Lag Compensation**: Independent techniques. Prediction for local player, lag compensation for hit detection against other players.

## Unity-Specific Notes

Unity's `FixedUpdate` provides a fixed timestep suitable for deterministic prediction. Run prediction logic in `FixedUpdate` at the same rate as the server (e.g., 60Hz).

```csharp
public class ClientPredictor : MonoBehaviour {
    private int sequenceNumber = 0;
    private List<PlayerInput> pendingInputs = new List<PlayerInput>();

    void FixedUpdate() {
        // Gather input
        PlayerInput input = new PlayerInput {
            sequenceNumber = sequenceNumber++,
            movement = new Vector2(Input.GetAxis("Horizontal"), Input.GetAxis("Vertical")),
            timestamp = Time.time
        };

        // Apply locally (predict)
        player.ProcessInput(input, Time.fixedDeltaTime);

        // Store for reconciliation
        pendingInputs.Add(input);

        // Send to server
        SendInputToServer(input);
    }
}
```

## Further Reading

- **Fast-Paced Multiplayer** by Gabriel Gambetta: Canonical guide to client prediction
- **Overwatch Gameplay Architecture** (GDC Talk): Real-world implementation details
- **Quake 3 Source Code**: Classic implementation of client prediction in id Tech

## See Also

- `server-reconciliation.md` - How to correct prediction errors
- `entity-interpolation.md` - How to handle other players
- `lag-compensation.md` - Server-side technique for hit detection
- `examples/unity-netcode/` - Working Unity implementation
