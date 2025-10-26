'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import Image from 'next/image';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const createRoom = () => {
    const newRoomId = nanoid(6).toUpperCase();
    if (username.trim()) {
      router.push(`/room/${newRoomId}?username=${encodeURIComponent(username)}`);
    } else {
      alert('Please enter a username');
    }
  };

  const joinRoom = () => {
    if (roomId.trim() && username.trim()) {
      router.push(`/room/${roomId.toUpperCase()}?username=${encodeURIComponent(username)}`);
    } else {
      alert('Please enter both room ID and username');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

      <div className="bg-white/90 backdrop-blur-sm rounded-tom-lg shadow-strong p-8 w-full max-w-md bounce-in relative">
        {/* Tom Character Header */}
        <div className="text-center mb-4">
          <div className="text-4xl mb-4 float">🐱</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Talking Tom Chat
          </h1>
          <p className="text-gray-600 text-base">
            Meow! Let&apos;s chat together!
          </p>
        </div>

        <div className="space-y-5">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Your Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name, friend!"
              className="tom-input w-full px-4 py-2 text-lg"
              maxLength={20}
            />
          </div>

          {/* Create Room */}
          <div className="space-y-5">
            <h3 className=" font-semibold text-gray-700 mb-2">
              Create New Room
            </h3>
            <button
              onClick={createRoom}
              className="tom-button tom-gradient w-full text-white py-2 px-6 rounded-tom font-bold text-lg shadow-medium"
            >
              Create Room
            </button>
          </div>

          {/* Join Room */}
          <div className="space-y-4">
            <h3 className=" font-semibold text-gray-700">
              Join Existing Room
            </h3>
            <div>
              <label htmlFor="roomId" className="block text-sm font-semibold text-gray-700 mb-3">
                Room Code
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="tom-input w-full px-4 py-2 text-lg uppercase font-mono"
                maxLength={6}
              />
            </div>
            <button
              onClick={joinRoom}
              className="tom-button sky-gradient w-full text-white py-2 px-6 rounded-tom font-bold text-lg shadow-medium"
            >
              Join Room
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600 space-y-2">
          <p>Tom will respond to every message!</p>
          <p>Share room codes with friends</p>
          <p>Have fun chatting together!</p>
        </div>
      </div>
    </div>
  );
}