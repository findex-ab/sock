import { range } from "./array";

const isFloat = (x: any): x is number => typeof x === 'number' && (x + '').includes('.')

export const floatBitsToUint = (f: number): number => {
  const buffer = new ArrayBuffer(4)
  const view = new DataView(buffer)
  if (isFloat(f)) {
    view.setFloat32(0, f)
  } else {
    view.setUint32(0, f);
  }
  return view.getUint32(0)
}

const U = floatBitsToUint;

export const hashUint32 = (n: number, normalize: boolean = false) => {
  let x = U(n);
  let y = U(~U(n));
  let z = U((U(x * 1013) + U(11 * y)) * 7);
  z ^= z << 17;
  z ^= z >> 13;
  z ^= z << 5;
  z *= 5013;
  return U(z) / (normalize ? U(0xFFFFFFFF) : 1);
}

const chance = (seed: number):boolean => hashUint32(seed, true) > 0.5;

export const generateUID = (numChars: number, inputSeed: number): [number, string] => {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';

  const genChar = (seed: number): [number, string] => {
    seed = hashUint32(seed);
    const digit = chance(seed);
    seed = hashUint32(seed);
    if (digit) return [seed, (seed % 9).toString()];
    seed = hashUint32(seed);
    const c = alpha[seed % alpha.length];
    seed = hashUint32(seed);
    const upper = chance(seed);
    return [seed, upper ? c.toUpperCase() : c];
  }

  const initialState: { seed: number, tokens: string[] } = { seed: inputSeed, tokens: [] };

  const gen = range(numChars).reduce((prev, cur) => {
    const [seed, token] = genChar(prev.seed);
    const nextSeed = hashUint32(prev.seed + 5 * hashUint32(prev.seed) + cur + seed);
    return {
      ...prev,
      tokens: [...prev.tokens, token],
      seed: nextSeed
    }
  }, initialState);

  return [gen.seed, gen.tokens.join('')];
}

export type UIDGeneratorConfig = {
  uidLength: number;
}

export type TUIDGenerator = {
  next: () => string;
}

export const UIDGenerator =  (config: UIDGeneratorConfig, inputSeed: number = 583281): TUIDGenerator => {
  let token = generateUID(config.uidLength, inputSeed);

  const next = () => {
    token = generateUID(config.uidLength, token[0]);
    return token[1];
  }

  return { next };
}
