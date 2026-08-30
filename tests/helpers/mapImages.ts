import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const MAP_DIR = join(process.cwd(), 'assets/images/maps')

// The SOF markers that open a frame header. Skipping every other segment by its own length is
// what steps over an EXIF thumbnail, which is a whole JPEG nested inside APP1.
const FRAME_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
])

export function mapImageSize(slug: string): { width: number; height: number } {
  const bytes = readFileSync(join(MAP_DIR, `${slug}.jpg`))
  if (bytes.readUInt16BE(0) !== 0xffd8) throw new Error(`${slug}.jpg is not a JPEG`)

  let at = 2
  while (at + 9 < bytes.length) {
    if (bytes[at] !== 0xff) throw new Error(`${slug}.jpg breaks at byte ${at}`)
    const marker = bytes[at + 1]
    if (FRAME_MARKERS.has(marker)) {
      return { height: bytes.readUInt16BE(at + 5), width: bytes.readUInt16BE(at + 7) }
    }
    at += 2 + bytes.readUInt16BE(at + 2)
  }
  throw new Error(`${slug}.jpg has no frame header`)
}
