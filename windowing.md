# Windowing + Telemetry

Recommended runtime behavior:

- Maintain a rolling window of recent events (e.g. last 50 or 200).
- Convert each event into an integer sequence:
  - Prefer real token IDs when available.
  - Otherwise use stable hash IDs over event.text (deterministic).
- Compute SDT-9 telemetry for that window.
- Run the governor policy against telemetry to produce actions.

Typical trigger points:
- after each assistant turn
- after each tool call/return
- periodically every N events for long streams
