const express = require('express');
const http = require('http')
const socketIo = require('socket.io')
const redis = require('redis');


const app = express();

const server = http.createServer(app)

const io = socketIo(server)



const resisClient = redis.createClient();
resisClient.on('connect',()=>{
    console.log('Connected to Redis');
})


// Setup a basic route
app.get('/', (req, res) => {
    res.send('Socket and Redis setup');
});


io('connection', (socket)=>{
    socket.emit('message', "'Hello from server!");

    socket.on('send_message', (message)=>{
        console.log(message,"from browser Client");
        
    })



    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
})








// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});