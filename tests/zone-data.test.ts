import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ZONE_SCHEMA_VERSION } from '../zones'
import {
  ZONE_DIR,
  formatIssue,
  loadEntityFile,
  loadZoneFile,
  parseIssues,
  zoneFileName,
  zoneSlugs,
  zones,
} from './helpers/zoneFiles'
import { mapImageSize } from './helpers/mapImages'

// A map spans a fixed number of coordinate units, so pixels per unit follows the image's own
// size: a map shipped at half the width needs half the grid.
const UNITS_ACROSS = 2048 / 50

// The zone files are data and the zone modules are the model. These check the two agree.

describe.each(zoneSlugs)('%s', slug => {
  const zone = zones[slug]
  const file = loadZoneFile(slug)
  const name = zoneFileName(slug)

  it('is the file its zone module imports', async () => {
    expect((await zone.file()).default).toEqual(file)
  })

  it('has its zone module import its own entity file', async () => {
    expect((await zone.entities()).default).toEqual(loadEntityFile(slug))
  })

  it('declares the current schema version', () => {
    expect(
      file.schemaVersion,
      `${name} is at schema version ${file.schemaVersion}, and the site now reads `
        + `${ZONE_SCHEMA_VERSION}. Redo your change in the zone's editor and download a fresh file`
    ).toBe(ZONE_SCHEMA_VERSION)
  })

  it('holds exactly the sections its zone module declares', () => {
    const declared = Object.keys(zone.sections)
    const held = Object.keys(file.sections)
    expect([
      ...held
        .filter(key => !declared.includes(key))
        .map(key => `${name} has a section "${key}", which this zone does not have`),
      ...declared
        .filter(key => !held.includes(key))
        .map(key => `${name} is missing the section "${key}"`),
    ]).toEqual([])
  })

  it('carries nothing in a section but its items', () => {
    expect(Object.entries(file.sections).flatMap(([key, section]) => [
      ...('items' in section ? [] : [`${name}: section "${key}" has no "items" list`]),
      ...Object.keys(section)
        .filter(field => field !== 'items')
        .map(field => `${name}: section "${key}" holds "${field}" beside its items`),
    ])).toEqual([])
  })

  it('draws its map on a grid scaled to the image it ships', () => {
    const { width, height } = mapImageSize(slug)
    expect(width, `${slug}.jpg`).toBe(height)
    expect(width / zone.map.grid.sizeInPixels, `${slug}.jpg`).toBeCloseTo(UNITS_ACROSS, 1)
  })

  it('parses every item against its section schema', () => {
    expect(parseIssues(slug).map(formatIssue)).toEqual([])
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
          if (seen.has(id)) duplicates.push(`${zoneFileName(slug)}: two items share the id ${id}`)
          seen.add(id)
        }
      }
      expect(duplicates).toEqual([])
    }
  })
})

const ZONE_FOLDER = ['entities.json', 'zone.json']

describe('data/zones', () => {
  it('holds a folder for each zone and nothing else', () => {
    expect(readdirSync(ZONE_DIR)
      .filter(entry => !(zoneSlugs as string[]).includes(entry))
      .map(entry => `data/zones/${entry} is not a zone. Each zone has its own folder, `
        + `and its file is that folder's zone.json`)).toEqual([])
  })

  it.each(zoneSlugs)('holds only the zone file and the entity file for %s', slug => {
    expect(readdirSync(join(ZONE_DIR, slug))
      .filter(entry => !ZONE_FOLDER.includes(entry))
      .map(entry => `data/zones/${slug}/${entry} should not be here. If it is the file the editor `
        + `downloaded, rename it to zone.json, replacing the one already there`)).toEqual([])
  })
})
