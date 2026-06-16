import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import GameBoard from './GameBoard';

// Connect to backend (assumes running on localhost:3001 for dev)
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

const MultiplayerRoom = ({ onExit }) => {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [roomData, setRoomData] = useState(null);
  
  useEffect(() => {
    socket.on('room_update', (data) => {
      setRoomData(data);
    });

    return () => {
      socket.off('room_update');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomId && playerName) {
      socket.emit('join_room', roomId, playerName);
      setInRoom(true);
    }
  };

  const handleLeave = () => {
    // Basic leave logic
    setInRoom(false);
    onExit();
  };

  if (inRoom && roomData) {
    if (roomData.players.length < 2) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-panel p-8 text-center rounded-2xl w-full max-w-md">
            <h2 className="text-2xl text-tunisian-blue font-bold mb-4" dir="rtl">غرفة: {roomId}</h2>
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-tunisian-emerald border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-700 text-lg" dir="rtl">في انتظار انضمام لاعب آخر...</p>
            </div>
            <button onClick={handleLeave} className="mt-8 text-tunisian-red hover:underline">مغادرة الغرفة</button>
          </div>
        </div>
      );
    } else {
      // For now, re-using offline GameBoard for UI demo. Real implementation would sync state via socket.
      return (
        <div className="relative">
          <div className="absolute top-4 left-4 bg-tunisian-blue text-white px-4 py-2 rounded-lg z-50 shadow-md">
            Online Match: {roomData.players[0].name} vs {roomData.players[1].name}
          </div>
          <GameBoard onExit={handleLeave} />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-8 text-center rounded-2xl w-full max-w-md">
        <h2 className="text-3xl text-tunisian-emerald font-bold mb-6" dir="rtl">اللعب الجماعي</h2>
        
        <form onSubmit={handleJoin} className="flex flex-col gap-4 text-right" dir="rtl">
          <div>
            <label className="block text-tunisian-blue font-semibold mb-2">اسم اللاعب:</label>
            <input 
              type="text" 
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tunisian-emerald"
              placeholder="أدخل اسمك"
              required
            />
          </div>
          <div>
            <label className="block text-tunisian-blue font-semibold mb-2">رقم الغرفة:</label>
            <input 
              type="text" 
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-tunisian-emerald"
              placeholder="مثال: 1234"
              required
            />
          </div>
          <button type="submit" className="mt-4 bg-tunisian-emerald hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg">
            دخول الغرفة (Join Room)
          </button>
          <button type="button" onClick={onExit} className="mt-2 text-tunisian-red font-bold py-2">
            العودة للرئيسية (Back)
          </button>
        </form>
      </div>
    </div>
  );
};

export default MultiplayerRoom;
