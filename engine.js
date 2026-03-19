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

  const memoryKeys = buildMemoryKeys(problem, category, input);
  const memory = updateProblemMemory(memoryKeys, problem, category);

  const quick = generateQuickFix(problem, category, input, memory, currentMode);
  const stabilize = generateStabilize(problem, category, input, memory, currentMode);
  const permanent = generatePermanent(problem, category, input, memory, currentMode);
  const pattern = generateEscalationMessage(memory, currentMode);

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
        <div>${escapeHtml(pattern)}</div>
      </div>
    </div>
  `;
}

/* --------------------------
   IDENTIFY
-------------------------- */
function identifyProblem(input) {
  let clean = input.trim();
  clean = clean.replace(/^(i have|there is|my|the|hey|uh|okay|ok)\s+/i, "");
  clean = clean.replace(/\s+/g, " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/* --------------------------
   CATEGORY
-------------------------- */
function detectCategory(input) {
  const text = normalize(input);

  const scores = {
    mess: scoreKeywords(text, [
      "dog poop", "dog shit", "dog dumped", "dog took a dump", "shit on carpet",
      "poop on carpet", "carpet", "stain", "vomit", "puke", "pee", "urine",
      "pet mess", "feces", "shit", "poop"
    ]),
    home: scoreKeywords(text, [
      "leak", "water", "sink", "dishwasher", "toilet", "drain", "pipe",
      "hose", "flood", "wet", "ceiling", "wall", "garbage disposal"
    ]),
    software: scoreKeywords(text, [
      "app", "crash", "bug", "error", "upload", "code", "freeze", "login",
      "won't load", "wont load", "broken", "glitch"
    ]),
    network: scoreKeywords(text, [
      "wifi", "wi fi", "internet", "router", "signal", "connection", "lag",
      "slow internet", "buffer", "streaming", "back room", "bedroom"
    ]),
    health: scoreKeywords(text, [
      "burnout", "stressed", "stress", "overwhelmed", "tired", "exhausted",
      "fatigue", "worn out", "cant focus", "can't focus"
    ]),
    money: scoreKeywords(text, [
      "broke", "debt", "bill", "payment", "late fee", "overdraft", "rent",
      "can't afford", "cant afford", "credit card"
    ]),
    clutter: scoreKeywords(text, [
      "messy", "clutter", "junk", "garage", "closet", "pile", "dirty room",
      "house is a mess", "room is a mess"
    ])
  };

  let bestCategory = "general";
  let bestScore = 0;

  for (const category in scores) {
    if (scores[category] > bestScore) {
      bestScore = scores[category];
      bestCategory = category;
    }
  }

  return bestCategory;
}

function scoreKeywords(text, keywords) {
  let score = 0;
  for (const keyword of keywords) {
    if (text.includes(keyword)) score += 1;
  }
  return score;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, words) {
  return words.some(word => text.includes(word));
}

/* --------------------------
   MEMORY — SMARTER MATCHING
-------------------------- */
function buildMemoryKeys(problem, category, input) {
  const raw = normalize(input);
  const canonical = buildCanonicalProblem(raw, category);

  return {
    exact: `${category}::${normalize(problem)}`,
    canonical: `${category}::${canonical}`
  };
}

function buildCanonicalProblem(text, category) {
  let canonical = text;

  const replacements = [
    [/\bwi fi\b/g, "wifi"],
    [/\binternet\b/g, "wifi"],
    [/\bconnection\b/g, "wifi"],
    [/\bback room\b/g, "far_room"],
    [/\bbed room\b/g, "bedroom"],
    [/\bback bedroom\b/g, "far_room"],
    [/\bbedroom\b/g, "far_room"],
    [/\blaggy\b/g, "slow"],
    [/\bsucks\b/g, "slow"],
    [/\bterrible\b/g, "slow"],
    [/\bcrashes\b/g, "crash"],
    [/\bfreezes\b/g, "freeze"],
    [/\bglitchy\b/g, "glitch"],
    [/\buploading\b/g, "upload"],
    [/\bleaking\b/g, "leak"],
    [/\bdripping\b/g, "leak"],
    [/\bpooped\b/g, "poop"],
    [/\bshit\b/g, "poop"],
    [/\btook a dump\b/g, "poop"],
    [/\brug\b/g, "carpet"],
    [/\bstressed out\b/g, "stressed"],
    [/\bworn out\b/g, "burnout"],
    [/\bexhausted\b/g, "burnout"],
    [/\boverwhelemed\b/g, "burnout"]
  ];

  for (const [pattern, replacement] of replacements) {
    canonical = canonical.replace(pattern, replacement);
  }

  canonical = canonical
    .split(" ")
    .filter(word => !isFillerWord(word, category))
    .sort()
    .join(" ")
    .trim();

  if (!canonical) {
    canonical = category;
  }

  return canonical;
}

function isFillerWord(word, category) {
  const common = new Set([
    "a", "an", "the", "my", "is", "are", "was", "were", "to", "for", "of",
    "and", "or", "in", "on", "at", "with", "it", "this", "that", "keeps",
    "keep", "very", "really", "super", "pretty", "kind", "of", "just"
  ]);

  if (common.has(word)) return true;

  const categoryFillers = {
    network: new Set(["room", "house"]),
    software: new Set(["app"]),
    home: new Set(["under"]),
    health: new Set(["feel", "feeling", "am", "im", "i"]),
    clutter: new Set(["stuff"])
  };

  return categoryFillers[category]?.has(word) || false;
}

function updateProblemMemory(keys, problem, category) {
  const store = JSON.parse(localStorage.getItem("trilane_memory") || "{}");
  const key = keys.canonical;

  if (!store[key]) {
    store[key] = {
      count: 0,
      problem,
      category,
      lastExact: keys.exact
    };
  }

  store[key].count += 1;
  store[key].problem = problem;
  store[key].lastExact = keys.exact;

  localStorage.setItem("trilane_memory", JSON.stringify(store));

  return store[key];
}

/* --------------------------
   PATTERN
-------------------------- */
function generateEscalationMessage(memory, mode) {
  if (mode === "brutal") {
    if (memory.count === 1) return "No pattern yet.";
    if (memory.count === 2) return "Same problem, different wording.";
    if (memory.count === 3) return "This is becoming your thing.";
    return "You keep revisiting this. Stop patching it and fix it.";
  }

  if (memory.count === 1) return "No repeat pattern detected yet.";
  if (memory.count === 2) return "This appears to be the same problem showing up again.";
  if (memory.count === 3) return "A repeat pattern is forming.";
  return "It may be time to move beyond short-term fixes and address the root issue.";
}

/* --------------------------
   OUTPUT ENGINE
-------------------------- */
function generateQuickFix(problem, category, input, memory, mode) {
  const text = normalize(input);

  if (category === "mess") {
    if (hasAny(text, ["carpet", "rug"])) {
      return mode === "brutal"
        ? "Pick up the mess and clean the spot."
        : "Pick up the mess and clean the affected area right away.";
    }

    return mode === "brutal"
      ? "Clean it up right now."
      : "Clean it up immediately before it sets or spreads.";
  }

  if (category === "home") {
    if (hasAny(text, ["leak", "water", "flood", "wet"])) {
      return mode === "brutal"
        ? "Shut off the water and contain the leak."
        : "Shut off the water source and contain the leak to limit damage.";
    }

    if (hasAny(text, ["dishwasher"])) {
      return mode === "brutal"
        ? "Stop using the dishwasher and clean up the water."
        : "Stop using the dishwasher for now and clean up any standing water.";
    }

    if (hasAny(text, ["toilet"])) {
      return mode === "brutal"
        ? "Stop the overflow and clean up the mess."
        : "Stop the toilet from overflowing and clean the area before damage spreads.";
    }

    return mode === "brutal"
      ? "Stop the damage first."
      : "Take the fastest step to stop further damage.";
  }

  if (category === "software") {
    if (hasAny(text, ["crash", "freeze", "glitch"])) {
      return mode === "brutal"
        ? "Restart it and try the smallest version of the task."
        : "Restart the app or device and retry with the smallest possible version of the task.";
    }

    if (hasAny(text, ["login"])) {
      return mode === "brutal"
        ? "Reset the password and try again."
        : "Reset the password or sign-in method and try again.";
    }

    if (hasAny(text, ["upload"])) {
      return mode === "brutal"
        ? "Try a smaller file or do it one piece at a time."
        : "Retry with a smaller file or a simpler upload to get unstuck quickly.";
    }

    return mode === "brutal"
      ? "Do the simplest workaround that gets you moving."
      : "Use the simplest workaround that gets the task moving again.";
  }

  if (category === "network") {
    return mode === "brutal"
      ? "Move closer to the router or reset the connection."
      : "Move closer to the router or reset the connection to restore service quickly.";
  }

  if (category === "health") {
    return mode === "brutal"
      ? "Stop adding to your day and take something off your plate."
      : "Reduce your load immediately and remove at least one nonessential demand.";
  }

  if (category === "money") {
    return mode === "brutal"
      ? "Stop the bleeding. Cut the extra spending today."
      : "Stop any nonessential spending immediately so the problem does not grow today.";
  }

  if (category === "clutter") {
    return mode === "brutal"
      ? "Pick up the obvious junk first."
      : "Start by removing the most obvious junk or trash so the space improves fast.";
  }

  return mode === "brutal"
    ? "Do the obvious thing first."
    : "Start with the most obvious action that reduces the immediate problem.";
}

function generateStabilize(problem, category, input, memory, mode) {
  const text = normalize(input);

  if (category === "mess") {
    if (hasAny(text, ["carpet", "rug"])) {
      return mode === "brutal"
        ? "Use a real carpet cleaner or get it cleaned properly."
        : "Use a carpet cleaner or have the carpet properly cleaned to remove residue and odor.";
    }

    return mode === "brutal"
      ? "Clean it properly so it does not keep bothering you."
      : "Clean it more thoroughly so it does not keep lingering as a problem.";
  }

  if (category === "home") {
    if (hasAny(text, ["leak", "pipe", "hose", "drain"])) {
      return mode === "brutal"
        ? "Repair the part that is failing."
        : "Repair or replace the specific part that is failing so the issue stops recurring short-term.";
    }

    if (hasAny(text, ["dishwasher"])) {
      return mode === "brutal"
        ? "Fix the seal, hose, or connection that is causing the leak."
        : "Inspect and repair the hose, seal, or connection that is likely causing the dishwasher problem.";
    }

    return mode === "brutal"
      ? "Fix the local problem properly."
      : "Address the local source of the issue so it stops coming back for a while.";
  }

  if (category === "software") {
    if (hasAny(text, ["upload"])) {
      return mode === "brutal"
        ? "Put limits and guardrails on the upload process."
        : "Add limits, validation, or simpler handling around uploads so the workflow becomes more stable.";
    }

    if (hasAny(text, ["crash", "freeze"])) {
      return mode === "brutal"
        ? "Figure out the trigger and stop stepping on it."
        : "Identify the trigger and add safeguards or constraints so users stop hitting the same failure.";
    }

    return mode === "brutal"
      ? "Patch the weak spot."
      : "Patch the weak spot so the failure is less likely to repeat.";
  }

  if (category === "network") {
    return mode === "brutal"
      ? "Move the router or add an extender."
      : "Improve coverage by moving the router, reducing interference, or adding an extender.";
  }

  if (category === "health") {
    return mode === "brutal"
      ? "Restructure the week so you stop eating garbage stress every day."
      : "Restructure your week and remove repeat stressors so the pressure drops in a more durable way.";
  }

  if (category === "money") {
    return mode === "brutal"
      ? "Make a real budget and cut what is screwing you."
      : "Build a simple budget and cut the recurring expenses that are creating the problem.";
  }

  if (category === "clutter") {
    return mode === "brutal"
      ? "Clean the room for real, not just the visible part."
      : "Do a real cleanup pass so the space works again instead of just looking slightly better.";
  }

  return mode === "brutal"
    ? "Do it properly."
    : "Apply a more complete fix so the problem is less likely to return soon.";
}

function generatePermanent(problem, category, input, memory, mode) {
  const text = normalize(input);

  if (category === "mess") {
    if (hasAny(text, ["carpet", "rug"])) {
      return mode === "brutal"
        ? "Replace the carpet."
        : "Replace the carpet if the stain, smell, or damage keeps coming back.";
    }

    if (hasAny(text, ["dog", "pet"])) {
      return mode === "brutal"
        ? "Fix the dog routine so this stops happening."
        : "Change the pet routine, training, or access so the mess stops happening in the first place.";
    }

    return mode === "brutal"
      ? "Remove the reason this keeps happening."
      : "Eliminate the root cause so the same mess does not keep repeating.";
  }

  if (category === "home") {
    if (hasAny(text, ["leak", "pipe", "hose", "drain"])) {
      return mode === "brutal"
        ? "Replace the bad plumbing and be done with it."
        : "Replace the failing plumbing or fixture so the root leak is gone.";
    }

    if (hasAny(text, ["dishwasher"])) {
      return mode === "brutal"
        ? "Repair or replace the dishwasher."
        : "Repair or replace the dishwasher if the core failure keeps returning.";
    }

    return mode === "brutal"
      ? "Fix the root cause instead of babysitting it."
      : "Repair or replace the root failing system so the issue stops returning.";
  }

  if (category === "software") {
    if (hasAny(text, ["upload"])) {
      return mode === "brutal"
        ? "Rebuild the upload flow so it stops breaking."
        : "Refactor the upload flow so the underlying failure is eliminated.";
    }

    if (hasAny(text, ["crash", "freeze", "bug", "glitch"])) {
      return mode === "brutal"
        ? "Fix the code that is actually broken."
        : "Fix the underlying code or architecture that is causing the repeated failure.";
    }

    return mode === "brutal"
      ? "Fix the actual broken thing."
      : "Correct the underlying technical problem instead of working around it.";
  }

  if (category === "network") {
    return mode === "brutal"
      ? "Upgrade the network so the dead zone disappears."
      : "Upgrade the network hardware or layout so the weak coverage area is eliminated.";
  }

  if (category === "health") {
    return mode === "brutal"
      ? "Change your life so burnout stops being normal."
      : "Redesign your workload, routines, and boundaries so burnout stops being your default pattern.";
  }

  if (category === "money") {
    return mode === "brutal"
      ? "Change the money system, not just the month."
      : "Change the income, spending, or debt structure so the same money problem stops repeating.";
  }

  if (category === "clutter") {
    return mode === "brutal"
      ? "Own less stuff or store it better."
      : "Reduce what you keep or build a storage system so clutter stops rebuilding itself.";
  }

  return mode === "brutal"
    ? "Fix the root cause."
    : "Address the root cause so the problem stops repeating.";
}

/* --------------------------
   SAFE OUTPUT
-------------------------- */
function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
