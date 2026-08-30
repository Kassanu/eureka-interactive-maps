import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { createItem, zoneSlugs, zones } from '../zones'
import type { ZoneItem, ZoneSlug } from '../zones'
import { dropItems } from '../model/lookups/drops'
import { weathers } from '../model/lookups'

// The item form builds objects the schemas have to accept: a mutation the moment its checkbox is
// ticked, a drop the moment one is added. Nothing here mounts a component; what is checked is
// that the shapes the form makes are the shapes the model declares.

interface Case {
  zone: ZoneSlug
  key: string
  type: string
  schema: z.ZodObject
  item: ZoneItem
}

const cases: Case[] = []
for (const slug of zoneSlugs) {
  for (const [key, section] of Object.entries(zones[slug].sections)) {
    cases.push({
      zone: slug,
      key,
      type: section.type,
      schema: section.schema as z.ZodObject,
      item: createItem(section, { x: 5, y: 5 }),
    })
  }
}

// A new item is valid apart from a reference it cannot invent, so these check what a form change
// does to it rather than whether it started perfect.
function complaintsAbout(schema: z.ZodType, item: unknown, field: string): z.core.$ZodIssue[] {
  const parsed = schema.safeParse(item)
  if (parsed.success) return []
  return parsed.error.issues.filter(issue => issue.path[0] === field)
}

describe('the fields a form decides to draw', () => {
  // Every item may carry a name; a mob, an event and a spell have to. A coffer has none, which
  // is why the panel falls back to its section's name for one.
  it('takes a name on every item, and needs one on the named kinds', () => {
    let seenRequired = 0
    for (const { key, type, schema, item } of cases) {
      expect('name' in schema.shape, key).toBe(true)
      expect(complaintsAbout(schema, { ...item, name: 'Named' }, 'name'), key).toEqual([])

      const unnamed = { ...item } as Record<string, unknown>
      delete unnamed.name
      const required = complaintsAbout(schema, unnamed, 'name').length > 0
      expect(required, key).toBe(['enemy', 'event', 'spell'].includes(type))
      if (required) seenRequired++
    }
    expect(seenRequired).toBeGreaterThan(0)
  })

  // An item with no mutation does not carry the key at all, so a handler asking the item whether
  // the field is allowed would refuse to add the one thing that is missing. What a form may set
  // comes from the schema, never from the item in front of it.
  it('declares optional fields that an item without one does not carry', () => {
    let seen = 0
    for (const { key, schema, item } of cases) {
      for (const field of ['mutation', 'adaptation', 'boss', 'icon']) {
        const declared = schema.shape[field]
        if (!declared || declared.safeParse(undefined).success !== true) continue
        expect(field in (item as object), `${key}.${field}`).toBe(false)
        seen++
      }
    }
    expect(seen, 'no section declares an optional field').toBeGreaterThan(0)
  })

  // The form offers a Default option only where the icon may be left off, which is how an
  // engagement is stopped from losing the marker it has to have.
  it('lets the icon be cleared only where the schema allows none', () => {
    for (const { key, schema, item } of cases) {
      const optional = schema.shape.icon?.safeParse(undefined).success === true
      const withoutIcon = { ...item } as Record<string, unknown>
      delete withoutIcon.icon
      expect(complaintsAbout(schema, withoutIcon, 'icon').length === 0, key).toBe(optional)
    }
  })
})

describe('ticking a presence checkbox', () => {
  it('makes a mutation the schema accepts, and taking it away leaves none', () => {
    for (const { key, schema, item } of cases) {
      if (!('mutation' in schema.shape)) continue
      const mutating = { ...item, mutation: { conditions: [] } }
      expect(complaintsAbout(schema, mutating, 'mutation'), key).toEqual([])

      const still = { ...item } as Record<string, unknown>
      delete still.mutation
      expect(complaintsAbout(schema, still, 'mutation'), key).toEqual([])
    }
  })

  it('makes an adaptation the schema accepts', () => {
    for (const { key, schema, item } of cases) {
      if (!('adaptation' in schema.shape)) continue
      const adapting = { ...item, adaptation: { conditions: [] } }
      expect(complaintsAbout(schema, adapting, 'adaptation'), key).toEqual([])
    }
  })

  // The form asks the schema whether a boss records a weakness rather than knowing which
  // operation it is looking at, so the two shapes have to stay distinguishable.
  it('makes a boss of whichever shape its own operation records', () => {
    const withWeakness = { name: 'New boss', weakness: [] }
    const plain = { name: 'New boss' }
    let seenRich = 0
    let seenPlain = 0

    for (const { key, schema } of cases) {
      const boss = schema.shape.boss
      if (!boss) continue
      const rich = boss.safeParse(withWeakness).success
      expect(boss.safeParse(rich ? withWeakness : plain).success, key).toBe(true)
      if (rich) seenRich++
      else seenPlain++
    }

    expect(seenRich, 'no operation records a boss weakness').toBeGreaterThan(0)
    expect(seenPlain, 'no operation records a boss without one').toBeGreaterThan(0)
  })
})

describe('adding a row to a list', () => {
  it('adds a drop the schema accepts', () => {
    for (const { key, schema, item } of cases) {
      if (!('drops' in schema.shape)) continue
      const dropped = { ...item, drops: [{ item: dropItems.keys[0]!, amount: 1 }] }
      expect(complaintsAbout(schema, dropped, 'drops'), key).toEqual([])
    }
  })

  it('adds a condition the schema accepts, and never the same weather twice', () => {
    for (const { key, schema, item } of cases) {
      if (!('mutation' in schema.shape)) continue
      // What ConditionList does: the first weather nothing in the block already uses.
      const conditions: { weather: string; time: string }[] = []
      for (let i = 0; i < 3; i++) {
        const taken = new Set(conditions.map(condition => condition.weather))
        const weather = weathers.keys.find(candidate => !taken.has(candidate))!
        conditions.push({ weather, time: 'any' })
      }
      const mutating = { ...item, mutation: { conditions } }
      expect(complaintsAbout(schema, mutating, 'mutation'), key).toEqual([])
    }
  })

  it('adds a timed spawn the schema accepts', () => {
    for (const { key, schema, item } of cases) {
      if (!('spawns' in schema.shape)) continue
      const spawning = { ...item, spawns: [{ type: 'time', seconds: 60 }] }
      expect(complaintsAbout(schema, spawning, 'spawns'), key).toEqual([])
    }
  })

  it('adds a position the schema accepts', () => {
    for (const { key, schema, item } of cases) {
      const moved = { ...item, position: [...item.positions, { x: 5, y: 5 }] }
      expect(complaintsAbout(schema, moved, 'position'), key).toEqual([])
    }
  })
})

describe('a pot picking where it spawns', () => {
  it('takes either the bonus roll or one FATE, and never both', () => {
    for (const { key, schema, item } of cases) {
      if (!('source' in schema.shape)) continue
      const id = crypto.randomUUID()
      expect(complaintsAbout(schema, { ...item, source: { type: 'bonus' } }, 'source'), key)
        .toEqual([])
      expect(complaintsAbout(schema, { ...item, source: { type: 'fate', fateId: id } }, 'source'), key)
        .toEqual([])
      expect(
        complaintsAbout(schema, { ...item, source: { type: 'bonus', fateId: id } }, 'source').length,
        key
      ).toBeGreaterThan(0)
    }
  })
})

describe('every reference the form offers a picker for', () => {
  it('takes an id the zone holds', () => {
    for (const slug of zoneSlugs) {
      const definition = zones[slug]
      for (const [key, section] of Object.entries(definition.sections)) {
        const schema = section.schema as z.ZodObject
        const item = createItem(section, { x: 5, y: 5 })
        const id = crypto.randomUUID()
        for (const field of ['spawnsFate', 'spawnedBy', 'learnedFrom', 'requires', 'replaces']) {
          if (!(field in schema.shape)) continue
          expect(complaintsAbout(schema, { ...item, [field]: id }, field), `${slug}.${key}.${field}`)
            .toEqual([])
        }
      }
    }
  })
})
