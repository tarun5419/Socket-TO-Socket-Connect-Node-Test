const express = require('express');
const Redis = require('ioredis');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Redis client for publishing
const redisPublisher = new Redis("redis://localhost:6379");

// Route to publish messages
app.post('/publish', async (req, res) => {
    const { channel, message } = req.body;

    if (!channel || !message) {
        return res.status(400).json({ error: 'Channel and message are required.' });
    }

    try {
        await redisPublisher.publish(channel, JSON.stringify(message));
        console.log(`Message published to channel ${channel}:`, message);
        res.status(200).json({ message: 'Message published successfully.' });
    } catch (error) {
        console.error('Error publishing message:', error);
        res.status(500).json({ error: 'Failed to publish message.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Publisher server is running on port ${PORT}`);
});
