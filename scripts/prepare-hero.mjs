// Optimise the generated hero artwork into a self-hosted JPEG.
// Source lives outside the repo (media-output); only the finished asset is committed.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'C:/Users/Administrator/AccioWork/2026-09-16-17-15-24-640-e0833c0c/media-output/img-mu9druom-e0b80959.png';
const OUT_DIR = path.resolve('public/hero');
const OUT = path.join(OUT_DIR, 'masquerade-ball.jpg');

fs.mkdirSync(OUT_DIR, { recursive: true });

const meta = await sharp(SRC).metadata();
const info = await sharp(SRC)
  .resize({ width: 1080, withoutEnlargement: true })
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile(OUT);

console.log(
  JSON.stringify(
    {
      source: { w: meta.width, h: meta.height, format: meta.format },
      output: OUT,
      w: info.width,
      h: info.height,
      kb: Math.round(info.size / 1024),
    },
    null,
    2
  )
);
