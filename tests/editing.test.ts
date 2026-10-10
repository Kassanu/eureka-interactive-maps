import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import {
  ZONE_SCHEMA_VERSION,
  createItem,
  encodeZone,
  indexZone,
  parseEntities,
  parseSections,
  referencedIds,
  shapeOf,
  zoneFileText,
  zones,
} from '../zones'
import type { ZoneItem, ZoneSlug } from '../zones'
import { hydratedZones, loadEntityFile, loadZoneFile, zoneFilePath } from './helpers/zoneFiles'
import { readFileSync } from 'node:fs'

// What the editor does to a zone after it is loaded. These run the same functions the editor
// calls, so nothing here is a second copy of its behaviour.

const loaded = hydratedZones()

const UNHELD = '0d9e8f7a-6b5c-4d3e-9f2a-1b0c9d8e7f6a'

function editable(slug: ZoneSlug) {
  const definition = zones[slug]
  const { sections } = parseSections(definition, loadZoneFile(slug))
  const { groups } = parseEntities(definition, loadEntityFile(slug))
  return { definition, sections, groups, index: () => indexZone(definition, sections, groups) }
}

describe.each(loaded.map(zone => [zone.definition.slug as ZoneSlug, zone] as const))('%s', (slug, zone) => {
  const definition = zones[slug]

  it('writes back exactly the file it read', () => {
    const { file, issues } = encodeZone(zone, ZONE_SCHEMA_VERSION)
    expect(issues).toEqual([])
    expect(zoneFileText(file!)).toBe(readFileSync(zoneFilePath(slug), 'utf8'))
  })

  it('makes a new item of every section that its own schema accepts once its entity is picked', () => {
    for (const [key, section] of Object.entries(definition.sections)) {
      const item = createItem(section, { x: 12, y: 34 })
      const schema = section.schema as z.ZodType

      expect(item.id, key).toMatch(/^[0-9a-f-]{36}$/)
      expect(item.positions, key).toEqual([{ x: 12, y: 34 }])
      expect('entity' in item, key).toBe(false)

      const takesEntity = 'entity' in shapeOf(schema)
      const first = zone.entities.get(key)?.keys[0]
      if (takesEntity) {
        expect(first, key).toBeDefined()
        expect(schema.safeParse(item).success, key).toBe(false)
      }

      const parsed = schema.safeParse(takesEntity ? { ...item, entity: first } : item)
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
    const { definition, sections, index } = editable('anemos')

    const before = index()
    const enemies = sections.get('enemies')!
    const item = createItem(definition.sections.enemies!, { x: 20, y: 20 })
    enemies.push(item)

    const after = index()
    expect(before.byId.has(item.id)).toBe(false)
    expect(after.byId.get(item.id)).toBe(item)
    expect(after.sectionOf.get(item.id)?.key).toBe('enemies')
    expect(after.iconsById.get(item.id)?.length).toBeGreaterThan(0)
  })
})

describe('a save that would not load back', () => {
  it('names the item and writes nothing', () => {
    const { sections, index } = editable('anemos')
    const enemies = sections.get('enemies')!
    const broken = { ...enemies[0]!, level: { from: 9, to: 3 } } as ZoneItem
    enemies.splice(0, 1, broken)

    const { file, issues } = encodeZone(index(), ZONE_SCHEMA_VERSION)

    expect(file).toBeNull()
    expect(issues).toHaveLength(1)
    expect(issues[0]?.section).toBe('enemies')
    expect(issues[0]?.itemId).toBe(broken.id)
    expect(issues[0]?.message).toContain('backwards')
  })

  it('names an item whose entity its section\'s group does not hold', () => {
    const { sections, groups, index } = editable('pagos')
    const fates = sections.get('fates')!
    const enemy = sections.get('enemies')![0] as { entity: string } & ZoneItem
    const fate = fates[0] as { entity: string } & ZoneItem
    fate.entity = groups.get('enemies')!.keys[0]!
    enemy.entity = UNHELD

    const { file, issues } = encodeZone(index(), ZONE_SCHEMA_VERSION)

    expect(file).toBeNull()
    expect(issues.map(issue => [issue.section, issue.itemId])).toEqual([
      ['enemies', enemy.id],
      ['fates', fate.id],
    ])
    expect(issues[0]?.message).toContain(UNHELD)
  })

  it('names an event whose boss the bosses group does not hold', () => {
    const { sections, index } = editable('pagos')
    const fate = sections.get('fates')!.find(item => 'bosses' in item && item.bosses.length > 0)!
    const bosses = (fate as { bosses: { entity: string }[] }).bosses
    bosses[0]!.entity = UNHELD

    const { file, issues } = encodeZone(index(), ZONE_SCHEMA_VERSION)

    expect(file).toBeNull()
    expect(issues.map(issue => issue.itemId)).toEqual([fate.id])
    expect(issues[0]?.message).toContain(UNHELD)
  })

  it('names a new item until its entity is picked, then writes it', () => {
    const { definition, sections, groups, index } = editable('anemos')
    const item = createItem(definition.sections.enemies!, { x: 20, y: 20 })
    sections.get('enemies')!.push(item)

    const unpicked = encodeZone(index(), ZONE_SCHEMA_VERSION)
    expect(unpicked.file).toBeNull()
    expect(unpicked.issues.map(issue => issue.itemId)).toEqual([item.id])

    Object.assign(item, { entity: groups.get('enemies')!.keys[0] })
    const picked = encodeZone(index(), ZONE_SCHEMA_VERSION)
    expect(picked.issues).toEqual([])
    const written = picked.file!.sections.enemies!.items!.at(-1) as Record<string, unknown>
    expect(Object.keys(written).slice(0, 3)).toEqual(['id', 'entity', 'positions'])
  })
})

describe('a reference to another item', () => {
  it('is never an entity, wherever one sits', () => {
    const other = '5a4b3c2d-1e0f-4a9b-8c7d-6e5f4a3b2c1d'
    const item = {
      entity: UNHELD,
      spawnsFate: other,
      bosses: [{ entity: UNHELD }],
      drops: [{ entity: UNHELD, amount: 1 }],
    }
    expect(referencedIds(item)).toEqual([other])
  })
})

describe('an item\'s name', () => {
  it('is refused by every section, as is a translation block', () => {
    for (const zone of loaded) {
      for (const section of zone.sections) {
        const item = section.items[0]
        if (!item) continue
        const schema = section.definition.schema as z.ZodType
        const label = `${zone.definition.slug}.${section.key}`
        expect(schema.safeParse(item).success, label).toBe(true)
        expect(schema.safeParse({ ...item, name: 'Named' }).success, label).toBe(false)
        expect(schema.safeParse({ ...item, i18n: { ja: { name: '名' } } }).success, label).toBe(false)
      }
    }
  })
})

describe('deleting an item', () => {
  it('drops it from the file and from every index', () => {
    const { sections, index } = editable('anemos')
    const enemies = sections.get('enemies')!
    const removed = enemies[0]!
    enemies.splice(0, 1)

    const zone = index()
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
    const { groups } = parseEntities(definition, loadEntityFile('zadnor'))
    const { file } = encodeZone(indexZone(definition, sections, groups), ZONE_SCHEMA_VERSION)
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
