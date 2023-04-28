// https://webgl2fundamentals.org/webgl/lessons/webgl-3d-orthographic.html
import { createProgramFromSources, resizeCanvasToDisplaySize, m4 } from "../../../../../helpers";
/**
 * 只考虑化简后(不考虑光源距离)的漫反射. 不考虑高光和环境光.
 * 虽然此程序用到的着色频率是逐像素。但由于传入的normal vector问题，效果和逐面一样。。。
 * 1. 定义各个顶点的normal vector 和 光源点
 * 2. 光源点 - 物体表面点，得到光源向量
 * 2. normal vector 和光源向量都先做插值，再在fragment shader里normalize到长度为1. 二者相乘得到余弦值，最后乘以颜色。
 * 3. 对官网代码做了化简：光源和normal vector都是在model space下的 https://webgl2fundamentals.org/webgl/lessons/webgl-3d-lighting-point.html
*/

const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec3 a_normal;

// A matrix to transform the positions by
uniform mat4 u_matrix;
uniform vec3 u_lightWorldPosition; // 不考虑坐标变换, 相对于模型坐标的光源位置

out vec3 v_normal;
out vec3 v_surfaceToLight;

// all shaders have a main function
void main() {
  gl_Position = u_matrix * a_position;
  v_normal =  a_normal; // 不考虑坐标变换, 相对模型坐标的normal
  v_surfaceToLight = u_lightWorldPosition -a_position.xyz;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_normal;
in vec3 v_surfaceToLight;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  // because v_normal is a varying it's interpolated
  // so it will not be a unit vector. Normalizing it
  // will make it a unit vector again
  vec3 normal = normalize(v_normal);
  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
 
  // compute the light by taking the dot product
  // of the normal to the light's reverse direction
  float light = dot(normal, surfaceToLightDirection);
 
  outColor = u_color;
 
  // Lets multiply just the color portion (not the alpha)
  // by the light
  outColor.rgb *= light;
}
`;


export function render(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = createProgramFromSources(gl,
      vertexShaderSource, fragmentShaderSource);

  if(!program) return;

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const normalLocation = gl.getAttribLocation(program, "a_normal");

  // look up uniform locations
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  const lightWorldPositionLocatoin = gl.getUniformLocation(program, "u_lightWorldPosition");

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);

  let size = 3;          // 3 components per iteration
  let type = gl.FLOAT;   // the data is 32bit floats
  let normalize = false; // don't normalize the data
  let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);
  size = 3;          // 3 components per iteration
  type = gl.FLOAT;   // the data is 32bit floats
  normalize = false; // don't normalize the data
  stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      normalLocation, size, type, normalize, stride, offset);
  gl.enableVertexAttribArray(normalLocation);



  function radToDeg(r: number) {
    return r * 180 / Math.PI;
  }

  function degToRad(d: number) {
    return d * Math.PI / 180;
  }

  // First let's make some variables
  // to hold the translation,
  const translation = [45, 150, 0];
  const rotation = [degToRad(40), degToRad(25), degToRad(325)];
  const scale = [1, 1, 1];

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

  // function updatePosition(index) {
  //   return function(event, ui) {
  //     translation[index] = ui.value;
  //     drawScene();
  //   };
  // }

  // function updateRotation(index) {
  //   return function(event, ui) {
  //     const angleInDegrees = ui.value;
  //     const angleInRadians = degToRad(angleInDegrees);
  //     rotation[index] = angleInRadians;
  //     drawScene();
  //   };
  // }

  // function updateScale(index) {
  //   return function(event, ui) {
  //     scale[index] = ui.value;
  //     drawScene();
  //   };
  // }

  // Draw the scene.
  function drawScene() {
    if(!gl || !program) return;
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
    let matrix = m4.projection(gl.canvas.width, gl.canvas.height, 400);
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);
    matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniform4fv(colorLocation, new Float32Array([0.2, 1, 0.2, 1]));
    gl.uniform3fv(lightWorldPositionLocatoin, new Float32Array([50, 70, 60]));

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }
}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl: WebGL2RenderingContext) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0,
      ]),
      gl.STATIC_DRAW);
}

function setNormals(gl: WebGL2RenderingContext) {
  var normals = new Float32Array([
          // left column front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // top rung front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // middle rung front
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // left column back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
 
          // top rung back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
 
          // middle rung back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
 
          // top
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
 
          // top rung right
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
 
          // under top rung
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
 
          // between top rung and middle
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
 
          // top of middle rung
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
 
          // right of middle rung
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
 
          // bottom of middle rung.
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
 
          // right of bottom
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
 
          // bottom
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
 
          // left side
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}