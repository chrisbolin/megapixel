import React, { useState } from 'react';

import './App.css';

import { Grid, NullableNumber, useGrid } from './Grid';

function useAppState() {
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const grid = useGrid();

  return { currentColorIndex, setCurrentColorIndex, grid };
}

type AppState = ReturnType<typeof useAppState>;

type Palette = Array<string>;

function Box({ value, xIndex, yIndex, palette }: { value: NullableNumber, yIndex: number, xIndex: number, palette: Palette }) {
  const color = value !== null ? palette[value] : 'lightgrey'; // backup color
  const baseDimension = 10;
  const oversizeDimension = baseDimension + 1; // oversize the width and height to fill small gap in browser rendering
  return <rect
    width={oversizeDimension}
    height={oversizeDimension}
    fill={color}
    x={xIndex * 10}
    y={yIndex * 10}
  />;
}

function BoxRow({ row, yIndex, palette }: { row: Array<NullableNumber>, yIndex: number, palette: Palette }) {
  return <>
    {row.map((value, index) => <Box value={value} yIndex={yIndex} xIndex={index} key={index} palette={palette} />)}
  </>
}

function BoxGrid({ state, widthInBoxes, heightInBoxes, palette }: { state: AppState, widthInBoxes: number, heightInBoxes: number, palette: Palette }) {
  const pixelsPerBox = 10;
  const viewBox = `0 0 ${widthInBoxes * pixelsPerBox} ${heightInBoxes * pixelsPerBox}`;

  function getBoxFromEvent(grid: Grid, event: React.TouchEvent<SVGElement>) {
    const { clientX, clientY, target } = event.touches[0];

    if (!(target instanceof Element && target.nodeName && target.parentElement)) {
      throw new Error('Unexpected Box touch event');
    }

    let measuredElement: Element;
    if (target.nodeName === "svg") {
      measuredElement = target;
    } else if (target.nodeName === "rect") {
      measuredElement = target.parentElement;
    } else {
      throw new Error(`target.nodeName unexpected: ${target.nodeName}.`);
    }
    const x = Math.floor(clientX / measuredElement.clientWidth * widthInBoxes);
    const y = Math.floor(clientY / measuredElement.clientHeight * heightInBoxes);
    const value = grid.get(x, y);
    return { x, y, value };
  }

  function handleTouchChange(event: React.TouchEvent<SVGElement>) {
    const { x, y, value } = getBoxFromEvent(state.grid, event);

    if (typeof value !== 'number') {
      state.grid.set(x, y, state.currentColorIndex);
    } else {
      state.setCurrentColorIndex(value);
    }
  }

  return <svg
    viewBox={viewBox}
    onTouchMove={handleTouchChange}
    onTouchStart={handleTouchChange}
  >
    {state.grid.data.map((row, yIndex) => <BoxRow row={row} yIndex={yIndex} key={yIndex} palette={palette} />)}
  </svg>
}

function ColorPicker({ state, palette }: { state: AppState, palette: Palette }) {
  const dimensionInPixels = 10;
  const viewBox = `0 0 ${palette.length * dimensionInPixels} ${3 * dimensionInPixels}`;
  return <svg viewBox={viewBox}>
    {palette.map((color, index) =>
      <rect
        onClick={() => state.setCurrentColorIndex(index)}
        key={color}
        fill={color}
        width={dimensionInPixels}
        height={dimensionInPixels}
        x={index * dimensionInPixels}
        y={0}
      />)
    }
  </svg>;
}

function App() {
  const state = useAppState();
  const dimensionInBoxes = 8;
  const widthInBoxes = dimensionInBoxes;
  const heightInBoxes = dimensionInBoxes;
  const palette = ['yellow', 'blue', 'red'];
  return (
    <div className="App">
      <BoxGrid widthInBoxes={widthInBoxes} heightInBoxes={heightInBoxes} state={state} palette={palette} />
      <ColorPicker state={state} palette={palette} />
    </div>
  );
}

export default App;
