const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require("dotenv").config();
const cors = require('cors');
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const {initSocket, redisSubscribe} = require('./socketAPI');
const redis = require('ioredis');
// const {redisSubscribe} = require('./redishandler')
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Content-Security-Policy-Report-Only', "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self'");
    next();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});
const server = http.createServer(app);


const numCPUs = os.cpus().length;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Function to create server
const createServer = () => {
    //    const redisClient = new redis(REDIS_URL);

    // Initialize socket.io with Redis
    initSocket(server);

    const port = process.env.PORT || 3020;
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};

// Clustering setup
if (cluster.isMaster) {

    redisSubscribe(REDIS_URL,server);

    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    createServer();
    console.log(`Worker ${process.pid} started`);
}

module.exports = createServer;
