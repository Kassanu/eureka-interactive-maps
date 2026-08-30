import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import {
  ZONE_SCHEMA_VERSION,
  createItem,
  encodeZone,
  indexZone,
  parseSections,
  zoneFileText,
  zones,
} from '../zones'
import type { ZoneItem, ZoneSlug } from '../zones'
import { hydratedZones, loadZoneFile, zoneFilePath } from './helpers/zoneFiles'
import { readFileSync } from 'node:fs'

// What the editor does to a zone after it is loaded. These run the same functions the editor
// calls, so nothing here is a second copy of its behaviour.

const loaded = hydratedZones()

describe.each(loaded.map(zone => [zone.definition.slug as ZoneSlug, zone] as const))('%s', (slug, zone) => {
  const definition = zones[slug]

  it('writes back exactly the file it read', () => {
    const { file, issues } = encodeZone(zone, ZONE_SCHEMA_VERSION)
    expect(issues).toEqual([])
    expect(zoneFileText(file!)).toBe(readFileSync(zoneFilePath(slug), 'utf8'))
  })

  it('makes a new item of every section that its own schema accepts', () => {
    for (const [key, section] of Object.entries(definition.sections)) {
      const item = createItem(section, { x: 12, y: 34 })
      const schema = section.schema as z.ZodType

      expect(item.id, key).toMatch(/^[0-9a-f-]{36}$/)
      expect(item.positions, key).toEqual([{ x: 12, y: 34 }])

      const parsed = schema.safeParse(item)
      // A field naming another item starts empty, which is the one thing a new item may fail on.
      const blocking = parsed.success
        ? []
        : parsed.error.issues.filter(issue => !String(issue.path[0]).match(/^(learnedFrom)$/))
      expect(blocking, `${key}: ${JSON.stringify(blocking)}`).toEqual([])
    }
  })

  it('mints a different id every time', () => {
    const [key, section] = Object.entries(definition.sections)[0]!
    const ids = new Set(
      Array.from({ length: 50 }, () => createItem(section, { x: 1, y: 1 }).id)
    )
    expect(ids.size, key).toBe(50)
  })
})

describe('adding an item', () => {
  it('reaches the indexes and the map once the section holds it', () => {
    const definition = zones.anemos
    const { sections } = parseSections(definition, loadZoneFile('anemos'))

    const before = indexZone(definition, sections)
    const enemies = sections.get('enemies')!
    const item = createItem(definition.sections.enemies!, { x: 20, y: 20 })
    enemies.push(item)

    const after = indexZone(definition, sections)
    expect(before.byId.has(item.id)).toBe(false)
    expect(after.byId.get(item.id)).toBe(item)
    expect(after.sectionOf.get(item.id)?.key).toBe('enemies')
    expect(after.iconsById.get(item.id)?.length).toBeGreaterThan(0)
  })
})

describe('a save that would not load back', () => {
  it('names the item and writes nothing', () => {
    const definition = zones.anemos
    const { sections } = parseSections(definition, loadZoneFile('anemos'))
    const enemies = sections.get('enemies')!
    const broken = { ...enemies[0]!, name: '  padded  ' } as ZoneItem
    enemies.splice(0, 1, broken)

    const { file, issues } = encodeZone(indexZone(definition, sections), ZONE_SCHEMA_VERSION)

    expect(file).toBeNull()
    expect(issues).toHaveLength(1)
    expect(issues[0]?.section).toBe('enemies')
    expect(issues[0]?.itemId).toBe(broken.id)
    expect(issues[0]?.message).toContain('whitespace')
  })
})

describe('deleting an item', () => {
  it('drops it from the file and from every index', () => {
    const definition = zones.anemos
    const { sections } = parseSections(definition, loadZoneFile('anemos'))
    const enemies = sections.get('enemies')!
    const removed = enemies[0]!
    enemies.splice(0, 1)

    const zone = indexZone(definition, sections)
    expect(zone.byId.has(removed.id)).toBe(false)
    expect(zone.sectionOf.has(removed.id)).toBe(false)

    const { file } = encodeZone(zone, ZONE_SCHEMA_VERSION)
    expect(file!.sections.enemies!.items).toHaveLength(enemies.length)
  })
})

describe('the file a save writes', () => {
  it('carries the version this build reads, whatever the loaded file said', () => {
    const definition = zones.zadnor
    const { sections } = parseSections(definition, { schemaVersion: 2, sections: loadZoneFile('zadnor').sections })
    const { file } = encodeZone(indexZone(definition, sections), ZONE_SCHEMA_VERSION)
    expect(file?.schemaVersion).toBe(ZONE_SCHEMA_VERSION)
  })

  it('keeps the sections in the order the zone module declares', () => {
    for (const zone of loaded) {
      const definition = zones[zone.definition.slug as ZoneSlug]
      const { file } = encodeZone(zone, ZONE_SCHEMA_VERSION)
      expect(Object.keys(file!.sections), zone.definition.slug).toEqual(Object.keys(definition.sections))
    }
  })
})
