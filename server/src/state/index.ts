import { Dict } from "#/shared/types/dict";
import { ISocket } from "../socket";
export type SetStateFun<T extends Dict = Dict> = (fun: (old: T) => T) => void;

export type UseStateOptions<T extends Dict = Dict> = {
  client?: ISocket;
  transform?: (data: T) => Dict
}
