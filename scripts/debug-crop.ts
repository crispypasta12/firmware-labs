import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";

const [src, out, xs, ys, ws, hs, scaleS] = process.argv.slice(2);
const img = PNG.sync.read(readFileSync(src));
const x0 = +xs, y0 = +ys, w = +ws, h = +hs, scale = +(scaleS ?? 4);
const crop = new PNG({ width: w * scale, height: h * scale });
for (let y = 0; y < h * scale; y++) {
  for (let x = 0; x < w * scale; x++) {
    const sx = x0 + Math.floor(x / scale), sy = y0 + Math.floor(y / scale);
    const si = (sy * img.width + sx) * 4, di = (y * crop.width + x) * 4;
    crop.data[di] = img.data[si]; crop.data[di + 1] = img.data[si + 1];
    crop.data[di + 2] = img.data[si + 2]; crop.data[di + 3] = img.data[si + 3];
  }
}
writeFileSync(out, PNG.sync.write(crop));
console.log("wrote", out);
