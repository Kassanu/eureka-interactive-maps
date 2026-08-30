import { describe, expect, it } from 'vitest'
import {
  ZONE_SCHEMA_VERSION,
  describeRef,
  initialState,
  loadZone,
  visibleItems,
  zoneSlugs,
  zones,
} from '../zones'
import type { ZoneSlug } from '../zones'
import { hydrateZone, loadZoneFile } from './helpers/zoneFiles'

// The loader is what the viewer and the editor both run. These check what it hands them, using
// the same call the app makes rather than a second copy of it.

const loaded = zoneSlugs.map(slug => hydrateZone(slug))

describe.each(loaded.map(zone => [zone.definition.slug as ZoneSlug, zone] as const))('%s', (slug, zone) => {
  it('parses every item its file holds', () => {
    expect(zone.issues).toEqual([])
    const parsed = zone.sections.reduce((total, section) => total + section.items.length, 0)
    const raw = Object.values(loadZoneFile(slug).sections)
      .reduce((total, section) => total + (section.items?.length ?? 0), 0)
    expect(parsed).toBe(raw)
  })

  it('hands back sections in draw order', () => {
    const orders = zone.sections.map(section => section.definition.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('holds every section its zone module declares', () => {
    expect(zone.sections.map(s => s.key).sort()).toEqual(Object.keys(zones[slug].sections).sort())
  })

  it('indexes every item by id', () => {
    const items = zone.sections.flatMap(section => section.items)
    expect(zone.byId.size).toBe(items.length)
    for (const item of items) expect(zone.byId.get(item.id)).toBe(item)
  })

  it('offers only sections holding something', () => {
    expect(zone.drawable.map(s => s.key)).toEqual(
      zone.sections.filter(s => s.items.length > 0).map(s => s.key)
    )
  })

  // A zone filter reaches a section only where that section's items carry its field, which is
  // what keeps the drop filter off the aethernet and the level range off Bozja.
  it('binds a zone filter only to the sections carrying its field', () => {
    for (const filter of zone.scopedFilters) {
      const reached = zone.sections.filter(section =>
        section.constraints.some(other => other.stateKey === filter.stateKey)
      )
      expect(reached.length, `${slug} ${filter.stateKey}`).toBeGreaterThan(0)
      // Both directions: a section answering to the filter is bound to it, one that does not is
      // left alone.
      for (const section of zone.sections) {
        const answers = filter.definition.constrains({
          ...filter.scope,
          items: section.items as never[],
        })
        expect(reached.includes(section), `${slug} ${filter.stateKey} ${section.key}`)
          .toBe(answers)
      }
    }
  })

  it('reads a zone filter\'s options from the whole zone', () => {
    for (const filter of zone.scopedFilters) {
      expect(filter.scope.items.length).toBe(zone.byId.size)
    }
  })

  it('says which section holds each item', () => {
    for (const section of zone.sections) {
      for (const item of section.items) {
        expect(zone.sectionOf.get(item.id), item.id).toBe(section)
      }
    }
  })

  // A reference is stored at one end only, and the panel reads it from the other: a Eureka enemy
  // names the FATE it spawns, where an Occult event names the enemy that starts it.
  it('reads the spawn relation from the end the data does not store it at', () => {
    const declared = zone.sections.flatMap(section =>
      section.items.filter(item => 'spawnsFate' in item && item.spawnsFate)
    )

    for (const item of declared) {
      const spawners = zone.spawnersOf((item as { spawnsFate: string }).spawnsFate)
      expect(spawners.map(other => other.id), item.id).toContain(item.id)
      expect(zone.sectionOf.get((item as { spawnsFate: string }).spawnsFate)?.definition.type)
        .toBe('event')
    }

    // The other end: an item naming its own spawner answers with that one and nothing else.
    for (const section of zone.sections) {
      for (const item of section.items) {
        if (!('spawnedBy' in item) || !item.spawnedBy) continue
        expect(zone.spawnersOf(item.id).map(other => other.id)).toEqual([item.spawnedBy])
      }
    }

    expect(zone.spawnersOf('not-an-id')).toEqual([])
  })

  it('names an item a reference points at', () => {
    for (const item of zone.byId.values()) {
      const described = describeRef(zone, item.id)
      if (!item.name) {
        expect(described).toBe('')
        continue
      }
      const [first] = item.positions
      expect(described).toBe(`${item.name} (${first!.x}, ${first!.y})`)
    }
    expect(describeRef(zone, undefined)).toBe('')
    expect(describeRef(zone, 'not-an-id')).toBe('')
  })

  it('draws everything it holds before a filter is touched', () => {
    const state = initialState(zone)
    for (const section of zone.sections) {
      expect(visibleItems(section, state.values).length, section.key).toBe(section.items.length)
    }
  })
})

describe('a zone whose file has drifted', () => {
  it('reports the item and keeps the rest', () => {
    const file = structuredClone(loadZoneFile('anemos'))
    const items = file.sections.enemies?.items ?? []
    const before = items.length
    items[0] = { ...(items[0] as object), level: 'seventy' }

    const zone = loadZone(zones.anemos, file)
    const enemies = zone.sections.find(section => section.key === 'enemies')

    expect(zone.issues).toHaveLength(1)
    expect(zone.issues[0]?.section).toBe('enemies')
    expect(zone.issues[0]?.index).toBe(0)
    expect(enemies?.items).toHaveLength(before - 1)
  })

  it('leaves a section its file does not mention empty', () => {
    const zone = loadZone(zones.anemos, { schemaVersion: ZONE_SCHEMA_VERSION, sections: {} })
    expect(zone.sections.map(s => s.key).sort()).toEqual(Object.keys(zones.anemos.sections).sort())
    expect(zone.drawable).toEqual([])
    expect(zone.scopedFilters).toEqual([])
  })
})

// The file itself, before any section schema sees an item. Both the viewer and the editor reach
// this through parseSections, so neither can load a file the other would refuse.
describe('a file this build cannot read', () => {
  const fileIssue = (input: unknown) => {
    const zone = loadZone(zones.anemos, input)
    return zone.issues.find(issue => issue.section === undefined)
  }

  it('reports a stale schema version and reads no items', () => {
    const file = loadZoneFile('anemos')
    const zone = loadZone(zones.anemos, { ...file, schemaVersion: ZONE_SCHEMA_VERSION - 1 })

    expect(zone.issues).toHaveLength(1)
    expect(zone.issues[0]?.section).toBeUndefined()
    expect(zone.issues[0]?.message).toContain(String(ZONE_SCHEMA_VERSION))
    expect(zone.byId.size).toBe(0)
  })

  it('reports a section whose items are not a list, rather than throwing', () => {
    expect(fileIssue({ schemaVersion: ZONE_SCHEMA_VERSION, sections: { enemies: { items: {} } } }))
      .toBeDefined()
  })

  it('reports anything that is not a zone file at all', () => {
    for (const input of [null, 42, 'a string', [], {}, { sections: {} }]) {
      expect(fileIssue(input), JSON.stringify(input)).toBeDefined()
    }
  })

  it('accepts a section that omits its items', () => {
    expect(fileIssue({ schemaVersion: ZONE_SCHEMA_VERSION, sections: { enemies: {} } }))
      .toBeUndefined()
  })
})
