const cluster = require('cluster');
const os = require('os');
const http = require('http');
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');

// Cluster settings
// const numCPUs = os.cpus().length;
const numCPUs = 1;


if (cluster.isMaster) {
    console.log(`Master process started with PID: ${process.pid}`);

    // Master process only
    const pubClient = new Redis(process.env.REDIS_URL); // Redis publisher
    const subClient = new Redis(process.env.REDIS_URL); // Redis subscriber

    pubClient.on('error', (err) => console.error('PubClient Redis error:', err));
    subClient.on('error', (err) => console.error('SubClient Redis error:', err));

    // Fork workers based on the number of CPUs
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle Redis Pub/Sub in master process
    subClient.subscribe('externalProjectUpdates', (err, count) => {
        if (err) {
            console.error('Failed to subscribe to externalProjectUpdates:', err.message);
        } else {
            console.log(`Subscribed successfully to externalProjectUpdates!`);
        }
    });

    subClient.subscribe('notificationUpdates', (err, count) => {
        if (err) {
            console.error('Failed to subscribe to notificationUpdates:', err.message);
        } else {
            console.log(`Subscribed successfully to notificationUpdates!`);
        }
    });

    // Listen for messages on the Redis channels
    subClient.on('message', (channel, message) => {
        console.log(`Received message on channel ${channel}: ${message}`);
        try {
            const update = JSON.parse(message);
            const room = update.room; // Room to which the update should be sent

            // Send update to the specific room on Socket.IO
            io.to(room).emit('notificationUpdated', { socketId: 'external', update: update.data });
            console.log(`Broadcasted to room ${room}`);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });
} else {
    // Worker processes handle socket connections and communication

    const server = http.createServer((req, res) => {
        res.writeHead(200);
        res.end('Socket.IO worker is running');
    });

    const io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
    });

    // Redis adapter for clustering support
    const pubClient = new Redis(process.env.REDIS_URL); // Redis publisher
    const subClient = new Redis(process.env.REDIS_URL); // Redis subscriber

    // Redis adapter setup
    io.adapter(createAdapter(pubClient, subClient));

    // Worker handles socket connections
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Handle socket events here
        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        socket.on('sendMessage', (data) => {
            console.log(`Received message from ${socket.id}: ${data}`);
            // Broadcast message to all users in the room
            socket.to(data.room).emit('receiveMessage', data);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    // Worker processes listen on port 3000
    server.listen(3000, () => {
        console.log(`Worker ${process.pid} running and listening on port 3000`);
    });
}





























































// // const os = require('os');
// // const cluster = require('cluster');
// // const http = require('http');

// // const noCPUs = os.noCPUs()




// const os = require('os');
// const cluster = require('cluster');
// const http = require('http');
// const { Server } = require('socket.io');
// const { createClient } = require('redis');
// const { createAdapter } = require('@socket.io/redis-adapter');

// const numCPUs = os.cpus().length;

// if (cluster.isMaster) {
//     console.log(`Master ${process.pid} is running`);

//     // Fork workers for each CPU
//     for (let i = 0; i < numCPUs; i++) {
//         cluster.fork();
//     }

//     // Handle worker exits
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died`);
//         cluster.fork(); // Restart the worker
//     });

// } else {
//     // Worker processes
//     const app = http.createServer();
//     const io = new Server(app);

//     // Redis clients for Pub/Sub
//     const pubClient = createClient({ url: 'redis://localhost:6379' });
//     const subClient = pubClient.duplicate();

//     // Connect Redis clients
//     Promise.all([pubClient.connect(), subClient.connect()])
//         .then(() => {
//             console.log(`Worker ${process.pid}: Redis connected`);
//             io.adapter(createAdapter(pubClient, subClient));

//             // Subscribe to Redis channels
//             subClient.subscribe('externalProjectUpdates', (err, count) => {
//                 if (err) {
//                     console.error('Failed to subscribe:', err.message);
//                 } else {
//                     console.log(`Subscribed to externalProjectUpdates (${count} channels)`);
//                 }
//             });

//             subClient.subscribe('notificationUpdates', (err, count) => {
//                 if (err) {
//                     console.error('Failed to subscribe:', err.message);
//                 } else {
//                     console.log(`Subscribed to notificationUpdates (${count} channels)`);
//                 }
//             });

//             // Listen for Redis messages
//             subClient.on('message', (channel, message) => {
//                 console.log(`Worker ${process.pid} received message on ${channel}: ${message}`);
//                 try {
//                     const update = JSON.parse(message);
//                     const room = update.room;

//                     // Emit to the specified room
//                     io.to(room).emit('notificationUpdated', {
//                         socketId: 'external',
//                         update: update.data,
//                     });
//                     console.log(`Broadcasted update to room ${room}`);
//                 } catch (err) {
//                     console.error('Error processing message:', err);
//                 }
//             });
//         })
//         .catch(err => console.error('Redis connection error:', err));

//     // Handle Socket.IO connections
//     io.on('connection', (socket) => {
//         console.log(`Socket connected: ${socket.id}`);

//         // Example room joining
//         socket.on('joinRoom', (room) => {
//             socket.join(room);
//             console.log(`Socket ${socket.id} joined room ${room}`);
//         });

//         socket.on('disconnect', () => {
//             console.log(`Socket disconnected: ${socket.id}`);
//         });
//     });

//     // Start the server
//     const PORT = 3000 + cluster.worker.id; // Unique port per worker for debugging
//     app.listen(PORT, () => {
//         console.log(`Worker ${process.pid} is running on port ${PORT}`);
//     });
// }
