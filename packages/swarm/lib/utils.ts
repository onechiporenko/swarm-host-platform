import winston = require('winston');

export function assert(msg: string, condition: boolean) {
  if (!condition) {
    throw new Error(msg);
  }
}
