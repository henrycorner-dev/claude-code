#!/usr/bin/env node
/**
 * Network Packet Inspector
 *
 * Logs and analyzes network traffic between client and server:
 * - Message types and sizes
 * - Bandwidth usage
 * - Message frequency
 * - Pattern analysis
 *
 * Usage:
 *   node packet-inspector.js --port 3000 --target-port 3001
 */

const net = require('net');
const { program } = require('commander');

class PacketInspector {
  constructor(listenPort, targetHost, targetPort) {
    this.listenPort = listenPort;
    this.targetHost = targetHost;
    this.targetPort = targetPort;

    // Statistics
    this.stats = {
      clientToServer: {
        totalBytes: 0,
        messageCount: 0,
        messageTypes: new Map(),
        lastMessageTime: Date.now()
      },
      serverToClient: {
        totalBytes: 0,
        messageCount: 0,
        messageTypes: new Map(),
        lastMessageTime: Date.now()
      }
    };

    this.startTime = Date.now();
  }

  analyzeMessage(data, direction) {
    const stats = direction === 'C→S' ? this.stats.clientToServer : this.stats.serverToClient;

    stats.totalBytes += data.length;
    stats.messageCount++;

    // Try to parse as JSON
    try {
      const text = data.toString('utf8');
      const message = JSON.parse(text);

      const messageType = message.type || 'unknown';
      const typeStats = stats.messageTypes.get(messageType) || {
        count: 0,
        totalBytes: 0
      };

      typeStats.count++;
      typeStats.totalBytes += data.length;
      stats.messageTypes.set(messageType, typeStats);

      const now = Date.now();
      const timeSinceLast = now - stats.lastMessageTime;
      stats.lastMessageTime = now;

      console.log(
        `[${direction}] ${messageType.padEnd(20)} | ` +
        `${data.length.toString().padStart(6)} bytes | ` +
        `Δt: ${timeSinceLast.toString().padStart(4)}ms`
      );

      // Log message content for debugging (optional)
      if (process.env.VERBOSE) {
        console.log('  Content:', JSON.stringify(message, null, 2));
      }

    } catch (e) {
      // Not JSON, log as binary
      console.log(
        `[${direction}] <binary>             | ` +
        `${data.length.toString().padStart(6)} bytes`
      );
    }
  }

  handleConnection(clientSocket) {
    console.log(`\n=== New Connection ===`);
    console.log(`Client: ${clientSocket.remoteAddress}:${clientSocket.remotePort}`);

    // Connect to target server
    const serverSocket = net.createConnection({
      host: this.targetHost,
      port: this.targetPort
    }, () => {
      console.log(`Connected to target: ${this.targetHost}:${this.targetPort}\n`);
    });

    // Forward client → server
    clientSocket.on('data', (data) => {
      this.analyzeMessage(data, 'C→S');
      serverSocket.write(data);
    });

    // Forward server → client
    serverSocket.on('data', (data) => {
      this.analyzeMessage(data, 'S→C');
      clientSocket.write(data);
    });

    // Handle disconnections
    clientSocket.on('end', () => {
      console.log('\nClient disconnected');
      serverSocket.end();
      this.printStats();
    });

    serverSocket.on('end', () => {
      console.log('\nServer disconnected');
      clientSocket.end();
    });

    // Handle errors
    clientSocket.on('error', (err) => {
      console.error('Client error:', err.message);
      serverSocket.destroy();
    });

    serverSocket.on('error', (err) => {
      console.error('Server error:', err.message);
      clientSocket.destroy();
    });
  }

  printStats() {
    const runtime = (Date.now() - this.startTime) / 1000;

    console.log('\n=== Packet Inspector Statistics ===');
    console.log(`Runtime: ${runtime.toFixed(2)}s\n`);

    console.log('Client → Server:');
    this.printDirectionStats(this.stats.clientToServer, runtime);

    console.log('\nServer → Client:');
    this.printDirectionStats(this.stats.serverToClient, runtime);

    const totalBytes = this.stats.clientToServer.totalBytes + this.stats.serverToClient.totalBytes;
    const avgBandwidth = (totalBytes / runtime / 1024).toFixed(2);
    console.log(`\nTotal bandwidth: ${avgBandwidth} KB/s`);
  }

  printDirectionStats(stats, runtime) {
    console.log(`  Total bytes: ${stats.totalBytes} (${(stats.totalBytes / 1024).toFixed(2)} KB)`);
    console.log(`  Messages: ${stats.messageCount}`);
    console.log(`  Avg bytes/msg: ${(stats.totalBytes / stats.messageCount || 0).toFixed(2)}`);
    console.log(`  Bandwidth: ${(stats.totalBytes / runtime / 1024).toFixed(2)} KB/s`);

    if (stats.messageTypes.size > 0) {
      console.log('\n  Message breakdown:');

      // Sort by byte count
      const sorted = Array.from(stats.messageTypes.entries())
        .sort((a, b) => b[1].totalBytes - a[1].totalBytes);

      for (const [type, typeStats] of sorted) {
        const percentage = ((typeStats.totalBytes / stats.totalBytes) * 100).toFixed(1);
        console.log(
          `    ${type.padEnd(20)} | ` +
          `${typeStats.count.toString().padStart(5)} msgs | ` +
          `${typeStats.totalBytes.toString().padStart(8)} bytes (${percentage}%)`
        );
      }
    }
  }

  start() {
    const server = net.createServer((socket) => {
      this.handleConnection(socket);
    });

    server.listen(this.listenPort, () => {
      console.log('\n=== Packet Inspector Started ===');
      console.log(`Listening on: localhost:${this.listenPort}`);
      console.log(`Forwarding to: ${this.targetHost}:${this.targetPort}`);
      console.log('\nConnect your client to ws://localhost:' + this.listenPort);
      console.log('Press Ctrl+C to stop\n');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\nShutting down...');
      this.printStats();
      server.close(() => {
        process.exit(0);
      });
    });

    // Print periodic stats
    setInterval(() => {
      const runtime = (Date.now() - this.startTime) / 1000;
      const totalBytes = this.stats.clientToServer.totalBytes + this.stats.serverToClient.totalBytes;
      const bandwidth = (totalBytes / runtime / 1024).toFixed(2);

      process.stdout.write(`\r[Stats] Runtime: ${runtime.toFixed(0)}s | Bandwidth: ${bandwidth} KB/s | Messages: ${this.stats.clientToServer.messageCount + this.stats.serverToClient.messageCount}`);
    }, 1000);
  }
}

// CLI setup
program
  .option('-p, --port <port>', 'Port to listen on', '3002')
  .option('-t, --target-host <host>', 'Target server host', 'localhost')
  .option('-tp, --target-port <port>', 'Target server port', '3000')
  .parse(process.argv);

const options = program.opts();

// Check if commander is installed
try {
  require.resolve('commander');
} catch (e) {
  console.error('Error: commander package not found');
  console.error('Install it with: npm install commander');
  process.exit(1);
}

const inspector = new PacketInspector(
  parseInt(options.port),
  options.targetHost,
  parseInt(options.targetPort)
);

inspector.start();
