"use client"
import { useLayoutEffect, useRef, useState } from "react";
import { render } from "./render";
import ControlPanel from "../../../../../components/control-panel";
import { Controller } from "../../../../../components/control-panel/types";

export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controllers, setControllers] = useState<Controller[]>([]);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if(canvas){
      const newConrollers = render(canvas);
      if(newConrollers) {
        console.log(newConrollers);
        setControllers(newConrollers);
      };
    }
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas id="c" className="shadow" ref={canvasRef}></canvas>
    <div className="w-64 p-5">
      <ControlPanel controllers={controllers}/>
    </div>
  </div>
}