const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const cluster = require('cluster');


let io;

const initSocket = async (server, redisClient,cluster) => {
    redisClient.on('error', (err) => {
        console.error('Redis error: ', err);
    });

    redisClient.on('connect', () => {
        console.log('Connected to Redis');
    });

    redisClient.on('end', () => {
        console.log('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
        console.log('Reconnecting to Redis...');
    });

    // await ensureRedisConnected(redisClient);

    // Flush Redis database
    try {
        await redisClient.flushdb();
        console.log('Redis database flushed.');
    } catch (error) {
        console.error('Error flushing Redis database:', error);
    }
    const pubClient = new Redis("redis://localhost:6379");
    const subClient = new Redis("redis://localhost:6379");

    pubClient.on('error', (err) => console.error('PubClient Redis error:', err));
    subClient.on('error', (err) => console.error('SubClient Redis error:', err));

    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        },
    });

    io.adapter(createAdapter(pubClient, subClient));

    if (cluster.isMaster) {
        // Subscribe to the new Redis channel 'externalProjectUpdates'
        subClient.subscribe('externalProjectUpdates', (err, count) => {
            if (err) {
                console.error('Failed to subscribe: ', err.message);
            } else {
                console.log(`Subscribed successfully to externalProjectUpdates! This client is currently subscribed to ${count} channels.`);
            }
        });
        subClient.subscribe('notificationUpdates', (err, count) => {
            if (err) {
                console.error('Failed to subscribe: ', err.message);
            } else {
                console.log(`Subscribed successfully to notificationUpdates! This client is currently subscribed to ${count} channels.`);
            }
        });

        // Listen for messages on the 'externalProjectUpdates' channel
        subClient.on('message', async (channel, message) => {
            console.log(channel, "channelchannelchannelchannelchannelchannelchannelchannelchannelchannelchannelchannelchannel");
    
            // if (channel === 'externalProjectUpdates') {
            try {
                const update = JSON.parse(message);
                const room = update.room; // The room to which the update should be sent
                // console.log(`Received external project update for room ${room}:`, update);
    
                // Broadcast the update to the specified room
                io.to(room).emit('notificationUpdated', {
                    socketId: 'external', // Indicate this update is from an external source
                    update: update.data,
                });
                console.log(`External project update broadcasted to room ${room}`);
            } catch (error) {
                console.error('Error processing external project update:', error);
            }
        });
    }

    

    // io.on('connection', async (socket) => {

    //     console.log('User connected: ' + socket.id);
    //     await JoinRoomFunction(redisClient, 'Lobby', socket);
    //     // Handle joining a room and sending all users in the room
    //     socket.on('joinRoom', async (room) => {
    //         try {
    //             room = await JoinRoomFunction(redisClient, room, socket);
    //         } catch (error) {
    //             console.error('Error joining room:', error);
    //         }
    //     });

    //     // Handle joining a room and sending all users in the room
    //     socket.on('joinRoom', async (room) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             room = `${room}`;
    //             await leaveCurrentRoom(socket, redisClient); // Leave any current room
    //             await socket.join(room);
    //             await redisClient.hset('userRoom', socket.id, room);
    //             io.to(room).emit('userJoined', { socketId: socket.id, room: room });
    //             console.log(`User ${socket.id} joined room ${room}`);

    //             // Send the list of all users in the room to the newly joined user
    //             const usersInRoom = await getUsersInRoom(room, redisClient);
    //             socket.emit('usersInRoom', usersInRoom);
    //         } catch (error) {
    //             console.error('Error joining room:', error);
    //         }
    //     });

    //     // Handle disconnection
    //     socket.on('disconnect', async () => {
    //         try {
    //             console.log('User disconnected: ' + socket.id);
    //             await handleDisconnection(socket, redisClient);
    //         } catch (error) {
    //             console.error('Error handling disconnection:', error);
    //         }
    //     });

    //     // Handle status change
    //     socket.on('statusChange', async (status) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const statusString = JSON.stringify(status);
    //             await redisClient.hset('userStatus', socket.id, statusString);
    //             const userStatus = await getAllUserStatus(redisClient);
    //             io.emit('userStatusUpdate', {
    //                 socketId: socket.id,
    //                 status: userStatus,
    //             });
    //         } catch (error) {
    //             console.error('Error setting user status in Redis:', error);
    //         }
    //     });

    //     socket.on('emailUpdate', async (email) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const emailObj = email;
    //             const emailString = JSON.stringify(emailObj);
    //             await redisClient.hset('userStatus', socket.id, emailString);
    //             const userStatus = await getAllUserStatus(redisClient);
    //             io.emit('userStatusUpdate', {
    //                 socketId: socket.id,
    //                 status: userStatus,
    //             });
    //         } catch (error) {
    //             console.error('Error setting email in Redis:', error);
    //         }
    //     });

    //     // Handle leaving a room
    //     socket.on('leaveRoom', async () => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             await leaveCurrentRoom(socket, redisClient);
    //             console.log(`User ${socket.id} left their current room`);
    //         } catch (error) {
    //             console.error('Error leaving room:', error);
    //         }
    //     });

    //     socket.on('projectCreates', async (update) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const currentRoom = await redisClient.hget('userRoom', socket.id);
    //             if (currentRoom) {
    //                 io.to(currentRoom).emit('projectCreated', {
    //                     socketId: socket.id,
    //                     update,
    //                 });
    //                 console.log(
    //                     `User ${socket.id} broadcasted an update to room ${currentRoom}`
    //                 );
    //             } else {
    //                 console.log(
    //                     `User ${socket.id} is not in any room, cannot broadcast update`
    //                 );
    //             }

    //         } catch (error) {
    //             console.error('Error handling project updates for new project:', error);
    //         }
    //     });

    //     // Handle Project Updates and broadcast the change to all the users only in his room
    //     socket.on('projectUpdates', async (update) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const currentRoom = await redisClient.hget('userRoom', socket.id);
    //             if (currentRoom) {
    //                 io.to(currentRoom).emit('projectUpdated', {
    //                     socketId: socket.id,
    //                     update,
    //                 });
    //                 console.log(
    //                     `User ${socket.id} broadcasted an update to room ${currentRoom}`
    //                 );
    //             } else {
    //                 console.log(
    //                     `User ${socket.id} is not in any room, cannot broadcast update`
    //                 );
    //             }
    //         } catch (error) {
    //             console.error('Error handling project updates:', error);
    //         }
    //     });
    //     // Handle Chat Updates and broadcast the change to all the users only in his room
    //     socket.on('chatUpdates', async (update) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const currentRoom = await redisClient.hget('userRoom', socket.id);
    //             if (currentRoom) {
    //                 io.to(currentRoom).emit('chatUpdated', {
    //                     socketId: socket.id,
    //                     update,
    //                 });
    //                 console.log(
    //                     `User ${socket.id} broadcasted an chat update to room ${currentRoom}`
    //                 );
    //             } else {
    //                 console.log(
    //                     `User ${socket.id} is not in any room, cannot broadcast update`
    //                 );
    //             }
    //         } catch (error) {
    //             console.error('Error handling project updates:', error);
    //         }
    //     });

    //     // Handle Chat Updates and broadcast the change to all the users only in his room
    //     socket.on('projectTransfer', async (update) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const currentRoom = await redisClient.hget('userRoom', socket.id);
    //             if (currentRoom) {
    //                 io.to(currentRoom).emit('projectMoved', {
    //                     socketId: socket.id,
    //                     update,
    //                 });
    //                 console.log(
    //                     `User ${socket.id} broadcasted an project movement update to room ${currentRoom}`
    //                 );
    //             } else {
    //                 console.log(
    //                     `User ${socket.id} is not in any room, cannot broadcast update`
    //                 );
    //             }
    //         } catch (error) {
    //             console.error('Error handling project movement:', error);
    //         }
    //     });

    //     // Handle Chat Updates and broadcast the updated notification to all the users only in his room
    //     socket.on('notificationUpdates', async (isUpdate) => {
    //         try {
    //             await ensureRedisConnected(redisClient);
    //             const currentRoom = await redisClient.hget('userRoom', socket.id);
    //             if (currentRoom) {
    //                 io.to(currentRoom).emit('notificationUpdated', {
    //                     socketId: socket.id,
    //                     isUpdate,
    //                 });
    //                 console.log(
    //                     `User ${socket.id} broadcasted an chat update to room ${currentRoom}`
    //                 );
    //             } else {
    //                 console.log(
    //                     `User ${socket.id} is not in any room, cannot broadcast update`
    //                 );
    //             }
    //         } catch (error) {
    //             console.error('Error handling project updates:', error);
    //         }
    //     });
    // });
};

// // Helper function to leave the current room
// const leaveCurrentRoom = async (socket, redisClient) => {
//     try {
//         await ensureRedisConnected(redisClient);
//         const currentRoom = await redisClient.hget('userRoom', socket.id);
//         if (currentRoom) {
//             await socket.leave(currentRoom);
//             await redisClient.hdel('userRoom', socket.id);
//             io.to(currentRoom).emit('userLeft', {
//                 socketId: socket.id,
//                 room: currentRoom,
//             });
//             console.log(`User ${socket.id} left room ${currentRoom}`);
//         }
//     } catch (error) {
//         console.error('Error leaving current room:', error);
//     }
// };

// Helper function to handle disconnection
// const handleDisconnection = async (socket, redisClient) => {
//     try {
//         await ensureRedisConnected(redisClient);
//         await leaveCurrentRoom(socket, redisClient);
//         await redisClient.hdel('userStatus', socket.id);
//         await redisClient.hdel('userRoom', socket.id); // Ensure room data is also removed
//         const userStatus = await getAllUserStatus(redisClient);
//         io.emit('userStatusUpdate', {
//             socketId: socket.id,
//             status: userStatus,
//         });
//     } catch (error) {
//         console.error('Error handling disconnection:', error);
//     }
// };

// // Helper function to get all user statuses and parse them
// const getAllUserStatus = async (redisClient) => {
//     try {
//         await ensureRedisConnected(redisClient);
//         const userStatus = await redisClient.hgetall('userStatus');
//         return Object.keys(userStatus).reduce((acc, key) => {
//             try {
//                 acc[key] = JSON.parse(userStatus[key]);
//             } catch (error) {
//                 console.error(`Error parsing JSON for key ${key}:`, error);
//             }
//             return acc;
//         }, {});
//     } catch (error) {
//         console.error('Error fetching user statuses from Redis:', error);
//         return {};
//     }
// };

// // Helper function to get all users in a room
// const getUsersInRoom = async (room, redisClient) => {
//     const clients = io.sockets.adapter.rooms.get(room);
//     if (!clients) return [];

//     const users = [];
//     for (let clientId of clients) {
//         const userStatus = await redisClient.hget('userStatus', clientId);
//         if (userStatus) {
//             users.push(JSON.parse(userStatus));
//         }
//     }
//     return users;
// };

// // Helper function to ensure Redis is connected
// const ensureRedisConnected = async (redisClient) => {
//     if (redisClient.status === 'end' || redisClient.status === 'connecting') {
//         await new Promise((resolve, reject) => {
//             redisClient.once('connect', resolve);
//             redisClient.once('error', reject);
//         });
//     } else if (redisClient.status !== 'ready') {
//         await redisClient.connect();
//     }
// };

// // Helper function to join room
// async function JoinRoomFunction(redisClient, room, socket) {
//     await ensureRedisConnected(redisClient);
//     room = `${room}`;
//     await leaveCurrentRoom(socket, redisClient); // Leave any current room
//     await socket.join(room);
//     await redisClient.hset('userRoom', socket.id, room);
//     io.to(room).emit('userJoined', { socketId: socket.id, room: room });
//     console.log(`User ${socket.id} joined room ${room}`);

//     // Send the list of all users in the room to the newly joined user
//     const usersInRoom = await getUsersInRoom(room, redisClient);
//     socket.emit('usersInRoom', usersInRoom);
//     return room;
// }


module.exports = {
    initSocket,
};


