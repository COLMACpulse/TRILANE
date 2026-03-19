function resolveProblem() {
  const input = document.getElementById("problemInput").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.innerHTML = "<div class='card'>Enter a problem.</div>";
    return;
  }

  const problem = identifyProblem(input);
  const category = detectCategory(input);

  const quick = generateQuickFix(problem, category);
  const stabilize = generateStabilize(problem, category);
  const permanent = generatePermanent(problem, category);

  output.innerHTML = `
    <div class="card">
      <div class="section">
        <div class="label">PROBLEM</div>
        <div>${problem}</div>
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
   IDENTIFY (v1 clean)
-------------------------- */
function identifyProblem(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/* --------------------------
   CATEGORY DETECTION
-------------------------- */
function detectCategory(input) {
  const text = input.toLowerCase();

  if (text.includes("leak") || text.includes("water") || text.includes("pipe")) {
    return "home";
  }

  if (text.includes("app") || text.includes("bug") || text.includes("crash") || text.includes("code")) {
    return "software";
  }

  if (text.includes("tired") || text.includes("burnout") || text.includes("stress")) {
    return "health";
  }

  if (text.includes("slow") || text.includes("wifi") || text.includes("internet")) {
    return "network";
  }

  return "general";
}

/* --------------------------
   QUICK FIX
-------------------------- */
function generateQuickFix(problem, category) {
  switch (category) {
    case "home":
      return {
        action: "Stop the immediate issue (shut off source, contain damage, reduce spread).",
        tradeoff: "Temporary control only. Problem likely returns."
      };

    case "software":
      return {
        action: "Disable or bypass the failing feature to stop disruption.",
        tradeoff: "Functionality is reduced."
      };

    case "health":
      return {
        action: "Reduce load immediately (pause, rest, remove pressure).",
        tradeoff: "Does not fix underlying cause."
      };

    case "network":
      return {
        action: "Move closer to signal or reset connection.",
        tradeoff: "Short-term improvement only."
      };

    default:
      return {
        action: "Take the fastest step to reduce immediate impact.",
        tradeoff: "Likely temporary and incomplete."
      };
  }
}

/* --------------------------
   STABILIZE
-------------------------- */
function generateStabilize(problem, category) {
  switch (category) {
    case "home":
      return {
        action: "Repair or replace the failing component locally.",
        tradeoff: "May not address broader system wear."
      };

    case "software":
      return {
        action: "Add safeguards, validation, or constraints to prevent failure.",
        tradeoff: "Improves reliability but not full solution."
      };

    case "health":
      return {
        action: "Restructure workload and remove unnecessary strain.",
        tradeoff: "Requires ongoing discipline."
      };

    case "network":
      return {
        action: "Improve signal distribution (extender, router placement).",
        tradeoff: "Partial fix depending on infrastructure."
      };

    default:
      return {
        action: "Apply a more stable fix that reduces recurrence.",
        tradeoff: "Still may not eliminate root cause."
      };
  }
}

/* --------------------------
   PERMANENT FIX
-------------------------- */
function generatePermanent(problem, category) {
  switch (category) {
    case "home":
      return {
        action: "Identify root failure and rebuild or replace the system correctly.",
        tradeoff: "Higher cost and effort."
      };

    case "software":
      return {
        action: "Refactor the system to eliminate the root cause of failure.",
        tradeoff: "Requires development time and testing."
      };

    case "health":
      return {
        action: "Redesign routines and boundaries to prevent recurring overload.",
        tradeoff: "Behavior change required."
      };

    case "network":
      return {
        action: "Upgrade network hardware or reconfigure full setup.",
        tradeoff: "Cost and setup time."
      };

    default:
      return {
        action: "Remove the root cause completely.",
        tradeoff: "Requires more time and resources."
      };
  }
}
