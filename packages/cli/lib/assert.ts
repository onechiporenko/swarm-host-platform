export function assert(msg: string, condition: boolean): void {
  if (!condition) {
    throw new Error(msg);
  }
}
