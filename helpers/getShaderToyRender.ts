import {  Camera, Material, MeshRenderer, PrimitiveMesh, Script, Shader, Vector2, Vector3, WebGLEngine} from "@galacean/engine";
import { Controller } from "../components/control-panel/types";


const vertexSource = `
  uniform mat4 renderer_MVPMat;

  attribute vec3 POSITION; 

  void main() {
    gl_Position = renderer_MVPMat * vec4(POSITION, 1.0);
  }
  `;

  // ${shaderToySource}



// const fragmentSource = `
//   out vec4 fragColor;
//   // uniform vec2 iResolution;
//   // uniform float iTime;
//   void main(){
//     // fragColor = mainImage(fragColor, gl_FragCoord);
//     fragColor = vec4(1, 0, 0, 1)
//   }
// `;


export function getShaderToyRender(canvas: HTMLCanvasElement, shaderToySource: string){
  const fragmentSource = `
    uniform vec4 iResolution;
    uniform float iTime;

    ${shaderToySource}

    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);
    }
    `;
 return  (canvas: HTMLCanvasElement) => {
    WebGLEngine.create({
      canvas
    }).then((engine) => {
      // engine.canvas.resizeByClientSize();
      const scene = engine.sceneManager.scenes[0];
      const rootEntity = scene.createRootEntity();
  
  
      const cameraEntity = rootEntity.createChild('camera_entity');
      cameraEntity.transform.position = new Vector3(0, 0, -1);
      cameraEntity.transform.lookAt(new Vector3(0, 0, 0));
      const cameraComponent =  cameraEntity.addComponent(Camera);
      cameraComponent.isOrthographic = true;
  
  
      // Shader.create("rayMarching2", vertexSource, shaderToySource+fragmentSource);
      Shader.create("rayMarching2", vertexSource, fragmentSource);
  
      const shaderToy = cameraEntity.createChild("shadertoy");
      shaderToy.transform.setPosition(0, 0, -1);
      shaderToy.transform.rotate(new Vector3(90, 0, 0));
  
      const renderer = shaderToy.addComponent(MeshRenderer);
      const mesh = PrimitiveMesh.createPlane(engine, 20, 20);
      renderer.mesh = mesh;
  
      const material = new Material(engine, Shader.find("rayMarching2"));
      renderer.setMaterial(material);
  
      const shaderData = material.shaderData;
      shaderData.setVector2("iResolution", new Vector2(engine.canvas.width, engine.canvas.height));
  
      shaderToy.addComponent(ShaderToyScript);
  
      engine.run();
    });
    return [] as Controller[];
  }
  
}



class ShaderToyScript extends Script {
  iTime: number = 0;
  onUpdate(deltaTime: number): void {
    const renderer = this.entity.getComponent(MeshRenderer);
    const material = renderer?.getMaterial();
    const shaderData = material?.shaderData;
    this.iTime+=deltaTime;
    shaderData?.setFloat("iTime", this.iTime);
  }
}
