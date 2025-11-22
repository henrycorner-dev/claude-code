# Socket.io Multiplayer with Rooms

This example demonstrates room-based multiplayer using Socket.io:

- Room/lobby creation and management
- Per-room game instances
- Socket.io rooms for efficient broadcasting
- Matchmaking basics

## Setup

```bash
# Install dependencies
npm install socket.io

# Start server
node server.js
```

## Using with a Client

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Socket.io Client</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  </head>
  <body>
    <h1>Multiplayer Game</h1>
    <button id="createRoom">Create Room</button>
    <button id="startGame">Start Game</button>
    <div id="status"></div>

    <script>
      const socket = io('http://localhost:3000');
      let currentRoom = null;

      socket.on('connect', () => {
        console.log('Connected:', socket.id);
      });

      socket.on('roomCreated', data => {
        console.log('Room created:', data.roomId);
        currentRoom = data.roomId;
        document.getElementById('status').innerText = `Room: ${currentRoom}`;
      });

      socket.on('joinedRoom', data => {
        console.log('Joined room:', data);
        document.getElementById('status').innerText =
          `Room: ${data.roomId} (${data.playerCount}/${data.maxPlayers} players)`;
      });

      socket.on('gameStarted', data => {
        console.log('Game started!');
        startGameLoop();
      });

      socket.on('gameState', state => {
        // Handle game state updates
        console.log('Game state:', state);
      });

      document.getElementById('createRoom').onclick = () => {
        socket.emit('createRoom', { maxPlayers: 4 });
      };

      document.getElementById('startGame').onclick = () => {
        socket.emit('startGame');
      };

      function startGameLoop() {
        setInterval(() => {
          // Send inputs
          const input = {
            sequenceNumber: Date.now(),
            movement: { x: 0, y: 0 }, // Get from keyboard
            timestamp: Date.now(),
          };

          socket.emit('input', { input });
        }, 1000 / 60); // 60fps
      }
    </script>
  </body>
</html>
```

## Features

### Room Management

**Create Room:**

```javascript
socket.emit('createRoom', { maxPlayers: 4 });
```

**Join Room:**

```javascript
socket.emit('joinRoom', { roomId: 'room_12345' });
```

**Leave Room:**

```javascript
socket.emit('leaveRoom');
```

**Start Game:**

```javascript
socket.emit('startGame');
```

### Events

**Server to Client:**

- `roomCreated` - Room successfully created
- `joinedRoom` - Successfully joined a room
- `playerJoined` - Another player joined
- `playerLeft` - A player left
- `gameStarted` - Game has started
- `gameState` - Game state update (20Hz)
- `error` - Error message

**Client to Server:**

- `createRoom` - Create a new room
- `joinRoom` - Join existing room
- `leaveRoom` - Leave current room
- `startGame` - Start the game
- `input` - Send player input

## Benefits of Socket.io

1. **Automatic Reconnection**: Built-in reconnection logic
2. **Rooms**: Efficient message broadcasting to subsets of clients
3. **Fallbacks**: Falls back to polling if WebSockets unavailable
4. **Events**: Typed events instead of raw message parsing
5. **Namespaces**: Logical separation of connections

## Extending This Example

Add to create a complete game:

1. Implement matchmaking queue
2. Add room listing/browsing
3. Implement spectator mode
4. Add room settings (private/public, password)
5. Persist room state for reconnection
6. Add admin/host privileges

## Comparison to WebSocket

**Socket.io Advantages:**

- Easier room management
- Built-in reconnection
- Event-based API
- Fallback support

**Raw WebSocket Advantages:**

- Lower overhead
- More control
- Simpler for point-to-point
- No library dependency

## Files

- `server.js` - Socket.io server with room management
- `README.md` - This file
