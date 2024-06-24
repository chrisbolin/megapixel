const DEBUG = false;

export function range(length: number) {
  return new Array(length)
    .fill(0)
    .map((_, index) => index);
}

export function randomInt(upperBoundExclusive: number) {
  return Math.floor(Math.random() * upperBoundExclusive);
}

export function removeDuplicates(array: Array<any>): Array<any> {
  return Array.from(new Set(array));
}

export function addToSetArray(array: Array<any>, element: any) {
  return removeDuplicates([element, ...array]);
}

export function log(...things: any[]) {
  if (DEBUG) {
    console.log(...things);
  }
}