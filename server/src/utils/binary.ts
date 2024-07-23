import { Dict } from "#/shared/types";
import { range } from "#/shared/utils/array";
import { SchemaParser } from "../schema";

export const BinaryReader = (data: Uint8Array) => {
  let offset: number = 0;
  const buf = Buffer.from(data).buffer;
  const view = new DataView(buf);


  const readString = (length: number) => {
    const str = range(length).map(i => String.fromCharCode(view.getUint8(offset + i))).join('');
    offset += str.length;
    return str;
  }

  const peakString = (length: number) => {
    const str = range(length).map(i => String.fromCharCode(view.getUint8(offset + i))).join('');
    return str;
  }

  const skipString = (value: string) => {
    if (peakString(value.length) !== value) return;
    offset += value.length;
  }

  const expectString = (value: string) => {
    const got = readString(value.length);
    return got === value;
  }

  const readStringUntil = (substr: string) => {
    const len = substr.length;
    let str: string = '';
    let c = readString(1);

    while (offset < data.length) {
      str += c;
      if (peakString(len) === substr) break;
      c = readString(1);
    }

    return str;
  }

  const readJSON = <T extends Dict = Dict>(parser?: SchemaParser<T>): T | null => {
    try {
      if (!expectString('<JSON>')) return null;
      const str = readStringUntil('</JSON>');
      skipString('</JSON>');
      
      if (!str || str.length <= 1) return null;
      const decoded = atob(str);
      if (!decoded) return null;
      if (!decoded.startsWith('{')) return null;
      const obj = JSON.parse(decoded);

      if (parser) {
        return parser.parse(obj);
      }
      
      return obj as T;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  const readUint32 = () => {
    const num = view.getUint32(offset);
    offset += 4;
    return num;
  }

  const readChunk = (length: number): Uint8Array => {
    return data.slice(offset, offset + length);
  }

  return { readString, expectString, skipString, readJSON, readUint32, readChunk };
}
