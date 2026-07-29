/**
 * Rasterise the app icons from Pip's artwork.
 *
 * Run with `npm run icons` after changing the mascot. Kept as a script rather
 * than committed binaries-by-hand so the icon always matches the character.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

/** `pad` shrinks the character so maskable icons survive an aggressive crop. */
const artwork = (pad = 0) => {
  const scale = (100 - pad) / 100
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffe4ee"/>
      <stop offset="100%" stop-color="#f7d9e8"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg)"/>
  <g transform="translate(100,106) scale(${scale}) translate(-100,-106)">
    <ellipse cx="56" cy="72" rx="17" ry="30" fill="#fff6f0" stroke="#ffe8dd" stroke-width="3" transform="rotate(-24 56 96)"/>
    <ellipse cx="144" cy="72" rx="17" ry="30" fill="#fff6f0" stroke="#ffe8dd" stroke-width="3" transform="rotate(24 144 96)"/>
    <ellipse cx="56" cy="70" rx="8" ry="18" fill="#ffb3c9" opacity=".35" transform="rotate(-24 56 70)"/>
    <ellipse cx="144" cy="70" rx="8" ry="18" fill="#ffb3c9" opacity=".35" transform="rotate(24 144 70)"/>
    <circle cx="100" cy="112" r="57" fill="#fff6f0" stroke="#ffe8dd" stroke-width="3"/>
    <path d="M92 58 Q100 42 108 58" stroke="#ffe8dd" stroke-width="5" stroke-linecap="round" fill="none"/>
    <ellipse cx="66" cy="126" rx="11" ry="7" fill="#ffb3c9" opacity=".75"/>
    <ellipse cx="134" cy="126" rx="11" ry="7" fill="#ffb3c9" opacity=".75"/>
    <path d="M69 113 q9 -11 18 0" stroke="#4a3f47" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M113 113 q9 -11 18 0" stroke="#4a3f47" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M88 134 q12 18 24 0 q-12 6 -24 0z" fill="#4a3f47" stroke="#4a3f47" stroke-width="3" stroke-linejoin="round"/>
    <path d="M148 150 l4.2 8.6 9.4 1.4 -6.8 6.7 1.6 9.4 -8.4 -4.4 -8.4 4.4 1.6 -9.4 -6.8 -6.7 9.4 -1.4z"
          fill="#ffe5a3" stroke="#e8b53d" stroke-width="2.5" stroke-linejoin="round"/>
  </g>
</svg>`
}

const targets = [
  { file: 'icon-192.png', size: 192, pad: 4 },
  { file: 'icon-512.png', size: 512, pad: 4 },
  // Maskable icons get cropped to a circle on some launchers — keep the head
  // well inside the safe area.
  { file: 'icon-512-maskable.png', size: 512, pad: 22 },
  { file: 'apple-touch-icon.png', size: 180, pad: 4 },
]

await mkdir(publicDir, { recursive: true })

for (const { file, size, pad } of targets) {
  await sharp(Buffer.from(artwork(pad)))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, file))
  console.log(`✓ ${file} (${size}×${size})`)
}

await writeFile(join(publicDir, 'favicon.svg'), artwork(4))
console.log('✓ favicon.svg')
