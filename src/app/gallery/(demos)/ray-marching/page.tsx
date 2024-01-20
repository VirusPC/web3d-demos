"use client"
import { useLayoutEffect, useRef, useState } from "react";
import { render} from "./render";
import ControlPanel from "../../../../../components/control-panel";
import { Controller } from "../../../../../components/control-panel/types";

export default function Demo() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const [controllers, setControllers] = useState<Controller[]>([]);
  useLayoutEffect(() => {
    const canvas = canvasRef1.current;
    if(canvas === null) return;
    const ctrls = render(canvas);
    setControllers(ctrls);
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas id="canvas" ref={canvasRef1} width={200} height={300}></canvas>
    <div className="w-64">
      <ControlPanel controllers={controllers}/>
    </div>
  </div>
}