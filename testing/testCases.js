// testCases.js

module.exports = [
  {
    name: "Direct Mention (Should Reply)",
    setup: ["Alice", "Bob"],
    messages: [
      { username: "Alice", content: "Hey Tom, how are you doing today?" },
      { username: "Bob", content: "Yeah Tom, tell us what’s up!" },
    ],
    expectResponse: true,
  },
  {
    name: "Cross-chat (Should Stay Silent)",
    setup: ["Alice", "Bob"],
    messages: [
      { username: "Alice", content: "Hey Bob, did you finish the project?" },
      { username: "Bob", content: "Yeah, just wrapped it up this morning." },
    ],
    expectResponse: false,
  },
  {
    name: "Group Address (Should Reply Once)",
    setup: ["Alice", "Bob", "Charlie"],
    messages: [
      { username: "Charlie", content: "Hey everyone, what are you all doing today?" },
    ],
    expectResponse: true,
  },
  {
    name: "Context Memory (Should Recall Topic)",
    setup: ["Alice", "Bob", "Charlie"],
    messages: [
      { username: "Alice", content: "Tom, do you like fish?" },
      { username: "Bob", content: "Haha, same, I love sushi too!" },
      { username: "Charlie", content: "Tom, what’s your favorite type of fish?" },
    ],
    expectResponse: true,
  },
  {
    name: "Multiple Mentions (Should Handle Gracefully)",
    setup: ["Alice", "Bob"],
    messages: [
      { username: "Alice", content: "Tom, do you like dogs?" },
      { username: "Bob", content: "Tom, answer me too — do you have a favorite dog breed?" },
    ],
    expectResponse: true,
  },
  {
    name: "Speed & Queue Handling (Multiple Users)",
    setup: ["User1", "User2", "User3", "User4", "User5"],
    messages: [
      { username: "User1", content: "Hey Tom!" },
      { username: "User2", content: "What’s up Tom?" },
      { username: "User3", content: "Tom, tell a joke!" },
      { username: "User4", content: "Do you like yarn?" },
      { username: "User5", content: "Wanna play?" },
    ],
    expectResponse: true,
  },
];
