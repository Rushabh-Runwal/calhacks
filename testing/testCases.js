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
  {
    name: "Max Context Stress Test (Complex Topic)",
    description:
      "Send 80 dense messages across multiple complex domains, then ask Tom to connect attention and Bayesian inference.",
    setup: ["Alice", "Bob", "Carol"],
    expectResponse: true,
    messages: Array.from({ length: 80 }, (_, i) => ({
      username: i % 2 === 0 ? "Alice" : "Bob",
      content: `Context ${i + 1}: transformer attention entropy — key point ${i + 1}.`,
      delay: 80,
    })).concat({
      username: "Carol",
      content:
        "Tom, can you summarize our main themes and connect transformer attention to Bayesian inference in 2 short lines?",
      delay: 150,
    }),
  },
];
