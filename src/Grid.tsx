import { useState } from "react";
import { range, addToSetArray } from "./utils";

export type NullableNumber = number | null;

export type NullableString = string | null;

export type GridArray = Array<Array<NullableNumber>>;

type ViewportCorner = { x: number, y: number };

type GridCore = {
  id: string,
  array: GridArray,
  viewportSize: number,
  viewportCorner: ViewportCorner,
  palette: Palette,
  createdAt: number,
  updatedAt: number,
}

export type FreshGridParams = {
  viewportSize: number,
  palette: Palette,
};

export type Palette = Array<string>;

const STORAGE_KEYS = {
  ALL_GRID_IDS: 'grids',
};

const COLOR_OUT_OF_BOUNDS = 'darkgrey';

function makeGridId(): string {
  return 'grid_' + new Date().toISOString().replace(/-|:|\.|Z/g, '').replace(/T/g, '_');
}

export class Grid {
  array: GridArray;
  notify: Function;
  viewportSize: number;
  pageSize: number;
  palette: Palette;
  viewportCorner: { x: number, y: number };
  id: string;
  updatedAt: number;
  createdAt: number;
  metrics: {
    lastSaveTimeMS: number;
    pixelCount: number;
  };

  constructor(params: GridCore) {
    this.array = params.array;
    this.viewportSize = params.viewportSize;
    this.viewportCorner = params.viewportCorner;
    this.palette = params.palette;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.id = params.id;

    this.pageSize = params.viewportSize - 1;
    this.notify = () => { };
    this.metrics = {
      lastSaveTimeMS: 0,
      pixelCount: countPixelsIn2DArray(params.array),
    };
  }

  get core(): GridCore {
    // everything needed to revive the Grid
    return {
      id: this.id,
      array: this.array,
      viewportSize: this.viewportSize,
      palette: this.palette,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      viewportCorner: this.viewportCorner,
    };
  }

  get size(): [number, number] {
    const ySize = this.array.length;
    const rowLengths = this.array.map(row => row.length).filter(Boolean);
    const xSize = Math.max(...rowLengths, 0);
    return [xSize, ySize];
  }

  valueAt(xIndex: number, yIndex: number): NullableNumber {
    if (xIndex < 0 || yIndex < 0) return -1;
    const row = this.array[yIndex] || [];
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
    this.array[y][x] = value;

    this.updatedAt = Date.now();
    this.metrics.pixelCount++;
    this.save();
  }

  toJSON() {
    return JSON.stringify(this.core);
  }

  save() {
    const t0 = performance.now();
    saveGrid(this);
    this.metrics.lastSaveTimeMS = performance.now() - t0;
    this.notify();
  };

  ensureRow(yIndex: number) {
    if (!this.array[yIndex]) {
      this.array[yIndex] = [];
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
    this.save();
  }

  moveViewportByPage(xPages: number, yPages: number) {
    this.moveViewport(xPages * this.pageSize, yPages * this.pageSize);
  }
}

export class FreshGrid extends Grid {
  constructor(freshParams: FreshGridParams) {
    const core : GridCore = {
      array: [],
      viewportCorner: { x: -1, y: -1 },
      id: makeGridId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewportSize: freshParams.viewportSize,
      palette: freshParams.palette,
    };
    super(core);
  }
}


export function useGrid(grid: Grid): [Grid, (newGrid: Grid) => void] {
  const [gridInState, _setGridInState] = useState(grid);
  const [count, setCounter] = useState(0);
  gridInState.notify = () => setCounter(count + 1);

  function setGridInState(newGrid: Grid) {
    newGrid.notify = () => setCounter(count + 1);
    _setGridInState(newGrid);
    newGrid.save();
  }
  return [gridInState, setGridInState];
}

export function newGridFromJSON(json: string): Grid | null {
  try {
    return new Grid(JSON.parse(json));
  } catch (error) {
    return null;
  }
}

function listSavedGridIds(): Array<string> {
  const json = localStorage.getItem(STORAGE_KEYS.ALL_GRID_IDS) || '[]';
  return JSON.parse(json);
}

function saveGrid(grid: Grid) {
  const gridIds = listSavedGridIds();
  localStorage.setItem(grid.id, JSON.stringify(grid.core));
  localStorage.setItem(STORAGE_KEYS.ALL_GRID_IDS, JSON.stringify(addToSetArray(gridIds, grid.id)));
}

function loadGridCore(gridId: string): GridCore | null {
  const json = localStorage.getItem(gridId);
  if (!json) return null;
  const core = JSON.parse(json);
  return {
    array: core?.data, // migration
    ...core
  };
}

export function loadMostRecentGrid(): Grid | null {
  const cores = listSavedGridIds().map(loadGridCore).sort((a, b) => {
    if (!a?.updatedAt) return 1;
    if (!b?.updatedAt) return -1;
    return b.updatedAt - a.updatedAt;
  });
  const core = cores[0];
  if (!core || core.id === undefined) return null;

  return new Grid(core);
}

function countPixelsIn2DArray(array: GridArray) {
  let count = 0;
  array.forEach(row => {
    if (row) row.forEach(element => {
      if (typeof element === 'number') count++;
    })
  });
  return count;
}