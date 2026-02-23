// ts/src/sdt9.ts
export type Spoke = 1|2|3|4|5|6|7|8|9;
export type Pass = number;   // 1..∞
export type Travel = number; // 0..8

export function spoke(n: number): Spoke {
  if (!Number.isInteger(n) || n <= 0) throw new Error("spoke(n) requires positive integer.");
  const v = 1 + ((n - 1) % 9);
  return v as Spoke;
}

export function decadePass(n: number): Pass {
  // SDT-9 decade pass: 1–9 => 1, 10–19 => 2, 20–29 => 3, ...
  if (!Number.isInteger(n) || n <= 0) throw new Error("decadePass(n) requires positive integer.");
  return Math.floor(n / 10) + 1;
}

export function reductionDepth(n: number): number {
  if (!Number.isInteger(n) || n <= 0) throw new Error("reductionDepth(n) requires positive integer.");
  let depth = 0;
  let x = n;
  while (x >= 10) {
    depth += 1;
    x = sumDigits(x);
  }
  return depth;
}

function sumDigits(n: number): number {
  let x = n;
  let s = 0;
  while (x > 0) {
    s += (x % 10);
    x = Math.floor(x / 10);
  }
  return s;
}

export function travelForward(aSpoke: number, bSpoke: number): Travel {
  return ((bSpoke - aSpoke) % 9 + 9) % 9;
}

export function travelBackward(aSpoke: number, bSpoke: number): Travel {
  return ((aSpoke - bSpoke) % 9 + 9) % 9;
}

export type SDT9Signature = {
  spoke: Spoke;
  pass: Pass;
  redDepth: number;
};

export function signature(n: number): SDT9Signature {
  return {
    spoke: spoke(n),
    pass: decadePass(n),
    redDepth: reductionDepth(n),
  };
}
