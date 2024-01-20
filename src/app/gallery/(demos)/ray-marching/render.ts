import { getShaderToyRender } from "../../../../../helpers/getShaderToyRender";


export function render(canvas: HTMLCanvasElement){
  canvas.width = 1000;
  canvas.height = 1000;
  const render = getShaderToyRender(canvas, shaderToySource);
  render(canvas);
  return [];
}

export const shaderToySource  = `
// suppose there are a ground plane and a sphere in the scene
// intersection test
float GetDist(vec3 p){
    vec4 sphere = vec4(0, 1, 6, 1); // a sphere touch the ground
    float dS = length(p - sphere.xyz) - sphere.w;
    float dP = p.y;  // ground plane
    float d = min(dS, dP);
    return d;
}


// integer
#define MAX_STEPS 100 
// float
#define MAX_DIST 100.   
#define SURFACE_DIST .01

float RayMarch(vec3 ro, vec3 rd){
    float dO = 0.; // how far away from the origin
    
    for(int i=0; i<MAX_STEPS; i++){
        vec3 p = ro+dO*rd;  // current point
        float dS = GetDist(p); // disance from this point to the nearest object
        dO += dS;
        if(dS < SURFACE_DIST || dO>MAX_DIST) break;
    }
    
    
    return dO;
}


vec3 GetNormal(vec3 p){
    float d = GetDist(p);
    vec2 e = vec2(.01, 0);
    vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx)
    );
    return normalize(n);
}



float GetLight(vec3 p){
    vec3 lightPos = vec3(0, 5, 6); // a point light above the sphere
    lightPos.xz += vec2(sin(iTime), cos(iTime))*2.;
    vec3 l = normalize(lightPos - p);
    vec3 n =  GetNormal(p);
    
    float dif = clamp(dot(n, l), 0., 1.);
    
    // shadow
    // float d = RayMarch(p, l); // shadow acene
    // float d = RayMarch(p + n*SURFACE_DIST, l);  // not enough
    float d = RayMarch(p + n*SURFACE_DIST*2., l);
    if(d< length(lightPos-p)) dif *= .1;
    
    
    return dif;
}


void mainImage(out vec4 fragColor, vec2 fragCoord){
  vec2 uv = (fragCoord-.5 *iResolution.xy)/iResolution.xy; // zero uv in the middle

  vec3 col = vec3(0); // black stream
  
  // camera ray, perspective projection
  vec3 ro = vec3(0, 1, 0); // ray origin
  vec3 rd = normalize(vec3(uv.x, uv.y, 0.5)); // ray diretion
  
  // ray marching to get distance

  float d = RayMarch(ro, rd);
  
  vec3 p = ro + rd * d;
  float dif = GetLight(p);
  
  
  // col = vec3(d/6.); // show depth map
  //col = GetNormal(p); // show normal map
  col = vec3(dif);

  fragColor = vec4(col, 1.0);
}
`;

