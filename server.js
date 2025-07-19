const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Store rooms and users
const rooms = new Map();

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/room/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'room.html'));
});

// Generate room ID
app.get('/api/generate-room', (req, res) => {
  const roomId = uuidv4().substring(0, 8).toUpperCase();
  res.json({ roomId });
});

// Helper function to broadcast participant list to all users in a room
function broadcastParticipants(roomId) {
  if (!rooms.has(roomId)) return;
  
  const room = rooms.get(roomId);
  const participants = Array.from(room).map(user => ({
    socketId: user.socketId,
    userName: user.userName
  }));
  
  io.to(roomId).emit('room-participants', participants);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userName }) => {
    socket.join(roomId);
    socket.userName = userName;
    socket.roomId = roomId;

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);
    
    // Get current participants before adding new user
    const existingParticipants = Array.from(room).map(user => ({
      socketId: user.socketId,
      userName: user.userName
    }));

    // Add new user to room
    room.add({
      socketId: socket.id,
      userName: userName
    });

    // Send existing participants to the new user first
    socket.emit('room-participants', existingParticipants);

    // Notify others in the room about new user
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userName: userName
    });

    // Broadcast updated participant list to ALL users in the room
    setTimeout(() => {
      broadcastParticipants(roomId);
    }, 100);

    console.log(`${userName} joined room ${roomId}`);
  });

  // Handle WebRTC signaling
  socket.on('offer', ({ target, offer }) => {
    socket.to(target).emit('offer', {
      from: socket.id,
      offer: offer
    });
  });

  socket.on('answer', ({ target, answer }) => {
    socket.to(target).emit('answer', {
      from: socket.id,
      answer: answer
    });
  });

  socket.on('ice-candidate', ({ target, candidate }) => {
    socket.to(target).emit('ice-candidate', {
      from: socket.id,
      candidate: candidate
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      
      // Remove user from room
      for (let user of room) {
        if (user.socketId === socket.id) {
          room.delete(user);
          break;
        }
      }

      // Notify others in the room
      socket.to(socket.roomId).emit('user-left', {
        socketId: socket.id,
        userName: socket.userName
      });

      // Broadcast updated participant list
      broadcastParticipants(socket.roomId);

      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(socket.roomId);
      }
    }
  });

  // Handle leave room
  socket.on('leave-room', () => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      
      // Remove user from room
      for (let user of room) {
        if (user.socketId === socket.id) {
          room.delete(user);
          break;
        }
      }

      // Notify others in the room
      socket.to(socket.roomId).emit('user-left', {
        socketId: socket.id,
        userName: socket.userName
      });

      // Broadcast updated participant list
      broadcastParticipants(socket.roomId);

      socket.leave(socket.roomId);

      // Clean up empty rooms
      if (room.size === 0) {
        rooms.delete(socket.roomId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to start using the app`);
});