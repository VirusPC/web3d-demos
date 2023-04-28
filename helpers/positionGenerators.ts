import { BufferAttribute, PositionalAudio, SphereGeometry, Triangle, Vector3 } from "three";

/**
 * three.js 中的position需要结合index来进行渲染
 * @param radius 
 * @param latitudeBands 
 * @param longitudeBands 
 * @returns x, y, z, u, v
 */
export function getSpherePositionsAndNormals(radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
  const sphere = new SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
  const positionAttr = sphere.getAttribute("position") as BufferAttribute;
  // three.js 默认是face normal
  const normalAttr = sphere.getAttribute("normal") as BufferAttribute;
  const _indices = [...(sphere.index?.array as Uint16Array | Uint32Array)];
  const _positions = (positionAttr.array as Float32Array);
  const _vertexNormals = (normalAttr.array as Float32Array).slice(0);

  const positions = new Float32Array(_indices.flatMap(index => [_positions[index*3], _positions[index*3+1], _positions[index*3+2]]));
  const vertexNormals = new Float32Array(_indices.flatMap(index => [_vertexNormals[index*3], _vertexNormals[index*3+1], _vertexNormals[index*3+2]]));
  
  const _faceNormals: number[] = [];//new Float32Array(indices.length);
  let tri = new Triangle(); // for re-use
  let a = new Vector3(), 
      b = new Vector3(), 
      c = new Vector3(); // for re-use
  for( let f = 0; f < _indices.length/3; f++ ){
      let idxBase = f * 3;
      a.fromBufferAttribute( positionAttr, _indices[idxBase] );
      b.fromBufferAttribute( positionAttr, _indices[ idxBase + 1 ]);
      c.fromBufferAttribute( positionAttr, _indices[ idxBase + 2 ]);
      tri.set( a, b, c );
      const normal = new Vector3();
      tri.getNormal( normal);
      _faceNormals.push(normal.x, normal.y, normal.z);
      _faceNormals.push(normal.x, normal.y, normal.z);
      _faceNormals.push(normal.x, normal.y, normal.z);
  }
  const faceNormals = new Float32Array(_faceNormals);

  return {
    vertexCount: positions.length / 3,
    positions,
    vertexNormals,
    faceNormals,
  }
}