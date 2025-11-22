/**
 * Basic WebSocket Client Example
 *
 * Demonstrates:
 * - Client-side prediction
 * - Server reconciliation
 * - Entity interpolation
 * - Input handling
 */

class GameClient {
  constructor(serverUrl = 'ws://localhost:3000') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.clientId = null;

    // Local player state (predicted)
    this.localPlayer = {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 }
    };

    // Input tracking
    this.inputSequenceNumber = 0;
    this.pendingInputs = [];

    // Other players (interpolated)
    this.otherPlayers = new Map(); // playerId -> player state

    // State buffer for interpolation
    this.stateBuffer = [];
    this.interpolationDelay = 100; // ms

    // Network stats
    this.rtt = 0;
    this.lastPingTime = 0;

    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.serverUrl);

    this.ws.onopen = () => {
      console.log('Connected to server');
      this.startPingLoop();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from server');
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'connected':
        this.handleConnected(message);
        break;
      case 'state':
        this.handleState(message);
        break;
      case 'pong':
        this.handlePong(message);
        break;
      case 'playerLeft':
        this.otherPlayers.delete(message.playerId);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  handleConnected(message) {
    this.clientId = message.clientId;
    this.localPlayer = {
      position: { ...message.player.position },
      velocity: { ...message.player.velocity }
    };
    console.log('Assigned client ID:', this.clientId);
  }

  handleState(message) {
    // Store state in buffer for interpolation
    this.stateBuffer.push({
      timestamp: Date.now(),
      serverTime: message.timestamp,
      players: message.players
    });

    // Keep buffer size reasonable (1 second of history)
    if (this.stateBuffer.length > 60) {
      this.stateBuffer.shift();
    }

    // Find our player in the state
    const serverPlayer = message.players.find(p => p.id === this.clientId);
    if (serverPlayer) {
      this.reconcile(serverPlayer);
    }

    // Update other players
    for (const player of message.players) {
      if (player.id !== this.clientId) {
        this.otherPlayers.set(player.id, player);
      }
    }
  }

  reconcile(serverState) {
    // Calculate position error
    const dx = this.localPlayer.position.x - serverState.position.x;
    const dy = this.localPlayer.position.y - serverState.position.y;
    const error = Math.sqrt(dx * dx + dy * dy);

    const threshold = 0.1; // meters

    if (error > threshold) {
      console.log(`Reconciling: error=${error.toFixed(3)}m`);

      // Snap to server state
      this.localPlayer.position = { ...serverState.position };
      this.localPlayer.velocity = { ...serverState.velocity };

      // Replay unprocessed inputs
      const unprocessedInputs = this.pendingInputs.filter(
        input => input.sequenceNumber > serverState.lastProcessedInput
      );

      for (const input of unprocessedInputs) {
        this.applyInput(input);
      }
    }

    // Clean up confirmed inputs
    this.pendingInputs = this.pendingInputs.filter(
      input => input.sequenceNumber > serverState.lastProcessedInput
    );
  }

  processInput(movement) {
    const input = {
      sequenceNumber: this.inputSequenceNumber++,
      movement: movement,
      timestamp: Date.now(),
      deltaTime: 1 / 60 // Assume 60fps for this example
    };

    // Store for reconciliation
    this.pendingInputs.push(input);

    // Apply locally (client-side prediction)
    this.applyInput(input);

    // Send to server
    this.sendInput(input);
  }

  applyInput(input) {
    const speed = 5.0; // Must match server
    const deltaTime = input.deltaTime;

    this.localPlayer.position.x += input.movement.x * speed * deltaTime;
    this.localPlayer.position.y += input.movement.y * speed * deltaTime;

    this.localPlayer.velocity.x = input.movement.x * speed;
    this.localPlayer.velocity.y = input.movement.y * speed;

    // World bounds (must match server)
    this.localPlayer.position.x = Math.max(-50, Math.min(50, this.localPlayer.position.x));
    this.localPlayer.position.y = Math.max(-50, Math.min(50, this.localPlayer.position.y));
  }

  sendInput(input) {
    this.send({
      type: 'input',
      input: {
        sequenceNumber: input.sequenceNumber,
        movement: input.movement,
        timestamp: input.timestamp
      }
    });
  }

  interpolateOtherPlayers() {
    const renderTime = Date.now() - this.interpolationDelay;

    // Find snapshots bracketing render time
    let before = null;
    let after = null;

    for (let i = 0; i < this.stateBuffer.length - 1; i++) {
      if (this.stateBuffer[i].timestamp <= renderTime &&
          this.stateBuffer[i + 1].timestamp >= renderTime) {
        before = this.stateBuffer[i];
        after = this.stateBuffer[i + 1];
        break;
      }
    }

    if (!before || !after) {
      // Not enough data to interpolate, use latest
      return this.stateBuffer[this.stateBuffer.length - 1]?.players || [];
    }

    // Interpolate each player
    const interpolatedPlayers = [];
    const t = (renderTime - before.timestamp) / (after.timestamp - before.timestamp);

    for (const afterPlayer of after.players) {
      if (afterPlayer.id === this.clientId) continue;

      const beforePlayer = before.players.find(p => p.id === afterPlayer.id);
      if (!beforePlayer) {
        interpolatedPlayers.push(afterPlayer);
        continue;
      }

      // Lerp position
      interpolatedPlayers.push({
        id: afterPlayer.id,
        position: {
          x: beforePlayer.position.x + (afterPlayer.position.x - beforePlayer.position.x) * t,
          y: beforePlayer.position.y + (afterPlayer.position.y - beforePlayer.position.y) * t
        }
      });
    }

    return interpolatedPlayers;
  }

  startPingLoop() {
    setInterval(() => {
      this.lastPingTime = Date.now();
      this.send({
        type: 'ping',
        sentAt: this.lastPingTime
      });
    }, 1000);
  }

  handlePong(message) {
    this.rtt = Date.now() - message.sentAt;
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Call this in your game loop (60fps)
  update() {
    // Render local player at predicted position
    this.renderPlayer(this.localPlayer, true);

    // Render other players at interpolated positions
    const interpolatedPlayers = this.interpolateOtherPlayers();
    for (const player of interpolatedPlayers) {
      this.renderPlayer(player, false);
    }

    // Display network stats
    this.renderStats();
  }

  renderPlayer(player, isLocal) {
    // This would be your actual rendering code
    // For example, updating a DOM element or canvas
    console.log(`${isLocal ? 'Local' : 'Other'} Player ${player.id}:`,
                `(${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)})`);
  }

  renderStats() {
    console.log(`RTT: ${this.rtt}ms | Pending inputs: ${this.pendingInputs.length}`);
  }
}

// Example usage:
// const client = new GameClient('ws://localhost:3000');
//
// // In your game loop:
// setInterval(() => {
//   // Get input from keyboard/gamepad
//   const movement = { x: 0, y: 0 };
//   if (/* up key */) movement.y = -1;
//   if (/* down key */) movement.y = 1;
//   if (/* left key */) movement.x = -1;
//   if (/* right key */) movement.x = 1;
//
//   // Process input
//   if (movement.x !== 0 || movement.y !== 0) {
//     client.processInput(movement);
//   }
//
//   // Update rendering
//   client.update();
// }, 1000 / 60); // 60fps
