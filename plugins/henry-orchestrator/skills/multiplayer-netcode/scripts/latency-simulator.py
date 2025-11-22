#!/usr/bin/env python3
"""
Network Latency Simulator

Simulates network conditions for testing multiplayer netcode:
- Added latency (delay)
- Packet loss
- Jitter (variable latency)

Usage:
    python latency-simulator.py --latency 100 --packet-loss 0.05 --jitter 20 --port 3000

This acts as a proxy between client and server, introducing network conditions.
"""

import asyncio
import argparse
import random
from collections import deque

class LatencySimulator:
    def __init__(self, target_host, target_port, listen_port, latency_ms, packet_loss, jitter_ms):
        self.target_host = target_host
        self.target_port = target_port
        self.listen_port = listen_port
        self.base_latency_ms = latency_ms
        self.packet_loss_rate = packet_loss
        self.jitter_ms = jitter_ms

        self.packets_sent = 0
        self.packets_dropped = 0
        self.total_delay = 0

    def calculate_delay(self):
        """Calculate delay with jitter"""
        if self.jitter_ms > 0:
            jitter = random.uniform(-self.jitter_ms, self.jitter_ms)
            delay = max(0, self.base_latency_ms + jitter)
        else:
            delay = self.base_latency_ms

        return delay / 1000.0  # Convert to seconds

    def should_drop_packet(self):
        """Determine if packet should be dropped"""
        return random.random() < self.packet_loss_rate

    async def handle_client(self, client_reader, client_writer):
        """Handle client connection"""
        client_addr = client_writer.get_extra_info('peername')
        print(f"Client connected from {client_addr}")

        try:
            # Connect to target server
            server_reader, server_writer = await asyncio.open_connection(
                self.target_host, self.target_port
            )

            print(f"Connected to target server {self.target_host}:{self.target_port}")

            # Create bidirectional forwarding
            await asyncio.gather(
                self.forward(client_reader, server_writer, "Client→Server"),
                self.forward(server_reader, client_writer, "Server→Client")
            )

        except Exception as e:
            print(f"Error handling client: {e}")
        finally:
            client_writer.close()
            await client_writer.wait_closed()

    async def forward(self, reader, writer, direction):
        """Forward data with simulated network conditions"""
        try:
            while True:
                data = await reader.read(4096)
                if not data:
                    break

                self.packets_sent += 1

                # Simulate packet loss
                if self.should_drop_packet():
                    self.packets_dropped += 1
                    print(f"[{direction}] Packet dropped (loss simulation)")
                    continue

                # Calculate delay
                delay = self.calculate_delay()
                self.total_delay += delay

                # Simulate latency
                if delay > 0:
                    await asyncio.sleep(delay)

                # Forward data
                writer.write(data)
                await writer.drain()

        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Error forwarding [{direction}]: {e}")
        finally:
            writer.close()
            await writer.wait_closed()

    async def start(self):
        """Start the proxy server"""
        server = await asyncio.start_server(
            self.handle_client,
            '0.0.0.0',
            self.listen_port
        )

        addr = server.sockets[0].getsockname()
        print(f"\n=== Network Latency Simulator ===")
        print(f"Listening on: {addr[0]}:{addr[1]}")
        print(f"Forwarding to: {self.target_host}:{self.target_port}")
        print(f"Base latency: {self.base_latency_ms}ms")
        print(f"Jitter: ±{self.jitter_ms}ms")
        print(f"Packet loss: {self.packet_loss_rate * 100:.1f}%")
        print(f"\nConnect your client to ws://localhost:{self.listen_port}")
        print(f"Press Ctrl+C to stop\n")

        async with server:
            try:
                await server.serve_forever()
            except KeyboardInterrupt:
                print("\n\n=== Simulator Statistics ===")
                print(f"Packets sent: {self.packets_sent}")
                print(f"Packets dropped: {self.packets_dropped}")
                if self.packets_sent > 0:
                    loss_rate = (self.packets_dropped / self.packets_sent) * 100
                    avg_delay = (self.total_delay / self.packets_sent) * 1000
                    print(f"Actual loss rate: {loss_rate:.2f}%")
                    print(f"Average delay: {avg_delay:.1f}ms")

def main():
    parser = argparse.ArgumentParser(
        description="Simulate network latency and packet loss for testing multiplayer games"
    )

    parser.add_argument(
        '--target-host',
        default='localhost',
        help='Target server host (default: localhost)'
    )

    parser.add_argument(
        '--target-port',
        type=int,
        default=3000,
        help='Target server port (default: 3000)'
    )

    parser.add_argument(
        '--listen-port',
        type=int,
        default=3001,
        help='Port to listen on (default: 3001)'
    )

    parser.add_argument(
        '--latency',
        type=int,
        default=100,
        help='Base latency in milliseconds (default: 100)'
    )

    parser.add_argument(
        '--jitter',
        type=int,
        default=0,
        help='Latency jitter in milliseconds (default: 0)'
    )

    parser.add_argument(
        '--packet-loss',
        type=float,
        default=0.0,
        help='Packet loss rate from 0.0 to 1.0 (default: 0.0)'
    )

    args = parser.parse_args()

    # Validate arguments
    if args.packet_loss < 0 or args.packet_loss > 1:
        print("Error: Packet loss must be between 0.0 and 1.0")
        return

    if args.latency < 0:
        print("Error: Latency must be >= 0")
        return

    # Create and start simulator
    simulator = LatencySimulator(
        target_host=args.target_host,
        target_port=args.target_port,
        listen_port=args.listen_port,
        latency_ms=args.latency,
        packet_loss=args.packet_loss,
        jitter_ms=args.jitter
    )

    asyncio.run(simulator.start())

if __name__ == "__main__":
    main()
