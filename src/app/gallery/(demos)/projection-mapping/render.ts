'use strict';

import * as twgl from "twgl.js";
import { degToRad, loadImageTexture } from "../../../../../helpers";
import { Controller } from "../../../../../components/control-panel/types";

/**
 * 核心：假设某个位置有一个texture面（类似camera），想办法将物体顶点投影回这个面
 * 1. 视空间中texture的中心点为一个相机，将顶点旋转到相机前
 * 2. 顶点向texture投影
 * 3. 将[-1, 1]的clip空间坐标变换到[0, 1]
 * 
 * 核心方法在drawScene、vs和fs里
 */

const vs = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;
uniform mat4 u_textureMatrix;

out vec2 v_texcoord;
out vec4 v_projectedTexcoord;

void main() {
  // Multiply the position by the matrix.
  vec4 worldPosition = u_world * a_position;

  gl_Position = u_projection * u_view * worldPosition;

  // Pass the texture coord to the fragment shader.
  v_texcoord = a_texcoord;

  v_projectedTexcoord = u_textureMatrix * worldPosition;
}
`;

const fs = `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;
in vec4 v_projectedTexcoord;

uniform vec4 u_colorMult;
uniform sampler2D u_texture;
uniform sampler2D u_projectedTexture;

out vec4 outColor;

void main() {
  vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;

  bool inRange = 
      projectedTexcoord.x >= 0.0 &&
      projectedTexcoord.x <= 1.0 &&
      projectedTexcoord.y >= 0.0 &&
      projectedTexcoord.y <= 1.0;

  vec4 projectedTexColor = texture(u_projectedTexture, projectedTexcoord.xy);
  vec4 texColor = texture(u_texture, v_texcoord) * u_colorMult;

  float projectedAmount = inRange ? 1.0 : 0.0;
  outColor = mix(texColor, projectedTexColor, projectedAmount);
}
`;

// draw Cube
const colorVS = `#version 300 es
in vec4 a_position;

uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_world;

void main() {
  // Multiply the position by the matrices.
  gl_Position = u_projection * u_view * u_world * a_position;
}
`;

const colorFS = `#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

export function render(canvas: HTMLCanvasElement): Controller[] {
  // Get A WebGL context
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    return [];
  }

  // setup GLSL programs
  const textureProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);
  const colorProgramInfo = twgl.createProgramInfo(gl, [colorVS, colorFS]);

  // Tell the twgl to match position with a_position,
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");

  //#region set vao and attributes
  const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(
      gl,
      1,  // radius
      12, // subdivisions around
      6,  // subdivisions down
  );
  const sphereVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, sphereBufferInfo);
  const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(
      gl,
      20,  // width
      20,  // height
      1,   // subdivisions across
      1,   // subdivisions down
  );
  const planeVAO = twgl.createVAOFromBufferInfo(
      gl, textureProgramInfo, planeBufferInfo);
  const cubeLinesBufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: [
      -1, -1, -1,
       1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
      -1, -1,  1,
       1, -1,  1,
      -1,  1,  1,
       1,  1,  1,
    ],
    indices: [
      0, 1,
      1, 3,
      3, 2,
      2, 0,

      4, 5,
      5, 7,
      7, 6,
      6, 4,

      0, 4,
      1, 5,
      3, 7,
      2, 6,
    ],
  });
  const cubeLinesVAO = twgl.createVAOFromBufferInfo(
      gl, colorProgramInfo, cubeLinesBufferInfo);
  //#endregion set vao and attributes


  //#region textures
  // make a 8x8 checkerboard texture
  const checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,                // mip level
      gl.LUMINANCE,     // internal format
      8,                // width
      8,                // height
      0,                // border
      gl.LUMINANCE,     // format
      gl.UNSIGNED_BYTE, // type
      new Uint8Array([  // data
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
      ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const imageTexture = loadImageTexture(gl, '/textures/f-texture.png', () => render());  
  //#endregion textures


  //#region settings and uniforms each object
  const settings = {
    cameraX: 2.75,
    cameraY: 5,
    posX: 2.5,
    posY: 4.8,
    posZ: 4.3,
    targetX: 2.5,
    targetY: 0,
    targetZ: 3.5,
    projWidth: 1,
    projHeight: 1,
    perspective: true,
    fieldOfView: 45,
  };


  const fieldOfViewRadians = degToRad(60);

  // Uniforms for each object.
  const planeUniforms = {
    u_colorMult: [0.5, 0.5, 1, 1],  // lightblue
    u_texture: checkerboardTexture,
    u_world: twgl.m4.translation([0, 0, 0]),
  };
  const sphereUniforms = {
    u_colorMult: [1, 0.5, 0.5, 1],  // pink
    u_texture: checkerboardTexture,
    u_world: twgl.m4.translation([2, 3, 4]),
  };
  //#endregion shared uniforms and settings

  function drawScene(projectionMatrix: twgl.m4.Mat4, cameraMatrix: twgl.m4.Mat4) {
    if(!gl) return;

    // Make a view matrix from the camera matrix.
    const viewMatrix = twgl.m4.inverse(cameraMatrix);

    const textureWorldMatrix = twgl.m4.lookAt(
        [settings.posX, settings.posY, settings.posZ],          // position
        [settings.targetX, settings.targetY, settings.targetZ], // target
        [0, 1, 0],                                              // up
    );
    const textureProjectionMatrix = settings.perspective
        ? twgl.m4.perspective(
            degToRad(settings.fieldOfView),
            settings.projWidth / settings.projHeight,
            0.1,  // near
            200)  // far
        : twgl.m4.ortho(
            -settings.projWidth / 2,   // left
             settings.projWidth / 2,   // right
            -settings.projHeight / 2,  // bottom
             settings.projHeight / 2,  // top
             0.1,                      // near
             200);                     // far

    const textureMatrix = twgl.m4.identity();
    twgl.m4.translate(textureMatrix, [0.5, 0.5, 0.5], textureMatrix);  //从[-.5, 0.5]到[0,1]
    twgl.m4.scale(textureMatrix, [0.5, 0.5, 0.5], textureMatrix);  // 从[-1, 1]到[-0.5, 0.5]
    twgl.m4.multiply(textureMatrix, textureProjectionMatrix, textureMatrix);
    // use the inverse of this world matrix to make
    // a matrix that will transform other positions
    // to be relative this this world space.
    twgl.m4.multiply(
        textureMatrix,
        twgl.m4.inverse(textureWorldMatrix),
        textureMatrix
        );

    gl.useProgram(textureProgramInfo.program);

    // set uniforms that are the same for both the sphere and plane
    twgl.setUniforms(textureProgramInfo, {
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_textureMatrix: textureMatrix,
      u_projectedTexture: imageTexture,
    });

    // ------ Draw the sphere --------

    // Setup all the needed attributes.
    gl.bindVertexArray(sphereVAO);

    // Set the uniforms unique to the sphere
    twgl.setUniforms(textureProgramInfo, sphereUniforms);

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, sphereBufferInfo);

    // ------ Draw the plane --------

    // Setup all the needed attributes.
    gl.bindVertexArray(planeVAO);

    // Set the uniforms we just computed
    twgl.setUniforms(textureProgramInfo, planeUniforms);

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, planeBufferInfo);

    // ------ Draw the cube ------

    gl.useProgram(colorProgramInfo.program);

    // Setup all the needed attributes.
    gl.bindVertexArray(cubeLinesVAO);

    // scale the cube in Z so it's really long
    // to represent the texture is being projected to
    // infinity
    const mat = twgl.m4.multiply(
        textureWorldMatrix, twgl.m4.inverse(textureProjectionMatrix));

    // Set the uniforms we just computed
    twgl.setUniforms(colorProgramInfo, {
      u_color: [0, 0, 0, 1],
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_world: mat,
    });

    // calls gl.drawArrays or gl.drawElements
    twgl.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
  }

  // Draw the scene.
  function render() {
    if(!gl) return;
    const canvas = gl?.canvas as HTMLCanvasElement;
    twgl.resizeCanvasToDisplaySize(canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Compute the projection matrix
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const projectionMatrix =
        twgl.m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    const cameraPosition = [settings.cameraX, settings.cameraY, 7];
    const target = [0, 0, 0];
    const up = [0, 1, 0];
    const cameraMatrix = twgl.m4.lookAt(cameraPosition, target, up);

    drawScene(projectionMatrix, cameraMatrix);
  }
  render();


  // webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
  //   { type: 'slider',   key: 'cameraX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'cameraY',    min:   1, max: 20, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'posX',       min: -10, max: 10, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'posY',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'posZ',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'targetX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'targetY',    min:   0, max: 20, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'targetZ',    min: -10, max: 20, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'projWidth',  min:   0, max:  2, change: render, precision: 2, step: 0.001, },
  //   { type: 'slider',   key: 'projHeight', min:   0, max:  2, change: render, precision: 2, step: 0.001, },
  //   { type: 'checkbox', key: 'perspective', change: render, },
  //   { type: 'slider',   key: 'fieldOfView', min:  1, max: 179, change: render, },
  // ]);
  return [{
    type: "number",
    label: "cameraX",
    default: settings.cameraX,
    range: [-10, 10],
    callback: (value) => {
      if(value !== null) settings.cameraX = value;
      render();
    },
    step: 0.1
  },{
    type: "number",
    label: "cameraY",
    default: settings.cameraY,
    range: [1, 20],
    callback: (value) => {
      if(value !== null) settings.cameraY = value;
      render();
    },
    step: 0.1
  },{
    type: "number",
    label: "posX",
    default: settings.posX,
    range: [-10, 10],
    callback: (value) => {
      if(value !== null) settings.posX= value;
      render();
    },
    step: 0.01
  },{
    type: "number",
    label: "posY",
    default: settings.posY,
    range: [1, 20],
    callback: (value) => {
      if(value !== null) settings.posY= value;
      render();
    },
    step: 0.01
  },{
    type: "number",
    label: "posZ",
    default: settings.posZ,
    range: [1, 20],
    callback: (value) => {
      if(value !== null) settings.posZ= value;
      render();
    },
    step: 0.01
  },{
    type: "number",
    label: "targetX",
    default: settings.targetX,
    range: [-10, 10],
    callback: (value) => {
      if(value !== null) settings.targetX= value;
      render();
    },
    step: 0.01
  },{
    type: "number",
    label: "targetY",
    default: settings.targetY,
    range: [0, 20],
    callback: (value) => {
      if(value !== null) settings.targetY= value;
      render();
    },
    step: 0.01
  },{
    type: "number",
    label: "targetX",
    default: settings.targetY,
    range: [-10, 20],
    callback: (value) => {
      if(value !== null) settings.targetY= value;
      render();
    },
    step: 0.01
  }, {
    type: "checkbox",
    label: "",
    options: [{label: "perspective", value: "perspective"}],
    default: ["perspective"],
    callback: (values) => {
      if(values.length === 1) {
        settings.perspective = true;
      } else {
        settings.perspective = false;
      }
      render();
    }
  }, {
    type: "checkbox",
    label: "",
    options: [{label: "perspective", value: "perspective"}],
    default: ["perspective"],
    callback: (values) => {
      if(values.length === 1) {
        settings.perspective = true;
      } else {
        settings.perspective = false;
      }
      render();
    }
  }]
}
  //   { type: 'checkbox', key: 'perspective', change: render, },

