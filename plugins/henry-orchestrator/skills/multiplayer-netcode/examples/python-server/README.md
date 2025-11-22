# Python WebSocket Server

This example demonstrates a multiplayer game server in Python:

- Async WebSocket server using `websockets` library
- Authoritative game state
- JSON message protocol
- Compatible with JavaScript clients

## Setup

```bash
# Install dependencies
pip install websockets

# Start server
python server.py
```

## Features

- **Async/Await**: Modern Python async patterns
- **JSON Protocol**: Compatible with JavaScript clients
- **Type Hints**: Clear type annotations
- **Authoritative Server**: Server validates all inputs

## Using with JavaScript Client

The JavaScript client from `../websocket-basic/client.js` works with this Python server:

```javascript
const client = new GameClient('ws://localhost:3000');
```

## Message Protocol

Same protocol as the JavaScript WebSocket example:

**Client → Server:**

```json
{
  "type": "input",
  "input": {
    "sequenceNumber": 123,
    "movement": { "x": 1, "y": 0 },
    "timestamp": 1234567890
  }
}
```

**Server → Client:**

```json
{
  "type": "state",
  "timestamp": 1234567890,
  "players": [
    {
      "id": "0",
      "position": { "x": 5.0, "y": 2.0 },
      "velocity": { "x": 5.0, "y": 0.0 },
      "lastProcessedInput": 123
    }
  ]
}
```

## Python Advantages

1. **Readable Code**: Python's syntax is very clear
2. **Rich Ecosystem**: NumPy for calculations, ML integration
3. **Easy Deployment**: Many hosting options support Python
4. **Data Science**: Integrate analytics, ML models easily
5. **Cross-Platform**: Runs on Linux, macOS, Windows

## Python Disadvantages

1. **Performance**: Slower than Node.js for I/O-heavy workloads
2. **Async Ecosystem**: Smaller than JavaScript's
3. **Typing**: Dynamic typing can cause runtime errors (use type hints!)

## When to Use Python Server

**Good for:**

- Games with complex AI (leverage scikit-learn, TensorFlow)
- Integration with data pipelines
- Rapid prototyping
- Teams with Python expertise

**Not ideal for:**

- Very high player counts (>1000 concurrent)
- Ultra-low latency requirements (<10ms)
- Games needing Node.js ecosystem

## Scaling

For production use, add:

```python
# 1. Connection pool limits
websockets.serve(..., max_size=1000000)  # Max message size

# 2. Rate limiting
from collections import defaultdict
from time import time

class RateLimiter:
    def __init__(self, max_per_second=100):
        self.max_per_second = max_per_second
        self.requests = defaultdict(list)

    def check(self, client_id):
        now = time()
        self.requests[client_id] = [
            t for t in self.requests[client_id]
            if now - t < 1.0
        ]

        if len(self.requests[client_id]) >= self.max_per_second:
            return False

        self.requests[client_id].append(now)
        return True

# 3. Monitoring
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Player {player.id} connected")
logger.warning(f"Invalid input from {player.id}")
```

## Testing

Test with the JavaScript client:

```bash
# Terminal 1: Start Python server
python server.py

# Terminal 2: Test with latency simulator
python ../../scripts/latency-simulator.py --latency 100 --port 3000

# Terminal 3: Run JavaScript client
node ../websocket-basic/client-test.js
```

## Files

- `server.py` - Python WebSocket server
- `README.md` - This file
