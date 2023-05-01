import { Vector3 } from "three";
// import { ConvexHull } from 'three/addons/math/ConvexHull.js';

export function createBezier(controlPoints: Vector3[], pointNum: number = 100, tick: number = 1) {
  let t = tick / (pointNum - 1);
  let points = [];
  for (let i = 0; i < pointNum; i++) {
    let point = getBezierNowPoint(controlPoints, i * t);
    points.push(point);
  }

  return points;
}

/**
 * 四阶贝塞尔曲线公式
 * from games101 lecture11
 */
function getBezierNowPoint(points: Vector3[], t: number) {
  const order = points.length - 1;
  const allC = getAllCombination(order);
  const bernsteinPolynominal = getBernstgeinPolynominal(t, order, allC);
  const result = points.reduce((result, point, i) => {
    return result.add(point.clone().multiplyScalar(bernsteinPolynominal[i]));
  }, new Vector3(0, 0, 0));
  return result;
}

function getBernstgeinPolynominal(t: number, order: number, allCombination: number[]) {
  const bernsteinPolynominal = new Array(order + 1);
  const midPos = Math.ceil((order + 1) / 2) - 1;
  const oneSubT = 1 - t;
  for (let i = 0; i <= order; ++i) {
    bernsteinPolynominal[i] = allCombination[i] * (oneSubT ** (order - i)) * (t ** order);
  }

  return bernsteinPolynominal;
}

/**
 *   C(n,i) = C(n-1,i-1) + C(n-1,i)    当n>i>0
 *   C(n,0) = C(n,n) = 1
 * @param num 
 */
function getAllCombination(num: number): number[]{
  const dp = new Array(num+1);
  for(let n=0; n<=num; ++n){
    dp[n] = new Array(num+1);
  }

  for(let n=0; n<=num; ++n){
    dp[n][0] = 1;
    dp[n][n] = 1;
  }

  for(let n=1; n<=num; ++n){
    for(let i=1; i<=num; ++i){
      if(i<n) dp[n][i] = dp[n-1][i-1] + dp[n-1][i]
    }
  }

  dp[0][0] = 1;
  dp[num-1] = 1;
  return dp[num];
}

// function getAllCombination(num: number) {
//   debugger;
//   const dp = new Array(num+1);
//   for(let n=0; n<=num; ++n){
//     dp[n] = new Array(num+1);
//   }

//   for(let n=0; n<=num; ++n){
//     dp[n][0] = 1;
//     dp[n][n] = 1;
//   }

//   for(let n=1; n<=num; ++n){
//     for(let i=1; i<=num; +i){
//       if(i<n) dp[n][i] = dp[n-1][i-1] + dp[n-1][i]
//     }
//   }

//   dp[0][0] = 1;
//   dp[num-1] = 1;
//   return dp[num];
// }
