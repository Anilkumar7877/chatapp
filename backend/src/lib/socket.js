import { Server } from "socket.io";
import http from "http"
import express from "express"

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"]
    }
})

export function getReceiverSocketId (userId) {
    return userSocketMap[userId]
}

//use to store online users
const userSocketMap = {} //{userId: socketId}

io.on('connection', (socket) => {
    // console.log("A user connected: ", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    //to emit the online users to all the connected users
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    
    socket.on("joinGroup", (groupId) => {
        socket.join(groupId);
        // console.log(`User ${socket.id} joined group: ${groupId}`);
    });

    socket.on("leaveGroup", (groupId) => {
        socket.leave(groupId);
        // console.log(`User ${socket.id} left group: ${groupId}`);
    });

    socket.on('disconnect', () => {
        // console.log("A user disconnected: ", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, server, app };

