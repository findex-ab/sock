"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEvent = void 0;
const event_1 = require("../../../shared/src/event");
const parseEvent = (data) => {
    const parsed = JSON.parse(data.toString());
    if (!(0, event_1.isSockEvent)(parsed))
        throw new Error(`Malformed event`);
    return parsed;
};
exports.parseEvent = parseEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXZlbnQvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQW1FO0FBRTVELE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBZ0MsRUFBYSxFQUFFO0lBQ3hFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLElBQUEsbUJBQVcsRUFBQyxNQUFNLENBQUM7UUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDN0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFBO0FBSlksUUFBQSxVQUFVLGNBSXRCIn0=
