/**
 * libGDX RandomXS128 (xorshift128+) + the StS `com.megacrit.cardcrawl.random.Random` wrapper.
 * Ground truth: desktop-1.0.jar `com.badlogic.gdx.math.RandomXS128` and
 * `com.megacrit.cardcrawl.random.Random`. 64-bit ops via BigInt.
 */

const MASK = 0xffffffffffffffffn;
const TWO64 = 0x10000000000000000n;

function u64(n: bigint): bigint {
  return n & MASK;
}

function murmurHash3(x: bigint): bigint {
  let z = u64(x);
  z ^= z >> 33n;
  z = u64(z * 0xff51afd7ed558ccdn);
  z ^= z >> 33n;
  z = u64(z * 0xc4ceb9fe1a85ec53n);
  z ^= z >> 33n;
  return z;
}

export interface RngState {
  seed0: string;
  seed1: string;
  counter: number;
}

export class StsRandom {
  private seed0: bigint;
  private seed1: bigint;
  counter = 0;

  constructor(seed: number | bigint, counter = 0) {
    const hashed = murmurHash3(BigInt(seed) === 0n ? 0x8000000000000000n : u64(BigInt(seed)));
    this.seed0 = hashed;
    this.seed1 = murmurHash3(hashed);
    for (let i = 0; i < counter; i++) this.random(999);
  }

  static fromState(s: RngState): StsRandom {
    const r = Object.create(StsRandom.prototype) as StsRandom;
    r.seed0 = BigInt(s.seed0);
    r.seed1 = BigInt(s.seed1);
    r.counter = s.counter;
    return r;
  }

  toState(): RngState {
    return { seed0: this.seed0.toString(), seed1: this.seed1.toString(), counter: this.counter };
  }

  copy(): StsRandom {
    return StsRandom.fromState(this.toState());
  }

  /** Unsigned 64-bit nextLong, matching RandomXS128.nextLong bit pattern. */
  nextLongU(): bigint {
    let s1 = this.seed0;
    const s0 = this.seed1;
    this.seed0 = s0;
    s1 ^= u64(s1 << 23n);
    this.seed1 = u64(s1 ^ s0 ^ (s1 >> 17n) ^ (s0 >> 26n));
    return u64(this.seed1 + s0);
  }

  /** Exclusive [0, n), Java RandomXS128.nextInt(n). */
  nextInt(n: number): number {
    if (n <= 0) throw new Error(`nextInt range ${n}`);
    const nB = BigInt(n);
    let bits: bigint;
    let val: bigint;
    do {
      bits = this.nextLongU() >> 1n;
      val = bits % nB;
    } while (bits - val + nB - 1n < 0n);
    return Number(val);
  }

  /** StS Random.random(range): inclusive 0..range. */
  random(range: number): number {
    this.counter++;
    return this.nextInt(range + 1);
  }

  /** StS Random.random(start, end): inclusive. */
  randomRange(start: number, end: number): number {
    this.counter++;
    return start + this.nextInt(end - start + 1);
  }

  randomBoolean(): boolean {
    this.counter++;
    return (this.nextLongU() & 1n) === 1n;
  }

  /** StS Random.randomBoolean(chance) — nextFloat() < chance. */
  randomChance(chance: number): boolean {
    this.counter++;
    return this.nextFloat() < chance;
  }

  nextFloat(): number {
    // RandomXS128.nextFloat: (nextLong >>> 40) * 2^-24
    const bits = this.nextLongU() >> 40n;
    return Number(bits) / 16777216;
  }

  shuffle<T>(arr: T[]): T[] {
    // java.util.Collections.shuffle using RandomXS128.nextInt
    for (let i = arr.length; i > 1; i--) {
      const j = this.nextInt(i);
      const a = arr[i - 1]!;
      arr[i - 1] = arr[j]!;
      arr[j] = a;
    }
    return arr;
  }
}

export function makeSeed(): number {
  return Math.floor(Math.random() * 999999999) + 1;
}
