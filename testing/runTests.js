// runTests.js
import { io } from "socket.io-client";
import fs from "fs";
import testCases from "./testCases.js";

const SERVER_URL = "http://localhost:3000";
const ROOM_ID = "test-room";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTest(test) {
  console.log(`\n🧪 Running Test: ${test.name}`);
  const sockets = [];

  const aiMessages = [];
  const userMessages = [];
  const allMessages = []; // Combined chronological log
  const startTime = Date.now();
  const seenMessageIds = new Set(); // ✅ Track unique messages

  for (const username of test.setup) {
    const socket = io(SERVER_URL);
    sockets.push(socket);

    socket.on("connect", () => {
      socket.emit("joinRoom", { roomId: ROOM_ID, username });
    });

    socket.on("message", (msg) => {
      // ✅ Skip duplicate messages
      if (seenMessageIds.has(msg.id)) return;
      seenMessageIds.add(msg.id);

      if (msg.isAI) {
        const aiMsg = {
          content: msg.content,
          username: msg.username,
          timestamp: msg.timestamp,
          latency: msg.timestamp - startTime,
          type: "answer",
          isAI: true,
        };
        aiMessages.push(aiMsg);
        allMessages.push(aiMsg);
      } else {
        const userMsg = {
          content: msg.content,
          username: msg.username,
          timestamp: msg.timestamp,
          type: "question",
          isAI: false,
        };
        userMessages.push(userMsg);
        allMessages.push(userMsg);
      }
    });
  }

  await delay(2000); // Wait for all sockets to connect

  // ✅ Send messages WITHOUT manually adding them (socket.on will handle it)
  for (const msg of test.messages) {
    const socket = sockets.find((s) => s.connected && s.id);
    socket.emit("sendMessage", { ...msg, roomId: ROOM_ID });
    await delay(1000); // Slightly longer delay between messages
  }

  // ✅ Wait up to 20 seconds for AI to respond
  await delay(20000);

  const aiCount = aiMessages.length;
  const pass =
    (test.expectResponse && aiCount > 0) ||
    (!test.expectResponse && aiCount === 0);

  console.log(`🗣️ User msgs: ${userMessages.length} | 🤖 AI msgs: ${aiCount}`);
  console.log(pass ? "✅ PASS" : "❌ FAIL");

  sockets.forEach((s) => s.disconnect());
  await delay(500);

  // Sort all messages by timestamp
  allMessages.sort((a, b) => a.timestamp - b.timestamp);

  return {
    name: test.name,
    description: test.description || "",
    pass,
    expectedBehavior: test.expectResponse 
      ? "AI should reply when addressed" 
      : "AI should stay silent",
    expectedAnswer: test.expectedAnswer || null,
    actualBehavior:
      aiMessages.length > 0
        ? `AI replied ${aiMessages.length} time(s)`
        : "AI did not reply",
    latencyMs: aiMessages.length ? aiMessages[0].latency : null,
    conversation: allMessages.map((msg) => ({
      type: msg.type, // "question" or "answer"
      speaker: msg.username,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString(),
      isAI: msg.isAI,
      latency: msg.latency || null,
    })),
  };
}

(async () => {
  console.log("🚀 Starting Talking Tom Multiplayer Chat Tests...");
  const results = [];

  for (const test of testCases) {
    const res = await runTest(test);
    results.push(res);
  }

  const summary = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passed: results.filter((r) => r.pass).length,
    failed: results.filter((r) => !r.pass).length,
    results: results.map((r) => ({
      testName: r.name,
      description: r.description,
      passed: r.pass,
      expectedBehavior: r.expectedBehavior,
      actualBehavior: r.actualBehavior,
      expectedAnswer: r.expectedAnswer,
      latency: r.latencyMs,
      conversation: r.conversation, // Chronological conversation log
    })),
  };

  // Generate unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `testResults-${timestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(summary, null, 2));
  console.log("\n📊 Test Summary:");
  results.forEach((r) =>
    console.log(
      `${r.pass ? "✅" : "❌"} ${r.name} ${r.latencyMs ? `(${r.latencyMs}ms)` : ""}`
    )
  );
  console.log(`\n📁 Detailed results saved to ${filename}`);
})();
