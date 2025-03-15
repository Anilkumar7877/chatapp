import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import channelRoutes from './routes/channel.routes.js';
import groupRoutes from './routes/group.routes.js';
import storyRoutes from './routes/story.routes.js';
import cors from 'cors'
import {app, server} from './lib/socket.js'
import path from 'path';

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/channel', channelRoutes);
app.use('/api/stories', storyRoutes);

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', 'dist', 'index.html'));
    });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});