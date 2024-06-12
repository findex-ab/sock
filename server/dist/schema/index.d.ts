import { Dict } from "#/shared/types/dict";
export type SchemaParser<T extends Dict = Dict> = {
    parse: (data: any) => T;
};
