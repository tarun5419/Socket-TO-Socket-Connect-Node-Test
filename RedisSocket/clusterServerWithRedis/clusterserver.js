const cluster = require('cluster');
const os = require('os');
const redis = require('ioredis');
const createApp = require('./app');

const numCPUs = os.cpus().length;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Create Redis clients for the master process
    const redisSubscriber = new redis(REDIS_URL);
    const redisPublisher = new redis(REDIS_URL);

    // Subscribe to a Redis channel
    redisSubscriber.subscribe('externalProjectUpdates', (err) => {
        if (err) {
            console.error('Failed to subscribe to channel:', err.message);
        } else {
            console.log('Subscribed to externalProjectUpdates');
        }
    });

    // Handle messages from Redis and broadcast to workers
    redisSubscriber.on('message', (channel, message) => {
        if (channel === 'externalProjectUpdates') {
            // console.log(`Master received message: ${message}`,cluster.workers);
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
        cluster.fork();
    });
} else {
    // Workers
    console.log(`Worker ${process.pid} started`);

    // Each worker creates its own server
    const redisPublisher = new redis(REDIS_URL);
    const server = createApp(redisPublisher);

    const port = process.env.PORT || 3021;
    server.listen(port, () => {
        console.log(`Worker ${process.pid} running on port ${port}`);
    });

    // Handle messages from the master
    process.on('message', (msg) => {
        if (msg.channel === 'externalProjectUpdates') {
            // console.log(`Worker ${process.pid} received message: ${msg.message}`);
            // Broadcast the message to connected clients
            const socketAPI = require('./socketAPI'); // Import socket API
            socketAPI.broadcastToClients(msg.message);
        }
    });
}
