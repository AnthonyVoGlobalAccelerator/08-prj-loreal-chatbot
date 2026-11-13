/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Use the class-hosted proxy so the OpenAI API key stays private.
const workerUrl = "https://openaiapi.anthonyvo567.workers.dev/";
const messages = [
  {
    role: "system",
    content:
      "You are L'Oréal Beauty Assistant. Only answer questions about L'Oréal products, makeup, skincare, haircare, fragrances, beauty routines, product comparisons, and beauty-related recommendations. Use the conversation history to give personalized advice and remember details the user shares, such as their name, preferences, hair or skin type, and past questions. If a question is unrelated, politely say you can only help with L'Oréal products, beauty routines, and beauty recommendations, then invite the user to ask a beauty-related question. Never claim a product has medical benefits, and recommend consulting a qualified professional for medical concerns. Ask a brief follow-up question when you need more information.",
  },
];

// Add a user or assistant message as a conversation bubble.
function addMessage(role, content) {
  const message = document.createElement("div");
  message.className = `message ${role}`;

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "L'Oréal Assistant";

  const text = document.createElement("p");
  text.textContent = content;

  message.append(label, text);
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Set the initial message.
addMessage("assistant", "👋 Hello! How can I help you today?");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  addMessage("user", userMessage);
  messages.push({ role: "user", content: userMessage });
  userInput.value = "";

  try {
    // Send the full conversation to the Cloudflare Worker.
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error("The Worker returned an unexpected response.");
    }

    messages.push({ role: "assistant", content: reply });
    addMessage("assistant", reply);
  } catch (error) {
    console.error("Could not get a chatbot response:", error);
    addMessage(
      "assistant",
      "Sorry, I could not connect right now. Please try again.",
    );
  }
});
