type Config = {
  name: string,
  width: string,
  tags: string[]
}

const config: Config[] = [{
  name: "orthographic",
  width: "w-40",
  tags: ["webgl2", "projection"]
}, {
  name: "perspective",
  width: "w-40",
  tags: ["webgl2", "projection"]
}, {
  name: "mipmap",
  width: "w-40",
  tags: ["webgl2", "mipmap"]
},{
  name: "lighting",
  width: "w-64",
  tags: ["webgl2", "lighting", "directional lighting", "point lighting"]
}, 
{
  name: "shading-frequency",
  width: "w-96",
  tags: ["webgl2", "shading frequency", "flat shading", "gouraud shading", "phong shading"]
}, {
  name: "blinn-phong-model",
  width: "w-40",
  tags: ["webgl2", "blinn phong model"]
},
{
  name: "bezier-curve",
  width: "w-40",
  tags: ["webgl2", "bezier curve"]
}, {
  name: "projection-mapping",
  width: "w-40",
  tags: ["webgl2", "projection mapping"]
}, {
  name: "shadow-mapping",
  width: "w-40",
  tags: ["webgl2", "shadow mapping"]
}, {
  name: "border",
  width: "w-40",
  tags: ["three.js", "border"]
}, {
  name: "ray-marching",
  width: "w-40",
  tags: ["ray tracing","ray marching","shadow"]
}// __plop_insert_point__
];

export default config;