import React, { useState } from "react";
import { range } from "./utils";

export type NullableNumber = number | null;
type GridData = Array<Array<NullableNumber>>;
export type GridContructorParams = {
  data?: GridData,
  viewportSize: number,
};

export class Grid {
  data: GridData;
  notify: Function;
  viewportSize: number;
  viewportCorner: { x: number, y: number };

  constructor(params: GridContructorParams) {
    this.data = params.data || [];
    this.viewportSize = params.viewportSize;
    this.notify = () => {};
    this.viewportCorner = { x: 0, y: 0 };
  }

  get size(): [number, number] {
    const ySize = this.data.length;
    const rowLengths = this.data.map(row => row.length).filter(Boolean);
    const xSize = Math.max(...rowLengths, 0);
    return [xSize, ySize];
  }

  valueAt(xIndex: number, yIndex: number): NullableNumber {
    const row = this.data[yIndex] || [];
    const value = row[xIndex];
    if (value === undefined) return null;
    return value;
  }

  hasValue(xIndex: number, yIndex: number) {
    const value = this.valueAt(xIndex, yIndex);
    return value !== null;
  }

  set(xIndex: number, yIndex: number, value: number) {
    const x = this.viewportCorner.x + xIndex;
    const y = this.viewportCorner.y + yIndex;

    if (this.hasValue(x, y)) return; // don't overwrite

    this.ensureRow(y);
    this.data[y][x] = value;
    this.notify();
  }

  ensureRow(yIndex: number) {
    if (this.data[yIndex] === undefined) {
      this.data[yIndex] = [];
    }
  }

  visibleGrid() {
    return range(this.viewportSize).map(yOffset => {
      return range(this.viewportSize).map(xOffset => {
        return this.valueAt(this.viewportCorner.x + xOffset, this.viewportCorner.y + yOffset);
      })
    });
  }

  moveViewport() {
    this.viewportCorner = { x: this.viewportCorner.x + 4 , y: this.viewportCorner.y + 0 };
    this.notify();
  }

}

export function useGrid(params: GridContructorParams) {
  const [grid] = useState(new Grid(params));
  const [count, setCounter] = useState(0);
  grid.notify = () => setCounter(count + 1);
  return grid;
}

export function GridInfo({ grid }: { grid: Grid }) {
  const info = {
    size: grid.size
  };
  const infoString = JSON.stringify(info, null, 2);
  return <div>
    <code style={{whiteSpace: 'pre-wrap'}}>
      {infoString}
    </code>
  </div>;
}