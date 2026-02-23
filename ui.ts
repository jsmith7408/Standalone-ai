// ts/src/ui.ts
import type { SequenceTelemetry } from "./telemetry";
import type { GovernorDecision } from "./governor";

export function renderKpis(el: HTMLElement, t: SequenceTelemetry, d: GovernorDecision): void {
  const steps = Math.max(1, t.spokes.length - 1);
  const wrapRate = (t.wrapCount / steps);
  const passJumpRate = (t.passJumpCount / steps);
  const travel0Rate = (t.travel0Count / steps);

  el.innerHTML = `
    <div><b>Decision</b><br>${d.status}</div>
    <div><b>aggSpoke</b><br>${t.aggSpoke}</div>
    <div><b>passMax</b><br>${t.passMax}</div>
    <div><b>wrapRate</b><br>${wrapRate.toFixed(2)}</div>
    <div><b>passJumpRate</b><br>${passJumpRate.toFixed(2)}</div>
    <div><b>travel0Rate</b><br>${travel0Rate.toFixed(2)}</div>
  `;
}

export function prettyJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
