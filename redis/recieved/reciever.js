// const http = require('http');
// const express = require('express');
// const socketIo = require('socket.io');
// const redisAdapter = require('socket.io-redis');
// const Redis = require('ioredis');
// const cluster = require('cluster');
// const os = require('os');

// const numCPUs = os.cpus().length;
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// // Separate Redis clients for publishing and subscribing
// const pubClient = new Redis({
//   host: 'localhost',
//   port: 6379,
// });
// const subClient = new Redis({
//   host: 'localhost',
//   port: 6379,
// });

// // Use the pubClient and subClient for socket.io-redis adapter
// io.adapter(redisAdapter({ pubClient, subClient }));

// // Separate Redis client for direct subscribing to messages
// const subscriber = new Redis({
//   host: 'localhost',
//   port: 6379,
// });

// // Subscribe to Redis channels
// subscriber.subscribe('channel-from-publishing-server');

// // Handle incoming messages from Redis and emit to WebSocket clients
// subscriber.on('message', (channel, message) => {
//   if (channel === 'channel-from-publishing-server') {
//     console.log('Received from publishing server:', message);
//     io.emit('dataTarun', message);
//   }
// });

// // Handle WebSocket connections
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Handle message from WebSocket client
//   socket.on('client-message', (msg) => {
//     console.log('Received message from client:', msg);

//     // Publish message to Redis
//     pubClient.publish('channel-from-websocket-server', msg);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

// if (cluster.isMaster) {
//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//   });
// } else {
//   // Start the server on workers
//   server.listen(3000, () => {
//     console.log(`Worker ${process.pid} listening on port 3000`);
//   });
// }









// const http = require('http');
// const express = require('express');
// const socketIo = require('socket.io');
// const redisAdapter = require('socket.io-redis');
// const Redis = require('ioredis');
// const cluster = require('cluster');
// const os = require('os');

// const numCPUs = os.cpus().length;

// if (cluster.isMaster) {
//   console.log(`Master ${process.pid} is running`);

//   // Separate Redis client for subscribing in the master process
//   const subscriber = new Redis({
//     host: 'localhost',
//     port: 6379,
//   });

//   // Subscribe to the Redis channel
//   subscriber.subscribe('channel-from-publishing-server');

//   // Broadcast messages to all workers
//   subscriber.on('message', (channel, message) => {
//     if (channel === 'channel-from-publishing-server') {
//       console.log(`Master received message: ${message}`);
//       for (const id in cluster.workers) {
//         cluster.workers[id].send({ channel, message });
//       }
//     }
//   });

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker, code, signal) => {
//     console.log(`Worker ${worker.process.pid} died`);
//   });
// } else {
//   const app = express();
//   const server = http.createServer(app);
//   const io = socketIo(server);

//   // Separate Redis clients for publishing and subscribing
//   const pubClient = new Redis({
//     host: 'localhost',
//     port: 6379,
//   });
//   const subClient = new Redis({
//     host: 'localhost',
//     port: 6379,
//   });

//   // Use the pubClient and subClient for socket.io-redis adapter
//   io.adapter(redisAdapter({ pubClient, subClient }));

//   // Handle WebSocket connections
//   io.on('connection', (socket) => {
//     console.log('A user connected');

//     // Handle message from WebSocket client
//     socket.on('client-message', (msg) => {
//       console.log('Received message from client:', msg);

//       // Publish message to Redis
//       pubClient.publish('channel-from-websocket-server', msg);
//     });

//     socket.on('disconnect', () => {
//       console.log('User disconnected');
//     });
//   });

//   // Listen for messages from the master process
//   process.on('message', ({ channel, message }) => {
//     if (channel === 'channel-from-publishing-server') {
//       console.log(`Worker ${process.pid} received message: ${message}`);
//       io.emit('dataTarun', message);
//     }
//   });

//   server.listen(3000, () => {
//     console.log(`Worker ${process.pid} listening on port 3000`);
//   });
// }















const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const redisAdapter = require('socket.io-redis');
const Redis = require('ioredis');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Redis subscriber in the master process
  const subscriber = new Redis({
    host: 'localhost',
    port: 6379,
  });

  // Subscribe to Redis channel
  subscriber.subscribe('channel-from-publishing-server');

  // When a message is received, forward it to all workers
  subscriber.on('message', (channel, message) => {
    if (channel === 'channel-from-publishing-server') {
      console.log(`Master received message--ddddfghjklfdxghjkfdghjklgfcbhjkmlfcgvhbjkmgfchbjklghjk: ${message}`);
      for (const id in cluster.workers) {
        cluster.workers[id].send({ channel, message });
      }
    }
  });

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  const server = http.createServer(app);
  const io = socketIo(server);

  // Separate Redis clients for publishing and subscribing
  const pubClient = new Redis({
    host: 'localhost',
    port: 6379,
  });
  const subClient = new Redis({
    host: 'localhost',
    port: 6379,
  });

  // Use socket.io-redis adapter
  io.adapter(redisAdapter({ pubClient, subClient }));

  // Store unique socket IDs in the worker
  const connectedClients = new Set();

  // Handle WebSocket connections
  io.on('connection', (socket) => {
    console.log(`Worker ${process.pid} - Client connected: ${socket.id}`);
    connectedClients.add(socket.id);

    socket.on('disconnect', () => {
      console.log(`Worker ${process.pid} - Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });

    // socket.on('client-message', (msg) => {
    //   console.log(`Worker ${process.pid} - Received from client: ${msg}`);
    //   pubClient.publish('channel-from-websocket-server', msg);
    // });
  });

  // Listen for messages from the master process
  process.on('message', ({ channel, message }) => {
    if (channel === 'channel-from-publishing-server') {
      console.log(`Worker ${process.pid} broadcasting message: ${message}`);

      // Emit only to connected clients in this worker
      connectedClients.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('dataTarun', message);
        }
      });
    }
  });

  server.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on port 3000`);
  });
}

