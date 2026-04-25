const WORKER_URL = "https://portfolio-agent.vegm92.workers.dev";

const MESSAGE_LIMIT = 10;
let msgCount = 0;

// DOM refs
const agent = document.getElementById("agent");
const fab = document.getElementById("agent-fab");
const closeBtn = document.getElementById("agent-close");
const body = document.getElementById("agent-body");
const input = document.getElementById("agent-input");
const send = document.getElementById("agent-send");
const suggest = document.getElementById("agent-suggest");

function openAgent() {
  agent.classList.add("open");
  setTimeout(() => input.focus(), 200);
}

function closeAgent() {
  agent.classList.remove("open");
}

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function addTyping() {
  const t = document.createElement("div");
  t.className = "typing";
  t.innerHTML = "<span></span><span></span><span></span>";
  body.appendChild(t);
  body.scrollTop = body.scrollHeight;
  return t;
}

async function callWorker(userMessage) {
  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });
  if (!res.ok) throw new Error(`Worker error: ${res.status}`);
  const data = await res.json();
  return data.reply?.trim() ?? "Sorry, I couldn't generate a response right now.";
}

function lockInput() {
  input.disabled = true;
  send.disabled = true;
  input.placeholder = "Message limit reached — email victorgranda1992@gmail.com";
}

async function ask(q) {
  if (!q || !q.trim()) return;
  if (msgCount >= MESSAGE_LIMIT) return;

  msgCount++;
  addMsg(q, "user");
  input.value = "";
  send.disabled = true;
  suggest.style.display = "none";
  const typing = addTyping();

  try {
    const reply = await callWorker(q.trim());
    typing.remove();
    addMsg(reply, "bot");
  } catch (err) {
    typing.remove();
    addMsg(
      "Something went wrong — try again or email victorgranda1992@gmail.com directly.",
      "bot",
    );
    console.error("Gemini error:", err);
  } finally {
    if (msgCount >= MESSAGE_LIMIT) {
      addMsg("You've reached the message limit for this session. Reach out directly at victorgranda1992@gmail.com!", "bot");
      lockInput();
    } else {
      send.disabled = false;
      input.focus();
    }
  }
}

fab.addEventListener("click", () =>
  agent.classList.contains("open") ? closeAgent() : openAgent(),
);
closeBtn.addEventListener("click", closeAgent);

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openAgent();
  }
  if (e.key === "Escape" && agent.classList.contains("open")) closeAgent();
});

send.addEventListener("click", () => ask(input.value));
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") ask(input.value);
});
suggest.querySelectorAll("button").forEach((b) => {
  b.addEventListener("click", () => ask(b.textContent));
});
