// ts/src/index.ts
import { analyzeTextLines } from "./demo";
import { renderKpis, prettyJson } from "./ui";

const input = document.getElementById("input") as HTMLTextAreaElement;
const out = document.getElementById("out") as HTMLPreElement;
const kpis = document.getElementById("kpis") as HTMLDivElement;
const runBtn = document.getElementById("run") as HTMLButtonElement;
const sampleBtn = document.getElementById("sample") as HTMLButtonElement;

function loadSample(): void {
  input.value = [
    "USER: Solve 23*47 with reduction logic.",
    "ASSISTANT: Planning steps.",
    "ASSISTANT: Computes partials.",
    "ASSISTANT: Repeats planning (possible loop).",
    "TOOL: calculator",
    "ASSISTANT: Returns result and summary."
  ].join("\n");
}

sampleBtn.addEventListener("click", () => loadSample());

runBtn.addEventListener("click", async () => {
  out.textContent = "Running…";
  try {
    const res = await analyzeTextLines(input.value);
    renderKpis(kpis, res.telemetry, res.decision);

    out.textContent = prettyJson({
      decision: res.decision,
      telemetry: {
        aggSpoke: res.telemetry.aggSpoke,
        passMax: res.telemetry.passMax,
        passSum: res.telemetry.passSum,
        wrapCount: res.telemetry.wrapCount,
        passJumpCount: res.telemetry.passJumpCount,
        travelHist: res.telemetry.travelHist,
        spokeHist: res.telemetry.spokeHist
      }
    });
  } catch (e: any) {
    out.textContent = `Error: ${e?.message ?? String(e)}`;
  }
});

// boot
loadSample();
runBtn.click();
