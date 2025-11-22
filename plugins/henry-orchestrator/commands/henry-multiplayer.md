---
description: Adds netcode; syncs lobbies, real-time state.
allowed-tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob', 'Bash', 'WebFetch', 'TodoWrite', 'Task']
---

Implement multiplayer functionality with the following requirements:

1. **Netcode Implementation**
   - Set up WebSocket or WebRTC connection for real-time communication
   - Implement client-server architecture or peer-to-peer networking
   - Handle network latency and prediction/reconciliation
   - Add connection state management (connecting, connected, disconnected)

2. **Lobby System**
   - Create lobby creation and joining functionality
   - Implement lobby listing/discovery
   - Add player ready state management
   - Handle host migration if needed
   - Support lobby settings (max players, game mode, etc.)

3. **Real-time State Synchronization**
   - Sync player positions and actions across all clients
   - Implement delta compression for efficient state updates
   - Add interpolation and extrapolation for smooth movement
   - Handle state reconciliation for missed updates
   - Implement authority model (server-authoritative or client-predicted)

4. **Additional Features**
   - Add matchmaking if applicable
   - Implement chat/communication system
   - Handle disconnections gracefully
   - Add reconnection logic
   - Include network statistics/debugging tools

Please analyze the existing codebase structure and implement multiplayer networking that integrates well with the current architecture.
