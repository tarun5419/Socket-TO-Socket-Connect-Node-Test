const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;
const redis = require('redis');

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    const subClient = redis.createClient();

    subClient.on('connect', () => {
        console.log('Redis client connected in master process.');
    });

    subClient.subscribe('externalProjectUpdates', (err, count) => {
        if (err) {
            console.error('Failed to subscribe:', err.message);
        } else {
            console.log(`Subscribed successfully to externalProjectUpdates! Subscribed to ${count} channels.`);
        }
    });

    // subClient.subscribe('notificationUpdates', (err, count) => {
    //     if (err) {
    //         console.error('Failed to subscribe:', err.message);
    //     } else {
    //         console.log(`Subscribed successfully to notificationUpdates! Subscribed to ${count} channels.`);
    //     }
    // });

    // Listen for Redis messages and forward to workers
    subClient.on('message', (channel, message) => {
        console.log(`Master received message from ${channel}:`, message);

        // Forward the message to all workers
        for (const id in cluster.workers) {
            cluster.workers[id].send({ channel, message });
        }
    });

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Spawning a new worker...`);
        cluster.fork();
    });

} else {
    // Worker process logic
    const express = require('express');
    const { Server } = require('socket.io');
    const http = require('http');

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    server.listen(3000, () => {
        console.log(`Worker ${process.pid} started on port 3000`);
    });

    // Listen for messages from the master process
    process.on('message', (data) => {
        const { channel, message } = data;
        console.log(`Worker ${process.pid} received message from ${channel}:`, message);

        try {
            const update = JSON.parse(message);
            const room = update.room;

            // Broadcast the update to the specified room
            io.to(room).emit('notificationUpdated', {
                socketId: 'external', // Indicate this update is from an external source
                update: update.data,
            });

            console.log(`Worker ${process.pid} broadcasted update to room ${room}`);
        } catch (error) {
            console.error(`Worker ${process.pid} error processing message:`, error);
        }
    });
}
