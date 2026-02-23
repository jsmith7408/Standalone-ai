// ts/src/demo.ts
import { splitLines, idsFromLines } from "./adapters";
import { sequenceTelemetry } from "./telemetry";
import { govern } from "./governor";

export type DemoResult = {
  ids: number[];
  telemetry: ReturnType<typeof sequenceTelemetry>;
  decision: ReturnType<typeof govern>;
};

export async function analyzeTextLines(input: string): Promise<DemoResult> {
  const lines = splitLines(input);
  const ids = await idsFromLines(lines);
  const telemetry = sequenceTelemetry(ids);
  const decision = govern(telemetry);
  return { ids, telemetry, decision };
}
