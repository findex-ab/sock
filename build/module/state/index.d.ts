import { Dict } from "#/shared/types";
export type SetStateFun<T extends Dict = Dict> = (fun: (old: T) => T) => void;
