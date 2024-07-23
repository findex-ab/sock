"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryReader = void 0;
const array_1 = require("#/shared/utils/array");
const BinaryReader = (data) => {
    let offset = 0;
    const buf = Buffer.from(data).buffer;
    const view = new DataView(buf);
    const readString = (length) => {
        const str = (0, array_1.range)(length).map(i => String.fromCharCode(view.getUint8(offset + i))).join('');
        offset += str.length;
        return str;
    };
    const peakString = (length) => {
        const str = (0, array_1.range)(length).map(i => String.fromCharCode(view.getUint8(offset + i))).join('');
        return str;
    };
    const skipString = (value) => {
        if (peakString(value.length) !== value)
            return;
        offset += value.length;
    };
    const expectString = (value) => {
        const got = readString(value.length);
        return got === value;
    };
    const readStringUntil = (substr) => {
        const len = substr.length;
        let str = '';
        let c = readString(1);
        while (offset < data.length) {
            str += c;
            if (peakString(len) === substr)
                break;
            c = readString(1);
        }
        return str;
    };
    const readJSON = (parser) => {
        try {
            if (!expectString('<JSON>'))
                return null;
            const str = readStringUntil('</JSON>');
            skipString('</JSON>');
            if (!str || str.length <= 1)
                return null;
            const decoded = atob(str);
            if (!decoded)
                return null;
            if (!decoded.startsWith('{'))
                return null;
            const obj = JSON.parse(decoded);
            if (parser) {
                return parser.parse(obj);
            }
            return obj;
        }
        catch (e) {
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
exports.BinaryReader = BinaryReader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2JpbmFyeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnREFBNkM7QUFHdEMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFnQixFQUFFLEVBQUU7SUFDL0MsSUFBSSxNQUFNLEdBQVcsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3JDLE1BQU0sSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRy9CLE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUU7UUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBQSxhQUFLLEVBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ3JCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQyxDQUFBO0lBRUQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRTtRQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFBLGFBQUssRUFBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDNUYsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLENBQUE7SUFFRCxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQWEsRUFB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