"use client"
import { useLayoutEffect, useRef } from "react";
import { render } from "./orthographic";

export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    canvas && render(canvas);
  }, []);
  return <div className="flex flex-wrap py-8">
    <canvas id="c" ref={canvasRef}></canvas>
  </div>
}