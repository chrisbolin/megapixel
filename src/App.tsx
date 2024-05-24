import React from 'react';

import './App.css';

import { Grid, NullableNumber } from './Grid';

function Box({ value, xIndex, yIndex }: { value: NullableNumber, yIndex: number, xIndex: number }) {
  const colors = ['yellow', 'red', 'blue'];
  const color = value !== null ? colors[value] : 'lightgrey'; // backup color
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

function BoxRow({ row, yIndex }: { row: Array<NullableNumber>, yIndex: number }) {
  return <>
    {row.map((value, index) => <Box value={value} yIndex={yIndex} xIndex={index} key={index} />)}
  </>
}

function BoxGrid({ grid, widthInBoxes, heightInBoxes }: { grid: Grid, widthInBoxes: number, heightInBoxes: number }) {
  const [count, setCount] = React.useState(0);

  const pixelsPerBox = 10;
  const viewBox = `0 0 ${widthInBoxes * pixelsPerBox} ${heightInBoxes * pixelsPerBox}`;

  function forceUpdate() {
    setCount(count + 1);
  }

  function getBoxFromEvent(grid: Grid, event: React.TouchEvent<SVGElement>) {
    const { clientX, clientY, target } = event.touches[0];
    if (target instanceof Element && target.parentElement) {
      const x = Math.floor(clientX / target.parentElement.clientWidth * widthInBoxes);
      const y = Math.floor(clientY / target.parentElement.clientHeight * heightInBoxes);
      const value = grid.get(x, y);
      return { x, y, value };
    }
    return {};
  }

  function handleTouchChange(event: React.TouchEvent<SVGElement>) {
    const { x, y } = getBoxFromEvent(grid, event);
    if (x === undefined) return;
    grid.set(x, y, 3);
    forceUpdate();
  }

  return <svg
    viewBox={viewBox}
    onTouchMove={handleTouchChange}
    onTouchStart={handleTouchChange}
  >
    {grid.data.map((row, yIndex) => <BoxRow row={row} yIndex={yIndex} key={yIndex} />)}
  </svg >
}

function App() {
  const dimensionInBoxes = 8;
  const widthInBoxes = dimensionInBoxes;
  const heightInBoxes = dimensionInBoxes;
  const grid = new Grid();
  return (
    <div className="App">
      <BoxGrid grid={grid} widthInBoxes={widthInBoxes} heightInBoxes={heightInBoxes} />
    </div>
  );
}

export default App;
