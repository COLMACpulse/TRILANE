function resolveProblem() {
  const input = document.getElementById("problemInput").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.innerHTML = "<div class='card'>Enter a problem.</div>";
    return;
  }

  const problem = identifyProblem(input);
  const category = detectCategory(input);

  const quick = generateQuickFix(problem, category, input);
  const stabilize = generateStabilize(problem, category, input);
  const permanent = generatePermanent(problem, category, input);

  output.innerHTML = `
    <div class="card">
      <div class="section">
        <div class="label">PROBLEM</div>
        <div>${problem}</div>
        <div class="tradeoff">Detected: ${category.toUpperCase()}</div>
      </div>

      <div class="section">
        <div class="label">QUICK FIX</div>
        <div>${quick.action}</div>
        <div class="tradeoff">Tradeoff: ${quick.tradeoff}</div>
      </div>

      <div class="section">
        <div class="label">STABILIZE</div>
        <div>${stabilize.action}</div>
        <div class="tradeoff">Tradeoff: ${stabilize.tradeoff}</div>
      </div>

      <div class="section">
        <div class="label">PERMANENT FIX</div>
        <div>${permanent.action}</div>
        <div class="tradeoff">Tradeoff: ${permanent.tradeoff}</div>
      </div>
    </div>
  `;
}

/* --------------------------
   IDENTIFY (slightly smarter)
-------------------------- */
function identifyProblem(input) {
  let clean = input.trim();

  // remove filler phrases
  clean = clean.replace(/^(i have|there is|my|the)\s+/i, "");

  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/* --------------------------
   CATEGORY DETECTION (weighted)
-------------------------- */
function detectCategory(input) {
  const text = input.toLowerCase();

  const categories = {
    home: ["leak", "water", "pipe", "sink", "dishwasher", "toilet"],
    software: ["app", "bug", "crash", "code", "error", "upload"],
    health: ["tired", "burnout", "stress", "exhausted", "overwhelmed"],
    network: ["wifi", "internet", "slow", "signal", "connection"],
  };

  let scores = {};

  for (let category in categories) {
    scores[category] = 0;
    categories[category].forEach(word => {
      if (text.includes(word)) {
        scores[category]++;
      }
    });
  }

  // find best match
  let best = "general";
  let max = 0;

  for (let category in scores) {
    if (scores[category] > max) {
      max = scores[category];
      best = category;
    }
  }

  return best;
}

/* --------------------------
   DYNAMIC HELPERS
-------------------------- */
function contains(text, words) {
  return words.some(w => text.includes(w));
}

/* --------------------------
   QUICK FIX (context-aware)
-------------------------- */
function generateQuickFix(problem, category, input) {
  const text = input.toLowerCase();

  if (category === "home") {
    if (contains(text, ["leak"])) {
      return {
        action: "Shut off water supply and contain the leak with a bucket or towel.",
        tradeoff: "Stops damage but does not fix the leak."
      };
    }
  }

  if (category === "software") {
    if (contains(text, ["crash"])) {
      return {
        action: "Restart the app or device and retry with minimal input.",
        tradeoff: "May temporarily mask the issue."
      };
    }
  }

  if (category === "network") {
    return {
      action: "Move closer to router or reset connection.",
      tradeoff: "Only improves conditions temporarily."
    };
  }

  if (category === "health") {
    return {
      action: "Pause and reduce current load immediately.",
      tradeoff: "Relief is short-term."
    };
  }

  return {
    action: "Take the fastest step to reduce immediate impact.",
    tradeoff: "Temporary and incomplete."
  };
}

/* --------------------------
   STABILIZE (context-aware)
-------------------------- */
function generateStabilize(problem, category, input) {
  const text = input.toLowerCase();

  if (category === "home") {
    return {
      action: "Repair or replace the faulty component causing the issue.",
      tradeoff: "Fixes the local problem but not system-wide wear."
    };
  }

  if (category === "software") {
    return {
      action: "Add validation, constraints, or safeguards to prevent failure.",
      tradeoff: "Improves stability but may not fix architecture."
    };
  }

  if (category === "network") {
    return {
      action: "Reposition router or install a signal extender.",
      tradeoff: "Partial improvement depending on setup."
    };
  }

  if (category === "health") {
    return {
      action: "Restructure schedule and remove unnecessary strain.",
      tradeoff: "Requires consistent follow-through."
    };
  }

  return {
    action: "Apply a more stable fix that reduces recurrence.",
    tradeoff: "Not a full solution."
  };
}

/* --------------------------
   PERMANENT (context-aware)
-------------------------- */
function generatePermanent(problem, category, input) {
  if (category === "home") {
    return {
      action: "Identify root cause and fully repair or replace the system correctly.",
      tradeoff: "Higher cost and effort."
    };
  }

  if (category === "software") {
    return {
      action: "Refactor the system to eliminate the root cause of failure.",
      tradeoff: "Requires development time."
    };
  }

  if (category === "network") {
    return {
      action: "Upgrade network hardware or redesign layout for full coverage.",
      tradeoff: "Cost and setup complexity."
    };
  }

  if (category === "health") {
    return {
      action: "Redesign lifestyle, workload, and recovery systems to prevent recurrence.",
      tradeoff: "Requires behavior change."
    };
  }

  return {
    action: "Remove the root cause completely.",
    tradeoff: "Requires time and resources."
  };
}
