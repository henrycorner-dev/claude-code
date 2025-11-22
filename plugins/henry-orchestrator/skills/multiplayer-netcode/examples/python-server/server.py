#!/usr/bin/env python3
"""
Python WebSocket Server Example

Demonstrates:
- WebSocket server in Python
- Authoritative server architecture
- Basic game loop
- JSON message handling
"""

import asyncio
import websockets
import json
from datetime import datetime
from typing import Dict, Set

class Player:
    def __init__(self, player_id: str):
        self.id = player_id
        self.position = {"x": 0.0, "y": 0.0}
        self.velocity = {"x": 0.0, "y": 0.0}
        self.last_processed_input = 0

    def to_dict(self):
        return {
            "id": self.id,
            "position": self.position,
            "velocity": self.velocity,
            "lastProcessedInput": self.last_processed_input
        }

class GameServer:
    def __init__(self):
        self.clients: Dict[websockets.WebSocketServerProtocol, Player] = {}
        self.tick_rate = 20  # Hz
        self.tick_interval = 1.0 / self.tick_rate
        self.next_client_id = 0

    async def handle_client(self, websocket, path):
        """Handle a new client connection"""
        client_id = str(self.next_client_id)
        self.next_client_id += 1

        player = Player(client_id)
        self.clients[websocket] = player

        print(f"Client {client_id} connected")

        try:
            # Send initial connection message
            await self.send_message(websocket, {
                "type": "connected",
                "clientId": client_id,
                "player": player.to_dict()
            })

            # Handle messages
            async for message in websocket:
                await self.handle_message(websocket, message)

        except websockets.exceptions.ConnectionClosed:
            print(f"Client {client_id} disconnected")
        finally:
            # Clean up
            del self.clients[websocket]
            await self.broadcast({
                "type": "playerLeft",
                "playerId": client_id
            })

    async def handle_message(self, websocket, message):
        """Handle incoming message from client"""
        try:
            data = json.loads(message)
            message_type = data.get("type")

            if message_type == "input":
                await self.handle_input(websocket, data)
            elif message_type == "ping":
                await self.handle_ping(websocket, data)
            else:
                print(f"Unknown message type: {message_type}")

        except json.JSONDecodeError:
            print("Invalid JSON received")

    async def handle_input(self, websocket, data):
        """Process player input"""
        player = self.clients.get(websocket)
        if not player:
            return

        input_data = data.get("input", {})

        # Validate input
        if not self.validate_input(input_data):
            print(f"Invalid input from {player.id}")
            return

        # Apply input
        self.apply_input(player, input_data, self.tick_interval)

        # Record last processed input
        player.last_processed_input = input_data.get("sequenceNumber", 0)

    def validate_input(self, input_data):
        """Validate input is within acceptable bounds"""
        movement = input_data.get("movement", {})
        x = movement.get("x", 0)
        y = movement.get("y", 0)

        # Check bounds
        if abs(x) > 1 or abs(y) > 1:
            return False

        return True

    def apply_input(self, player: Player, input_data, delta_time):
        """Apply input to player state"""
        speed = 5.0  # meters per second
        movement = input_data.get("movement", {"x": 0, "y": 0})

        # Apply movement
        player.position["x"] += movement["x"] * speed * delta_time
        player.position["y"] += movement["y"] * speed * delta_time

        # Update velocity
        player.velocity["x"] = movement["x"] * speed
        player.velocity["y"] = movement["y"] * speed

        # World bounds
        player.position["x"] = max(-50, min(50, player.position["x"]))
        player.position["y"] = max(-50, min(50, player.position["y"]))

    async def handle_ping(self, websocket, data):
        """Handle ping request"""
        await self.send_message(websocket, {
            "type": "pong",
            "sentAt": data.get("sentAt")
        })

    async def game_loop(self):
        """Main game loop - broadcasts state at tick_rate"""
        while True:
            await asyncio.sleep(self.tick_interval)

            # Build state snapshot
            state = {
                "type": "state",
                "timestamp": datetime.now().timestamp() * 1000,
                "players": [player.to_dict() for player in self.clients.values()]
            }

            # Broadcast to all clients
            await self.broadcast(state)

    async def broadcast(self, message):
        """Broadcast message to all connected clients"""
        if not self.clients:
            return

        message_json = json.dumps(message)

        # Send to all clients concurrently
        await asyncio.gather(
            *[self.send_message(ws, message) for ws in self.clients.keys()],
            return_exceptions=True
        )

    async def send_message(self, websocket, message):
        """Send message to specific client"""
        try:
            if isinstance(message, dict):
                message = json.dumps(message)
            await websocket.send(message)
        except websockets.exceptions.ConnectionClosed:
            pass

    async def start(self, host="localhost", port=3000):
        """Start the server"""
        print(f"Starting WebSocket server on {host}:{port}")

        # Start game loop
        asyncio.create_task(self.game_loop())

        # Start WebSocket server
        async with websockets.serve(self.handle_client, host, port):
            await asyncio.Future()  # Run forever

if __name__ == "__main__":
    server = GameServer()
    try:
        asyncio.run(server.start())
    except KeyboardInterrupt:
        print("\nShutting down server...")
