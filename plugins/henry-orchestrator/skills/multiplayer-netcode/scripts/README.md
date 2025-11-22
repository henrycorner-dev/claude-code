# Multiplayer Netcode Testing Scripts

Utility scripts for testing and debugging multiplayer netcode under various conditions.

## latency-simulator.py

Simulates network conditions (latency, packet loss, jitter) for testing.

### Usage

```bash
# Basic latency simulation (100ms)
python latency-simulator.py --latency 100

# Latency with packet loss
python latency-simulator.py --latency 100 --packet-loss 0.05

# Variable latency (jitter)
python latency-simulator.py --latency 100 --jitter 20

# Custom ports
python latency-simulator.py --latency 100 --target-port 3000 --listen-port 3001
```

### Options

- `--target-host`: Target server hostname (default: localhost)
- `--target-port`: Target server port (default: 3000)
- `--listen-port`: Port to listen on (default: 3001)
- `--latency`: Base latency in ms (default: 100)
- `--jitter`: Latency variation in ms (default: 0)
- `--packet-loss`: Packet loss rate 0.0-1.0 (default: 0.0)

### Example Workflow

```bash
# Terminal 1: Start game server
node ../examples/websocket-basic/server.js

# Terminal 2: Start latency simulator
python latency-simulator.py --latency 100 --packet-loss 0.05

# Terminal 3: Connect client to simulator
# Client connects to ws://localhost:3001 (simulator)
# Simulator forwards to ws://localhost:3000 (game server)
```

### Testing Scenarios

**Good Connection:**
```bash
python latency-simulator.py --latency 20 --jitter 5
```

**Average Connection:**
```bash
python latency-simulator.py --latency 80 --jitter 15 --packet-loss 0.02
```

**Poor Connection:**
```bash
python latency-simulator.py --latency 150 --jitter 50 --packet-loss 0.10
```

**Mobile 4G:**
```bash
python latency-simulator.py --latency 60 --jitter 30 --packet-loss 0.03
```

**Satellite:**
```bash
python latency-simulator.py --latency 600 --jitter 100 --packet-loss 0.05
```

## packet-inspector.js

Logs and analyzes network traffic between client and server.

### Usage

```bash
# Install dependencies
npm install commander

# Basic usage
node packet-inspector.js --port 3002 --target-port 3000

# Verbose mode (logs message contents)
VERBOSE=1 node packet-inspector.js
```

### Options

- `-p, --port`: Port to listen on (default: 3002)
- `-t, --target-host`: Target server host (default: localhost)
- `-tp, --target-port`: Target server port (default: 3000)

### Example Output

```
=== Packet Inspector Started ===
Listening on: localhost:3002
Forwarding to: localhost:3000

[C→S] input                |    142 bytes | Δt:   16ms
[S→C] state                |    487 bytes | Δt:   50ms
[C→S] input                |    142 bytes | Δt:   16ms
[S→C] state                |    487 bytes | Δt:   50ms

=== Packet Inspector Statistics ===
Runtime: 10.50s

Client → Server:
  Total bytes: 8520 (8.32 KB)
  Messages: 60
  Avg bytes/msg: 142.00
  Bandwidth: 0.79 KB/s

  Message breakdown:
    input                |    60 msgs |     8520 bytes (100.0%)

Server → Client:
  Total bytes: 97400 (95.12 KB)
  Messages: 200
  Avg bytes/msg: 487.00
  Bandwidth: 9.06 KB/s

  Message breakdown:
    state                |   200 msgs |    97400 bytes (100.0%)
```

### Use Cases

1. **Bandwidth Analysis**: Identify which message types use most bandwidth
2. **Message Frequency**: Check how often each message type is sent
3. **Optimization**: Find opportunities for compression or delta updates
4. **Debugging**: Log message contents with VERBOSE=1

## Combining Both Tools

Use both tools together for comprehensive testing:

```bash
# Terminal 1: Game server
node server.js

# Terminal 2: Latency simulator
python latency-simulator.py --latency 100 --listen-port 3001

# Terminal 3: Packet inspector
node packet-inspector.js --port 3002 --target-port 3001

# Terminal 4: Client
# Connect to ws://localhost:3002 (packet inspector)
# → Forwards to ws://localhost:3001 (latency simulator)
# → Forwards to ws://localhost:3000 (game server)
```

This setup provides:
- Network condition simulation (latency, packet loss, jitter)
- Traffic analysis (bandwidth, message types, frequency)
- Message logging for debugging

## Dependencies

**latency-simulator.py:**
- Python 3.7+
- No external dependencies (uses standard library)

**packet-inspector.js:**
- Node.js 12+
- commander package: `npm install commander`

## Tips

1. **Start with clean testing**: Test with no latency/loss first, then gradually add conditions

2. **Test realistic scenarios**: Most players have 30-100ms latency, 1-5% packet loss

3. **Test extremes**: Always test with 200ms+ latency and 10%+ packet loss to ensure graceful degradation

4. **Monitor bandwidth**: Keep bandwidth under 100 KB/s per client for scalability

5. **Log statistics**: Use packet inspector to identify bandwidth bottlenecks

6. **Automate testing**: Create shell scripts that test various scenarios automatically

## Troubleshooting

**Simulator not forwarding traffic:**
- Check target server is running on specified port
- Verify client is connecting to simulator port, not server port directly

**Packet inspector shows binary data:**
- Messages are not JSON (e.g., binary protocol or compressed)
- Use VERBOSE=1 to see raw data

**High latency despite low simulator setting:**
- Your actual network may add latency
- Test locally (all on localhost) to isolate simulator effects

**Excessive packet loss:**
- Simulator is probabilistic; actual rate may vary slightly
- Run longer tests for accurate statistics
