import { useState } from "react";
import { range } from "./utils";

export type NullableNumber = number | null;

export type NullableString = string | null;

export type GridData = Array<Array<NullableNumber>>;

export type GridContructorParams = {
  viewportSize: number,
  palette: Palette,
  data?: GridData,
};

export type Palette = Array<string>;

const COLOR_OUT_OF_BOUNDS = 'darkgrey';

export class Grid {
  data: GridData;
  notify: Function;
  viewportSize: number;
  pageSize: number;
  palette: Palette;
  viewportCorner: { x: number, y: number };

  constructor(params: GridContructorParams) {
    this.data = params.data || [];
    this.viewportSize = params.viewportSize;
    this.pageSize = params.viewportSize - 1;
    this.notify = () => {};
    this.viewportCorner = { x: -1, y: -1 };
    this.palette = params.palette;
  }

  get size(): [number, number] {
    const ySize = this.data.length;
    const rowLengths = this.data.map(row => row.length).filter(Boolean);
    const xSize = Math.max(...rowLengths, 0);
    return [xSize, ySize];
  }

  valueAt(xIndex: number, yIndex: number): NullableNumber {
    if (xIndex < 0 || yIndex < 0) return -1;
    const row = this.data[yIndex] || [];
    const value = row[xIndex];
    if (value === undefined) return null;
    return value;
  }

  colorAt(xIndex: number, yIndex: number): NullableString {
    const value = this.valueAt(xIndex, yIndex);
    if (value === null) return null;

    return this.palette[value] || COLOR_OUT_OF_BOUNDS;
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
    if (!this.inViewport(x, y)) return; // don't draw outside the viewport
    if (x < 0 || y < 0) return; // don't draw on negative indexes

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
        return this.colorAt(this.viewportCorner.x + xOffset, this.viewportCorner.y + yOffset);
      })
    });
  }

  moveViewport(xDelta: number, yDelta: number) {
    const xIndex = this.viewportCorner.x + xDelta;
    const yIndex = this.viewportCorner.y + yDelta;
    if (xIndex < -1 || yIndex < -1) return; // don't allow negative indexes

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
