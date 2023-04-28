export {m3} from "./m3";
export {m4} from "./m4";
export function createProgramFromSources(gl: WebGL2RenderingContext, vertextShaderSource: string, fragmentShaderSource: string){
  const vertextShader = createShader(gl, gl.VERTEX_SHADER, vertextShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if(!vertextShader || !fragmentShader) return;
  const program = createProgram(gl, vertextShader, fragmentShader);
  return program;
}

export function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    console.log("cannot create shader");
    return;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram();
  if (!program) {
    console.log("cannot create program");
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log("error");
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}
 export function clearCanvas(gl: WebGL2RenderingContext, x=0, y=0, width=gl.canvas.width, height = gl.canvas.height){
  gl.clearColor(1, 1, 1, 0);
  gl.enable(gl.SCISSOR_TEST);
  gl.scissor(x, y, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.SCISSOR_TEST);
 }

 export function createFramebuffer(gl: WebGL2RenderingContext, texture: WebGLTexture) {
  const frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    texture,
    0
  );
  return frameBuffer;
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const displayWidth  = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;
 
  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
 
  return needResize;
}