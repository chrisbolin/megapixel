import './App.css';

export function identity(x: any) {
  return x;
}

type NullableNumber = number | null;
type GridData<T> = Array<Array<T>>;
// [
//   [1,2],
//   [3,4],
// ]
// Grid[yIndex][xIndex]

class Grid<T> {
  data: GridData<T>;

  constructor(data: GridData<T>) {
    this.data = data;
  }

  get(xIndex: number, yIndex: number) {
    const row = this.data[yIndex] || [];
    return row[xIndex];
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
  const onClick = () => console.log([xIndex, yIndex], color);
  const baseDimension = 10;
  const oversizeDimension = baseDimension + 1; // oversize the width and height to fill small gap in browser rendering
  return <rect
    width={oversizeDimension}
    height={oversizeDimension}
    fill={color}
    x={xIndex * 10}
    y={yIndex * 10}
    onClick={onClick}
  />;
}

function BoxRow({ row, yIndex }: { row: Array<NullableNumber>, yIndex: number }) {
  return <>
    {row.map((value, index) => <Box value={value} yIndex={yIndex} xIndex={index} key={index} />)}
  </>
}

function BoxGrid({ colorsGrid }: { colorsGrid: GridData<NullableNumber> }) {
  const widthInBoxes = 6;
  const heightInBoxes = 10;
  const pixelsPerBox = 10;
  return <svg viewBox={`0 0 ${widthInBoxes * pixelsPerBox} ${heightInBoxes * pixelsPerBox}`}>
    {colorsGrid.map((row, yIndex) => <BoxRow row={row} yIndex={yIndex} key={yIndex} />)}
  </svg>
}

function App() {
  const grid = randomGrid(6, 10, 3);
  return (
    <div className="App">
      <BoxGrid colorsGrid={grid.data} />
    </div>
  );
}

export default App;
