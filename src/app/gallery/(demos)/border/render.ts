import { Controller } from "../../../../../components/control-panel/types";
import * as THREE from 'three';

const vertexShader = `
varying vec3 vPos;
void main()	{
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;
const fragmentShader = `

varying vec3 vPos;
uniform vec3 size;
uniform float thickness;
uniform float smoothness;
uniform vec3 fill;
uniform vec3 stroke;

void main() {
  
  float a = smoothstep(thickness, thickness + smoothness, length(abs(vPos.xy) - size.xy));
  a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.yz) - size.yz));
  a *= smoothstep(thickness, thickness + smoothness, length(abs(vPos.xz) - size.xz));
  
  vec3 c = mix(stroke, fill, a);
  
  gl_FragColor = vec4(c, 1.0);
}
`;


export function render(canvas: HTMLCanvasElement): Controller[] {
  // Creating the scene

  // Three basic things: scene, camera and renderer
  // so that we can render the scene with camera.
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer({canvas: canvas});
  renderer.setSize( canvas.clientWidth, canvas.clientHeight);


  // BoxGeometry. This is an object that contains all the points (vertices) and fill (faces) of the cube. 
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  // In addition to the geometry, we need a material to color it. 
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const material2 = new THREE.ShaderMaterial({
    uniforms: {
      size: {
        value: new THREE.Vector3(geometry.parameters.width, geometry.parameters.height, geometry.parameters.depth).multiplyScalar(0.5)
      },
      thickness: {
        value: 0.05
      },
      smoothness: {
        value: 0.05
      },
      fill: {
        value: [0.2, 0.2, 0.2]
      },
      stroke: {
        value: [1, 0, 0]
      }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
  });

  // mesh = geometry + material
  // const cube = new THREE.Mesh( geometry, material );
  const cube = new THREE.Mesh( geometry, material2 );
  scene.add( cube );

  //By default, when we call scene.add(), the thing we add will be added to the coordinates (0,0,0).
  // This would cause both the camera and the cube to be inside each other. 
  // To avoid this, we simply move the camera out a bit.
  camera.position.z = 3;

  function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
  }
  animate();

  return [];
}