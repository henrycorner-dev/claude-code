# Basic WebSocket Multiplayer Example

This example demonstrates a simple multiplayer game using WebSockets with:
- Client-side prediction
- Server reconciliation
- Entity interpolation
- Authoritative server

## Setup

```bash
# Install dependencies
npm install ws

# Start server
node server.js

# In another terminal, test with a client
node -e "const GameClient = require('./client.js'); new GameClient();"
```

## Architecture

**Server (`server.js`):**
- Runs at 20Hz tick rate
- Authoritative game state
- Validates all client inputs
- Broadcasts state snapshots to all clients

**Client (`client.js`):**
- Client-side prediction for local player (instant response)
- Server reconciliation to correct predictions
- Entity interpolation for other players (smooth at 100ms delay)
- Sends inputs to server with sequence numbers

## Key Concepts Demonstrated

### Client-Side Prediction

When the player presses a key:
1. Client immediately applies movement (no lag)
2. Client stores input with sequence number
3. Client sends input to server

### Server Reconciliation

When server state arrives:
1. Check if prediction matches server
2. If mismatch: snap to server position and replay inputs
3. Clean up confirmed inputs

### Entity Interpolation

Other players are rendered at 100ms delay:
1. Buffer recent server snapshots
2. Interpolate between snapshots
3. Result: smooth 60fps animation from 20Hz updates

## Testing

Test with different network conditions using the latency simulator:

```bash
# Test with 100ms latency
python ../../scripts/latency-simulator.py --latency 100 --port 3000

# Test with packet loss
python ../../scripts/latency-simulator.py --latency 50 --packet-loss 0.05
```

## Extending This Example

To build a full game:
1. Add actual rendering (Canvas, WebGL, or game engine)
2. Implement proper input handling (keyboard/gamepad)
3. Add game mechanics (shooting, collisions, etc.)
4. Implement lag compensation for hit detection
5. Add interest management for larger player counts
6. Optimize bandwidth with delta compression

## Files

- `server.js` - Authoritative game server
- `client.js` - Client with prediction and interpolation
- `README.md` - This file
