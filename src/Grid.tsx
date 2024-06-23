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
  pageSize: number;
  viewportCorner: { x: number, y: number };

  constructor(params: GridContructorParams) {
    this.data = params.data || [];
    this.viewportSize = params.viewportSize;
    this.pageSize = params.viewportSize - 1;
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

  inViewport(xIndex: number, yIndex: number) {
    if (xIndex < this.viewportCorner.x) return false;
    if (yIndex < this.viewportCorner.y) return false;
    if (xIndex >= this.viewportCorner.x + this.viewportSize) return false;
    if (yIndex >= this.viewportCorner.y + this.viewportSize) return false;
    return true;
  }

  set(xIndex: number, yIndex: number, value: number) {
    const x = this.viewportCorner.x + xIndex;
    const y = this.viewportCorner.y + yIndex;

    if (this.hasValue(x, y)) return; // don't overwrite
    if (!this.inViewport(x, y)) return;

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

  moveViewport(xDelta: number, yDelta: number) {
    const xIndex = this.viewportCorner.x + xDelta;
    const yIndex = this.viewportCorner.y + yDelta;
    if (xIndex < 0 || yIndex < 0) return; // don't allow negative indexes

    this.viewportCorner = {
      x: xIndex,
      y: yIndex
    };
    this.notify();
  }

  moveViewportByPage(xPages: number, yPages: number) {
    this.moveViewport(xPages * this.pageSize, yPages * this.pageSize);
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
    size: grid.size,
    viewportCorner: grid.viewportCorner,
  };
  const infoString = JSON.stringify(info, null, 2);
  return <div>
    <code style={{whiteSpace: 'pre-wrap'}}>
      {infoString}
    </code>
  </div>;
}