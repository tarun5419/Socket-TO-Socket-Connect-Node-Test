
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const Redis = require('ioredis');



const redisSubscribe = (REDIS_URL) =>{
    const redisSubscriber = new Redis(REDIS_URL);
        const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = new Redis(process.env.REDIS_URL);
    // const redisPublisher = new redis(REDIS_URL);

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
            console.log(`Master received message: ${message}`);
            for (const id in cluster.workers) {
                cluster.workers[id].send({ channel, message });
            }
        }
    });
}

module.exports = { redisSubscribe }