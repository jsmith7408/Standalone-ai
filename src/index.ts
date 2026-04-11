type Role = "user" | "jarvis" | "system";

type Message = {
  role: Role;
  text: string;
  at: Date;
};

const transcriptEl = document.getElementById("transcript") as HTMLDivElement;
const inputEl = document.getElementById("commandInput") as HTMLInputElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;
const micBtn = document.getElementById("micBtn") as HTMLButtonElement;
const speakToggle = document.getElementById("speakToggle") as HTMLInputElement;
const stateDot = document.getElementById("stateDot") as HTMLSpanElement;
const stateText = document.getElementById("stateText") as HTMLSpanElement;

const memory: Message[] = [];
let listening = false;

const SpeechRecognitionCtor =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognizer = SpeechRecognitionCtor ? new SpeechRecognitionCtor() : null;

if (recognizer) {
  recognizer.lang = "en-US";
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onstart = () => setState("listening", "Listening for command…");
  recognizer.onend = () => {
    listening = false;
    setState("idle", "Standing by");
  };
  recognizer.onerror = () => {
    listening = false;
    setState("error", "Mic error. You can still type commands.");
  };
  recognizer.onresult = (event: any) => {
    const text = event.results[0][0].transcript.trim();
    inputEl.value = text;
    runCommand(text);
  };
} else {
  micBtn.disabled = true;
  setState("warning", "Voice unavailable in this browser. Type commands below.");
}

function nowTime(): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}

function addMessage(role: Role, text: string): void {
  const message: Message = { role, text, at: new Date() };
  memory.push(message);

  const row = document.createElement("div");
  row.className = `msg ${role}`;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = role === "jarvis" ? "J" : role === "user" ? "You" : "•";

  const content = document.createElement("div");
  content.className = "content";
  content.innerHTML = `<p>${escapeHtml(text)}</p><time>${nowTime()}</time>`;

  row.appendChild(badge);
  row.appendChild(content);
  transcriptEl.appendChild(row);
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function speak(text: string): void {
  if (!speakToggle.checked || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function setState(kind: "idle" | "listening" | "warning" | "error", text: string): void {
  stateDot.className = `dot ${kind}`;
  stateText.textContent = text;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function helpText(): string {
  return [
    "I can help with:",
    "• time / date",
    "• open youtube, github, google",
    "• calculate 12 * 8",
    "• remember <fact>",
    "• what do you remember",
    "• clear memory"
  ].join("\n");
}

function calcExpression(raw: string): string | null {
  const expr = raw.replace(/[^0-9+\-*/().\s]/g, "").trim();
  if (!expr) return null;

  try {
    const fn = new Function(`return (${expr});`);
    const result = fn();
    if (typeof result !== "number" || Number.isNaN(result)) return null;
    return `${expr} = ${result}`;
  } catch {
    return null;
  }
}

function openSite(target: string): string | null {
  const map: Record<string, string> = {
    youtube: "https://www.youtube.com",
    github: "https://github.com",
    google: "https://google.com",
    gmail: "https://mail.google.com"
  };

  for (const key of Object.keys(map)) {
    if (target.includes(key)) {
      window.open(map[key], "_blank", "noopener,noreferrer");
      return `Opening ${key}.`;
    }
  }

  return null;
}

function generateReply(command: string): string {
  const q = command.toLowerCase().trim();

  if (!q) return "I did not catch that command.";
  if (q.includes("help")) return helpText();

  if (q.includes("time")) {
    return `It is ${new Date().toLocaleTimeString()}.`;
  }

  if (q.includes("date") || q.includes("day")) {
    return `Today is ${new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;
  }

  if (q.startsWith("open ")) {
    return openSite(q) ?? "I can open youtube, github, google, or gmail.";
  }

  if (q.startsWith("calculate") || q.startsWith("what is") || q.startsWith("compute")) {
    const cleaned = q
      .replace(/^calculate\s+/, "")
      .replace(/^what is\s+/, "")
      .replace(/^compute\s+/, "");
    return calcExpression(cleaned) ?? "I could not evaluate that expression.";
  }

  if (q.startsWith("remember ")) {
    const fact = command.slice("remember ".length).trim();
    localStorage.setItem(`jarvis-memory-${Date.now()}`, fact);
    return `Stored: ${fact}`;
  }

  if (q.includes("what do you remember")) {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("jarvis-memory-"));
    if (keys.length === 0) return "No saved memories yet.";
    const notes = keys
      .sort()
      .slice(-8)
      .map((k) => `• ${localStorage.getItem(k)}`)
      .join("\n");
    return `Recent memory:\n${notes}`;
  }

  if (q.includes("clear memory")) {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("jarvis-memory-"))
      .forEach((k) => localStorage.removeItem(k));
    return "Memory cleared.";
  }

  if (q.includes("status")) {
    return "All systems nominal. Running browser-only mode.";
  }

  return "Understood. I am ready for your next instruction.";
}

function runCommand(text: string): void {
  addMessage("user", text);
  const reply = generateReply(text);
  addMessage("jarvis", reply);
  speak(reply);
}

sendBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  runCommand(text);
});

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendBtn.click();
  }
});

micBtn.addEventListener("click", () => {
  if (!recognizer) return;
  if (listening) {
    recognizer.stop();
    return;
  }

  listening = true;
  recognizer.start();
});

addMessage("system", "JARVIS-lite initialized. Type or speak a command.");
addMessage("jarvis", "Good evening. How can I assist you today?");
