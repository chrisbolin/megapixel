import { useState } from "react";
import { range, addToSetArray, log, sortBy } from "./utils";

export type NullableNumber = number | null;

export type NullableString = string | null;

export type GridData = Array<Array<NullableNumber>>;

export type GridContructorParams = {
  viewportSize: number,
  palette: Palette,
  data?: GridData,
  createdAt?: number,
  updatedAt?: number,
  id?: string,
};

export type Palette = Array<string>;

const STORAGE_KEYS = {
  ALL_GRID_IDS: 'grids',
  SUFFIX_GRID_METADATA: '',
  SUFFIX_GRID_DATA: '_data',
};

const COLOR_OUT_OF_BOUNDS = 'darkgrey';

function makeGridId(): string {
  return 'grid_' + new Date().toISOString().replace(/-|:|\.|Z/g,'').replace(/T/g, '_');
}

export class Grid {
  data: GridData;
  notify: Function;
  viewportSize: number;
  pageSize: number;
  palette: Palette;
  viewportCorner: { x: number, y: number };
  id: string;
  updatedAt: number;
  createdAt: number;

  constructor(params: GridContructorParams) {
    this.data = params.data || [];
    this.viewportSize = params.viewportSize;
    this.pageSize = params.viewportSize - 1;
    this.notify = () => {};
    this.viewportCorner = { x: -1, y: -1 };
    this.palette = params.palette;
    this.id = params.id || makeGridId();
    this.createdAt = params.createdAt || Date.now();
    this.updatedAt = Date.now();
  }

  get metadata(): GridContructorParams {
    // persisted metadata; everything in constructor except data
    return {
      viewportSize: this.viewportSize,
      palette: this.palette,
      createdAt: this.createdAt,
      id: this.id,
    };
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

  setValue(xIndex: number, yIndex: number, value: number) {
    const x = this.viewportCorner.x + xIndex;
    const y = this.viewportCorner.y + yIndex;

    if (this.hasValue(x, y)) return; // don't overwrite
    if (!this.inViewport(x, y)) return; // don't draw outside the viewport
    if (x < 0 || y < 0) return; // don't draw on negative indexes

    this.ensureRow(y);
    this.data[y][x] = value;

    this.updatedAt = Date.now();
    saveGrid(this);
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

export function useGrid(grid: Grid) {
  const [gridInState] = useState(grid);
  const [count, setCounter] = useState(0);
  gridInState.notify = () => setCounter(count + 1);
  return gridInState;
}

 function listSavedGridIds(): Array<string> {
  const json = localStorage.getItem(STORAGE_KEYS.ALL_GRID_IDS) || '[]';
  return JSON.parse(json);
}

function saveGrid(grid: Grid) {
  const gridIds = listSavedGridIds();
  log('listSavedGridIds', gridIds);
  localStorage.setItem(grid.id + STORAGE_KEYS.SUFFIX_GRID_METADATA, JSON.stringify(grid.metadata));
  localStorage.setItem(grid.id + STORAGE_KEYS.SUFFIX_GRID_DATA, JSON.stringify(grid.data));
  localStorage.setItem(STORAGE_KEYS.ALL_GRID_IDS, JSON.stringify(addToSetArray(gridIds, grid.id)));
}

function loadGridMetadata(gridId: string): GridContructorParams | null {
  const json = localStorage.getItem(gridId + STORAGE_KEYS.SUFFIX_GRID_METADATA);
  if (!json) return null;
  return JSON.parse(json);
}

export function loadMostRecentGrid(): Grid | null {
  const grids = listSavedGridIds().map(loadGridMetadata).sort((a, b) => {
    if (!a?.updatedAt) return -1;
    if (!b?.updatedAt) return 1;
    return a.updatedAt - b.updatedAt;
  });
  if (grids.length === 0) return null;
  
}
