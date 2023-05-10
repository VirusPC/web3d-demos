"use client"
import { useLayoutEffect, useRef, useState } from "react";
import { render as render1 } from "./render";
import ControlPanel from "../../../../../components/control-panel";
import { Controller } from "../../../../../components/control-panel/types";

export default function Demo() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const [controllers, setControllers] = useState<Controller[]>([]);
  useLayoutEffect(() => {
    const canvas1 = canvasRef1.current;
    if(canvas1 === null) return;
    const ctrls = render1(canvas1);
    setControllers(ctrls);
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas ref={canvasRef1} width={200} height={300}></canvas>
    <div className="w-64">
      <ControlPanel controllers={controllers}/>
    </div>
  </div>
}