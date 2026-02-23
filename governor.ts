// ts/src/governor.ts
import { SequenceTelemetry } from "./telemetry";

export type GovernorThresholds = {
  maxWrapRate: number;
  maxPassJumpRate: number;
  maxTravel0Rate: number;
};

export type GovernorDecision = {
  status: "ok" | "reset" | "summarize" | "tool" | "stop";
  reason: string;
  actions: Record<string, unknown>;
};

export const DefaultThresholds: GovernorThresholds = {
  maxWrapRate: 0.35,
  maxPassJumpRate: 0.20,
  maxTravel0Rate: 0.40,
};

export function govern(t: SequenceTelemetry, th: GovernorThresholds = DefaultThresholds): GovernorDecision {
  const n = t.spokes.length;
  const steps = Math.max(1, n - 1);

  const wrapRate = t.wrapCount / steps;
  const passJumpRate = t.passJumpCount / steps;
  const travel0Rate = t.travel0Count / steps;

  if (wrapRate > th.maxWrapRate && travel0Rate > (th.maxTravel0Rate / 2)) {
    return {
      status: "reset",
      reason: `High wrapRate=${wrapRate.toFixed(2)} with stalling travel0Rate=${travel0Rate.toFixed(2)}`,
      actions: { resetMemory: true, injectNewGoal: true }
    };
  }

  if (passJumpRate > th.maxPassJumpRate) {
    return {
      status: "summarize",
      reason: `High passJumpRate=${passJumpRate.toFixed(2)} suggests unstable abstraction level`,
      actions: { summarizeContext: true, compressHistory: true }
    };
  }

  if (travel0Rate > th.maxTravel0Rate) {
    return {
      status: "tool",
      reason: `High travel0Rate=${travel0Rate.toFixed(2)} suggests stuck / repeating`,
      actions: { forceToolCall: "search_or_calc" }
    };
  }

  return { status: "ok", reason: "Stable structural telemetry", actions: {} };
}
