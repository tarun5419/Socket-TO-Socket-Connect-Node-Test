const express = require('express');
const Redis = require('ioredis');
const app = express();

// Redis client for subscribing
// const REDIS_URL = 'redis://localhost:6379'
const REDIS_URL = "redis://3.255.103.68:6379"

const redisSubscriber = new Redis(REDIS_URL);
// redisSubscriber.ping()
//     .then((res) => console.log('Ping response:', res))
//     .catch((err) => console.error('Ping error:', err));

redisSubscriber.on('error', (err) => {
    console.error('Redis error: ', err);
  });
  
  redisSubscriber.on('connect', () => {
    console.log(`Connected to Redis: ${REDIS_URL}`);
  });
  
  redisSubscriber.on('end', () => {
    console.log('Redis connection closed');
  });
  
  redisSubscriber.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
  });

// Subscribe to a Redis channel
const CHANNEL_NAME = 'externalProjectUpdates_alpha';

redisSubscriber.subscribe(CHANNEL_NAME, (err, count) => {
    if (err) {
        console.error('Failed to subscribe to channel:', err);
    } else {
        console.log(`Subscribed to ${CHANNEL_NAME}. Currently subscribed to ${count} channel(s).`);
    }
});

// Listen for messages on the subscribed channel
redisSubscriber.on('message', (channel, message) => {
    if (channel === CHANNEL_NAME) {
        console.log(`Message received on channel ${channel}:`, message);
        // Process the message (example: broadcast to connected WebSocket clients)
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Subscriber server is running on port ${PORT}`);
});
