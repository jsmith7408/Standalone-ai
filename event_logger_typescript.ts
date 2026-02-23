// Example: log events -> SDT-9 telemetry (TypeScript)
import { stableIdFromText } from "../ts/src/adapters";
import { sequenceTelemetry } from "../ts/src/telemetry";
import { govern } from "../ts/src/governor";

async function run() {
  const events = [
    { type: "user", text: "Find markets for peaches." },
    { type: "assistant", text: "Planning steps." },
    { type: "tool_call", text: "TOOL:search local grocers" },
    { type: "tool_result", text: "TOOL:results ..." },
    { type: "assistant", text: "Summary and next steps." },
  ];

  const ids: number[] = [];
  for (const e of events) ids.push(await stableIdFromText(e.text));

  const tel = sequenceTelemetry(ids);
  const dec = govern(tel);

  console.log({ tel, dec });
}
run();
