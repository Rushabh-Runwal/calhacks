import fetch from "node-fetch";

async function streamCompletion() {
  const response = await fetch("https://janitorai.com/hackathon/completions", {
    method: "POST",
    headers: {
      Authorization: "calhacks2047",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // ignored by server but helps mimic OpenAI schema
      stream: true,
      messages: [{ role: "user", content: "Hello, can you stream?" }],
    }),
  });

  console.log("Status:", response.status, response.statusText);
  if (!response.ok) {
    console.error("Error:", await response.text());
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  console.log("🔵 Streaming response...\n");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line.startsWith("data: ")) {
        const data = line.substring(6).trim();
        if (data === "[DONE]") {
          console.log("\n✅ Stream complete.");
          return;
        }
        try {
          const json = JSON.parse(data);
          const token = json?.choices?.[0]?.delta?.content;
          if (token) process.stdout.write(token);
        } catch (e) {
          // Ignore partial JSON (still streaming)
        }
      }
    }

    buffer = lines[lines.length - 1];
  }
}

streamCompletion();
