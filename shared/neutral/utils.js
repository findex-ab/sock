// src/utils/until.ts
var until = (fun, interval = 500, timeout = 6e4) => {
  const started = performance.now();
  let timer = void 0;
  return new Promise((resolve, _reject) => {
    if (fun()) {
      resolve(true);
      return;
    }
    timer = setInterval(() => {
      if (fun()) {
        clearInterval(timer);
        resolve(true);
        return;
      }
      const now = performance.now();
      const elapsed = now - started;
      if (elapsed >= timeout) {
        clearInterval(timer);
        resolve(false);
      }
    }, interval);
  });
};

// src/utils/array.ts
var range = (n) => Array.from(Array(n).keys());

// src/utils/hash.ts
var isFloat = (x) => typeof x === "number" && (x + "").includes(".");
var floatBitsToUint = (f) => {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  if (isFloat(f)) {
    view.setFloat32(0, f);
  } else {
    view.setUint32(0, f);
  }
  return view.getUint32(0);
};
var U = floatBitsToUint;
var hashUint32 = (n, normalize = false) => {
  let x = U(n);
  let y = U(~U(n));
  let z = U((U(x * 1013) + U(11 * y)) * 7);
  z ^= z << 17;
  z ^= z >> 13;
  z ^= z << 5;
  z *= 5013;
  return U(z) / (normalize ? U(4294967295) : 1);
};
var chance = (seed) => hashUint32(seed, true) > 0.5;
var generateUID = (numChars, inputSeed) => {
  const alpha = "abcdefghijklmnopqrstuvwxyz";
  const genChar = (seed) => {
    seed = hashUint32(seed);
    const digit = chance(seed);
    seed = hashUint32(seed);
    if (digit) return [seed, (seed % 9).toString()];
    seed = hashUint32(seed);
    const c = alpha[seed % alpha.length];
    seed = hashUint32(seed);
    const upper = chance(seed);
    return [seed, upper ? c.toUpperCase() : c];
  };
  const initialState = { seed: inputSeed, tokens: [] };
  const gen = range(numChars).reduce((prev, cur) => {
    const [seed, token] = genChar(prev.seed);
    const nextSeed = hashUint32(prev.seed + 5 * hashUint32(prev.seed) + cur + seed);
    return {
      ...prev,
      tokens: [...prev.tokens, token],
      seed: nextSeed
    };
  }, initialState);
  return [gen.seed, gen.tokens.join("")];
};
var UIDGenerator = (config, inputSeed = 583281) => {
  let token = generateUID(config.uidLength, inputSeed);
  const next = () => {
    token = generateUID(config.uidLength, token[0]);
    return token[1];
  };
  return { next };
};
export {
  UIDGenerator,
  floatBitsToUint,
  generateUID,
  hashUint32,
  until
};
