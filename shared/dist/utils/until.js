"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.until = void 0;
const until = (fun, interval = 500, timeout = 60000) => {
    const started = performance.now();
    let timer = undefined;
    return new Promise((resolve, _reject) => {
        if (fun()) {
            resolve(true);
            return;
        }
        timer = setInterval(() => {
            if (fun()) {
                clearInterval(timer);
                resolve(true);
                return;
            }
            const now = performance.now();
            const elapsed = now - started;
            if (elapsed >= timeout) {
                clearInterval(timer);
                resolve(false);
            }
        }, interval);
    });
};
exports.until = until;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvdW50aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRU8sTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFrQixFQUFFLFdBQW1CLEdBQUcsRUFBRSxVQUFrQixLQUFLLEVBQUUsRUFBRTtJQUMzRixNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDakMsSUFBSSxLQUFLLEdBQStDLFNBQVMsQ0FBQTtJQUNqRSxPQUFPLElBQUksT0FBTyxDQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQy9DLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztZQUNWLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNkLE9BQU87UUFDVCxDQUFDO1FBQ0QsS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDdkIsSUFBSSxHQUFHLEVBQUUsRUFBRSxDQUFDO2dCQUNWLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNkLE9BQU87WUFDVCxDQUFDO1lBRUQsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQzdCLE1BQU0sT0FBTyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUE7WUFDN0IsSUFBSSxPQUFPLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ3ZCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtnQkFDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBQ2hCLENBQUM7UUFDSCxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDZCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQTtBQXZCWSxRQUFBLEtBQUssU0F1QmpCIn0=