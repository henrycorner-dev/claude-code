---
name: multiplayer-netcode
description: This skill should be used when the user asks to "add multiplayer to my game", "implement client-side prediction", "set up WebSocket server", "fix lag in multiplayer game", "add Socket.io", "implement server reconciliation", "add lag compensation", "implement entity interpolation", or mentions netcode, client prediction, authoritative server, or peer-to-peer networking.
version: 0.1.0
---

# Multiplayer Netcode Skill

This skill provides specialized knowledge for implementing real-time multiplayer networking (netcode) in games and interactive applications. It covers client-server prediction, lag compensation, entity interpolation, server reconciliation, and WebSocket-based communication patterns.

## Purpose

Multiplayer netcode is complex because it must handle:
- Network latency (ping times) ranging from 20ms to 200ms+
- Packet loss and jitter
- The need for responsive local gameplay despite latency
- Synchronizing game state across multiple clients
- Preventing cheating with authoritative server validation

This skill guides the implementation of robust netcode architectures using established patterns from the game networking community.

## Core Concepts

### Client-Server Architecture

Most real-time multiplayer games use an authoritative server architecture:
- **Server**: Maintains the true game state, validates all actions, broadcasts updates
- **Clients**: Send inputs to server, predict local state optimistically, reconcile with server updates

This prevents cheating since the server has final authority on all game events.

### Key Techniques

**Client-Side Prediction**: Clients immediately apply local player inputs without waiting for server confirmation. This eliminates perceived input lag. When server confirmation arrives, reconcile any differences.

**Server Reconciliation**: When the server's authoritative state differs from the client's prediction, correct the client state. Replay any inputs that occurred after the server's state timestamp.

**Entity Interpolation**: Render other players' positions by interpolating between recent server snapshots. This smooths movement despite discrete network updates (typically 10-60Hz).

**Lag Compensation**: When processing a client's action (e.g., shooting), rewind the server's game state to account for the client's latency. This ensures the client sees accurate hit detection relative to what they saw on their screen.

## When to Use This Skill

Use this skill when:
- Implementing real-time multiplayer functionality in games or applications
- Setting up WebSocket or Socket.io communication infrastructure
- Debugging lag, desync, or jitter in existing multiplayer systems
- Choosing between netcode architectures (peer-to-peer vs client-server, lockstep vs snapshot)
- Implementing specific techniques like client prediction or lag compensation

## Architecture Decision Guide

### Question 1: Real-Time or Turn-Based?

**Turn-Based Games** (chess, card games):
- Simple request-response patterns sufficient
- No need for client prediction or interpolation
- Use REST APIs or basic WebSockets
- Focus on game logic validation

**Real-Time Games** (shooters, racing, fighting):
- Require advanced netcode techniques
- Need high update rates (10-60Hz)
- Implement client prediction and interpolation
- See references for detailed patterns

### Question 2: Client-Server or Peer-to-Peer?

**Client-Server (Recommended)**:
- Authoritative server prevents cheating
- Server validates all actions
- Easier to maintain consistent state
- Scales better with player count
- Implementation: See `examples/websocket-basic/` and `examples/socketio-rooms/`

**Peer-to-Peer**:
- No server costs
- Lower latency between peers
- Vulnerable to cheating (no authority)
- Complex state synchronization
- Best for co-op games with trusted players

### Question 3: Which Transport?

**WebSockets** (`ws` library):
- Full-duplex TCP-based communication
- Reliable ordered delivery
- Good for turn-based or slower-paced games
- Example: `examples/websocket-basic/`

**Socket.io**:
- Built on WebSockets with fallbacks
- Built-in rooms and namespaces
- Automatic reconnection
- Good for prototyping and production
- Example: `examples/socketio-rooms/`

**UDP (not browser-native)**:
- Lower latency, unreliable
- Requires custom client (Unity, Unreal, native apps)
- Best for fast-paced competitive games
- Not available in browser without WebRTC

For browser-based games, use WebSockets or Socket.io. For desktop games with high competitive requirements, consider UDP-based solutions.

## Technique Quick Reference

### Client-Side Prediction

**When to use**: For local player movement and actions to eliminate input lag

**Basic flow**:
1. Client receives input
2. Apply input immediately to local state (predict)
3. Send input to server with timestamp/sequence number
4. Server processes input, sends authoritative state back
5. Client reconciles prediction with server state

**Details**: See `references/client-prediction.md`

**Example**: `examples/unity-netcode/` demonstrates prediction in Unity

### Server Reconciliation

**When to use**: Always, when implementing client prediction

**Basic flow**:
1. Receive server state update with timestamp
2. If client state matches server state, done
3. If mismatch, revert to server state
4. Replay all inputs sent after server's timestamp
5. Result: client state matches what server will compute

**Details**: See `references/server-reconciliation.md`

### Lag Compensation

**When to use**: For hitscan weapons, projectiles, or any action targeting other entities

**Basic flow**:
1. Client performs action (e.g., shoots), sends to server with timestamp
2. Server rewinds game state to timestamp - client_latency
3. Server validates action against rewound state
4. Server broadcasts result from current state

**Details**: See `references/lag-compensation.md`

### Entity Interpolation

**When to use**: For rendering other players and network entities smoothly

**Basic flow**:
1. Server sends state snapshots at fixed rate (e.g., 20Hz = every 50ms)
2. Client buffers recent snapshots
3. Client renders entities at interpolation_delay in the past (e.g., 100ms ago)
4. Interpolate position/rotation between buffered snapshots
5. Result: smooth movement despite discrete updates

**Details**: See `references/entity-interpolation.md`

## Implementation Patterns

### State Synchronization

**Snapshot Model** (recommended for most games):
- Server sends full world state snapshots at regular intervals
- Clients interpolate between snapshots
- Predictable bandwidth, simple to reason about
- Example: Most modern shooters (Overwatch, Valorant)

**Delta Compression**:
- Only send changes since last acknowledged state
- Reduces bandwidth
- More complex implementation
- Combine with snapshot model for efficiency

### Update Rates

**Server Tickrate**: 10-64Hz depending on game requirements
- Fast competitive games: 60-128Hz
- Standard action games: 20-30Hz
- Casual games: 10-20Hz

**Client Send Rate**: Often matches server tickrate
- Send inputs every frame or at fixed intervals
- Include sequence numbers for ordering

**Interpolation Delay**: 2-3 server snapshots
- If server sends 20Hz, use 100-150ms interpolation delay
- Balance between smoothness and latency

## Common Patterns by Game Type

### Fast-Paced Shooter

- Client prediction for local player
- Server reconciliation with input replay
- Lag compensation for hitscan weapons
- Entity interpolation for other players
- High tickrate (60Hz+)
- Reference: `references/architecture-patterns.md`

### Racing Game

- Client prediction for local car physics
- Server reconciliation for position
- Entity interpolation with extrapolation for tight races
- Collision resolved on server
- Medium tickrate (20-30Hz)

### Fighting Game

- Requires deterministic lockstep or rollback netcode
- Not covered in depth by this skill (specialized domain)
- Consider GGPO or similar libraries

### Turn-Based Game

- Simple request-response
- No prediction or interpolation needed
- Focus on game logic validation
- REST API or basic WebSocket messages

## Troubleshooting

For common multiplayer issues like rubberbanding, desync, hit registration problems, or high bandwidth usage, consult `references/troubleshooting.md`.

To test netcode under various latency conditions, use `scripts/latency-simulator.py`.

## Additional Resources

### Reference Files

Detailed implementation guides for each technique:

- **`references/client-prediction.md`** - Implementing client-side prediction with input queuing, sequence numbers, and state buffering
- **`references/server-reconciliation.md`** - Reconciling predicted state with authoritative server updates
- **`references/lag-compensation.md`** - Rewinding game state for accurate hit detection
- **`references/entity-interpolation.md`** - Smoothly rendering networked entities with interpolation and extrapolation
- **`references/architecture-patterns.md`** - Complete architecture examples for different game types
- **`references/troubleshooting.md`** - Common netcode issues: rubberbanding, desync, high bandwidth, stuttering

### Code Examples

Working implementations in multiple languages/frameworks:

- **`examples/websocket-basic/`** - Basic WebSocket server and client (Node.js)
- **`examples/socketio-rooms/`** - Socket.io server with room/lobby support
- **`examples/unity-netcode/`** - Unity client-side prediction example (C#)
- **`examples/python-server/`** - Python WebSocket server implementation

### Utility Scripts

Tools for testing and debugging:

- **`scripts/latency-simulator.py`** - Simulate network latency, jitter, and packet loss for testing netcode locally
- **`scripts/packet-inspector.js`** - Debug tool to inspect and log network packets

## Implementation Workflow

When implementing multiplayer:

1. **Choose architecture**: Use decision guide above
2. **Set up infrastructure**: Start with examples in `examples/`
3. **Implement basic sync**: Get simple state synchronization working first
4. **Add client prediction**: For local player input responsiveness
5. **Add server reconciliation**: To correct prediction errors
6. **Add entity interpolation**: For smooth rendering of other players
7. **Add lag compensation**: For accurate hit detection
8. **Test with latency**: Use `scripts/latency-simulator.py` to simulate realistic conditions
9. **Optimize bandwidth**: Delta compression, message packing, culling
10. **Debug issues**: Use `references/troubleshooting.md` and `scripts/packet-inspector.js`

## Best Practices

**Always Validate on Server**: Never trust client messages. Validate all actions (movement speed, ability cooldowns, resource costs) on the authoritative server.

**Use Sequence Numbers**: Attach sequence numbers or timestamps to all messages. This enables proper ordering and reconciliation.

**Buffer Inputs**: Keep a buffer of recent client inputs for reconciliation. When server state arrives, replay inputs newer than server timestamp.

**Interpolate in the Past**: Render other entities slightly in the past (interpolation delay) to ensure smooth interpolation between snapshots.

**Test Under Bad Conditions**: Use latency simulator to test with 100ms+ latency, jitter, and packet loss. Netcode must handle real-world conditions gracefully.

**Monitor Network Stats**: Display RTT (round-trip time), packet loss, server tickrate in development builds. This helps diagnose issues.

**Optimize Carefully**: Profile before optimizing. Common optimizations include delta compression, spatial culling (don't send updates for far-away entities), and message batching.

## Next Steps

To begin implementing multiplayer:

1. Review decision guide to choose architecture
2. Start with appropriate example from `examples/`
3. Implement basic state synchronization
4. Layer in advanced techniques (prediction, reconciliation, etc.) as needed
5. Test thoroughly with `scripts/latency-simulator.py`
6. Refer to detailed technique references as you implement each component

Focus on getting basic synchronization working first before adding advanced techniques. Each technique solves a specific problem—add them incrementally as those problems arise.
