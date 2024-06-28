import { AppState } from "./App";
import { newGridFromJSON } from "./Grid";
import { copyTextToClipboard, getTextFromClipboard, roundTo } from './utils';

export function Settings({ state }: { state: AppState }) {
  const onCopyClick = () => copyTextToClipboard(state.grid.toJSON());

  const onPasteClick = async () => {
    const json = await getTextFromClipboard();
    const newGrid = newGridFromJSON(json);
    if (newGrid) {
      state.setGrid(newGrid);
    }
  };

  return <>
    <button className="colorful giant" onClick={onCopyClick}>
      copy grid
    </button>
    <button className="colorful giant" onClick={onPasteClick}>
      open grid
    </button>
  </>;
}