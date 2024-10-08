"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIDGenerator = exports.generateUID = exports.hashUint32 = exports.floatBitsToUint = void 0;
const array_1 = require("./array");
const isFloat = (x) => typeof x === 'number' && (x + '').includes('.');
const floatBitsToUint = (f) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    if (isFloat(f)) {
        view.setFloat32(0, f);
    }
    else {
        view.setUint32(0, f);
    }
    return view.getUint32(0);
};
exports.floatBitsToUint = floatBitsToUint;
const U = exports.floatBitsToUint;
const hashUint32 = (n, normalize = false) => {
    let x = U(n);
    let y = U(~U(n));
    let z = U((U(x * 1013) + U(11 * y)) * 7);
    z ^= z << 17;
    z ^= z >> 13;
    z ^= z << 5;
    z *= 5013;
    return U(z) / (normalize ? U(0xFFFFFFFF) : 1);
};
exports.hashUint32 = hashUint32;
const chance = (seed) => (0, exports.hashUint32)(seed, true) > 0.5;
const generateUID = (numChars, inputSeed) => {
    const alpha = 'abcdefghijklmnopqrstuvwxyz';
    const genChar = (seed) => {
        seed = (0, exports.hashUint32)(seed);
        const digit = chance(seed);
        seed = (0, exports.hashUint32)(seed);
        if (digit)
            return [seed, (seed % 9).toString()];
        seed = (0, exports.hashUint32)(seed);
        const c = alpha[seed % alpha.length];
        seed = (0, exports.hashUint32)(seed);
        const upper = chance(seed);
        return [seed, upper ? c.toUpperCase() : c];
    };
    const initialState = { seed: inputSeed, tokens: [] };
    const gen = (0, array_1.range)(numChars).reduce((prev, cur) => {
        const [seed, token] = genChar(prev.seed);
        const nextSeed = (0, exports.hashUint32)(prev.seed + 5 * (0, exports.hashUint32)(prev.seed) + cur + seed);
        return {
            ...prev,
            tokens: [...prev.tokens, token],
            seed: nextSeed
        };
    }, initialState);
    return [gen.seed, gen.tokens.join('')];
};
exports.generateUID = generateUID;
const UIDGenerator = (config, inputSeed = 583281) => {
    let token = (0, exports.generateUID)(config.uidLength, inputSeed);
    const next = () => {
        token = (0, exports.generateUID)(config.uidLength, token[0]);
        return token[1];
    };
    return { next };
};
exports.UIDGenerator = UIDGenerator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9oYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFnQztBQUVoQyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQU0sRUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUVqRixNQUFNLGVBQWUsR0FBRyxDQUFDLENBQVMsRUFBVSxFQUFFO0lBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2pDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN2QixDQUFDO1NBQU0sQ0FBQztRQUNOLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDMUIsQ0FBQyxDQUFBO0FBVFksUUFBQSxlQUFlLG1CQVMzQjtBQUVELE1BQU0sQ0FBQyxHQUFHLHVCQUFlLENBQUM7QUFFbkIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFTLEVBQUUsWUFBcUIsS0FBSyxFQUFFLEVBQUU7SUFDbEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FB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