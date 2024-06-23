import React, { useState } from 'react';

import './App.css';

import { Grid, NullableNumber, useGrid } from './Grid';

function useAppState({ viewSquareSize }: { viewSquareSize: number }) {
  const [colorIndex, setColorIndex] = useState(0);
  const [viewportCorner, setViewportCorner] = useState([0, 0]);
  const grid = useGrid({ viewSquareSize });

  return {
    colorIndex,
    setColorIndex,
    viewportCorner,
    setViewportCorner,
    grid,
  };
}

type AppState = ReturnType<typeof useAppState>;

type Palette = Array<string>;

function Box(
  { value, xIndex, yIndex, palette, pixelsPerBox }:
    { value: NullableNumber, yIndex: number, xIndex: number, palette: Palette, pixelsPerBox: number }
) {
  if (value === null) return null;

  const color = palette[value];
  const oversizeDimension = pixelsPerBox + 1; // oversize the width and height to fill small gap in browser rendering
  return <rect
    width={oversizeDimension}
    height={oversizeDimension}
    fill={color}
    x={xIndex * pixelsPerBox}
    y={yIndex * pixelsPerBox}
  />;
}

function BoxGrid(
  { state, widthInBoxes, heightInBoxes, palette, pixelsPerBox }:
    { state: AppState, widthInBoxes: number, heightInBoxes: number, palette: Palette, pixelsPerBox: number }
) {
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
    const value = grid.valueAt(x, y);
    return { x, y, value };
  }

  function handleTouchChange(event: React.TouchEvent<SVGElement>) {
    const { x, y, value } = getBoxFromEvent(state.grid, event);

    if (typeof value !== 'number') {
      // no value selected
      state.grid.set(x, y, state.colorIndex);
    }
  }

  return <svg
    viewBox={viewBox}
    onTouchMove={handleTouchChange}
    onTouchStart={handleTouchChange}
  >
    {state.grid.viewSquare(state.viewportCorner[0], state.viewportCorner[1]).map((row, yIndex) => row.map((value, index) => <Box
      value={value}
      yIndex={yIndex}
      xIndex={index}
      palette={palette}
      pixelsPerBox={pixelsPerBox}
      key={index}
    />))
    }
  </svg>
}

function ColorPicker({ state, palette }: { state: AppState, palette: Palette }) {
  const dimensionInPixels = 10;
  const viewBox = `0 0 ${palette.length * dimensionInPixels} ${dimensionInPixels}`;
  return <svg viewBox={viewBox}>
    {palette.map((color, index) => {
      const active = index === state.colorIndex;
      return <rect
        onClick={() => state.setColorIndex(index)}
        key={color}
        fill={color}
        width={dimensionInPixels}
        height={dimensionInPixels}
        x={index * dimensionInPixels}
        rx={active ? 0 : dimensionInPixels / 2}
        y={0}
      />
    })
    }
  </svg>;
}

function ViewportPicker({ state }: { state: AppState }) {
  const [x, y] = state.viewportCorner;
  const handleClick = () => state.setViewportCorner([x + 1, y + 1]);
  return <button onClick={handleClick}>Move Viewport</button>;
}

function App() {
  const dimensionInBoxes = 8;
  const state = useAppState({ viewSquareSize: dimensionInBoxes });
  const pixelsPerBox = 30;
  const widthInBoxes = dimensionInBoxes;
  const heightInBoxes = dimensionInBoxes;
  const palette = ['yellow', 'blue', 'red'];
  return (
    <div className="App">
      <BoxGrid
        widthInBoxes={widthInBoxes}
        heightInBoxes={heightInBoxes}
        state={state}
        palette={palette}
        pixelsPerBox={pixelsPerBox}
      />
      <ColorPicker state={state} palette={palette} />
      <ViewportPicker state={state} />
      <div>
        viewportCorner: {JSON.stringify(state.viewportCorner)}
      </div>
      <div>
        Grid.size: {JSON.stringify(state.grid.size)}
      </div>
    </div>
  );
}

export default App;
