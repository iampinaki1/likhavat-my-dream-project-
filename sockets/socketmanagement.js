import { Server } from "socket.io";
import http from "http";

const userSocketMap = {}; // this map stores socket id corresponding the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const setupSocket = (app) => {
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(o => o.trim()),
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

        socket.on('sendMessage', async (data) => {
            const { receiverId, message, senderId, messageId } = data;
            const receiverSocketId = getReceiverSocketId(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', {
                    senderId,
                    message,
                    timestamp: new Date(),
                    messageId
                });
                
                socket.emit('messageDelivered', {
                    messageId,
                    status: 'delivered'
                });
            } else {
                // Receiver offline — message already saved via REST, just confirm to sender
                socket.emit('messageSendError', {
                    messageId,
                    error: 'Recipient is currently offline.'
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