const express = require('express');
const http = require('http')

const socketIo = require('socket.io')
const redis = require('redis');
// const Redis = rquire('ioredis')

const app = express();



const server = http.createServer(app)
// const io = socketIo(server)

const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:4200", // Angular app URL
      methods: ["GET", "POST"]
    }
  });



const client = redis.createClient({
    socket: {
      host: 'localhost', // Redis server address
      port: 6379,        // Redis server port
    },
  });



  client.on('connect', () => {
    console.log('Connected to Redis!');
  });
  
  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });


  const connect = async ()=>{
      await client.connect();
  }

  const disConnec = async () =>{
    await client.disconnect();
  }

  const setAndGetDataFromRedis = async () => {
          // Perform basic operations
          await client.set('key', 'value');
          const value = await client.get('key');
          console.log('Value:', value);
          return value
  }


// Setup a basic route
app.get('/', (req, res) => {
    res.send('Socket and Redis setup');
});


io.on('connection', (socket)=>{
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