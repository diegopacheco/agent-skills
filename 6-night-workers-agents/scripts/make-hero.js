const fs = require("fs");
const zlib = require("zlib");

const WIDTH = 1400;
const HEIGHT = 700;

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, body) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length);
  const tagged = Buffer.concat([Buffer.from(type), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(tagged));
  return Buffer.concat([length, tagged, crc]);
}

function pixels() {
  const raw = Buffer.alloc((WIDTH * 3 + 1) * HEIGHT);
  let seed = 7;
  for (let y = 0; y < HEIGHT; y++) {
    const row = y * (WIDTH * 3 + 1);
    for (let x = 0; x < WIDTH; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const noise = seed % 40;
      const at = row + 1 + x * 3;
      raw[at] = 90 + ((x + y) % 60) + noise;
      raw[at + 1] = 50 + (y % 40) + noise / 2;
      raw[at + 2] = 25 + noise / 3;
    }
  }
  return raw;
}

const header = Buffer.alloc(13);
header.writeUInt32BE(WIDTH, 0);
header.writeUInt32BE(HEIGHT, 4);
header[8] = 8;
header[9] = 2;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", header),
  chunk("IDAT", zlib.deflateSync(pixels(), { level: 0 })),
  chunk("IEND", Buffer.alloc(0)),
]);
fs.writeFileSync(process.argv[2], png);
