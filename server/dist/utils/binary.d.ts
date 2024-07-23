import { Dict } from "../../../shared/src/types/dict";
import { SchemaParser } from "../schema";
export declare const BinaryReader: (data: Uint8Array) => {
    readString: (length: number) => string;
    expectString: (value: string) => boolean;
    skipString: (value: string) => void;
    readJSON: <T extends Dict = Dict>(parser?: SchemaParser<T>) => [T, T] | null;
    readUint32: () => number;
    readChunk: (length: number) => Uint8Array;
};
