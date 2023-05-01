"use client"
import { useLayoutEffect, useRef, useState } from "react";
import { render } from "./render";
import ControlPanel from "../../../../../components/control-panel";
import { Slider } from "antd";
import { Controller } from "../../../../../components/control-panel/types";



export default function Demo() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  const [ctrls, setCtrls] = useState<Controller[]>([]);
  useLayoutEffect(() => {
    const canvas1 = canvasRef1.current;
    const canvas2 = canvasRef2.current;
    const canvas3 = canvasRef3.current;
    canvas1 && canvas2 && canvas3 && render(canvas1, canvas2, canvas3);

    const controllers: Controller[] = [{
      type: "number",
      range: [1, 4],
      label: "granularity",
      step: 1,
      default: 2,
      callback: (value)=>{
        [canvas1, canvas2, canvas3].forEach((c) => {
          const context = c?.getContext('2d');
          c&&context&&context.clearRect(0, 0, c.width, c.height);
        });
        canvas1 && canvas2 && canvas3 && render(canvas1, canvas2, canvas3, value??2);
      }
    }];
    setCtrls(controllers);

  }, []);
  return <div>
    <div className="flex flex-wrap py-8">
      <div>
        <canvas ref={canvasRef1}></canvas>
        <span className=" flex items-center justify-center">flat shading</span>
      </div>
      <div>
        <canvas ref={canvasRef2}></canvas>
        <span className=" flex items-center justify-center">gouraud shading</span>
      </div>
      <div>
        <canvas ref={canvasRef3}></canvas>
        <span className=" flex items-center justify-center">phong shading</span>
      </div>
    </div>
    <div className="">
      <div className="w-64">
        <ControlPanel controllers={ctrls}/>
      </div>
    </div>
  </div>
}