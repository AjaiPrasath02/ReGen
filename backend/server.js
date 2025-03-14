const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const cpuRoutes = require('./routes/cpuRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { setupSocketHandlers } = require('./controllers/chatController');
require('dotenv').config();

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// API routes
app.use('/api/user/', userRoutes);
app.use('/api/feedback/', feedbackRoutes);
app.use('/api/complaints/', complaintRoutes);
app.use('/api/cpu/', cpuRoutes);
app.use('/api/chat/', chatRoutes);

app.get('/', (req, res) => {
    console.log("RAN");
    res.send("Hello World");
});

// Create HTTP server and Socket.io instance
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Set up Socket.io handlers
setupSocketHandlers(io);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI).then(() => {
    httpServer.listen(process.env.PORT, () => {
        console.log('Server is running on port', process.env.PORT);
    });
}).catch((error) => {
    console.log("Failed to start server", error);
});
