const Redis = require('ioredis');

// Create Redis client using ioredis
const subscriber = new Redis({
  host: 'localhost',
  port: 6379,
});
const publisher = new Redis({
  host: 'localhost',
  port: 6379,
});

// Subscribe to the channel where the WebSocket server publishes messages
subscriber.subscribe('channel-from-websocket-server');

// Listen for messages from the WebSocket server
subscriber.on('message', (channel, message) => {
  if (channel === 'channel-from-websocket-server') {
    console.log('Received from WebSocket server:', message);
    
    // Process the message or take action as needed
  }
});

// Example of publishing data to WebSocket server via Redis
setInterval(() => {
  // const message = 'Data from publishing server';
  // console.log('Publishing message:', message);
  
  // Publish message to Redis (WebSocket server will receive this)
  // publisher.publish('channel-from-publishing-server', message);


  let message = { data : 'Data from publishing server',
                  room : '6070468d40946264c46d2101'
  }
  message = JSON.stringify(message)
  publisher.publish('channel-from-publishing-server', message);

  
}, 5000); // Publish every 5 seconds
