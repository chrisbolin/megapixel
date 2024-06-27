import { useState } from "react";

export function Menu() {
  const [x, setOpen] = useState(false);
  return <div className="Menu">
    <h1>{x ? 'opened' : 'closed'}</h1>
    <MenuButton onClick={() => setOpen(true)} />
  </div>;
}

export function MenuButton({ onClick }: { onClick: Function }) {
  return <div className="MenuButton" onClick={() => onClick()}>
    <button onClick={() => null}>Open Menu</button>
  </div>;
}