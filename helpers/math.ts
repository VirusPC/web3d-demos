export function degToRad(d: number) {
  return d * Math.PI / 180;
}
export function radToDeg(d: number) {
  return d * 180 / Math.PI;
}
export function rand(min: number, max: number) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

export function randInt(range: number) {
  return Math.floor(Math.random() * range);
};