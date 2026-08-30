import { describe, expect, it } from 'vitest'
import { ZONE_SCHEMA_VERSION } from '../zones'
import { formatIssues, loadZoneFile, parseIssues, zoneSlugs, zones } from './helpers/zoneFiles'
import { mapImageSize } from './helpers/mapImages'

// A map spans a fixed number of coordinate units, so pixels per unit follows the image's own
// size: a map shipped at half the width needs half the grid.
const UNITS_ACROSS = 2048 / 50

// The zone files are data and the zone modules are the model. These check the two agree.

describe.each(zoneSlugs)('%s', slug => {
  const zone = zones[slug]
  const file = loadZoneFile(slug)

  it('declares the current schema version', () => {
    expect(file.schemaVersion).toBe(ZONE_SCHEMA_VERSION)
  })

  it('holds exactly the sections its zone module declares', () => {
    expect(Object.keys(file.sections).sort()).toEqual(Object.keys(zone.sections).sort())
  })

  it('carries nothing in a section but its items', () => {
    for (const [key, section] of Object.entries(file.sections)) {
      expect(Object.keys(section), `section "${key}"`).toEqual(['items'])
    }
  })

  it('draws its map on a grid scaled to the image it ships', () => {
    const { width, height } = mapImageSize(slug)
    expect(width, `${slug}.jpg`).toBe(height)
    expect(width / zone.map.grid.sizeInPixels, `${slug}.jpg`).toBeCloseTo(UNITS_ACROSS, 1)
  })

  it('parses every item against its section schema', () => {
    const issues = parseIssues(slug)
    expect(issues.length ? `\n${formatIssues(issues)}\n` : '').toBe('')
  })
})

describe('across every zone', () => {
  it('gives every item an id unique within its file', () => {
    for (const slug of zoneSlugs) {
      const seen = new Set<string>()
      const duplicates: string[] = []
      for (const section of Object.values(loadZoneFile(slug).sections)) {
        for (const item of section.items ?? []) {
          const id = (item as { id?: string }).id
          if (!id) continue
          if (seen.has(id)) duplicates.push(id)
          seen.add(id)
        }
      }
      expect(duplicates, slug).toEqual([])
    }
  })
})
