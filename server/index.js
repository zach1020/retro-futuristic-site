import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);

// Allow connections from the frontend (Vite default port 5173)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST"]
    }
});

// Store drawing history in memory
// format: { x, y, color, size, type: 'start'|'line'|'end', prevX?, prevY? }
// or simpler segments: { x, y, prevX, prevY, color, size }
let drawingHistory = [];

const MAX_HISTORY_LENGTH = 10000; // Limit history to prevent memory issues

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send existing history to the new user
    socket.emit('load_history', drawingHistory);

    socket.on('draw', (data) => {
        // data = { x, y, prevX, prevY, color, size }

        // Add to history
        drawingHistory.push(data);
        if (drawingHistory.length > MAX_HISTORY_LENGTH) {
            // Remove oldest
            drawingHistory.shift();
        }

        // Broadcast to everyone else
        socket.broadcast.emit('draw_remote', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`SERVER RUNNING on port ${PORT}`);
});
