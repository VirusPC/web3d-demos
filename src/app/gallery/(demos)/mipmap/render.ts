"use strict";

import { m4 } from "twgl.js";
import { createProgramFromSources, degToRad, resizeCanvasToDisplaySize } from "../../../../../helpers";

const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec2 a_texcoord;

// A matrix to transform the positions by
uniform mat4 u_matrix;

// a constying to pass the texture coordinates to the fragment shader
out vec2 v_texcoord;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;

const zDepth = 50;

export function render(canvas: HTMLCanvasElement) {

  const gl = canvas.getContext("webgl2", {antialias: false});
  if (!gl) {
    return;
  }

  // Use our boilerplate utils to compile the shaders and link into a program
  const program = createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource);

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  // look up uniform locations
  const matrixLocation = gl.getUniformLocation(program, "u_matrix");

  // Create a buffer
  const positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  const vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Set Geometry.
  setGeometry(gl);

  gl.vertexAttribPointer(
      positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  // create the texcoord buffer, make it the current ARRAY_BUFFER
  // and copy in the texcoord values
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTexcoords(gl);

  // Turn on the attribute
  gl.enableVertexAttribArray(texcoordAttributeLocation);

  // Tell the attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  gl.vertexAttribPointer(
      texcoordAttributeLocation, 2, gl.FLOAT, true, 0, 0);

  // Create a texture with different colored mips
  const mipTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, mipTexture);
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if(!ctx) throw Error("cannot create canvas element");
  const mips = [
    { size: 64, color: "rgb(128,0,255)", },
    { size: 32, color: "rgb(0,0,255)", },
    { size: 16, color: "rgb(255,0,0)", },
    { size:  8, color: "rgb(255,255,0)", },
    { size:  4, color: "rgb(0,255,0)", },
    { size:  2, color: "rgb(0,255,255)", },
    { size:  1, color: "rgb(255,0,255)", },
  ];
  mips.forEach(function(s, level) {
     const size = s.size;
     c.width = size;
     c.height = size;
     ctx.fillStyle = "rgb(255,255,255)";
     ctx.fillRect(0, 0, size, size);
     ctx.fillStyle = s.color;
     ctx.fillRect(0, 0, size / 2, size / 2);
     ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
     gl.texImage2D(gl.TEXTURE_2D, level, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
  });


  // Create a texture.
  const texture = gl.createTexture();

  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0 + 0);

  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Fill the texture with a 1x1 blue pixel.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

  // Asynchronously load an image
  const image = new Image();
  image.src = "/textures/mip-low-res-example.png";
  image.addEventListener('load', function() {
    // Now that the image has loaded make copy it to the texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);
    drawScene();
  });

  const textures = [
    texture,
    mipTexture,
  ];
  let textureIndex = 0;

  canvas.addEventListener('click', function() {
    textureIndex = (textureIndex + 1) % textures.length;
    drawScene();
  });

  // First let's make some constiables
  // to hold the translation,
  const fieldOfViewRadians = degToRad(60);

  drawScene();

  // Draw the scene.
  function drawScene() {
    if(!gl) return;
    const canvas = gl.canvas as HTMLCanvasElement;
    resizeCanvasToDisplaySize(canvas);//, window.devicePixelRatio);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

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
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 1;
    const zFar = 2000;
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const cameraPosition = [0, 0, 2];
    const up = [0, 1, 0];
    const target = [0, 0, 0];

    // Compute the camera's matrix using look at.
    const cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    const viewMatrix = m4.inverse(cameraMatrix);

    const viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    const settings = [
      { x: -1, y:  1, zRot: 0, magFilter: gl.NEAREST, minFilter: gl.NEAREST,                 },
      { x:  0, y:  1, zRot: 0, magFilter: gl.LINEAR,  minFilter: gl.LINEAR,                  },
      { x:  1, y:  1, zRot: 0, magFilter: gl.LINEAR,  minFilter: gl.NEAREST_MIPMAP_NEAREST,  },
      { x: -1, y: -1, zRot: 1, magFilter: gl.LINEAR,  minFilter: gl.LINEAR_MIPMAP_NEAREST,   },
      { x:  0, y: -1, zRot: 1, magFilter: gl.LINEAR,  minFilter: gl.NEAREST_MIPMAP_LINEAR,   },
      { x:  1, y: -1, zRot: 1, magFilter: gl.LINEAR,  minFilter: gl.LINEAR_MIPMAP_LINEAR,    },
    ];
    const xSpacing = 1.2;
    const ySpacing = 0.7;
    settings.forEach(function(s) {
      gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, s.minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, s.magFilter);

      let matrix = m4.translate(viewProjectionMatrix, [s.x * xSpacing, s.y * ySpacing, -zDepth * 0.5]);
      matrix = m4.rotateZ(matrix, s.zRot * Math.PI);
      matrix = m4.scale(matrix, [1, 1, zDepth]);

      // Set the matrix.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
    });
  }
}

// Fill the current ARRAY_BUFFER buffer
// with the values that define a plane.
function setGeometry(gl: WebGL2RenderingContext) {
  const positions = new Float32Array([
      -0.5, 0.5, -0.5,
       0.5, 0.5, -0.5,
      -0.5, 0.5,  0.5,
      -0.5, 0.5,  0.5,
       0.5, 0.5, -0.5,
       0.5, 0.5,  0.5,
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the current ARRAY_BUFFER buffer
// with texture coordinates for a plane
function setTexcoords(gl: WebGL2RenderingContext) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          0, 0,
          1, 0,
          0, zDepth,
          0, zDepth,
          1, 0,
          1, zDepth,
      ]),
      gl.STATIC_DRAW);
}