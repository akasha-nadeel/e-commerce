"use client";

import { useState } from "react";

/** Mens/Womens pill toggle for the "Train In Golden Egal" section. */
export function ActivitySwitch() {
  const [mens, setMens] = useState(false);

  return (
    <div className="flex overflow-hidden rounded-none border-[1.5px] border-[#0c0c0d]">
      <button
        type="button"
        onClick={() => setMens(true)}
        className="cursor-pointer px-[26px] py-[11px] text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors"
        style={{
          background: mens ? "#0c0c0d" : "transparent",
          color: mens ? "#fff" : "#0c0c0d",
        }}
      >
        Mens
      </button>
      <button
        type="button"
        onClick={() => setMens(false)}
        className="cursor-pointer px-[26px] py-[11px] text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors"
        style={{
          background: !mens ? "#0c0c0d" : "transparent",
          color: !mens ? "#fff" : "#0c0c0d",
        }}
      >
        Womens
      </button>
    </div>
  );
}
