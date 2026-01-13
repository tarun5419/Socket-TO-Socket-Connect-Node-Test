
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const redisAdapter = require('socket.io-redis');
const Redis = require('ioredis');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

// if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Redis subscriber in the master process
  const subscriber = new Redis({
    host: 'localhost',
    port: 6379,
  });

  // Subscribe to Redis channel
  subscriber.subscribe('channel-from-publishing-server');

  // Forward messages to all workers
  subscriber.on('message', (channel, message) => {
    if (channel === 'channel-from-publishing-server') {
      console.log(`Master received message: ${message}`);
      // for (const id in cluster.workers) {
      //   cluster.workers[id].send({ channel, message });
      // }
    }
  });

  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  // Redis clients for publishing and subscribing
  const pubClient = new Redis({
    host: 'localhost',
    port: 6379,
  });
  const subClient = new Redis({
    host: 'localhost',
    port: 6379,
  });

  // Use Redis adapter for socket.io
  io.adapter(redisAdapter({ pubClient, subClient }));

  // Handle WebSocket connections
  io.on('connection', (socket) => {
    console.log(`Worker ${process.pid} - Client connected: ${socket.id}`);

    // Join the client to a specific room
    socket.on('join-room', (room) => {
      console.log(`Socket ${socket.id} joined room: ${room}`);
      socket.join(room);
    });

    // Leave the client from a room
    socket.on('leave-room', (room) => {
      console.log(`Socket ${socket.id} left room: ${room}`);
      socket.leave(room);
    });

    // Handle message from client
    socket.on('client-message', ({ room, message }) => {
      console.log(`Worker ${process.pid} - Received message for room ${room}: ${message}`);

      // Publish the message to Redis
      pubClient.publish('channel-from-websocket-server', JSON.stringify({ room, message }));
    });

    socket.on('disconnect', () => {
      console.log(`Worker ${process.pid} - Client disconnected: ${socket.id}`);
    });
  });

  // Handle messages forwarded by the master process
//   process.on('message', ({ channel, message }) => {
//     if (channel === 'channel-from-publishing-server') {
//       // const { room, data } = JSON.parse(message);
//       const room = 'channel-from-publishing-server'
//       const data = 'Data from publishing server'
//       console.log(`Worker ${process.pid} - Broadcasting to room ${room}: ${data}`);

//       // Emit the message to clients in the specified room
//       io.to(room).emit('dataTarun', data);
//     }
//   });


let PORT = 3000;
if (process.env.NODE_APP_INSTANCE) PORT = parseInt(PORT) + parseInt(process.env.NODE_APP_INSTANCE);

  server.listen(PORT, () => {
    console.log(`Worker ${process.pid} listening on port 3000`);
  });
// }
