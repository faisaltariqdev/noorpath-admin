"use client";

import { memo, useMemo, useState } from "react";
import { joinColorUnits, segmentColorUnits } from "../data/colorfulLetters";

function ColorfulLetters({ text }: { text: string }) {
  const units = useMemo(() => segmentColorUnits(text), [text]);
  const [focus, setFocus] = useState<number | null>(null);

  if (joinColorUnits(units) !== text) {
    return <>{text}</>;
  }

  return (
    <>
      {units.map((unit, index) => (
        unit.color === null ? (
          <span key={index}>{unit.glyph}</span>
        ) : (
          <span
            key={index}
            className={`hq-cl hq-cl-${unit.color}${focus === index ? " is-focus" : ""}`}
            onPointerDown={() => setFocus(index)}
          >
            {unit.glyph}
          </span>
        )
      ))}
    </>
  );
}

export default memo(ColorfulLetters);
