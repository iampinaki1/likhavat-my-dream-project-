import { Server } from "socket.io";
import http from "http";

const userSocketMap = {}; // this map stores socket id corresponding the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const setupSocket = (app) => {
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            userSocketMap[userId] = socket.id;
            console.log(`User ${userId} connected with socket ${socket.id}`);
        }

        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        // Handle sending messages
        socket.on('sendMessage', (data) => {
            const { receiverId, message, senderId, messageId } = data;
            const receiverSocketId = getReceiverSocketId(receiverId);
            
            if (receiverSocketId) {
                // Send message to receiver
                io.to(receiverSocketId).emit('receiveMessage', {
                    senderId,
                    message,
                    timestamp: new Date(),
                    messageId
                });
                
                // Confirm delivery to sender
                socket.emit('messageDelivered', {
                    messageId,
                    status: 'delivered'
                });
            } else {
                // Send error if receiver is not online
                socket.emit('messageSendError', {
                    messageId,
                    error: 'Recipient is offline. Message will be delivered when they come online.' 
                });
            }
        });

        socket.on('disconnect', () => {
            if (userId) {
                delete userSocketMap[userId];
                console.log(`User ${userId} disconnected`);
            }
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        });
    });

    return { server, io };
};