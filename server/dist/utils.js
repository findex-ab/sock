var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/index.ts
var utils_exports = {};
__export(utils_exports, {
  BinaryReader: () => BinaryReader
});
module.exports = __toCommonJS(utils_exports);

// ../shared/src/utils/array.ts
var range = (n) => Array.from(Array(n).keys());

// src/utils/binary.ts
var BinaryReader = (data) => {
  let offset = 0;
  const buf = Buffer.from(data).buffer;
  const view = new DataView(buf);
  const readString = (length) => {
    const str = range(length).map((i) => String.fromCharCode(view.getUint8(offset + i))).join("");
    offset += str.length;
    return str;
  };
  const peakString = (length) => {
    const str = range(length).map((i) => String.fromCharCode(view.getUint8(offset + i))).join("");
    return str;
  };
  const skipString = (value) => {
    if (peakString(value.length) !== value) return;
    offset += value.length;
  };
  const expectString = (value) => {
    const got = readString(value.length);
    return got === value;
  };
  const readStringUntil = (substr) => {
    const len = substr.length;
    let str = "";
    let c = readString(1);
    while (offset < data.length) {
      str += c;
      if (peakString(len) === substr) break;
      c = readString(1);
    }
    return str;
  };
  const readJSON = (parser) => {
    try {
      if (!expectString("<JSON>")) return null;
      const str = readStringUntil("</JSON>");
      skipString("</JSON>");
      if (!str || str.length <= 1) return null;
      const decoded = atob(str);
      if (!decoded) return null;
      if (!decoded.startsWith("{")) return null;
      const obj = JSON.parse(decoded);
      if (parser) {
        return [parser.parse(obj), obj];
      }
      return [obj, obj];
    } catch (e) {
      console.error(e);
      return null;
    }
  };
  const readUint32 = () => {
    const num = view.getUint32(offset);
    offset += 4;
    return num;
  };
  const readChunk = (length) => {
    return data.slice(offset, offset + length);
  };
  return { readString, expectString, skipString, readJSON, readUint32, readChunk };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BinaryReader
});
