type Config = {
  name: string,
  tags: string[]
}

const config: Config[] = [{
  name: "orthographic",
  tags: ["webgl2", "projection"]
}, {
  name: "perspective",
  tags: ["webgl2", "projection"]
}];

export default config;