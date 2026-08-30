import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  ZONE_SCHEMA_VERSION,
  encodeZone,
  firstAccepted,
  isOptionalField,
  parseSections,
  setField,
  shapeOf,
  spawnedByOf,
  spawnsFateOf,
  zoneFor,
  zoneSlugs,
  type RawZoneFile,
} from '../zones'
import { hydrateZone, loadZoneFile } from './helpers/zoneFiles'

// What Save refuses to write, and what the loader says about a file it cannot fully read.

describe('writing a zone back', () => {
  it.each(zoneSlugs)('%s writes cleanly as it ships', slug => {
    const { file, issues } = encodeZone(hydrateZone(slug), ZONE_SCHEMA_VERSION)
    expect(issues).toEqual([])
    expect(file).not.toBeNull()
  })

  // Deleting an item leaves whatever pointed at it holding an id that resolves to nothing. Every
  // item still passes its own schema, so only a pass over the whole file catches it.
  it('refuses a file whose references no longer resolve', () => {
    const zone = hydrateZone('anemos')
    const fates = zone.sections.find(section => section.key === 'fates')!
    const target = fates.items.find(item =>
      [...zone.byId.values()].some(other => 'spawnsFate' in other && other.spawnsFate === item.id)
    )!

    fates.items.splice(fates.items.indexOf(target), 1)
    zone.byId.delete(target.id)

    const { file, issues } = encodeZone(zone, ZONE_SCHEMA_VERSION)
    expect(file).toBeNull()
    expect(issues.length).toBeGreaterThan(0)
    expect(issues.every(issue => issue.message.includes(target.id))).toBe(true)
  })

  it('refuses an item the schema no longer accepts, and names it', () => {
    const zone = hydrateZone('anemos')
    const enemies = zone.sections.find(section => section.key === 'enemies')!
    const item = enemies.items[0]!
    const named = item.name
    Object.assign(item, { name: '  padded  ' })

    const { file, issues } = encodeZone(zone, ZONE_SCHEMA_VERSION)
    expect(file).toBeNull()
    expect(issues.some(issue => issue.itemId === item.id)).toBe(true)

    Object.assign(item, { name: named })
    expect(encodeZone(zone, ZONE_SCHEMA_VERSION).file).not.toBeNull()
  })
})

describe('reading a zone file', () => {
  // A section the file holds and the zone module does not is read by nothing and written back by
  // nothing, so it would otherwise disappear on the next save without a word.
  it('says so when the file holds a section this build does not know', () => {
    const raw = loadZoneFile('anemos')
    const file: RawZoneFile = {
      ...raw,
      sections: { ...raw.sections, notorious: { items: [{ id: 'x' }] } },
    }

    const { issues } = parseSections(zoneFor('anemos'), file)
    const unknown = issues.filter(issue => issue.section === 'notorious')
    expect(unknown.length).toBe(1)
    expect(unknown[0]!.index).toBeUndefined()
    expect(unknown[0]!.message).toContain('not a section of this zone')
  })

  it('names the section and row of an item that will not parse', () => {
    const raw = loadZoneFile('anemos')
    const enemies = raw.sections.enemies!.items!
    const file: RawZoneFile = {
      ...raw,
      sections: {
        ...raw.sections,
        enemies: { items: [...enemies.slice(0, 2), { id: 'not-a-uuid' }] },
      },
    }

    const { sections, issues } = parseSections(zoneFor('anemos'), file)
    expect(sections.get('enemies')!.length).toBe(2)
    expect(issues).toHaveLength(1)
    expect(issues[0]).toMatchObject({ section: 'enemies', index: 2 })
  })
})

describe('writing a field the schema makes optional', () => {
  // The item does not carry a field it has none of, so a guard that asks the item refuses to add
  // the very thing that is missing. This is what made the Name box a no-op on every unnamed item.
  it('adds a field the item does not have but the schema allows', () => {
    const shape = { name: true, icon: true }
    const item: Record<string, unknown> = { id: 'a' }

    setField(item, shape, 'name', 'Given a name')
    expect(item.name).toBe('Given a name')
  })

  it('removes the field when given nothing', () => {
    const shape = { name: true }
    const item: Record<string, unknown> = { id: 'a', name: 'Had one' }

    setField(item, shape, 'name', undefined)
    expect('name' in item).toBe(false)
  })

  it('ignores a field the schema does not declare', () => {
    const item: Record<string, unknown> = { id: 'a' }
    setField(item, { name: true }, 'rank', '3')
    expect('rank' in item).toBe(false)
  })

  // Every unnamed item the data ships: a coffer, a pot, a lockbox, an elemental. The box is drawn
  // for all of them because the schema declares the field, so writing to it has to work for all
  // of them too.
  it('names every shipped item whose section offers a name box', () => {
    let named = 0
    for (const slug of zoneSlugs) {
      const zone = hydrateZone(slug)
      for (const section of zone.sections) {
        const shape = (section.definition.schema as unknown as {
          shape: Record<string, unknown>
        }).shape
        if (!('name' in shape)) continue

        for (const item of section.items.filter(candidate => !('name' in candidate))) {
          setField(item, shape, 'name', 'Named by the editor')
          expect((item as { name?: string }).name, `${slug}.${section.key}`)
            .toBe('Named by the editor')
          expect(
            z.safeEncode(section.definition.schema as z.ZodType, item).success,
            `${slug}.${section.key}`
          ).toBe(true)
          named++
        }
      }
    }
    expect(named).toBeGreaterThan(500)
  })
})

// The two questions the item form used to answer by trial-parsing a Zod schema inside a template.
describe('asking a schema what it allows', () => {
  it('says whether a field may be left off', () => {
    const enemies = shapeOf(zoneFor('anemos').sections.enemies!.schema)
    const engagements = shapeOf(zoneFor('bozjansouthernfront').sections.engagements!.schema)

    expect(isOptionalField(enemies, 'icon')).toBe(true)
    expect(isOptionalField(engagements, 'icon')).toBe(false)
    expect(isOptionalField(enemies, 'nothing-declares-this')).toBe(false)
  })

  it('picks the richest boss shape each operation accepts', () => {
    const rich = { name: 'New boss', weakness: [] }
    const plain = { name: 'New boss' }
    const candidates = [rich, plain]

    const eureka = shapeOf(zoneFor('anemos').sections.fates!.schema)
    const occult = shapeOf(zoneFor('north_horn').sections.fates!.schema)

    expect(firstAccepted(eureka, 'boss', candidates)).toEqual(plain)
    expect(firstAccepted(occult, 'boss', candidates)).toEqual(rich)
    expect(firstAccepted(eureka, 'boss', [{ name: '' }])).toBeUndefined()
  })
})

describe('the spawn relation', () => {
  it('is read from whichever end the operation records it at', () => {
    const eureka = hydrateZone('anemos')
    const withFate = [...eureka.byId.values()].find(item => spawnsFateOf(item))!
    expect(spawnedByOf(withFate)).toBeUndefined()
    expect(eureka.spawnersOf(spawnsFateOf(withFate)!).map(item => item.id)).toContain(withFate.id)

    const occult = hydrateZone('north_horn')
    const named = [...occult.byId.values()].find(item => spawnedByOf(item))!
    expect(spawnsFateOf(named)).toBeUndefined()
    expect(occult.spawnersOf(named.id).map(item => item.id)).toEqual([spawnedByOf(named)])
  })

  it('reads an empty reference as no relation at all', () => {
    const zone = hydrateZone('anemos')
    const without = [...zone.byId.values()].find(
      item => 'spawnsFate' in item && item.spawnsFate === ''
    )!
    expect(spawnsFateOf(without)).toBeUndefined()
  })
})

// Filter options that point at another section follow the zone's declaration order, which is the
// order the reader sees them listed in the panel.
describe('resolving items outside a filter scope', () => {
  it('returns them once each, in declaration order, named', () => {
    const zone = hydrateZone('north_horn')
    const declared = [...zone.byId.keys()]
    const picked = [declared[8]!, declared[2]!, declared[8]!, declared[5]!]

    const filter = zone.sections
      .flatMap(section => section.constraints)
      .find(candidate => candidate.definition.key === 'source')!
    const resolved = filter.scope.resolve(picked)

    expect(resolved.map(item => item.id)).toEqual([declared[2], declared[5], declared[8]])
    for (const item of resolved) {
      expect(item.name).toBe(zone.byId.get(item.id)!.name ?? item.id)
    }
  })

  it('names an id the zone does not hold after everything it does', () => {
    const zone = hydrateZone('north_horn')
    const filter = zone.sections
      .flatMap(section => section.constraints)
      .find(candidate => candidate.definition.key === 'source')!
    const first = [...zone.byId.keys()][0]!

    expect(filter.scope.resolve(['nope', first])).toEqual([
      { id: first, name: zone.byId.get(first)!.name ?? first },
      { id: 'nope', name: 'nope' },
    ])
  })
})
