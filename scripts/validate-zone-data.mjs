// Checks the zone data against the rules the viewer relies on but does not enforce.
//
// Errors are the project invariant: a zone section with no matching filter section makes
// Viewer.vue read `.enabled` off undefined, which throws at render. `nuxt generate` cannot
// catch it, because zone data loads client-side behind a v-if and the viewer never runs
// during SSR.
//
// Warnings are silent-failure behaviours: an unregistered icon falls back to a plausible
// wrong one, an out-of-range coordinate lands off the map, and a level of 0 is filtered out
// of sight in a zone whose filters carry a level range.
//
// The zone-to-filter mapping and the icon registry are both read from source rather than
// restated here, so this cannot drift out of agreement with what the app actually loads.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const PAGES = join(ROOT, 'pages/map')
const ZONE_DIR = join(ROOT, 'assets/zoneJson')
const FILTER_DIR = join(ROOT, 'assets/filters')
const RESOLVER = join(ROOT, 'composables/useIconResolver.ts')

// Map images are 2048x2048 at gridSizeInPixels 50 with coordinatesOffset 1, so an in-game
// coordinate outside this range cannot be drawn on the image.
const COORD_MIN = 1
const COORD_MAX = 42

// Guards against the registry regex silently matching nothing after a reformat, which would
// otherwise report every icon in every zone as unregistered.
const MIN_EXPECTED_ICONS = 30

const errors = []
const warnings = []

const error = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)

const readJson = path => JSON.parse(readFileSync(path, 'utf8'))

function zonePages() {
  const zones = []
  for (const dir of readdirSync(PAGES, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    const src = readFileSync(join(PAGES, dir.name, 'index.vue'), 'utf8')
    const zone = src.match(/assets\/zoneJson\/([\w.]+)\.json/)
    const filter = src.match(/assets\/filters\/([\w.]+)\.json/)
    if (!zone || !filter) {
      error(`pages/map/${dir.name}/index.vue`, 'no zone JSON or filter import found')
      continue
    }
    zones.push({ page: dir.name, zone: zone[1], filter: filter[1] })
  }
  return zones
}

function iconRegistry() {
  const src = readFileSync(RESOLVER, 'utf8')
  const keys = new Set([...src.matchAll(/^ {2}(\w+):\s+`/gm)].map(m => m[1]))
  if (keys.size < MIN_EXPECTED_ICONS) {
    throw new Error(
      `parsed only ${keys.size} icon keys from useIconResolver.ts, expected at least ` +
      `${MIN_EXPECTED_ICONS}. The iconPaths format has changed and this parser needs updating.`
    )
  }
  return keys
}

function checkSectionKeys(where, zoneData, filterData) {
  const zoneKeys = Object.keys(zoneData.sections)
  const filterKeys = Object.keys(filterData.sections ?? {})
  for (const key of zoneKeys) {
    if (!filterKeys.includes(key)) {
      error(where, `section "${key}" has no matching section in the filter file (Viewer throws on this)`)
    }
  }
  for (const key of filterKeys) {
    if (!zoneKeys.includes(key)) {
      error(where, `filter section "${key}" has no matching section in the zone file`)
    }
  }
}

function iconKeysUsed(section) {
  const icon = section.icon ?? {}
  const primary = icon.primary ?? {}
  const keys = []
  if (primary.strategy === 'static' && primary.value) keys.push(primary.value)
  for (const badge of icon.badges ?? []) if (badge.icon) keys.push(badge.icon)
  for (const item of section.items ?? []) {
    const field = item[primary.field]
    if (primary.strategy === 'element' && field) keys.push(field)
    if (primary.strategy === 'rank') keys.push(`rank_${field}`)
    if (primary.strategy === 'prefixed') keys.push(`${primary.prefix}_${field}`)
  }
  return keys
}

function positionsOf(item) {
  const pos = item.position
  const list = Array.isArray(pos) ? [...pos] : pos ? [pos] : []
  for (const spawn of item.spawns ?? []) {
    const p = spawn?.position ?? spawn
    if (p && typeof p === 'object' && 'x' in p) list.push(p)
  }
  return list
}

function checkSection(where, key, section, icons, levelRange) {
  for (const iconKey of iconKeysUsed(section)) {
    if (!icons.has(iconKey)) {
      warn(where, `section "${key}" references unregistered icon "${iconKey}" (falls back silently)`)
    }
  }

  for (const item of section.items ?? []) {
    const label = `${key}/${item.name || item.id || '?'}`

    for (const p of positionsOf(item)) {
      for (const axis of ['x', 'y']) {
        const v = p[axis]
        if (typeof v !== 'number') {
          warn(where, `${label}: position.${axis} is ${JSON.stringify(v)}, not a number`)
        } else if (v < COORD_MIN || v > COORD_MAX) {
          warn(where, `${label}: position.${axis} is ${v}, outside ${COORD_MIN}-${COORD_MAX}`)
        }
      }
    }

    // Only meaningful where the filter file carries a level range. Bozja and Zadnor have none,
    // and their `level` field holds a rank, where 0 is a real value.
    if (levelRange && item.level === 0) {
      warn(where, `${label}: level is 0, outside the filter's ${levelRange.from}-${levelRange.to} range, so it loads hidden`)
    }
  }
}

const icons = iconRegistry()

for (const { page, zone, filter } of zonePages()) {
  const where = `${zone}.json`
  const zoneData = readJson(join(ZONE_DIR, `${zone}.json`))
  const filterData = readJson(join(FILTER_DIR, `${filter}.json`))

  if (!zoneData.sections) {
    error(where, 'no "sections" key')
    continue
  }

  checkSectionKeys(`${page} (${zone}.json vs ${filter}.json)`, zoneData, filterData)

  for (const [key, section] of Object.entries(zoneData.sections)) {
    checkSection(where, key, section, icons, filterData.level)
  }
}

for (const w of warnings) console.error(`warning  ${w}`)
for (const e of errors) console.error(`error    ${e}`)

if (errors.length || warnings.length) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`)
  process.exit(1)
}

console.log(`zone data OK: ${zonePages().length} zones, ${icons.size} registered icons`)
