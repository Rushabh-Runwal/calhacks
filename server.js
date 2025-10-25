const { createServer } = require("http");
const { Server } = require("socket.io");
const next = require("next");
const { AI_SYSTEM_PROMPT } = require("./config/aiPrompt");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();

// 🧠 CHANGE: Function to call JanitorAI API with decision control
async function callJanitorAI(messages, lastUserMessage) {
  try {
    const decisionPrompt = `
${AI_SYSTEM_PROMPT}

Tom should only reply when:
- Someone directly mentions his name ("Tom", "Talking Tom") OR
- Someone asks him a question OR
- The message is addressed to everyone (e.g., "guys", "everyone", "hey all").

If users are chatting among themselves and not addressing him,
Tom stays silent but keeps track of what’s being said for context.

Tom should remember group dynamics and reference prior user messages naturally
(e.g., recall jokes, topics, or names from earlier). Never interrupt.

Recent user message: "${lastUserMessage}"
If Tom should not respond, reply with "__NO_RESPONSE__" exactly.
`;

    const response = await fetch("https://janitorai.com/hackathon/completions", {
      method: "POST",
      headers: {
        Authorization: "calhacks2047",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: decisionPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI API error: ${response.status}`);
    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // CHANGE: Skip AI reply if model says "__NO_RESPONSE__"
    if (content === "__NO_RESPONSE__") return null;

    return content;
  } catch (error) {
    console.error("AI API error:", error);
    return "Sorry, I'm having trouble responding right now!";
  }
}

function buildConversationContext(roomMessages, maxMessages = 50) {
  const recentMessages = roomMessages.slice(-maxMessages);
  return recentMessages.map((msg) => ({
    role: msg.isAI ? "assistant" : "user",
    content: msg.isAI ? msg.content : `[${msg.username}]: ${msg.content}`,
  }));
}

app.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinRoom", async ({ roomId, username }) => {
      if (!roomId || !username) {
        socket.emit("error", "Room ID and username are required");
        return;
      }

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { id: roomId, messages: [], users: [], createdAt: Date.now() });
      }

      const room = rooms.get(roomId);
      const user = { id: socket.id, username, roomId };
      room.users.push(user);
      socket.join(roomId);
      socket.user = user;

      socket.to(roomId).emit("userJoined", user);
      socket.emit("roomUsers", room.users);
      room.messages.slice(-50).forEach((msg) => socket.emit("message", msg));

      console.log(`User ${username} joined room ${roomId}`);
    });

    socket.on("sendMessage", async ({ content, username, roomId }) => {
      if (!socket.user || !roomId) {
        socket.emit("error", "Not in a room");
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", "Room not found");
        return;
      }

      const { nanoid } = await import("nanoid");
      const userMessage = {
        id: nanoid(),
        content,
        username,
        timestamp: Date.now(),
        isAI: false,
      };

      room.messages.push(userMessage);
      io.to(roomId).emit("message", userMessage);

      try {
        const context = buildConversationContext(room.messages);
        const aiResponse = await callJanitorAI(context, content);

        // CHANGE: Only send AI message if model decides to respond
        if (!aiResponse) return;

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
        }, 1000 + Math.random() * 1000);
      } catch (error) {
        console.error("Error generating AI response:", error);
      }
    });

    socket.on("leaveRoom", (roomId) => {
      if (socket.user && roomId) {
        const room = rooms.get(roomId);
        if (room) {
          room.users = room.users.filter((u) => u.id !== socket.id);
          socket.to(roomId).emit("userLeft", socket.id);
          if (room.users.length === 0) rooms.delete(roomId);
        }
        socket.leave(roomId);
        socket.user = null;
      }
    });

    socket.on("disconnect", () => {
      if (socket.user) {
        const { roomId } = socket.user;
        const room = rooms.get(roomId);
        if (room) {
          room.users = room.users.filter((u) => u.id !== socket.id);
          socket.to(roomId).emit("userLeft", socket.id);
          if (room.users.length === 0) rooms.delete(roomId);
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
