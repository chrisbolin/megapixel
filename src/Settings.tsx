import { AppState } from "./App";
import { FreshGrid, newGridFromJSON } from "./Grid";
import { copyTextToClipboard, getTextFromClipboard, roundTo } from './utils';

export function Settings({ state }: { state: AppState }) {
  const onCopyClick = async () => {
    await copyTextToClipboard(state.grid.toJSON());
    alert('Grid copied.');
  };

  const onPasteClick = async () => {
    const json = await getTextFromClipboard();
    const newGrid = newGridFromJSON(json);
    if (newGrid) {
      state.setGrid(newGrid);
      alert('Grid loaded');
    } else {
      alert('Failed to load Grid');
    }
  };

  const onNewClick = () => {
    state.setGrid(new FreshGrid({
      palette: state.grid.palette,
      viewportSize: state.grid.viewportSize,
    }));
    alert('New Grid');
  };

  return <>
    <button className="colorful giant" onClick={onCopyClick}>
      copy grid
    </button>
    <button className="colorful giant" onClick={onPasteClick}>
      paste grid
    </button>
    <button className="colorful giant" onClick={onNewClick}>
      new grid
    </button>
  </>;
}