const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('App 2 connected via WebSocket');
    socket.on('sedToSocket', (data) => {
        console.log('Received from App 2:', data);
        // setInterval(()=>{
            io.emit('recieverFromSocket', 'central client');
        // },10000)

        
    });
});

// Start the server
server.listen(3000, () => {
    console.log('App 1 is listening on http://localhost:3000');
});
