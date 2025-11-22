#!/usr/bin/env node
/**
 * Socket.io Server with Room Support
 *
 * Demonstrates:
 * - Room/lobby management
 * - Socket.io rooms for game instances
 * - Per-room game state
 * - Matchmaking
 */

const http = require('http');
const socketIO = require('socket.io');

class GameRoom {
  constructor(roomId, maxPlayers = 4) {
    this.roomId = roomId;
    this.maxPlayers = maxPlayers;
    this.players = new Map(); // socketId -> player
    this.gameState = 'waiting'; // waiting, playing, finished
    this.tickRate = 20; // Hz
    this.tickInterval = null;
  }

  addPlayer(socketId) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    const player = {
      id: socketId,
      position: { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10 },
      velocity: { x: 0, y: 0 },
      score: 0,
      lastProcessedInput: 0
    };

    this.players.set(socketId, player);
    return true;
  }

  removePlayer(socketId) {
    this.players.delete(socketId);

    // Stop game if not enough players
    if (this.players.size === 0 && this.gameState === 'playing') {
      this.stopGame();
    }
  }

  startGame() {
    if (this.gameState === 'playing') return;

    this.gameState = 'playing';
    this.tickInterval = setInterval(() => this.tick(), 1000 / this.tickRate);

    console.log(`Room ${this.roomId}: Game started with ${this.players.size} players`);
  }

  stopGame() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    this.gameState = 'finished';

    console.log(`Room ${this.roomId}: Game stopped`);
  }

  tick() {
    // Game simulation would go here
    // For now, just a placeholder
  }

  processInput(socketId, input) {
    const player = this.players.get(socketId);
    if (!player) return;

    const speed = 5.0;
    const deltaTime = 1 / this.tickRate;

    player.position.x += input.movement.x * speed * deltaTime;
    player.position.y += input.movement.y * speed * deltaTime;

    player.velocity.x = input.movement.x * speed;
    player.velocity.y = input.movement.y * speed;

    player.lastProcessedInput = input.sequenceNumber;
  }

  getState() {
    return {
      roomId: this.roomId,
      gameState: this.gameState,
      timestamp: Date.now(),
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        position: p.position,
        velocity: p.velocity,
        score: p.score,
        lastProcessedInput: p.lastProcessedInput
      }))
    };
  }
}

class GameServer {
  constructor(port = 3000) {
    this.port = port;
    this.rooms = new Map(); // roomId -> GameRoom
    this.playerRooms = new Map(); // socketId -> roomId

    this.server = http.createServer();
    this.io = socketIO(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupHandlers();
    this.startBroadcastLoop();
  }

  setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Player ${socket.id} connected`);

      socket.on('joinRoom', (data) => this.handleJoinRoom(socket, data));
      socket.on('leaveRoom', () => this.handleLeaveRoom(socket));
      socket.on('createRoom', (data) => this.handleCreateRoom(socket, data));
      socket.on('startGame', () => this.handleStartGame(socket));
      socket.on('input', (data) => this.handleInput(socket, data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  handleCreateRoom(socket, data) {
    const roomId = `room_${Date.now()}`;
    const maxPlayers = data.maxPlayers || 4;

    const room = new GameRoom(roomId, maxPlayers);
    this.rooms.set(roomId, room);

    console.log(`Room ${roomId} created by ${socket.id}`);

    socket.emit('roomCreated', {
      roomId: roomId,
      maxPlayers: maxPlayers
    });

    // Auto-join creator to room
    this.handleJoinRoom(socket, { roomId });
  }

  handleJoinRoom(socket, data) {
    const { roomId } = data;
    const room = this.rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (!room.addPlayer(socket.id)) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    // Join Socket.io room
    socket.join(roomId);
    this.playerRooms.set(socket.id, roomId);

    console.log(`Player ${socket.id} joined room ${roomId}`);

    // Notify player
    socket.emit('joinedRoom', {
      roomId: roomId,
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers
    });

    // Notify others in room
    socket.to(roomId).emit('playerJoined', {
      playerId: socket.id,
      playerCount: room.players.size
    });

    // Send current room state
    socket.emit('roomState', room.getState());
  }

  handleLeaveRoom(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    this.removePlayerFromRoom(socket, roomId);
  }

  removePlayerFromRoom(socket, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.removePlayer(socket.id);
    socket.leave(roomId);
    this.playerRooms.delete(socket.id);

    console.log(`Player ${socket.id} left room ${roomId}`);

    // Notify others
    socket.to(roomId).emit('playerLeft', {
      playerId: socket.id,
      playerCount: room.players.size
    });

    // Clean up empty rooms
    if (room.players.size === 0) {
      room.stopGame();
      this.rooms.delete(roomId);
      console.log(`Room ${roomId} deleted (empty)`);
    }
  }

  handleStartGame(socket) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    room.startGame();

    // Notify all players in room
    this.io.to(roomId).emit('gameStarted', {
      roomId: roomId,
      timestamp: Date.now()
    });
  }

  handleInput(socket, data) {
    const roomId = this.playerRooms.get(socket.id);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room || room.gameState !== 'playing') return;

    room.processInput(socket.id, data.input);
  }

  handleDisconnect(socket) {
    console.log(`Player ${socket.id} disconnected`);

    const roomId = this.playerRooms.get(socket.id);
    if (roomId) {
      this.removePlayerFromRoom(socket, roomId);
    }
  }

  startBroadcastLoop() {
    // Broadcast state updates for all active rooms
    setInterval(() => {
      for (const [roomId, room] of this.rooms) {
        if (room.gameState === 'playing') {
          const state = room.getState();
          this.io.to(roomId).emit('gameState', state);
        }
      }
    }, 50); // 20Hz broadcast rate
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Socket.io server listening on port ${this.port}`);
    });
  }
}

// Start server
const server = new GameServer(3000);
server.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.io.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
