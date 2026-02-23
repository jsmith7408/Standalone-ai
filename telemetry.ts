// ts/src/telemetry.ts
import { spoke, decadePass, reductionDepth, travelForward, Spoke, Travel } from "./sdt9";

export type Histogram = Record<string, number>;

export type SequenceTelemetry = {
  ids: number[];
  spokes: Spoke[];
  passes: number[];
  depths: number[];
  travels: Travel[];

  aggSpoke: Spoke;
  passMax: number;
  passSum: number;

  wrapCount: number;
  passJumpCount: number;
  travel0Count: number;

  spokeHist: Histogram;
  travelHist: Histogram;
};

function bump(h: Histogram, k: number | string): void {
  const key = String(k);
  h[key] = (h[key] ?? 0) + 1;
}

export function aggSpokeFromSpokes(spokes: number[]): Spoke {
  if (spokes.length === 0) return 1;
  const total = spokes.reduce((a, b) => a + b, 0);
  const v = 1 + ((total - 1) % 9);
  return v as Spoke;
}

export function sequenceTelemetry(ids: number[]): SequenceTelemetry {
  if (ids.length === 0) {
    return {
      ids: [],
      spokes: [],
      passes: [],
      depths: [],
      travels: [],
      aggSpoke: 1,
      passMax: 1,
      passSum: 0,
      wrapCount: 0,
      passJumpCount: 0,
      travel0Count: 0,
      spokeHist: {},
      travelHist: {},
    };
  }

  const sp = ids.map(spoke);
  const pa = ids.map(decadePass);
  const de = ids.map(reductionDepth);

  const tr: Travel[] = [];
  let wrapCount = 0;
  let passJumpCount = 0;
  let travel0Count = 0;

  const spokeHist: Histogram = {};
  const travelHist: Histogram = {};

  for (const s of sp) bump(spokeHist, s);

  for (let i = 0; i < sp.length - 1; i++) {
    const a = sp[i];
    const b = sp[i + 1];
    const t = travelForward(a, b);
    tr.push(t);

    bump(travelHist, t);
    if (b < a) wrapCount += 1;
    if (pa[i + 1] !== pa[i]) passJumpCount += 1;
    if (t === 0) travel0Count += 1;
  }

  const passMax = Math.max(...pa);
  const passSum = pa.reduce((a, b) => a + b, 0);

  return {
    ids,
    spokes: sp,
    passes: pa,
    depths: de,
    travels: tr,
    aggSpoke: aggSpokeFromSpokes(sp),
    passMax,
    passSum,
    wrapCount,
    passJumpCount,
    travel0Count,
    spokeHist,
    travelHist,
  };
}
