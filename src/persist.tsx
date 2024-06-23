import { Grid } from "./Grid";

export function listSavedGrids() {

}

export function saveGrid(grid: Grid) {

}

export function loadGrid(gridId: string): Grid {
  return new Grid({ palette: [], viewportSize: 8 });
}

export function loadMostRecentGrid(): Grid {
  return new Grid({ palette: [], viewportSize: 8 });
}