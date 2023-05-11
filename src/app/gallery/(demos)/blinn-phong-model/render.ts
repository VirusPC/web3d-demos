import { m4 } from "twgl.js";
import { Controller } from "../../../../../components/control-panel/types";
import { createProgramFromSources, degToRad, resizeCanvasToDisplaySize } from "../../../../../helpers";
import { Matrix4, Vector4 } from "three";

// based on  https://webgl2fundamentals.org/webgl/lessons/webgl-3d-lighting-point.html

const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

void main() {
  gl_Position = u_worldViewProjection * a_position;
  v_normal = mat3(u_worldInverseTranspose) * a_normal;
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // compute the vector of the surface to the light
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  // compute the vector of the surface to the view/camera
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;

uniform vec4 u_color;
uniform float u_shininess;
uniform float u_ambient;

out vec4 outColor;

void main() {
  // because v_normal is a varying it's interpolated so it will not be a uint vector. 
  // Normalizing it will make it a unit vector again
  vec3 normal = normalize(v_normal);

  vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
  vec3 surfaceToViewDirection = normalize(v_surfaceToView);
  vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

  // compute the light by taking the dot product of the normal to the light's reverse direction.
  float light = dot(normal, surfaceToLightDirection);
  float specular = 0.0;
  if (light > 0.0) {
    specular = pow(dot(normal, halfVector), u_shininess);
  }
  

  vec3 specularLightColor = vec3(1, 1, 1);
  vec3 diffuseColor = u_color.rgb * light;
  vec3 specularColor = specularLightColor * specular;
  vec3 ambientColor = u_color.rgb * u_ambient;
  outColor = vec4((diffuseColor + specularColor + ambientColor).rgb, 1);
}
`;

export function render(canvas: HTMLCanvasElement): Controller[] {
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return [];
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

  // look up uniform locations
  const worldViewProjectionLocation =
      gl.getUniformLocation(program, "u_worldViewProjection");
  const worldInverseTransposeLocation =
      gl.getUniformLocation(program, "u_worldInverseTranspose");
  const colorLocation = gl.getUniformLocation(program, "u_color");
  const shininessLocation = gl.getUniformLocation(program, "u_shininess");
  const lightWorldPositionLocation =
      gl.getUniformLocation(program, "u_lightWorldPosition");
  const viewWorldPositionLocation =
      gl.getUniformLocation(program, "u_viewWorldPosition");
  const worldLocation =
      gl.getUniformLocation(program, "u_world");
  const ambientLocation =
      gl.getUniformLocation(program, "u_ambient");


  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);
  gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalAttributeLocation);

  // First let's make some variables
  // to hold the translation,
  const fieldOfViewRadians = degToRad(60);
  let fRotationRadians = 0;
  let shininess = 150;
  let ambient = 0.1;

  drawScene();

  // Draw the scene.
  function drawScene() {
    if(!gl) return;
    resizeCanvasToDisplaySize(canvas);

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
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    // Compute the camera's matrix
    const camera = [100, 150, 200];
    const target = [0, 35, 0];
    const up = [0, 1, 0];
    const cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix.
    const viewMatrix = m4.inverse(cameraMatrix);

    // create a viewProjection matrix. This will both apply perspective
    // AND move the world so that the camera is effectively the origin
    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // Draw a F at the origin with rotation
    const worldMatrix = m4.rotationY(fRotationRadians);
    const worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    const worldInverseMatrix = m4.inverse(worldMatrix);
    const worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(
        worldLocation, false,
        worldMatrix);
    gl.uniformMatrix4fv(
        worldViewProjectionLocation, false,
        worldViewProjectionMatrix);
    gl.uniformMatrix4fv(
        worldInverseTransposeLocation, false,
        worldInverseTransposeMatrix);

    gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green
    gl.uniform3fv(lightWorldPositionLocation, [20, 30, 60]);
    gl.uniform3fv(viewWorldPositionLocation, camera);
    gl.uniform1f(shininessLocation, shininess);
    console.log("al", ambientLocation);
    gl.uniform1f(ambientLocation, ambient);

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 16 * 6;
    gl.drawArrays(primitiveType, offset, count);
  }


  return [{
    type: "number",
    range: [-360, 360],
    default: degToRad(fRotationRadians),
    label: "fRotation",
    callback: (value) => {
      fRotationRadians = degToRad(value??0);
      drawScene();
    }
  },{
    type: "number",
    range: [1, 300],
    default: shininess,
    label: "shininess",
    callback: (value) => {
      shininess = value ?? 100;
      drawScene();
    }
  },{
    type: "number",
    range: [0, 1],
    default: ambient,
    label: "ambient",
    step: 0.1,
    callback: (value) => {
      ambient = value ?? 0;
      drawScene();
    }
  }
];

}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a letter 'F'.
function setGeometry(gl: WebGL2RenderingContext) {
  var positions = new Float32Array([
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
  ]);

  // Center the F around the origin and Flip it around. We do this because
  // we're in 3D now with and +Y is up where as before when we started with 2D
  // we had +Y as down.

  // We could do by changing all the values above but I'm lazy.
  // We could also do it with a matrix at draw time but you should
  // never do stuff at draw time if you can do it at init time.
  var matrix = m4.rotationX(Math.PI);
  matrix = m4.translate(matrix, [-50, -75, -15]);

  for (var ii = 0; ii < positions.length; ii += 3) {
    // transformVector
    // debugger;
    // var vector = m4.transformNormal(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
    // var vector = m4.transformNormal(matrix, [positions[ii + 0], positions[ii + 1], positions[ii + 2]]);
    const vector = transformVector(matrix,  [positions[ii + 0], positions[ii + 1], positions[ii + 2], 1]);
  
    positions[ii + 0] = vector[0];
    positions[ii + 1] = vector[1];
    positions[ii + 2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
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


function transformVector(m: m4.Mat4, v: [number, number, number, number], dst?: [number, number, number, number]) {
  dst = dst || [0, 0, 0, 0];
  for (var i = 0; i < 4; ++i) {
    dst[i] = 0;
    for (var j = 0; j < 4; ++j) {
      dst[i] += v[j] * m[j * 4 + i]
    }
  }
  return dst;
}