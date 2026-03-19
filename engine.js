let currentMode = "brutal";

/* --------------------------
   MODE CONTROL
-------------------------- */
function setMode(mode) {
  currentMode = mode;

  document.getElementById("brutalBtn").classList.remove("active");
  document.getElementById("guidedBtn").classList.remove("active");

  if (mode === "brutal") {
    document.getElementById("brutalBtn").classList.add("active");
  } else {
    document.getElementById("guidedBtn").classList.add("active");
  }
}

/* --------------------------
   MAIN
-------------------------- */
function resolveProblem() {
  const input = document.getElementById("problemInput").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.innerHTML = "<div class='card'>Enter a problem.</div>";
    return;
  }

  const problem = identifyProblem(input);
  const category = detectCategory(input);

  const memoryKey = buildMemoryKey(problem, category);
  const memory = updateProblemMemory(memoryKey, problem, category);

  const quick = generateQuickFix(problem, category, input, memory, currentMode);
  const stabilize = generateStabilize(problem, category, input, memory, currentMode);
  const permanent = generatePermanent(problem, category, input, memory, currentMode);

  const escalation = generateEscalationMessage(memory, currentMode);

  output.innerHTML = `
    <div class="card">
      <div class="section">
        <div class="label">PROBLEM</div>
        <div>${escapeHtml(problem)}</div>
      </div>

      <div class="section">
        <div class="label">QUICK FIX</div>
        <div>${escapeHtml(quick)}</div>
      </div>

      <div class="section">
        <div class="label">STABILIZE</div>
        <div>${escapeHtml(stabilize)}</div>
      </div>

      <div class="section">
        <div class="label">PERMANENT FIX</div>
        <div>${escapeHtml(permanent)}</div>
      </div>

      <div class="section">
        <div class="label">PATTERN</div>
        <div>${escapeHtml(escalation)}</div>
      </div>
    </div>
  `;
}

/* --------------------------
   IDENTIFY
-------------------------- */
function identifyProblem(input) {
  let clean = input.trim();
  clean = clean.replace(/^(i have|there is|my|the)\s+/i, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/* --------------------------
   CATEGORY
-------------------------- */
function detectCategory(input) {
  const text = input.toLowerCase();

  if (text.includes("leak") || text.includes("water") || text.includes("sink")) return "home";
  if (text.includes("app") || text.includes("crash") || text.includes("bug")) return "software";
  if (text.includes("wifi") || text.includes("internet") || text.includes("slow")) return "network";
  if (text.includes("tired") || text.includes("burnout") || text.includes("stress")) return "health";

  return "general";
}

/* --------------------------
   MEMORY
-------------------------- */
function buildMemoryKey(problem, category) {
  return category + "::" + problem.toLowerCase();
}

function updateProblemMemory(key, problem, category) {
  const store = JSON.parse(localStorage.getItem("trilane_memory") || "{}");

  if (!store[key]) {
    store[key] = { count: 0 };
  }

  store[key].count += 1;
  localStorage.setItem("trilane_memory", JSON.stringify(store));

  return store[key];
}

function generateEscalationMessage(memory, mode) {
  if (mode === "brutal") {
    if (memory.count < 2) return "No pattern yet.";
    if (memory.count === 2) return "Seen this twice.";
    if (memory.count === 3) return "This is becoming a pattern.";
    return "You keep doing this. Fix it properly.";
  } else {
    if (memory.count < 2) return "No repeat pattern detected yet.";
    if (memory.count === 2) return "This has come up more than once.";
    if (memory.count === 3) return "A pattern is forming.";
    return "It may be worth addressing this at the root level.";
  }
}

/* --------------------------
   OUTPUT ENGINE (MODES)
-------------------------- */

function generateQuickFix(problem, category, input, memory, mode) {
  if (mode === "brutal") {
    return "Do the obvious thing to stop the problem right now.";
  } else {
    return "Take the fastest step to reduce the immediate impact.";
  }
}

function generateStabilize(problem, category, input, memory, mode) {
  if (mode === "brutal") {
    return "Fix it properly so it stops happening for a while.";
  } else {
    return "Apply a more reliable fix to reduce recurrence.";
  }
}

function generatePermanent(problem, category, input, memory, mode) {
  if (mode === "brutal") {
    return "Fix the root cause so this stops happening.";
  } else {
    return "Identify and eliminate the root cause completely.";
  }
}

/* --------------------------
   SAFE OUTPUT
-------------------------- */
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
