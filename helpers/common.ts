

export function createProgramFromSources(gl: WebGL2RenderingContext, vertextShaderSource: string, fragmentShaderSource: string) {
  const vertextShader = compileShader(gl, vertextShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = createProgram(gl, vertextShader, fragmentShader);
  return program;
}

/**
 * Creates and compiles a shader.
 */
function compileShader(gl: WebGL2RenderingContext,
  shaderSource: string,
  shaderType: WebGL2RenderingContext["VERTEX_SHADER"] | WebGL2RenderingContext["FRAGMENT_SHADER"]) {
  // Create the shader object
  const shader = gl.createShader(shaderType);
  if (shader === null) throw ("could not create shader");

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) throw ("could not compile shader:" + gl.getShaderInfoLog(shader));

  // gl.deleteShader(shader);

  return shader;
}



/**
 * Creates a program from 2 shaders.
*/
function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  // create a program.
  const program = gl.createProgram();
  if (program === null) throw ("could not create program");

  // attach the shaders.
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // link the program.
  gl.linkProgram(program);

  // Check if it linked.
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // something went wrong with the link; get the error
    throw ("program failed to link:" + gl.getProgramInfoLog(program));
  }

  //  gl.deleteProgram(program);

  return program;
};


export function clearCanvas(gl: WebGL2RenderingContext, x = 0, y = 0, width = gl.canvas.width, height = gl.canvas.height) {
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
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

export function loadImageTexture(gl: WebGL2RenderingContext, url: string, callback: () => void) {
  // Create a texture.
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  const image = new Image();
  image.src = url;
  image.addEventListener('load', function () {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // assumes this texture is a power of 2
    gl.generateMipmap(gl.TEXTURE_2D);
    callback();
  });
  return texture;
}