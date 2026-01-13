const express = require('express');
const { io } = require('socket.io-client');

const app = express();
const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to App 1');
    setInterval(() => {
        
        socket.emit('sedToSocket', 'Hello from App 2');
    }, 10000);
});

socket.on('response', (data) => {
    console.log('Response from App 1:', data);
});

app.get('/trigger', (req, res) => {
    socket.emit('message', 'Triggered message from App 2');
    res.send({ success: true, message: 'Message sent to App 1 via WebSocket' });
});

// Start the server
app.listen(4000, () => {
    console.log('App 2 is listening on http://localhost:4000');
});