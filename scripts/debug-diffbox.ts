import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readFileSync } from "node:fs";

const [ga, aa] = process.argv.slice(2);
const g = PNG.sync.read(readFileSync(ga));
const a = PNG.sync.read(readFileSync(aa));
const diff = new PNG({ width: g.width, height: g.height });
pixelmatch(g.data, a.data, diff.data, g.width, g.height, { threshold: 0.15, includeAA: false });
let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1, count = 0;
for (let y = 0; y < g.height; y++) {
  for (let x = 0; x < g.width; x++) {
    const i = (y * g.width + x) * 4;
    if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) {
      count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
console.log(`diff pixels: ${count}, bbox x:[${minX},${maxX}] y:[${minY},${maxY}]  image ${g.width}x${g.height}`);
