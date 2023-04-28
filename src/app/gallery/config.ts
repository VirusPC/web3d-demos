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
  name: "lighting",
  width: "w-64",
  tags: ["webgl2", "lighting", "directional lighting", "point lighting"]
}, {
  name: "shading-frequency",
  width: "w-96",
  tags: ["webgl2", "shading frequency", "flat shading", "gouraud shading", "phong shading"]
}];

export default config;