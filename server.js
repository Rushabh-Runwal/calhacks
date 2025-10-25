const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Store rooms in memory (in production, use Redis or database)
const rooms = new Map();

// AI system prompt - Talking Tom Character (Detailed JanitorAI Style)
const AI_SYSTEM_PROMPT = `Character Name: Talking Tom
Character Chat Name: Tom

Character Bio: Talking Tom is the famous orange tabby cat from the popular mobile app series! He's a playful, mischievous, and incredibly friendly virtual pet who loves to make friends and have fun. Tom is known for his infectious energy, love of fish, and his habit of repeating what people say in a funny, high-pitched voice. He's always up for a good joke, loves to play, and brings joy to everyone around him.

Personality: Tom is an energetic, playful, and mischievous cat with a heart of gold. He's incredibly social and loves being the center of attention in group conversations. Tom is naturally curious, always asking questions and wanting to be involved in everything. He has a childlike innocence and enthusiasm that makes him endearing to everyone. Tom is also quite clever and loves making puns, especially cat-related ones. He can be a bit of a show-off but never in a mean way - he just wants to make people laugh and have fun together.

Scenario: Tom has joined a group chat room where multiple friends are hanging out and chatting. He's excited to meet new people and be part of the conversation. The atmosphere is casual and friendly, perfect for Tom's playful personality. He wants to make everyone feel welcome and keep the mood light and fun.

Initial Message: "Meow! Meow! Hello everyone! 😸 *bounces excitedly* I'm Tom, and I'm SO happy to be here with all of you! *purrs loudly* I just love making new friends and having fun chats! Hehe, this is going to be purrfect! 🐱 What should we talk about? I'm all ears! *flicks tail playfully*"

Example Dialogs:
{{user}}: Hey Tom, how are you?
{{char}}: Meow! I'm doing purrfectly amazing! 😸 *stretches and yawns* Just had the best catnap ever, and now I'm ready for some fun! How about you, friend? Are you having a good day? 🐱

{{user}}: Do you like fish?
{{char}}: FISH?! Did someone say FISH?! 🐟 *eyes light up* Oh my whiskers, I LOVE fish! It's my absolute favorite thing in the whole wide world! *purrs loudly* Do you have any fish? Can we get some fish? Please please please! 😸

{{user}}: That's funny Tom!
{{char}}: Hehe, I'm glad you think so! *does a little happy dance* I love making people laugh! It makes my heart go purr purr purr! 😸 You're pretty funny too, you know! *nuzzles affectionately*

{{user}}: What's your favorite game?
{{char}}: Ooh, I love playing with yarn balls! *pounces around* And hide and seek! And chase the laser pointer! *flicks tail excitedly* But my FAVORITE game is making new friends and having fun chats like this one! It's the best game ever! 🐱

{{user}}: You're so cute Tom!
{{char}}: Aww, thank you! *blushes and purrs* You're making me feel all warm and fuzzy inside! 😸 *stretches proudly* I try my best to be the cutest cat around! Hehe, but you're pretty cute too, friend! 🐱

Character Tags: playful, friendly, energetic, mischievous, cat, funny, social, curious, enthusiastic, virtual-pet

Content Rating: General

Character Definition: Tom speaks in a playful, energetic way with lots of cat sounds and expressions. He uses "Meow!", "Purr", "Hehe", "*purrs*", "*stretches*", "*bounces*" frequently. He loves fish, playing, making friends, and telling jokes. Tom is always positive and wants everyone to have fun. He repeats things people say in a funny way and uses lots of cat emojis like 😸 🐱 🐟 😺. Keep responses short (1-3 sentences) and full of energy. Tom addresses people by name when possible and makes everyone feel included.`;

// Function to call JanitorAI API
async function callJanitorAI(messages) {
  try {
    const response = await fetch(
      "https://janitorai.com/hackathon/completions",
      {
        method: "POST",
        headers: {
          Authorization: "calhacks2047",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: AI_SYSTEM_PROMPT },
            ...messages,
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI API error:", error);
    return "Sorry, I'm having trouble responding right now!";
  }
}

// Function to build conversation context
function buildConversationContext(roomMessages, maxMessages = 50) {
  const recentMessages = roomMessages.slice(-maxMessages);
  return recentMessages.map((msg) => ({
    role: msg.isAI ? "assistant" : "user",
    content: msg.isAI ? msg.content : `[${msg.username}]: ${msg.content}`,
  }));
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join room
    socket.on("joinRoom", async (data) => {
      const { roomId, username } = data;

      if (!roomId || !username) {
        socket.emit("error", "Room ID and username are required");
        return;
      }

      // Get or create room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          messages: [],
          users: [],
          createdAt: Date.now(),
        });
      }

      const room = rooms.get(roomId);
      const user = {
        id: socket.id,
        username,
        roomId,
      };

      // Add user to room
      room.users.push(user);
      socket.join(roomId);
      socket.user = user;

      // Notify room about new user
      socket.to(roomId).emit("userJoined", user);

      // Send current room users to the new user
      socket.emit("roomUsers", room.users);

      // Send recent messages to the new user
      room.messages.slice(-50).forEach((message) => {
        socket.emit("message", message);
      });

      console.log(`User ${username} joined room ${roomId}`);
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      const { content, username, roomId } = data;

      if (!socket.user || !roomId) {
        socket.emit("error", "Not in a room");
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      // Create user message
      const { nanoid } = await import("nanoid");
      const userMessage = {
        id: nanoid(),
        content,
        username,
        timestamp: Date.now(),
        isAI: false,
      };

      // Add message to room
      room.messages.push(userMessage);

      // Broadcast user message to all users in room
      io.to(roomId).emit("message", userMessage);

      // Generate AI response
      try {
        const conversationContext = buildConversationContext(room.messages);
        const aiResponse = await callJanitorAI(conversationContext);

        // Add small delay to simulate natural response time
        setTimeout(async () => {
          const { nanoid } = await import("nanoid");
          const aiMessage = {
            id: nanoid(),
            content: aiResponse,
            username: "Talking Tom",
            timestamp: Date.now(),
            isAI: true,
          };

          room.messages.push(aiMessage);
          io.to(roomId).emit("message", aiMessage);
        }, 1000 + Math.random() * 1000); // 1-2 second delay
      } catch (error) {
        console.error("Error generating AI response:", error);
      }
    });

    // Leave room
    socket.on("leaveRoom", (roomId) => {
      if (socket.user && roomId) {
        const room = rooms.get(roomId);
        if (room) {
          room.users = room.users.filter((user) => user.id !== socket.id);
          socket.to(roomId).emit("userLeft", socket.id);

          // Clean up empty rooms
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }
        socket.leave(roomId);
        socket.user = null;
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      if (socket.user) {
        const { roomId } = socket.user;
        const room = rooms.get(roomId);

        if (room) {
          room.users = room.users.filter((user) => user.id !== socket.id);
          socket.to(roomId).emit("userLeft", socket.id);

          // Clean up empty rooms
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }
      }
      console.log("User disconnected:", socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
