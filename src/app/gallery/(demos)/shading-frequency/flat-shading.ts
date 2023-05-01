// https://webgl2fundamentals.org/webgl/lessons/webgl-3d-orthographic.html
import { SphereGeometry } from "three";
import { createProgramFromSources, resizeCanvasToDisplaySize, m4 } from "../../../../../helpers";
import { getSpherePositionsAndNormals } from "../../../../../helpers/positionGenerators";
/**
 * shading each triangle
 * 只考虑化简后(不考虑光源距离)的漫反射. 不考虑高光和环境光.
 * 虽然此程序用到的着色频率是逐像素。但由于同一个三角面的三个顶点的normal vector相同，效果等价于逐面渲染flat shading。
*/

const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_faceNormal;

uniform mat4 u_matrix;
uniform vec3 u_reverseLightDirection; // 不考虑坐标变换, 相对于模型坐标的光源位置
uniform vec4 u_color;

flat out vec4 color;

void main() {
  gl_Position = u_matrix * a_position;
  float light = dot(a_faceNormal, normalize(u_reverseLightDirection));  // 只考虑漫反射
  color = u_color * light;
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

flat in vec4 color;

out vec4 outColor;

void main() {
  outColor = color;
}
`;

export function render(canvas: HTMLCanvasElement, widthSegments = 32, heightSegments = 32) {
  canvas.width = 400;
  canvas.height = 400;
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  // enable float textre
  // const ext = gl.getExtension('OES_texture_float');
  const ext = gl.getExtension("EXT_color_buffer_float");
  if (!ext) {
    console.log(ext);
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = createProgramFromSources(gl,
    vertexShaderSource, fragmentShaderSource);

  if (!program) return;

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const faceNormalLocation = gl.getAttribLocation(program, "a_faceNormal");

  // look up uniform locations
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  const reverseLightDirectionLocatoin = gl.getUniformLocation(program, "u_reverseLightDirection");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const sphere = getSpherePositionsAndNormals(100, widthSegments, heightSegments);
  console.log(sphere);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    sphere.positions,
    // fGeometry,
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const faceNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, faceNormalBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    sphere.faceNormals,
    // fGeometry,
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(
    faceNormalLocation, 3, gl.FLOAT, true, 0, 0);
  gl.enableVertexAttribArray(faceNormalLocation);

  function radToDeg(r: number) {
    return r * 180 / Math.PI;
  }

  function degToRad(d: number) {
    return d * Math.PI / 180;
  }

  drawScene();

  // Draw the scene.
  function drawScene() {
    if (!gl || !program) return;
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
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
    let matrix = m4.projection(gl.canvas.width, gl.canvas.height, 500);
    matrix = m4.translate(matrix, gl.canvas.width / 2, gl.canvas.height / 2, 0);
    // matrix = m4.translate(matrix, 100, 100, 0);
    // matrix = m4.xRotate(matrix, rotation[0]);
    // matrix = m4.yRotate(matrix, rotation[1]);
    // matrix = m4.zRotate(matrix, rotation[2]);
    // matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniform4fv(colorLocation, new Float32Array([0.1, 0.1, 0.1, 1]));
    gl.uniform3fv(reverseLightDirectionLocatoin, new Float32Array([1, 1, -1]));

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = sphere.vertexCount;
    // const instanceCount = sphere.faceNormals.length / 3;
    gl.drawArrays(primitiveType, offset, count);
  }
}

