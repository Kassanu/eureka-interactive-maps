import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { DropSchema, dropItems } from '../model/lookups/drops'
import { iconKeys, iconPaths } from '../model/icons'
import * as lookups from '../model/lookups'
import {
  LevelSchema,
  NameSchema,
  PositionSchema,
  PositionsSchema,
  formatLevel,
  levelOverlaps,
} from '../model/primitives'
import { operations, zoneSlugs, zones } from '../zones'

const PUBLIC_DIR = join(process.cwd(), 'public')

// The reading half of a Lookup, which is all the rules below need. A Lookup is invariant in its
// key type because subset() accepts keys, so one over elements does not assign to one over
// strings; this names only what every domain has in common.
interface LookupReader {
  readonly keys: readonly string[]
  label(key: string | null | undefined): string
}

function asLookupReader(value: unknown): LookupReader | null {
  if (typeof value !== 'object' || value === null) return null
  if (!('keys' in value) || !('labels' in value) || !('label' in value)) return null
  return value as LookupReader
}

const domains: [string, LookupReader][] = Object.entries(lookups)
  .map(([name, value]): [string, LookupReader | null] => [name, asLookupReader(value)])
  .filter((entry): entry is [string, LookupReader] => entry[1] !== null)

describe('lookups', () => {
  it('finds every domain', () => {
    expect(domains.map(([name]) => name).sort()).toEqual([
      'aggroTypes', 'attacks', 'directions', 'elements', 'grades',
      'mobFamilies', 'ranks', 'spawnConditions', 'times', 'weathers',
    ])
  })

  it.each(domains)('%s labels every key', (_name, lookup) => {
    for (const key of lookup.keys) {
      expect(lookup.label(key), key).toBeTruthy()
    }
  })

  it.each(domains)('%s keys are squashed lowercase', (_name, lookup) => {
    for (const key of lookup.keys) {
      expect(key, key).toMatch(/^[a-z0-9]+$/)
    }
  })

  it.each(domains)('%s reads an empty key as nothing at all', (_name, lookup) => {
    expect(lookup.label('')).toBe('')
    expect(lookup.label(null)).toBe('')
    expect(lookup.label(undefined)).toBe('')
  })

  it('narrows to a subset and rejects a key outside the domain', () => {
    const narrowed = lookups.elements.subset(['fire', 'ice'])
    expect(narrowed.keys).toEqual(['fire', 'ice'])
    expect(narrowed.key.safeParse('fire').success).toBe(true)
    expect(narrowed.key.safeParse('water').success).toBe(false)
    expect(lookups.elements.key.safeParse('water').success).toBe(true)
    // @ts-expect-error a key outside the domain is a compile error as well as a runtime one
    expect(() => lookups.elements.subset(['plasma'])).toThrow()
  })
})

describe('icons', () => {
  it('has a file behind every registered key', () => {
    const missing = iconKeys.filter(key => !existsSync(join(PUBLIC_DIR, iconPaths[key])))
    expect(missing).toEqual([])
  })

  it('names a rank icon for every rank key', () => {
    for (const rank of lookups.ranks.keys) {
      expect(iconKeys, rank).toContain(`rank_${rank}`)
    }
  })

  it('names an icon for every element key', () => {
    for (const element of lookups.elements.keys) {
      expect(iconKeys, element).toContain(element)
    }
  })

  it('names a coffer icon for every grade key', () => {
    for (const grade of lookups.grades.keys) {
      expect(iconKeys, grade).toContain(`coffer_${grade}`)
    }
  })
})

describe('drop catalogue', () => {
  it('labels every key', () => {
    for (const key of dropItems.keys) {
      expect(dropItems.label(key), key).toBeTruthy()
    }
  })

  it('gives every item a distinct name', () => {
    const names = dropItems.keys.map(key => dropItems.labels[key])
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('level', () => {
  it('reads a bare number as a range with equal ends', () => {
    expect(LevelSchema.parse(25)).toEqual({ from: 25, to: 25 })
  })

  it('writes a range with equal ends back as a bare number', () => {
    expect(z.encode(LevelSchema, { from: 25, to: 25 })).toBe(25)
    expect(z.encode(LevelSchema, { from: 1, to: 5 })).toEqual({ from: 1, to: 5 })
  })

  it('refuses a range that runs backwards', () => {
    expect(LevelSchema.safeParse({ from: 9, to: 2 }).success).toBe(false)
  })

  it('refuses zero, which no zone draws', () => {
    expect(LevelSchema.safeParse(0).success).toBe(false)
  })

  it('overlaps a filter window on either end', () => {
    const level = { from: 10, to: 20 }
    expect(levelOverlaps(level, 1, 10)).toBe(true)
    expect(levelOverlaps(level, 20, 70)).toBe(true)
    expect(levelOverlaps(level, 1, 9)).toBe(false)
    expect(levelOverlaps(level, 21, 70)).toBe(false)
  })

  it('formats a single level and a range differently', () => {
    expect(formatLevel({ from: 25, to: 25 })).toBe('25')
    expect(formatLevel({ from: 1, to: 5 })).toBe('1 to 5')
  })
})

describe('positions', () => {
  it('refuses a coordinate outside the map', () => {
    expect(PositionSchema.safeParse({ x: 14.1, y: 34.5 }).success).toBe(true)
    expect(PositionSchema.safeParse({ x: 290, y: 12 }).success).toBe(false)
    expect(PositionSchema.safeParse({ x: -1, y: 12 }).success).toBe(false)
  })

  it('refuses a coordinate stored as a string', () => {
    expect(PositionSchema.safeParse({ x: '14.1', y: 34.5 }).success).toBe(false)
  })
})

describe('zone registry', () => {
  it('keys every zone by its own slug', () => {
    for (const slug of zoneSlugs) {
      expect(zones[slug].slug).toBe(slug)
    }
  })

  it('gives every section a name, and every zone at least one section', () => {
    for (const slug of zoneSlugs) {
      const sections = Object.entries(zones[slug].sections)
      expect(sections.length, slug).toBeGreaterThan(0)
      for (const [key, section] of sections) {
        expect(section.name, `${slug}.${key}`).toBeTruthy()
      }
    }
  })

  it('gives a zone a level range only where its sections carry a level', () => {
    expect(zones.bozjansouthernfront.level).toBeUndefined()
    expect(zones.zadnor.level).toBeUndefined()
    expect(zones.anemos.level).toEqual({ from: 1, to: 70 })
    expect(zones.south_horn.level).toEqual({ from: 1, to: 30 })
    expect(zones.north_horn.level).toEqual({ from: 20, to: 50 })
  })

  it('names the level after the operation, for zones with a range and without', () => {
    for (const slug of zoneSlugs) {
      expect(operations[zones[slug].operation].levelLabel, slug).toBeTruthy()
    }
    expect(operations.eureka.levelLabel).toBe('Level')
    expect(operations.bozja.levelLabel).toBe('Level')
    expect(operations.occult.levelLabel).toBe('Knowledge Level')
  })
})

// What the schemas refuse. Shipped data satisfies every one of these.

describe('a constraint the data never violates', () => {
  it('rejects a name that is empty', () => {
    expect(z.safeParse(NameSchema, '').success).toBe(false)
    expect(z.safeParse(NameSchema, 'Sabotender').success).toBe(true)
  })

  it('rejects a name padded with whitespace', () => {
    for (const padded of [' Laboratory Lion', 'Ljeban Point ', ' both ']) {
      expect(z.safeParse(NameSchema, padded).success, padded).toBe(false)
    }
  })

  it('rejects an item placed nowhere', () => {
    expect(z.safeParse(PositionsSchema, []).success).toBe(false)
    expect(z.safeParse(PositionsSchema, [{ x: 1, y: 1 }]).success).toBe(true)
  })

  it('rejects a position off the map', () => {
    expect(z.safeParse(PositionSchema, { x: -1, y: 1 }).success).toBe(false)
    expect(z.safeParse(PositionSchema, { x: 1, y: 46 }).success).toBe(false)
  })

  it('rejects a drop of nothing', () => {
    const anyDrop = dropItems.keys[0]!
    expect(z.safeParse(DropSchema, { item: anyDrop, amount: 0 }).success).toBe(false)
    expect(z.safeParse(DropSchema, { item: anyDrop, amount: -1 }).success).toBe(false)
    expect(z.safeParse(DropSchema, { item: anyDrop, amount: 1 }).success).toBe(true)
  })

  it('rejects a level range that runs backwards', () => {
    expect(z.safeParse(LevelSchema, { from: 30, to: 20 }).success).toBe(false)
    expect(z.safeParse(LevelSchema, { from: 20, to: 30 }).success).toBe(true)
  })
})
