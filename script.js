/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Use the class-hosted proxy so the OpenAI API key stays private.
const workerUrl = "https://loreal-chatbot.your-subdomain.workers.dev/";
const messages = [
  {
    role: "system",
    content:
      "You are a helpful L'Oréal beauty assistant. Recommend makeup, skincare, haircare, and fragrance products, and create personalized routines. Ask helpful follow-up questions when needed.",
  },
];

// Add one message to the chat window without treating it as HTML.
function addMessage(role, content) {
  const message = document.createElement("p");
  message.textContent = `${role === "user" ? "You" : "Assistant"}: ${content}`;
  chatWindow.appendChild(message);
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
    const reply = data.choices[0].message.content;

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
