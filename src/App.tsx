import React, { ReactElement, useState } from 'react';

import './App.css';

import { Grid, useGrid, Palette, FreshGridParams, NullableString, loadMostRecentGrid, newGridFromJSON, FreshGrid } from './Grid';
import { roundTo } from './utils';
import { Menu } from './Menu';
import { Settings } from './Settings';

function useAppState(defaultGridParams: FreshGridParams) {
  const [colorIndex, setColorIndex] = useState(0);
  const [view, setView] = useState('drawing');
  const gridForState = loadMostRecentGrid() || new FreshGrid(defaultGridParams);
  const [grid, setGrid] = useGrid(gridForState);

  return {
    colorIndex,
    setColorIndex,
    grid,
    setGrid,
    view,
    setView,
  };
}

export type AppState = ReturnType<typeof useAppState>;

const viewConfigs = [
  { key: 'drawing' },
  { key: 'debug' },
  { key: 'settings' },
];

export type ViewConfigs = typeof viewConfigs;

function Box(
  { color, xIndex, yIndex, pixelsPerBox }:
    { color: NullableString, yIndex: number, xIndex: number, pixelsPerBox: number }
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

function GridCanvas(
  { state, widthInBoxes, heightInBoxes, pixelsPerBox }:
    { state: AppState, widthInBoxes: number, heightInBoxes: number, pixelsPerBox: number }
) {
  const viewBox = `0 0 ${widthInBoxes * pixelsPerBox} ${heightInBoxes * pixelsPerBox}`;

  function getBoxFromEvent(event: React.TouchEvent<SVGElement>) {
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
    const { x, y } = getBoxFromEvent(event);
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

function DPad({ state }: { state: AppState }) {
  return <div className="DPad">
    <button className="colorful" onClick={() => state.grid.moveViewportByPage(-1, 0)}> ← </button>
    <button className="colorful" onClick={() => state.grid.moveViewportByPage(1, 0)}> → </button>
    <button className="colorful" onClick={() => state.grid.moveViewportByPage(0, -1)}> ↑ </button>
    <button className="colorful" onClick={() => state.grid.moveViewportByPage(0, 1)}> ↓ </button>
  </div>;
}

function DebugInfo({ grid }: { grid: Grid }) {
  const info = {
    lastSaveTimeMS: roundTo(grid.metrics.lastSaveTimeMS, 0.01),
    size: grid.size,
  };
  const infoString = JSON.stringify(info, null, 2);
  return <div>
    <code style={{ whiteSpace: 'pre-wrap' }}>
      {infoString}
    </code>
  </div>;
}

function Render({ when, children } : { when: boolean, children: ReactElement[] | ReactElement }){
  if (when) return <>{children}</>;
  return null;
}

function App() {
  const viewportSize = 9;
  const palette = ['blue', 'red', 'yellow'];
  const state = useAppState({ viewportSize, palette });
  return (
    <div className="App">
      <Render when={state.view === 'drawing'}>
        <GridCanvas
          widthInBoxes={viewportSize}
          heightInBoxes={viewportSize}
          state={state}
          pixelsPerBox={30}
          />
        <ColorPicker state={state} palette={palette} />
        <DPad state={state} />
      </Render>
      <Render when={state.view === 'settings'}>
        <Settings state={state} />
      </Render>
      <Render when={state.view === 'debug'}>
        <DebugInfo grid={state.grid} />
      </Render>
      <Menu state={state} viewConfigs={viewConfigs} />
    </div>
  );
}

export default App;
