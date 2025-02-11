"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEvent = exports.isSockEvent = exports.ESockEvent = void 0;
var ESockEvent;
(function (ESockEvent) {
    ESockEvent["PING"] = "PING";
    ESockEvent["PONG"] = "PONG";
    ESockEvent["AUTH"] = "AUTH";
    ESockEvent["CLOSE"] = "CLOSE";
    ESockEvent["BEGIN_TRANSACTION"] = "BEGIN_TRANSACTION";
    ESockEvent["END_TRANSACTION"] = "END_TRANSACTION";
    ESockEvent["TRANSFER_RECEIVED"] = "TRANSFER_RECEIVED";
    ESockEvent["FILE_TRANSACTION"] = "FILE_TRANSACTION";
    ESockEvent["FILE_TRANSACTION_COMPLETE"] = "FILE_TRANSACTION_COMPLETE";
    ESockEvent["STATE_UPDATE"] = "STATE_UPDATE";
    ESockEvent["PULL"] = "PULL";
    ESockEvent["SUBSCRIBE"] = "SUBSCRIBE";
    ESockEvent["SUBSCRIBE_APP"] = "SUBSCRIBE_APP";
    ESockEvent["UNSUBSCRIBE_APP"] = "UNSUBSCRIBE_APP";
    ESockEvent["CLEANUP_APP"] = "CLEANUP_APP";
})(ESockEvent || (exports.ESockEvent = ESockEvent = {}));
const isSockEvent = (x) => {
    if (!x)
        return false;
    if (typeof x !== 'object')
        return false;
    return (typeof x.type === 'string' && typeof x.payload === 'object');
};
exports.isSockEvent = isSockEvent;
const parseEvent = (data) => {
    const parsed = JSON.parse(data.toString());
    if (!(0, exports.isSockEvent)(parsed))
        throw new Error(`Malformed event`);
    return parsed;
};
exports.parseEvent = parseEvent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsSUFBWSxVQWdCWDtBQWhCRCxXQUFZLFVBQVU7SUFDcEIsMkJBQWEsQ0FBQTtJQUNiLDJCQUFhLENBQUE7SUFDYiwyQkFBYSxDQUFBO0lBQ2IsNkJBQWUsQ0FBQTtJQUNmLHFEQUF1QyxDQUFBO0lBQ3ZDLGlEQUFtQyxDQUFBO0lBQ25DLHFEQUF1QyxDQUFBO0lBQ3ZDLG1EQUFxQyxDQUFBO0lBQ3JDLHFFQUF1RCxDQUFBO0lBQ3ZELDJDQUE2QixDQUFBO0lBQzdCLDJCQUFhLENBQUE7SUFDYixxQ0FBdUIsQ0FBQTtJQUN2Qiw2Q0FBK0IsQ0FBQTtJQUMvQixpREFBbUMsQ0FBQTtJQUNuQyx5Q0FBMkIsQ0FBQTtBQUM3QixDQUFDLEVBaEJXLFVBQVUsMEJBQVYsVUFBVSxRQWdCckI7QUFnQ00sTUFBTSxXQUFXLEdBQUcsQ0FBd0IsQ0FBTSxFQUFxQixFQUFFO0lBQzlFLElBQUksQ0FBQyxDQUFDO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDckIsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRO1FBQUUsT0FBTyxLQUFLLENBQUM7SUFDeEMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZFLENBQUMsQ0FBQTtBQUpZLFFBQUEsV0FBVyxlQUl2QjtBQUVNLE1BQU0sVUFBVSxHQUFHLENBQXdCLElBQWdDLEVBQWdCLEVBQUU7SUFDbEcsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztJQUMzQyxJQUFJLENBQUMsSUFBQSxtQkFBVyxFQUFJLE1BQU0sQ0FBQztRQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUNoRSxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDLENBQUE7QUFKWSxRQUFBLFVBQVUsY0FJdEIifQ==