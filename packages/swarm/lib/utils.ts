import winston = require('winston');

export function assert(msg: string, condition: boolean): void {
  if (!condition) {
    throw new Error(msg);
  }
}
