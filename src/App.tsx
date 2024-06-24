import React, { useState } from 'react';

import './App.css';

import { Grid, useGrid, Palette, GridContructorParams, NullableString } from './Grid';

function useAppState(defaultGridParams: GridContructorParams) {
  const [colorIndex, setColorIndex] = useState(0);
  const gridForState = new Grid(defaultGridParams);
  const grid = useGrid(gridForState);

  return {
    colorIndex,
    setColorIndex,
    grid,
  };
}

type AppState = ReturnType<typeof useAppState>;

function Box(
  { color, xIndex, yIndex, palette, pixelsPerBox }:
    { color: NullableString, yIndex: number, xIndex: number, palette: Palette, pixelsPerBox: number }
) {
  if (color === null) return null;

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

    return { x, y };
  }

  function handleTouchChange(event: React.TouchEvent<SVGElement>) {
    const { x, y } = getBoxFromEvent(state.grid, event);
    state.grid.setValue(x, y, state.colorIndex);
  }

  return <svg
    viewBox={viewBox}
    onTouchMove={handleTouchChange}
    onTouchStart={handleTouchChange}
  >
    {state.grid.visibleGrid().map((row, yIndex) => row.map((color, index) => <Box
      color={color}
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
  return <div>
    <button onClick={() => state.grid.moveViewportByPage(-1, 0)}>{'<'}</button>
    <button onClick={() => state.grid.moveViewportByPage(1, 0)}>{'>'}</button>
    <button onClick={() => state.grid.moveViewportByPage(0, -1)}>{'^'}</button>
    <button onClick={() => state.grid.moveViewportByPage(0, 1)}>{'v'}</button>
  </div>;
}

function GridInfo({ grid }: { grid: Grid }) {
  const info = {
    size: grid.size,
    viewportCorner: grid.viewportCorner,
    id: grid.id,
    updatedAt: grid.updatedAt,
  };
  const infoString = JSON.stringify(info, null, 2);
  return <div>
    <code style={{whiteSpace: 'pre-wrap'}}>
      {infoString}
    </code>
  </div>;
}

function App() {
  const viewportSize = 9;
  const palette = [ 'blue', 'red', 'yellow' ];
  const state = useAppState({ viewportSize, palette });
  const pixelsPerBox = 30;
  const widthInBoxes = viewportSize;
  const heightInBoxes = viewportSize;
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
      <GridInfo grid={state.grid} />
    </div>
  );
}

export default App;
