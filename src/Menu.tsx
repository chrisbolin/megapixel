import { useState } from "react";
import { AppState, ViewConfigs } from "./App";

export function Menu({state, viewConfigs }: { state: AppState, viewConfigs: ViewConfigs }) {
  const [open, setOpen] = useState(false);
  const to = (viewKey: string) => () => state.setView(viewKey);

  if (open) return <div className="MenuMaximized" onClick={() => setOpen(false)}>
    {viewConfigs.map(({ key }) => 
      <button className="giant colorful" onClick={to(key)} key={key}>{key}</button>)
    }
  </div>;

  return <div className="MenuMinimized">
    <button className="giant colorful" onClick={() => setOpen(true)}>
      menu
    </button>
  </div>;
}

