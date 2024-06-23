import { useState } from "react";
import { range } from "./utils";

export type NullableNumber = number | null;
type GridData = Array<Array<NullableNumber>>;
export type GridContructorParams = {
  data?: GridData,
  viewSquareSize: number,
};

export class Grid {
  data: GridData;
  notify: Function;
  viewSquareSize: number;
  viewportCorner: [number, number];

  constructor(params: GridContructorParams) {
    this.data = params.data || [];
    this.viewSquareSize = params.viewSquareSize;
    this.notify = () => {};
    this.viewportCorner = [0, 0];
  }

  get size(): [number, number] {
    const ySize = this.data.length;
    const rowLengths = this.data.map(row => row.length).filter(Boolean);
    const xSize = Math.max(...rowLengths);
    return [xSize, ySize];
  }

  valueAt(xIndex: number, yIndex: number): NullableNumber {
    const row = this.data[yIndex] || [];
    const value = row[xIndex];
    if (value === undefined) return null;
    return value;
  }

  set(xIndex: number, yIndex: number, value: number) {
    this.ensureRow(yIndex);
    this.data[yIndex][xIndex] = value;
    this.notify();
  }

  ensureRow(yIndex: number) {
    if (this.data[yIndex] === undefined) {
      this.data[yIndex] = [];
    }
  }

  visibleGrid() {
    const [x, y] = this.viewportCorner;
    return range(this.viewSquareSize).map(yOffset => {
      return range(this.viewSquareSize).map(xOffset => {
        return this.valueAt(x + xOffset, y + yOffset);
      })
    });
  }

  moveViewport() {
    const [x, y] = this.viewportCorner;
    this.viewportCorner = [x + 1, y + 1];
    this.notify();
  }

}

export function useGrid(params: GridContructorParams) {
  const [grid] = useState(new Grid(params));
  const [count, setCounter] = useState(0);
  grid.notify = () => setCounter(count + 1);
  return grid;
}
