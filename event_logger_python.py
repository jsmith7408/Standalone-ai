"""Example: log events -> SDT-9 telemetry (Python)."""
from __future__ import annotations
from datetime import datetime
from sdt9_ai.adapters import stable_id_from_text
from sdt9_ai.telemetry import sequence_telemetry
from sdt9_ai.governor import govern

events = [
    {"ts": datetime.utcnow().isoformat(), "type": "user", "text": "Find markets for peaches."},
    {"ts": datetime.utcnow().isoformat(), "type": "assistant", "text": "Planning steps."},
    {"ts": datetime.utcnow().isoformat(), "type": "tool_call", "text": "TOOL:search local grocers"},
    {"ts": datetime.utcnow().isoformat(), "type": "tool_result", "text": "TOOL:results ..."},
    {"ts": datetime.utcnow().isoformat(), "type": "assistant", "text": "Summary and next steps."},
]

ids = [stable_id_from_text(e["text"]) for e in events]
tel = sequence_telemetry(ids)
decision = govern(tel)

print("Telemetry:", tel)
print("Decision:", decision)
