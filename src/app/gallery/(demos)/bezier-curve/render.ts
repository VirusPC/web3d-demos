// https://webgl2fundamentals.org/webgl/lessons/webgl-3d-orthographic.html
import { Vector3, Vector4 } from "three";
import { Controller } from "../../../../../components/control-panel/types";
import { createProgramFromSources, resizeCanvasToDisplaySize, m4 } from "../../../../../helpers";
import { createBezier } from "./createBezier";

const bezierParams =
{
  expectNum: 10,
  controlPoints: [new Vector3(0, 0, 0), new Vector3(150, 0, 0), new Vector3(300, 300, 0)],
  // colors: new Array(10).fill(new Vector3(255, 0, 0))
  colors: [new Vector3(255, 0, 0), new Vector3(0, 255, 0), new Vector3(0, 0, 255),
    new Vector3(255, 0, 0), new Vector3(0, 255, 0), new Vector3(0, 0, 255),
    new Vector3(255, 0, 0), new Vector3(0, 255, 0), new Vector3(0, 0, 255),
    new Vector3(255, 0, 0)]
  // colors: [new Vector3(200, 0, 0), new Vector3(0, 200, 0), new Vector3(0, 0, 200)]
    // new Vector3(255, 0, 0), new Vector3(0, 255, 0), new Vector3(0, 0, 255)]
}


const vertexShaderSource = `#version 300 es
uniform mat4 u_matrix;

in vec4 a_position;
in vec4 a_color;

out vec4 v_color;

// all shaders have a main function
void main() {
  gl_Position = u_matrix * a_position;
  // gl_Position = a_position;
  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}
`;


export function render(canvas: HTMLCanvasElement) {
  canvas.width = 400;
  canvas.height = 400;
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = createProgramFromSources(gl,
    vertexShaderSource, fragmentShaderSource);

  if (!program) return;

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const colorAttributeLocation = gl.getAttribLocation(program, "a_color");
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl, bezierParams.controlPoints, bezierParams.expectNum);
  let size = 3;          // 3 components per iteration
  let type: number = gl.FLOAT;   // the data is 32bit floats
  let normalize = false; // don't normalize the data
  let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  setColors(gl, bezierParams.colors);
  size = 3;          // 3 components per iteration
  type = gl.UNSIGNED_BYTE;   // the data is 8bit unsigned bytes
  normalize = true;  // convert from 0-255 to 0.0-1.0
  stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    colorAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(colorAttributeLocation);


  function radToDeg(r: number) {
    return r * 180 / Math.PI;
  }

  function degToRad(d: number) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  // to hold the translation,
  // const translation = [45, 150, 0];
  // const rotation = [degToRad(40), degToRad(25), degToRad(325)];
  // const scale = [1, 1, 1];
  // const fieldOfViewRadians = degToRad(60);
  const translation = [0, 0, 0];
  // const rotation = [degToRad(190), degToRad(40), degToRad(30)];
  const rotation = [degToRad(0), degToRad(0), degToRad(0)];
  const scale = [1, 1, 1];
  // const fieldOfViewRadians = degToRad(60);



  drawScene();

  // // Setup a ui.
  // webglLessonsUI.setupSlider("#x",      {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  // webglLessonsUI.setupSlider("#y",      {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  // webglLessonsUI.setupSlider("#z",      {value: translation[2], slide: updatePosition(2), max: gl.canvas.height});
  // webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
  // webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
  // webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});
  // webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  // webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
  // webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2});

  // Draw the scene.
  function drawScene() {
    if (!gl || !program) return;
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // turn on depth testing
    gl.enable(gl.DEPTH_TEST);

    // tell webgl to cull faces
    gl.enable(gl.CULL_FACE);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Compute the matrix
    let matrix = m4.projection(canvas.width, canvas.height, -1);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);
    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    // gl.lineWidth(bezierParams.lineWidth); // not work
    const primitiveType = gl.LINE_STRIP;
    // const primitiveType = gl.LINES;
    const offset = 0;
    const count = bezierParams.expectNum;
    gl.drawArrays(primitiveType, offset, count);
  }

  function updatePosition(index: number) {
    return function (value: any) {
      translation[index] = value;
      drawScene();
    };
  }

  function updateRotation(index: number) {
    return function (value: any) {
      const angleInDegrees = value;
      const angleInRadians = degToRad(angleInDegrees);
      rotation[index] = angleInRadians;
      drawScene();
    };
  }

  function updateScale(index: number) {
    return function (value: any) {
      scale[index] = value;
      drawScene();
    };
  }
  const controllers: Controller[] = [{
    type: "number",
    label: "x",
    default: translation[0],
    range: [-150, 100],
    callback: updatePosition(0)
  },
  {
    type: "number",
    label: "y",
    default: translation[1],
    range: [0, 300],
    callback: updatePosition(1)
  },
  {
    type: "number",
    label: "z",
    default: translation[2],
    range: [-500, -200],
    callback: updatePosition(2)
  }, {
    type: "number",
    label: "angleX",
    default: radToDeg(rotation[0]),
    range: [0, 360],
    callback: updateRotation(0)
  },
  {
    type: "number",
    label: "angleY",
    default: radToDeg(rotation[1]),
    range: [0, 360],
    callback: updateRotation(1)
  },
  {
    type: "number",
    label: "angleZ",
    default: radToDeg(rotation[2]),
    range: [0, 360],
    callback: updateRotation(2)
  },{
    type: "number",
    label: "scaleX",
    default: scale[0],
    range: [0.1, 10],
    callback: updateScale(0)
  },{
    type: "number",
    label: "scaleY",
    default: scale[1],
    range: [0.1, 10],
    callback: updateScale(1)
  },{
    type: "number",
    label: "scaleZ",
    default: scale[2],
    range: [0.1, 10],
    callback: updateScale(2)
  },
  ]

  return controllers;
}



// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl: WebGL2RenderingContext, controlPoints: Vector3[], expectedNum:number) {
  const bezierLine = createBezier(controlPoints, expectedNum, 1)
    .flatMap(point => [point.x, point.y, point.z]);
    console.log(bezierLine);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(bezierLine),
    gl.STATIC_DRAW);
}

// Fill the current ARRAY_BUFFER buffer with colors for the 'F'.
function setColors(gl: WebGL2RenderingContext, colors: Vector3[]) {
  const flatColors = colors.flatMap(color => [color.x, color.y, color.z]);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Uint8Array(flatColors),
    gl.STATIC_DRAW);
}