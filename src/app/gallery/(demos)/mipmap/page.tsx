"use client"
import { useLayoutEffect, useRef, useState } from "react";
import { render as render1 } from "./render";
import ControlPanel from "../../../../../components/control-panel";
import { Controller } from "../../../../../components/control-panel/types";

const settings = [
  { x: -1, y: 1, zRot: 0, magFilter: "NEAREST", minFilter: "NEAREST", },
  { x: 0, y: 1, zRot: 0, magFilter: "LINEAR", minFilter: "LINEAR", },
  { x: 1, y: 1, zRot: 0, magFilter: "LINEAR", minFilter: "NEAREST_MIPMAP_NEAREST", },
  { x: -1, y: -1, zRot: 1, magFilter: "LINEAR", minFilter: "LINEAR_MIPMAP_NEAREST", },
  { x: 0, y: -1, zRot: 1, magFilter: "LINEAR", minFilter: "NEAREST_MIPMAP_LINEAR", },
  { x: 1, y: -1, zRot: 1, magFilter: "LINEAR", minFilter: "LINEAR_MIPMAP_LINEAR", },
];

export default function Demo() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  // const [controllers, setControllers] = useState<Controller[]>([]);
  useLayoutEffect(() => {
    const canvas1 = canvasRef1.current;
    if (canvas1 === null) return;
    render1(canvas1);
    // const ctrls = render1(canvas1);
    // setControllers(ctrls);
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas ref={canvasRef1} width={600} height={600}></canvas>
    <div className="">
      <div className="p-6">
        click canvas to switch texture
      </div>
      <div className="p-6">
        {
          settings.map((setting, i) => (
            <div key={i} className=" min-w-min">{`${i}th magFilter: ${setting.magFilter} minFilter: ${setting.minFilter}`}</div>
          ))
        }
      </div>
      <div className="p-6">
        ps: minFilter: pixel &lt; texel. magFIlter: pixel &gt; texel.
      </div>

    </div>

  </div>
}