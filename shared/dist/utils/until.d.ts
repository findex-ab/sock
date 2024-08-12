export type UntilFunction = () => boolean;
export declare const until: (fun: UntilFunction, interval?: number, timeout?: number) => Promise<boolean>;
