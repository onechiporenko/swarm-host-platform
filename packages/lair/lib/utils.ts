export function isId(id: string): boolean {
  return !isNaN(parseInt(id, 10));
}

export function isArrayOfIds(list: any[]): boolean {
  return !list.some(item => !isId(item));
}

export function assert(msg: string, condition: boolean) {
  if (!condition) {
    throw new Error(msg);
  }
}

export function arrayDiff(arr1: string[], arr2: string[]): string[] {
  return arr1.filter(x => arr2.indexOf(x) < 0);
}

export function uniq(list: any[]): any[] {
  return list.filter((item ,index, collection) => collection.indexOf(item) === index);
}