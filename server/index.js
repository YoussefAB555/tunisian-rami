const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Basic Room management
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId, playerName) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        gameState: null // To be implemented
      };
    }
    
    rooms[roomId].players.push({ id: socket.id, name: playerName });
    
    io.to(roomId).emit('room_update', rooms[roomId]);
    console.log(`${playerName} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Cleanup player from rooms
    for (const roomId in rooms) {
      rooms[roomId].players = rooms[roomId].players.filter(p => p.id !== socket.id);
      if (rooms[roomId].players.length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('room_update', rooms[roomId]);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
