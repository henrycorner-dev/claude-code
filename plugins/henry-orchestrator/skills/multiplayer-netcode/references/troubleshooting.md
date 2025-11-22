# Multiplayer Netcode Troubleshooting

This guide helps diagnose and fix common multiplayer networking issues including rubberbanding, desync, hit registration problems, high bandwidth usage, and visual stuttering.

## Issue 1: Rubberbanding (Player Snapping Back)

**Symptoms:**
- Player moves forward, then suddenly teleports backwards
- Happens frequently or occasionally
- More common with higher latency

**Causes:**

### Cause 1A: Client-Server Logic Mismatch
- Client predicts movement using different physics than server
- Server corrections constantly override client predictions

**Diagnosis:**
```javascript
// Add logging to reconciliation
reconcile(serverState) {
  const error = this.calculateError(this.localPlayer, serverState);
  console.log(`Reconciliation error: ${error.toFixed(3)}m`);

  if (error > 0.1) {
    console.warn('Significant mismatch - client/server logic diverging');
  }
}
```

**Solutions:**
- Ensure client and server use **identical** movement speed, physics constants, timestep
- Share movement code between client and server (use same JavaScript file)
- Use fixed timestep on both sides
- Log and compare client vs server calculations for same input

### Cause 1B: Reconciliation Threshold Too Sensitive
- Threshold too low causes corrections for tiny floating-point differences

**Diagnosis:**
```javascript
// Check reconciliation frequency
class ReconciliationStats {
  constructor() {
    this.totalUpdates = 0;
    this.reconciliations = 0;
  }

  onUpdate() {
    this.totalUpdates++;
  }

  onReconciliation() {
    this.reconciliations++;
  }

  getReconciliationRate() {
    return this.reconciliations / this.totalUpdates;
  }
}
// If rate > 10%, threshold may be too sensitive
```

**Solutions:**
- Increase reconciliation threshold (e.g., 0.1m → 0.2m)
- Add smoothing to corrections (lerp over 100ms instead of snapping)
- Use epsilon comparisons for floating-point values

### Cause 1C: Packet Loss Causing Large Corrections
- Missing server updates cause client prediction to diverge
- When update finally arrives, large correction occurs

**Diagnosis:**
```javascript
class PacketLossDetector {
  constructor() {
    this.lastSequence = 0;
    this.packetsReceived = 0;
    this.packetsLost = 0;
  }

  onPacket(sequence) {
    const expectedSequence = this.lastSequence + 1;
    if (sequence > expectedSequence) {
      this.packetsLost += (sequence - expectedSequence);
    }
    this.packetsReceived++;
    this.lastSequence = sequence;
  }

  getPacketLoss() {
    const total = this.packetsReceived + this.packetsLost;
    return this.packetsLost / total;
  }
}
// If packet loss > 5%, network issues likely
```

**Solutions:**
- Increase interpolation delay to tolerate packet loss
- Implement packet loss recovery (request missed packets)
- Use UDP-like behavior (don't block on lost packets)
- Consider connection quality indicators for users

## Issue 2: Desync (Client and Server Disagree)

**Symptoms:**
- Client sees themselves at one position, server says they're elsewhere
- Actions fail unexpectedly (server rejects them)
- Game state inconsistent between players

**Causes:**

### Cause 2A: Non-Deterministic Game Logic
- Random number generation differs between client/server
- Floating-point operations produce different results
- Race conditions in update order

**Diagnosis:**
```javascript
// Add determinism checks
class DeterminismValidator {
  validateMovement(initialState, input, deltaTime) {
    const result1 = this.simulateMovement(initialState, input, deltaTime);
    const result2 = this.simulateMovement(initialState, input, deltaTime);

    if (!this.positionsEqual(result1, result2)) {
      console.error('Non-deterministic movement detected!');
      console.log('Result 1:', result1);
      console.log('Result 2:', result2);
    }
  }
}
```

**Solutions:**
- Use deterministic random seeds shared between client/server
- Use fixed-point math instead of floating-point for critical calculations
- Ensure consistent update order (sort entities by ID before updating)
- Avoid system time dependencies (use game time)

### Cause 2B: Missing Server Reconciliation
- Client prediction exists but no reconciliation implemented
- States diverge over time

**Diagnosis:**
```javascript
// Check if reconciliation is running
onServerState(serverState) {
  console.log('Server state received');

  // Is reconciliation actually being called?
  this.reconciliation.reconcile(serverState);
}
```

**Solutions:**
- Implement server reconciliation (see `server-reconciliation.md`)
- Ensure server sends last processed input sequence number
- Client must replay unconfirmed inputs after reconciling

### Cause 2C: Inputs Not Reaching Server
- Network issues or input loss
- Server never processes some client inputs

**Diagnosis:**
```javascript
// Track input acknowledgment
class InputTracker {
  constructor() {
    this.sentInputs = new Map(); // sequence -> timestamp
  }

  onInputSent(sequence) {
    this.sentInputs.set(sequence, Date.now());
  }

  onServerAck(lastProcessedSequence) {
    for (const [seq, sentTime] of this.sentInputs) {
      if (seq <= lastProcessedSequence) {
        const rtt = Date.now() - sentTime;
        console.log(`Input ${seq} acknowledged after ${rtt}ms`);
        this.sentInputs.delete(seq);
      }
    }

    // Check for old unacknowledged inputs
    for (const [seq, sentTime] of this.sentInputs) {
      if (Date.now() - sentTime > 1000) {
        console.warn(`Input ${seq} not acknowledged after 1000ms - lost?`);
      }
    }
  }
}
```

**Solutions:**
- Ensure reliable delivery for critical inputs
- Resend unacknowledged inputs after timeout
- Check Socket.io/WebSocket connection stability

## Issue 3: Hit Registration Problems

**Symptoms:**
- Shots that appear to hit don't register
- Hits register when aiming off-target
- Inconsistent hit detection

**Causes:**

### Cause 3A: No Lag Compensation
- Server validates hits at current time, but client sees past state
- Client aims at delayed position

**Diagnosis:**
```javascript
// Check if lag compensation is enabled
onShot(shotData) {
  console.log('Shot fired at:', shotData.timestamp);

  // Is the server rewinding state?
  const historicalState = this.getHistoricalState(shotData.timestamp - clientLatency);

  if (!historicalState) {
    console.error('Lag compensation not working - no historical state');
  }
}
```

**Solutions:**
- Implement lag compensation (see `lag-compensation.md`)
- Server must buffer historical states
- Rewind state based on client latency before validating hits

### Cause 3B: Interpolation Delay Too High
- Other players rendered too far in the past
- Where client aims doesn't match server's rewind target

**Diagnosis:**
```javascript
// Compare interpolation delay to server compensation
const clientInterpolationDelay = 150; // ms
const serverCompensation = clientLatency / 2; // e.g., 50ms
const totalDelay = clientInterpolationDelay + serverCompensation;

console.log(`Total delay: ${totalDelay}ms`);
// If > 200ms, may cause hit registration issues
```

**Solutions:**
- Reduce interpolation delay (but not below 2x server update interval)
- Ensure lag compensation accounts for interpolation delay
- Test with `scripts/latency-simulator.py` at various latencies

### Cause 3C: Hitbox Mismatch
- Client and server use different hitbox sizes/positions
- Visual model doesn't match hitbox

**Diagnosis:**
```javascript
// Visualize hitboxes on both client and server
class HitboxDebugger {
  drawHitboxes(player) {
    const hitboxes = this.getHitboxes(player);

    for (const box of hitboxes) {
      this.drawBox(box.min, box.max, 'red');
    }

    // Also draw visual model bounds
    this.drawBox(player.visualBounds.min, player.visualBounds.max, 'blue');

    // Do they match?
    if (!this.boundsMatch(hitboxes, player.visualBounds)) {
      console.warn('Hitbox doesn\'t match visual model!');
    }
  }
}
```

**Solutions:**
- Ensure client and server use identical hitbox definitions
- Hitboxes should closely match visual model
- Test hit detection in development with visible hitboxes

## Issue 4: High Bandwidth Usage

**Symptoms:**
- Network usage exceeds budget (e.g., >100KB/s per client)
- Bandwidth scales poorly with player count
- Mobile clients struggle with data usage

**Causes:**

### Cause 4A: Sending Full State Every Update
- No delta compression
- Sending unchanged entities

**Diagnosis:**
```javascript
// Measure bandwidth per update type
class BandwidthMonitor {
  constructor() {
    this.messageSizes = new Map(); // messageType -> totalBytes
    this.messageCounts = new Map();
  }

  onMessageSent(type, message) {
    const size = this.estimateSize(message);

    this.messageSizes.set(type,
      (this.messageSizes.get(type) || 0) + size
    );
    this.messageCounts.set(type,
      (this.messageCounts.get(type) || 0) + 1
    );
  }

  getReport() {
    const report = [];
    for (const [type, totalBytes] of this.messageSizes) {
      const count = this.messageCounts.get(type);
      report.push({
        type: type,
        totalBytes: totalBytes,
        averageBytes: totalBytes / count,
        count: count
      });
    }
    return report.sort((a, b) => b.totalBytes - a.totalBytes);
  }
}
```

**Solutions:**
- Implement delta compression (only send changes)
- Quantize position/rotation to fewer bits
- Use binary protocols instead of JSON
- Only send entities that moved significantly

### Cause 4B: Too High Update Rate
- Sending updates more frequently than necessary
- Server tickrate too high for game type

**Diagnosis:**
```javascript
// Calculate actual bandwidth
const updateRate = 60; // Hz
const bytesPerUpdate = 500;
const playersInGame = 10;

const bandwidthPerSecond = updateRate * bytesPerUpdate;
const totalBandwidth = bandwidthPerSecond * playersInGame / 1024; // KB/s

console.log(`Bandwidth: ${bandwidthPerSecond} bytes/s per client`);
console.log(`Total server: ${totalBandwidth} KB/s`);
```

**Solutions:**
- Reduce update rate (e.g., 60Hz → 20Hz for non-competitive games)
- Use adaptive update rate based on entity importance
- Nearby entities: high rate, far entities: low rate

### Cause 4C: No Interest Management
- Sending all entities to all clients regardless of distance

**Diagnosis:**
```javascript
// Check entities per update
onStateReceived(state) {
  console.log(`Received ${state.entities.length} entities`);

  // How many are actually visible?
  const visible = state.entities.filter(e => this.isVisible(e));
  console.log(`Only ${visible.length} are visible`);

  if (state.entities.length > visible.length * 2) {
    console.warn('Receiving many off-screen entities - need interest management');
  }
}
```

**Solutions:**
- Implement interest management (only sync nearby entities)
- Spatial culling based on player view radius
- Priority system (player units > nearby entities > far entities)

## Issue 5: Visual Stuttering

**Symptoms:**
- Other players' movement looks jerky
- Entities freeze briefly then jump
- Inconsistent frame times

**Causes:**

### Cause 5A: Interpolation Buffer Empty
- Interpolation delay too short
- Packet loss causing missing snapshots

**Diagnosis:**
```javascript
class InterpolationHealthCheck {
  checkBufferHealth(buffer, renderTime) {
    const { before, after } = buffer.getSnapshotsForInterpolation(renderTime);

    if (!before || !after) {
      console.warn('Interpolation buffer empty - stuttering likely');
      console.log('Buffer size:', buffer.snapshots.length);
      console.log('Render time:', renderTime);
      return false;
    }

    if (renderTime > after.timestamp) {
      console.warn('Extrapolating - ran out of future data');
      return false;
    }

    return true;
  }
}
```

**Solutions:**
- Increase interpolation delay
- Implement adaptive interpolation (adjust delay based on buffer health)
- Add extrapolation as fallback

### Cause 5B: Jitter (Variable Latency)
- Network latency varies significantly
- Snapshots arrive irregularly

**Diagnosis:**
```javascript
class JitterDetector {
  constructor() {
    this.lastArrivalTime = Date.now();
    this.arrivalIntervals = [];
  }

  onSnapshotReceived() {
    const now = Date.now();
    const interval = now - this.lastArrivalTime;
    this.arrivalIntervals.push(interval);

    if (this.arrivalIntervals.length > 100) {
      this.arrivalIntervals.shift();
    }

    this.lastArrivalTime = now;
  }

  getJitter() {
    if (this.arrivalIntervals.length < 2) return 0;

    const mean = this.arrivalIntervals.reduce((a, b) => a + b) / this.arrivalIntervals.length;
    const variance = this.arrivalIntervals.reduce((sum, interval) =>
      sum + Math.pow(interval - mean, 2), 0
    ) / this.arrivalIntervals.length;

    return Math.sqrt(variance);
  }
}
// High jitter (>20ms) causes stuttering
```

**Solutions:**
- Increase interpolation delay to absorb jitter
- Use adaptive interpolation delay
- Implement jitter buffer (buffer snapshots before processing)

### Cause 5C: Server Update Rate Too Low
- Server sends updates at 10Hz, client renders at 60fps
- Not enough data to interpolate smoothly

**Diagnosis:**
```javascript
// Measure time between server updates
class UpdateRateMonitor {
  constructor() {
    this.lastUpdateTime = Date.now();
    this.updateIntervals = [];
  }

  onUpdate() {
    const now = Date.now();
    const interval = now - this.lastUpdateTime;
    this.updateIntervals.push(interval);

    if (this.updateIntervals.length > 20) {
      this.updateIntervals.shift();
    }

    this.lastUpdateTime = now;
  }

  getAverageUpdateRate() {
    if (this.updateIntervals.length === 0) return 0;

    const avgInterval = this.updateIntervals.reduce((a, b) => a + b) / this.updateIntervals.length;
    return 1000 / avgInterval; // Hz
  }
}
// If rate < 20Hz, consider increasing
```

**Solutions:**
- Increase server update rate (10Hz → 20-30Hz)
- Use extrapolation to smooth between updates
- Implement dead reckoning for predictable movement

## Issue 6: High Latency Players

**Symptoms:**
- High-ping players experience poor gameplay
- Other players complain about high-ping player's behavior

**Solutions:**

### For the High-Latency Player
```javascript
// Show latency indicator to player
class LatencyIndicator {
  display(latency) {
    if (latency < 50) {
      this.showIndicator('green', 'Excellent');
    } else if (latency < 100) {
      this.showIndicator('yellow', 'Good');
    } else if (latency < 200) {
      this.showIndicator('orange', 'Fair');
    } else {
      this.showIndicator('red', 'Poor');
    }
  }
}

// Adjust client settings for high latency
if (clientLatency > 150) {
  // Increase interpolation delay
  config.interpolationDelay = 200;

  // Reduce prediction aggressiveness
  config.predictionConfidence = 0.7;
}
```

### For Other Players
```javascript
// Server-side lag compensation limits
if (player.latency > 200) {
  // Limit compensation to prevent "shooting into the past"
  const compensationTime = Math.min(player.latency / 2, 200);
  // Use compensationTime instead of full latency/2
}
```

## Debugging Tools

### Network Simulator

Use `scripts/latency-simulator.py` to test under various conditions:

```bash
# Simulate 100ms latency
python scripts/latency-simulator.py --latency 100

# Simulate 100ms latency with 10% packet loss
python scripts/latency-simulator.py --latency 100 --packet-loss 0.1

# Simulate variable latency (jitter)
python scripts/latency-simulator.py --latency 100 --jitter 20
```

### Packet Inspector

Use `scripts/packet-inspector.js` to debug network traffic:

```javascript
// Log all packets with size and type
node scripts/packet-inspector.js --port 3000
```

### In-Game Debug Overlay

```javascript
class NetcodeDebugOverlay {
  render() {
    const stats = {
      clientRTT: this.client.getRTT(),
      serverTickRate: this.server.tickRate,
      interpolationDelay: this.client.interpolationDelay,
      reconciliationsPerSec: this.client.reconciliationRate * 60,
      packetLoss: this.client.packetLoss,
      bandwidth: this.client.bytesPerSecond
    };

    this.drawOverlay(stats);
  }
}
```

## Common Combinations

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Rubberbanding + high reconciliation rate | Client/server logic mismatch | Sync movement constants |
| Hit misses + high latency | No lag compensation | Implement lag compensation |
| Stuttering + low buffer | Interpolation delay too short | Increase delay to 100-150ms |
| High bandwidth + many entities | No delta compression | Only send changed entities |
| Desync + deterministic logic | Missing reconciliation | Add server reconciliation |

## Testing Checklist

Before considering netcode complete, test:

- [ ] 0ms latency: Prediction perfect, no corrections
- [ ] 50ms latency: Smooth gameplay, rare corrections
- [ ] 100ms latency: Playable, occasional corrections
- [ ] 200ms latency: Difficult but functional
- [ ] 5% packet loss: Gameplay mostly smooth
- [ ] Variable latency (50-150ms jitter): Handles gracefully
- [ ] Bandwidth within budget (<100KB/s per client typical target)
- [ ] 10+ players: Performance acceptable, bandwidth scales reasonably

## Further Reading

- **Overwatch Netcode** (GDC): How Blizzard debugs netcode at scale
- **Rocket League Netcode** (GDC): Handling poor network conditions
- **Gaffer on Games**: Classic articles on netcode debugging

## See Also

- `client-prediction.md` - Prevent rubberbanding with correct prediction
- `server-reconciliation.md` - Fix desync issues
- `lag-compensation.md` - Fix hit registration
- `entity-interpolation.md` - Fix visual stuttering
- `scripts/latency-simulator.py` - Test under poor conditions
- `scripts/packet-inspector.js` - Debug network traffic
