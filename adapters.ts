// ts/src/adapters.ts
export async function stableIdFromText(text: string, mod = 10_000_000): Promise<number> {
  const data = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", data);
  const hashArr = Array.from(new Uint8Array(hashBuf));

  let n = 0;
  for (let i = 0; i < 6; i++) n = (n * 256) + hashArr[i];
  return (n % mod) + 1;
}

export async function idsFromLines(lines: string[], mod = 10_000_000): Promise<number[]> {
  const out: number[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    out.push(await stableIdFromText(t, mod));
  }
  return out;
}

export function splitLines(text: string): string[] {
  return text.split(/\r?\n/);
}
