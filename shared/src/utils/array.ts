export const range = (n: number): number[] => Array.from(Array(n).keys());

export const unique = <T = any>(arr: T[]): T[] =>
  [...Array.from(new Set(arr))] as T[];
