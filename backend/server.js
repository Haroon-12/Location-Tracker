const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all connections for mobile app
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/groups', require('./routes/group'));
app.use('/api/location', require('./routes/location'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Socket.io Connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_group', (groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on('send_location', async (data) => {
        // data: { groupId, userId, latitude, longitude, name }
        const { groupId, userId, latitude, longitude, name } = data;
        // Broadcast to everyone in the group
        io.to(groupId).emit('receive_location', { userId, latitude, longitude, name });

        // Save to database
        try {
            const Location = require('./models/Location');
            await new Location({ userId, latitude, longitude }).save();
        } catch (err) {
            console.error("Error saving location", err);
        }
    });

    socket.on('sos_alert', (data) => {
        const { groupId, userId } = data;
        io.to(groupId).emit('sos_alert', { userId, message: "SOS TRIGGERED!" });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/', (req, res) => {
    res.send('Location App Backend is Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
