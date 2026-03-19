function resolveProblem() {
  const input = document.getElementById("problemInput").value.trim();
  const output = document.getElementById("output");

  if (!input) {
    output.innerHTML = "<div class='card'>Enter a problem.</div>";
    return;
  }

  const problem = identifyProblem(input);

  const quick = generateQuickFix(problem);
  const stabilize = generateStabilize(problem);
  const permanent = generatePermanent(problem);

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
   CORE ENGINE (v1 SIMPLE)
-------------------------- */

function identifyProblem(input) {
  // v1 = clean restatement (later we make this smarter)
  return input;
}

/* QUICK FIX */
function generateQuickFix(problem) {
  return {
    action: "Take the fastest possible action to reduce immediate impact or discomfort.",
    tradeoff: "Does not solve root cause. Likely temporary."
  };
}

/* STABILIZE */
function generateStabilize(problem) {
  return {
    action: "Apply a more durable fix that reduces recurrence and buys time.",
    tradeoff: "Improves stability but may not eliminate underlying issue."
  };
}

/* PERMANENT */
function generatePermanent(problem) {
  return {
    action: "Identify and eliminate the root cause completely.",
    tradeoff: "Requires more time, effort, or resources."
  };
}
