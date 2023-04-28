"use client"
import { useLayoutEffect, useRef } from "react";
import { render as render1 } from "./directional-lighting";
import { render as render2 } from "./point-lighting";

export default function Demo() {
  const canvasRef1 = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas1 = canvasRef1.current;
    const canvas2 = canvasRef2.current;
    canvas1 && render1(canvas1);
    canvas2 && render2(canvas2);
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas ref={canvasRef1} width={200} height={300}></canvas>
    <canvas ref={canvasRef2} width={200} height={300}></canvas>
  </div>
}