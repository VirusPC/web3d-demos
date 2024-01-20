import {  Camera, Material, MeshRenderer, Pointer, PrimitiveMesh, Script, Shader, ShaderData, Vector2, Vector3, Vector4, WebGLEngine} from "@galacean/engine";
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


/**
 * TODO: iChannel/iMouse(right click)
 * @param canvas 
 * @param shaderToySource 
 * @returns 
 */
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
      shaderData.setFloat("iSampleRate", engine.targetFrameRate);
  
      shaderToy.addComponent(ShaderToyScript);

      const bbox = canvas.getBoundingClientRect();

      let isClicked = 0;
      let isContextClicked = 0;
      canvas.addEventListener('pointerdown', (evt) => {
        isClicked = 1;
      });
      canvas.addEventListener('pointerdown', (evt) => {
        isClicked = 0;
      });
      const poitnerEvents: ("pointerdown" | "pointermove" | "pointerup")[]= ['pointerdown', 'pointermove', 'pointerup'];
      poitnerEvents.forEach((evtName) => {
        canvas.addEventListener(evtName, (evt: PointerEvent) => {
          shaderData?.setVector4("iMouse", new Vector4(
            (evt.x-bbox.x) / cameraComponent.aspectRatio, 
            (evt.y-bbox.y) / cameraComponent.aspectRatio, 
            isClicked, 0));
        });

      });
  
      engine.run();
    });
    return [] as Controller[];
  }
  
}



class ShaderToyScript extends Script {
  iTime: number = 0;
  iFrame: number = 0;
  onUpdate(deltaTime: number): void {
    const renderer = this.entity.getComponent(MeshRenderer);
    const material = renderer?.getMaterial();
    const shaderData = material?.shaderData;

    this.iTime+=deltaTime;
    this.iFrame++;

    shaderData?.setFloat("iTimeDelta", deltaTime);
    shaderData?.setFloat("iTime", this.iTime);
    shaderData?.setInt("iFrame", this.iFrame);
    const date = new Date();
    shaderData?.setVector4("iDate", new Vector4(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate(),
      (date.getHours() * 60 + date.getMinutes()) * 60 +date.getSeconds()
      ));
  }
  // onPointerDown(pointer: Pointer): void {
  //   const renderer = this.entity.getComponent(MeshRenderer);
  //   const material = renderer?.getMaterial();
  //   const shaderData = material?.shaderData;
  //   // TODO: right click
  //   shaderData?.setVector4("iMouse", new Vector4(pointer.position.x, pointer.position.y, 1, 0));
  // }
  // onPointerUp(pointer: Pointer): void {
  //   const renderer = this.entity.getComponent(MeshRenderer);
  //   const material = renderer?.getMaterial();
  //   const shaderData = material?.shaderData;
  //   // TODO: right click
  //   shaderData?.setVector4("iMouse", new Vector4(pointer.position.x, pointer.position.y, 0, 0));
  // }
}
