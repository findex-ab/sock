export declare const floatBitsToUint: (f: number) => number;
export declare const hashUint32: (n: number, normalize?: boolean) => number;
export declare const generateUID: (numChars: number, inputSeed: number) => [number, string];
export type UIDGeneratorConfig = {
    uidLength: number;
};
export type TUIDGenerator = {
    next: () => string;
};
export declare const UIDGenerator: (config: UIDGeneratorConfig, inputSeed?: number) => TUIDGenerator;
