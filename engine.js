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

  const quick = generateQuickFix(problem, category, input, memory);
  const stabilize = generateStabilize(problem, category, input, memory);
  const permanent = generatePermanent(problem, category, input, memory);

  const escalation = generateEscalationMessage(memory);

  output.innerHTML = `
    <div class="card">
      <div class="section">
        <div class="label">PROBLEM</div>
        <div>${escapeHtml(problem)}</div>
        <div class="tradeoff">Detected: ${category.toUpperCase()}</div>
      </div>

      <div class="section">
        <div class="label">QUICK FIX</div>
        <div>${escapeHtml(quick.action)}</div>
        <div class="tradeoff">Tradeoff: ${escapeHtml(quick.tradeoff)}</div>
      </div>

      <div class="section">
        <div class="label">STABILIZE</div>
        <div>${escapeHtml(stabilize.action)}</div>
        <div class="tradeoff">Tradeoff: ${escapeHtml(stabilize.tradeoff)}</div>
      </div>

      <div class="section">
        <div class="label">PERMANENT FIX</div>
        <div>${escapeHtml(permanent.action)}</div>
        <div class="tradeoff">Tradeoff: ${escapeHtml(permanent.tradeoff)}</div>
      </div>

      <div class="section">
        <div class="label">PATTERN</div>
        <div>${escapeHtml(escalation.message)}</div>
        <div class="tradeoff">${escapeHtml(escalation.subtext)}</div>
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
  clean = clean.replace(/\s+/g, " ");

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/* --------------------------
   CATEGORY DETECTION
-------------------------- */
function detectCategory(input) {
  const text = input.toLowerCase();

  const categories = {
    home: ["leak", "water", "pipe", "sink", "dishwasher", "toilet", "drain", "hose"],
    software: ["app", "bug", "crash", "code", "error", "upload", "freeze", "broken", "issue"],
    health: ["tired", "burnout", "stress", "exhausted", "overwhelmed", "fatigue"],
    network: ["wifi", "internet", "slow", "signal", "connection", "router", "lag"]
  };

  const scores = {};
  let best = "general";
  let max = 0;

  for (const category in categories) {
    scores[category] = 0;

    categories[category].forEach(word => {
      if (text.includes(word)) {
        scores[category] += 1;
      }
    });

    if (scores[category] > max) {
      max = scores[category];
      best = category;
    }
  }

  return best;
}

/* --------------------------
   MEMORY
-------------------------- */
function buildMemoryKey(problem, category) {
  const normalized = problem
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return `${category}::${normalized}`;
}

function loadMemoryStore() {
  try {
    const raw = localStorage.getItem("trilane_memory_v1");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveMemoryStore(store) {
  try {
    localStorage.setItem("trilane_memory_v1", JSON.stringify(store));
  } catch (error) {
    // fail quietly
  }
}

function updateProblemMemory(memoryKey, problem, category) {
  const store = loadMemoryStore();
  const now = new Date().toISOString();

  if (!store[memoryKey]) {
    store[memoryKey] = {
      problem,
      category,
      count: 0,
      firstSeen: now,
      lastSeen: now
    };
  }

  store[memoryKey].count += 1;
  store[memoryKey].lastSeen = now;

  saveMemoryStore(store);

  return store[memoryKey];
}

function generateEscalationMessage(memory) {
  const count = memory.count;

  if (count <= 1) {
    return {
      message: "First time seen. No repeat pattern detected yet.",
      subtext: "Quick Fix is reasonable here if speed matters."
    };
  }

  if (count === 2) {
    return {
      message: "This problem has shown up more than once.",
      subtext: "Stabilize is starting to make more sense than repeating a Quick Fix."
    };
  }

  if (count === 3) {
    return {
      message: "Repeat pattern confirmed.",
      subtext: "You are likely paying a tax for not fixing the underlying issue."
    };
  }

  if (count === 4) {
    return {
      message: "Escalation recommended.",
      subtext: "Quick Fix behavior is becoming a loop. Move to Stabilize or Permanent Fix."
    };
  }

  return {
    message: `This problem has appeared ${count} times.`,
    subtext: "Permanent Fix is now strongly favored unless constraints are blocking action."
  };
}

/* --------------------------
   HELPERS
-------------------------- */
function contains(text, words) {
  return words.some(word => text.includes(word));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/* --------------------------
   QUICK FIX
-------------------------- */
function generateQuickFix(problem, category, input, memory) {
  const text = input.toLowerCase();
  const repeated = memory.count >= 3;

  if (category === "home") {
    if (contains(text, ["leak", "water"])) {
      return {
        action: repeated
          ? "Contain damage immediately, but stop relying on towels and temporary control alone."
          : "Shut off water supply and contain the leak with a bucket or towel.",
        tradeoff: repeated
          ? "Temporary containment is no longer enough if this keeps returning."
          : "Stops damage but does not fix the leak."
      };
    }

    return {
      action: "Reduce immediate damage and isolate the failing area.",
      tradeoff: "Gets you through the moment, not the cause."
    };
  }

  if (category === "software") {
    if (contains(text, ["crash", "freeze"])) {
      return {
        action: repeated
          ? "Use the smallest possible workflow and bypass the failing path for now."
          : "Restart the app or device and retry with minimal input.",
        tradeoff: repeated
          ? "You are now working around the issue instead of solving it."
          : "May temporarily mask the issue."
      };
    }

    return {
      action: "Disable or avoid the failing feature temporarily.",
      tradeoff: "Functionality is reduced."
    };
  }

  if (category === "network") {
    return {
      action: repeated
        ? "Reset the connection only if needed, but stop treating resets as the main solution."
        : "Move closer to the router or reset the connection.",
      tradeoff: repeated
        ? "Repeat resets signal a system weakness."
        : "Only improves conditions temporarily."
    };
  }

  if (category === "health") {
    return {
      action: repeated
        ? "Reduce load immediately and cancel nonessential pressure today."
        : "Pause and reduce current load immediately.",
      tradeoff: repeated
        ? "Short-term relief will keep fading if the structure stays the same."
        : "Relief is short-term."
    };
  }

  return {
    action: repeated
      ? "Take the fastest step to reduce impact, but note that repetition is turning this into a pattern."
      : "Take the fastest step to reduce immediate impact.",
    tradeoff: repeated
      ? "Quick relief is becoming a loop."
      : "Temporary and incomplete."
  };
}

/* --------------------------
   STABILIZE
-------------------------- */
function generateStabilize(problem, category, input, memory) {
  const repeated = memory.count >= 2;

  if (category === "home") {
    return {
      action: repeated
        ? "Repair or replace the failing component locally before it causes more damage."
        : "Repair or replace the faulty component causing the issue.",
      tradeoff: repeated
        ? "Fixes the local problem, but not wider wear in the system."
        : "Fixes the local problem but not system-wide wear."
    };
  }

  if (category === "software") {
    return {
      action: repeated
        ? "Add validation, guardrails, and limits around the failing workflow."
        : "Add validation, constraints, or safeguards to prevent failure.",
      tradeoff: "Improves stability but may not fix architecture."
    };
  }

  if (category === "network") {
    return {
      action: repeated
        ? "Reposition the router, reduce interference, or add a mesh/extender node."
        : "Reposition the router or install a signal extender.",
      tradeoff: "Partial improvement depending on setup."
    };
  }

  if (category === "health") {
    return {
      action: repeated
        ? "Restructure the week, remove low-value obligations, and protect recovery time."
        : "Restructure the schedule and remove unnecessary strain.",
      tradeoff: "Requires consistent follow-through."
    };
  }

  return {
    action: "Apply a more stable fix that reduces recurrence.",
    tradeoff: "Not a full solution."
  };
}

/* --------------------------
   PERMANENT FIX
-------------------------- */
function generatePermanent(problem, category, input, memory) {
  const repeated = memory.count >= 3;

  if (category === "home") {
    return {
      action: repeated
        ? "Inspect the full system, find the root failure, and repair or replace it correctly."
        : "Identify root cause and fully repair or replace the system correctly.",
      tradeoff: "Higher cost and effort."
    };
  }

  if (category === "software") {
    return {
      action: repeated
        ? "Refactor the failing workflow or architecture so the issue cannot keep resurfacing."
        : "Refactor the system to eliminate the root cause of failure.",
      tradeoff: "Requires development time."
    };
  }

  if (category === "network") {
    return {
      action: repeated
        ? "Upgrade hardware and redesign coverage so the weak zone disappears."
        : "Upgrade network hardware or redesign layout for full coverage.",
      tradeoff: "Cost and setup complexity."
    };
  }

  if (category === "health") {
    return {
      action: repeated
        ? "Redesign workload, routines, and boundaries so overload stops being your default mode."
        : "Redesign lifestyle, workload, and recovery systems to prevent recurrence.",
      tradeoff: "Requires behavior change."
    };
  }

  return {
    action: repeated
      ? "Remove the root cause completely instead of paying the same problem tax repeatedly."
      : "Remove the root cause completely.",
    tradeoff: "Requires time and resources."
  };
}
