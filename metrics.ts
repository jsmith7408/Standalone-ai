// ts/src/metrics.ts
import { SequenceTelemetry } from "./telemetry";

function l1Hist(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set<string>([...Object.keys(a), ...Object.keys(b)]);
  let s = 0;
  for (const k of keys) s += Math.abs((a[k] ?? 0) - (b[k] ?? 0));
  return s;
}

export function telemetryDistance(A: SequenceTelemetry, B: SequenceTelemetry): number {
  let d = 0;
  d += Math.abs(A.aggSpoke - B.aggSpoke) * 1.0;
  d += Math.abs(A.passMax - B.passMax) * 0.5;
  d += Math.abs(A.wrapCount - B.wrapCount) * 0.25;
  d += Math.abs(A.passJumpCount - B.passJumpCount) * 0.25;
  d += l1Hist(A.travelHist, B.travelHist) * 0.05;
  d += l1Hist(A.spokeHist, B.spokeHist) * 0.05;
  return d;
}
