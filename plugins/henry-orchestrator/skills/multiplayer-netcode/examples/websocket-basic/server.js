#!/usr/bin/env node
/**
 * Basic WebSocket Server Example
 *
 * Demonstrates:
 * - Simple WebSocket server setup
 * - Client connection management
 * - Input processing and broadcasting
 * - Basic game loop with authoritative server
 */

const WebSocket = require('ws');

class GameServer {
  constructor(port = 3000) {
    this.port = port;
    this.wss = new WebSocket.Server({ port });
    this.clients = new Map(); // clientId -> { ws, player }
    this.nextClientId = 0;

    // Game state
    this.players = new Map(); // playerId -> { position, velocity }
    this.tickRate = 20; // 20 Hz server tick
    this.tickInterval = 1000 / this.tickRate;

    this.setupServer();
    this.startGameLoop();
  }

  setupServer() {
    this.wss.on('connection', (ws) => {
      const clientId = this.nextClientId++;
      console.log(`Client ${clientId} connected`);

      // Create player
      const player = {
        id: clientId,
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        lastProcessedInput: 0
      };

      this.clients.set(clientId, { ws, player });
      this.players.set(clientId, player);

      // Send initial state
      this.sendMessage(ws, {
        type: 'connected',
        clientId: clientId,
        player: player
      });

      // Handle messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error(`Error parsing message from client ${clientId}:`, error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        this.clients.delete(clientId);
        this.players.delete(clientId);

        // Notify others
        this.broadcast({
          type: 'playerLeft',
          playerId: clientId
        });
      });
    });

    console.log(`WebSocket server listening on port ${this.port}`);
  }

  handleMessage(clientId, message) {
    switch (message.type) {
      case 'input':
        this.handleInput(clientId, message);
        break;
      case 'ping':
        this.handlePing(clientId, message);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  handleInput(clientId, message) {
    const player = this.players.get(clientId);
    if (!player) return;

    const input = message.input;

    // Validate input (anti-cheat)
    if (!this.validateInput(input)) {
      console.warn(`Invalid input from client ${clientId}`);
      return;
    }

    // Apply input to authoritative state
    this.applyInput(player, input, this.tickInterval / 1000);

    // Record last processed input for client reconciliation
    player.lastProcessedInput = input.sequenceNumber;
  }

  validateInput(input) {
    // Basic validation
    if (!input.movement) return false;

    const { x, y } = input.movement;

    // Check movement is within reasonable bounds (-1 to 1)
    if (Math.abs(x) > 1 || Math.abs(y) > 1) return false;

    return true;
  }

  applyInput(player, input, deltaTime) {
    const speed = 5.0; // meters per second

    // Apply movement
    player.position.x += input.movement.x * speed * deltaTime;
    player.position.y += input.movement.y * speed * deltaTime;

    // Update velocity (for dead reckoning)
    player.velocity.x = input.movement.x * speed;
    player.velocity.y = input.movement.y * speed;

    // World bounds checking
    player.position.x = Math.max(-50, Math.min(50, player.position.x));
    player.position.y = Math.max(-50, Math.min(50, player.position.y));
  }

  handlePing(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Send pong back
    this.sendMessage(client.ws, {
      type: 'pong',
      sentAt: message.sentAt
    });
  }

  startGameLoop() {
    setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  tick() {
    // Build state snapshot
    const state = {
      type: 'state',
      timestamp: Date.now(),
      players: Array.from(this.players.values()).map(player => ({
        id: player.id,
        position: player.position,
        velocity: player.velocity,
        lastProcessedInput: player.lastProcessedInput
      }))
    };

    // Broadcast to all clients
    this.broadcast(state);
  }

  broadcast(message) {
    const json = JSON.stringify(message);

    for (const [clientId, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(json);
      }
    }
  }

  sendMessage(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

// Start server
const server = new GameServer(3000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
