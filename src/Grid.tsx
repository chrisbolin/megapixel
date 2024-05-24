import { range, randomInt } from "./utils";

export type NullableNumber = number | null;
type GridData = Array<Array<NullableNumber>>;

export class Grid {
  data: GridData;

  constructor(data: GridData = []) {
    this.data = data;
  }

  get(xIndex: number, yIndex: number) {
    const row = this.data[yIndex] || [];
    return row[xIndex];
  }

  set(xIndex: number, yIndex: number, value: number) {
    this.ensureRow(yIndex);
    this.data[yIndex][xIndex] = value;
  }

  ensureRow(yIndex: number) {
    if (this.data[yIndex] === undefined) {
      this.data[yIndex] = [];
    }
  }
}

export function randomGrid(x: number, y: number, max: number) {
  const data = range(y).map(() => range(x).map(() => randomInt(max)));
  return new Grid(data);
}
