const { Server } = require('socket.io');

let io;
let connectedClients = new Map();

/**
 * Initialize Socket.IO with Redis publisher
 * @param {http.Server} server - The HTTP server to attach socket.io to
 * @param {Redis} redisPublisher - Redis publisher instance
 */
const initSocket = (server, redisPublisher) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Authorization', 'Content-Type'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        connectedClients.set(socket.id, socket);

        // Listen for custom events from the client
        socket.on('sendMessage', (data) => {
            // console.log(`Received from client ${socket.id}:`, data);

            // Publish the message to Redis (optional)
            redisPublisher.publish('clientMessages', JSON.stringify(data));
        });

        // Handle client disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            connectedClients.delete(socket.id);
        });
    });
};

/**
 * Broadcast message to all connected clients
 * @param {string} message - The message to broadcast
 */
const broadcastToClients = (message) => {
    if (!io) {
        console.error('Socket.io is not initialized');
        return;
    }

    console.log('Broadcasting message to clients:');
    // io.emit('broadcast', message); // Emit a "broadcast" event to all clients
    io.emit('externalProjectUpdated', message); // Emit a "broadcast" event to all clients

};

/**
 * Send a message to a specific client
 * @param {string} clientId - The ID of the client to send the message to
 * @param {string} message - The message to send
 */
const sendToClient = (clientId, message) => {
    const socket = connectedClients.get(clientId);
    if (socket) {
        socket.emit('externalProjectUpdated', message);
    } else {
        console.warn(`Client with ID ${clientId} not found`);
    }
};

module.exports = {
    initSocket,
    broadcastToClients,
    sendToClient,
};
