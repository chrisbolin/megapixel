import { Grid } from "./Grid";
import { addToSetArray } from "./utils";

const STORAGE_KEYS = {
  ALL_GRID_IDS: 'grids',
  SUFFIX_GRID_METADATA: '',
  SUFFIX_GRID_DATA: '_data',
};

export function listSavedGridIds(): Array<string> {
  const json = localStorage.getItem(STORAGE_KEYS.ALL_GRID_IDS) || '[]';
  return JSON.parse(json);
}

export function saveGrid(grid: Grid) {
  const gridIds = listSavedGridIds();
  localStorage.setItem(grid.id, JSON.stringify(grid.metadata));
  localStorage.setItem(grid.id + '_data', JSON.stringify(grid.data));
  localStorage.setItem(STORAGE_KEYS.ALL_GRID_IDS, JSON.stringify(addToSetArray(gridIds, grid.id)));
}

export function loadGrid(gridId: string): Grid {
  return new Grid({ palette: [], viewportSize: 8 });
}

export function loadMostRecentGrid(): Grid {
  return new Grid({ palette: [], viewportSize: 8 });
}