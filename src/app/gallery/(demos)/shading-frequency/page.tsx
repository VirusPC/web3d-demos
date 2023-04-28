"use client"
import { useLayoutEffect, useRef } from "react";
import { render as render1 } from "./flat-shading";
import { render as render2 } from "./gouraud-shading";
import { render as render3 } from "./phong-shading";

export default function Demo() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasRef3 = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas1 = canvasRef1.current;
    const canvas2 = canvasRef2.current;
    const canvas3 = canvasRef3.current;
    canvas1 && render1(canvas1);
    canvas2 && render2(canvas2);
    canvas3 && render3(canvas3);
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas ref={canvasRef1}></canvas>
    <canvas ref={canvasRef2}></canvas>
    <canvas ref={canvasRef3}></canvas>
  </div>
}