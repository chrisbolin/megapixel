export function range(length: number) {
  return new Array(length)
    .fill(0)
    .map((_, index) => index);
}

export function randomInt(upperBoundExclusive: number) {
  return Math.floor(Math.random() * upperBoundExclusive);
}
