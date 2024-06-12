import { Dict } from "../../../shared/src/types/dict";

export type SchemaParser<T extends Dict = Dict> = {
  parse: (data: any) => T;
}
