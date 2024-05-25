import { useState } from "react";
import { range, randomInt } from "./utils";

export type NullableNumber = number | null;
type GridData = Array<Array<NullableNumber>>;

export class Grid {
  data: GridData;
  updateCallback: Function;

  constructor(data: GridData = []) {
    this.data = data;
    this.updateCallback = () => { };
  }

  get(xIndex: number, yIndex: number) {
    const row = this.data[yIndex] || [];
    return row[xIndex];
  }

  set(xIndex: number, yIndex: number, value: number) {
    this.ensureRow(yIndex);
    this.data[yIndex][xIndex] = value;
    this.updateCallback();
  }

  ensureRow(yIndex: number) {
    if (this.data[yIndex] === undefined) {
      this.data[yIndex] = [];
    }
  }

}

export function useGrid(data?: GridData) {
  const [grid] = useState(new Grid(data));
  const [count, setCounter] = useState(0);
  grid.updateCallback = () => setCounter(count + 1);
  return grid;
}

export function randomGrid(x: number, y: number, max: number) {
  const data = range(y).map(() => range(x).map(() => randomInt(max)));
  return new Grid(data);
}
