import {render as render1} from "./flat-shading";
import {render as render2} from "./gouraud-shading";
import {render as render3} from "./phong-shading";
export function render(c1: HTMLCanvasElement, c2: HTMLCanvasElement, c3: HTMLCanvasElement, factor: number = 2){
  const widthSegments = 8*factor;
  const heightSegments = 4*factor;
  render1(c1, widthSegments, heightSegments);
  render2(c2, widthSegments, heightSegments);
  render3(c3, widthSegments, heightSegments);
}