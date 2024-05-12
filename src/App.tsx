import './App.css';

export function identity(x: any) {
  return x;
}

function range(length: number) {
  return new Array(length)
    .fill(0)
    .map((_, index) => index);
}

function Box({ color, xIndex, yIndex }: { color: string, yIndex: number, xIndex: number }) {
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

function BoxRow({ colors, yIndex }: { colors: Array<string>, yIndex: number }) {
  return <>
    {colors.map((color, index) => <Box color={color} yIndex={yIndex} xIndex={index} key={index} />)}
  </>
}

function BoxGrid({ colorsGrid }: { colorsGrid: Array<Array<string>> }) {
  const sideLengthInBoxes = 4;
  const sideLengthInSvgUnits = sideLengthInBoxes * 10;
  return <svg viewBox={`0 0 ${sideLengthInSvgUnits} ${sideLengthInSvgUnits}`}>
    {colorsGrid.map((colorsRow, yIndex) => <BoxRow colors={colorsRow} yIndex={yIndex} key={yIndex} />)}
  </svg>
}

function App() {
  console.log(range(10));
  return (
    <div className="App">
      <BoxGrid colorsGrid={[
        ["red", "yellow", "blue"],
        ["red", "red", "blue"],
        ["yellow", "red", "blue"],
        ["red", "yellow", "yellow"],
        ["red", "red", "blue"],
        ["yellow", "red", "blue"],
        ["red", "red", "blue"],
      ]} />
    </div>
  );
}

export default App;
