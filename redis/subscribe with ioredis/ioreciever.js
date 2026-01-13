const express = require('express');
const app = express();

const http = require('http');
const server = http.Server(app);
const socketIO = require('socket.io');
const cluster = require('cluster');
const os = require('os');
const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter'); // Add Redis adapter for Socket.IO

const numCPUs = os.cpus().length;

// Check if the process is the master
if (cluster.isMaster) {
    console.log('Master process:', process.pid);
        // Redis subscription for test-channel

    const io = socketIO(server);

        const redis = new Redis(); // A separate Redis client for custom subscriptions
        redis.subscribe('externalProjectUpdates', (err, count) => {
            if (err) {
                console.error('Failed to subscribe:', err.message);
            } else {
                console.log(`Subscribed to ${count} channel(s)`);
            }
        });
    
        // Handle Redis messages
        redis.on('message', (channel, message) => {
            console.log(`Received message from ${channel}: ${message}`);
            if (channel === 'externalProjectUpdates') {
        
                try {
                    const update = JSON.parse(message);
                    const room = update.room; // The room to which the update should be sent
                    io.to(room).emit('externalProjectUpdated', {
                        socketId: 'external', // Indicate this update is from an external source
                        update: update.data,
                    });
                } catch (error) {
                    console.error('Error processing external project update:', error);
                }
            }
        });

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
        console.log('Worker process died:', worker.process.pid);
        cluster.fork(); // Restart a new worker
    });

} else {
    console.log('Worker process:', process.pid);

    // Redis setup for pub/sub
    const pubClient = new Redis(); // Publisher client

    // Use Redis adapter
    io.adapter(createAdapter(pubClient, subClient));

    // Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });

        socket.on('joinRoom', (room)=>{
            socket.join(room);
        })
        socket.on('leaveRoom', (rooo)=>{
            socket.leave(room);
        })
    });

    // Start the server
    server.listen(3000, () => {
        console.log(`Worker server running on port 3000`);
    });
}
