import React from 'react';

import './App.css';

export function identity(x: any) {
  return x;
}

type NullableNumber = number | null;
type GridData = Array<Array<NullableNumber>>;
// [
//   [1,2],
//   [3,4],
// ]
// Grid[yIndex][xIndex]

class Grid {
  data: GridData;

  constructor(data: GridData) {
    this.data = data;
  }

  get(xIndex: number, yIndex: number) {
    const row = this.data[yIndex] || [];
    return row[xIndex];
  }

  set(xIndex: number, yIndex: number, value: number) {
    this.data[yIndex][xIndex] = value;
  }

  ensureSize(xMin: number, yMin: number) {
    // first check number rows with yMin
    // then check contents of rows with xMin
  }
}

function range(length: number) {
  return new Array(length)
    .fill(0)
    .map((_, index) => index);
}

function randomInt(upperBoundExclusive: number) {
  return Math.floor(Math.random() * upperBoundExclusive);
}

function randomGrid(x: number, y: number, max: number) {
  const data = range(y).map(() => range(x).map(() => randomInt(max)));
  return new Grid(data);
}

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
    const { x, y, value } = getBoxFromEvent(grid, event);
    if (value === undefined) return;
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
  const widthInBoxes = 7;
  const heightInBoxes = 7;
  const grid = randomGrid(widthInBoxes, heightInBoxes, 3);
  return (
    <div className="App">
      <BoxGrid grid={grid} widthInBoxes={widthInBoxes} heightInBoxes={heightInBoxes} />
    </div>
  );
}

export default App;
