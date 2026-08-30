import { describe, expect, it } from 'vitest'
import {
  NONE_KEY,
  NO_KEY,
  YES_KEY,
  applyFilters,
  initialState,
  operations,
  setKeys,
  visibleItems,
  zoneSlugs,
  zones,
} from '../zones'
import type { LoadedSection, LoadedZone, ScopedFilter, ZoneSlug } from '../zones'
import { hydratedZones } from './helpers/zoneFiles'

// Every filter that narrows any section of any zone, with the items it reads and what it offers.
// A filter is scoped by the loader, so this is the list the viewer itself works from.
interface Case {
  zone: LoadedZone
  section: LoadedSection
  filter: ScopedFilter<never>
  where: string
}

const cases: Case[] = []
const loaded = hydratedZones()

for (const zone of loaded) {
  for (const section of zone.sections) {
    for (const filter of section.constraints) {
      cases.push({ zone, section, filter, where: `${zone.definition.slug}.${section.key}.${filter.definition.key}` })
    }
  }
}

// Filters over a single field, where one enabled option is a state the filter can be read in.
const independent = cases.filter(
  entry => entry.filter.definition.combine === 'any' && entry.filter.definition.control !== 'range'
)

const combined = cases.filter(entry => entry.filter.definition.combine === 'every')

describe('every declared filter', () => {
  it('covers all eight zones', () => {
    expect(new Set(cases.map(entry => entry.zone.definition.slug)).size).toBe(zoneSlugs.length)
  })

  it('keeps every item at its initial value', () => {
    const hiding: string[] = []
    for (const { filter, section, where } of cases) {
      const value = filter.definition.initial(filter.scope)
      const kept = section.items.filter(item => filter.definition.matches(item as never, value))
      if (kept.length !== section.items.length) {
        hiding.push(`${where} hides ${section.items.length - kept.length} of ${section.items.length}`)
      }
    }
    expect(hiding).toEqual([])
  })

  it('reads its initial value as untouched', () => {
    const moved = cases
      .filter(({ filter }) => !filter.definition.isDefault(filter.definition.initial(filter.scope), filter.scope))
      .map(entry => entry.where)
    expect(moved).toEqual([])
  })

  it('names every option once', () => {
    const duplicated: string[] = []
    for (const { filter, where } of cases) {
      const values = filter.definition.options(filter.scope).map(option => option.key)
      if (new Set(values).size !== values.length) duplicated.push(where)
    }
    expect(duplicated).toEqual([])
  })

  it('gives every option text to draw', () => {
    const blank: string[] = []
    for (const { filter, where } of cases) {
      for (const option of filter.definition.options(filter.scope)) {
        if (!option.label.trim()) blank.push(`${where}.${option.key}`)
      }
    }
    expect(blank).toEqual([])
  })

  it('hides everything when nothing is enabled', () => {
    const leaking: string[] = []
    for (const { filter, section, where } of cases) {
      if (filter.definition.control === 'range') continue
      const kept = section.items.filter(item => filter.definition.matches(item as never, []))
      if (kept.length) leaking.push(`${where} keeps ${kept.length}`)
    }
    expect(leaking).toEqual([])
  })

  it('draws only where two options can tell items apart', () => {
    for (const { filter, where } of cases) {
      if (filter.definition.control === 'range') continue
      expect(filter.definition.applies(filter.scope), where).toBe(filter.definition.options(filter.scope).length > 1)
    }
  })

  // A range has no options, so what makes it worth drawing is an item carrying the field.
  it('draws a range only where an item carries the field', () => {
    for (const { filter, section, where } of cases) {
      if (filter.definition.control !== 'range') continue
      const carried = section.items.some(
        item => item !== null && typeof item === 'object' && 'level' in item
      )
      expect(filter.definition.applies(filter.scope), where).toBe(carried)
    }
  })
})

describe('a filter over one field', () => {
  // The point of narrowing options to the data: an option nothing matches is one a reader can
  // only use to empty the map. A zone filter answers for its whole zone, which is the scope its
  // one control reads, so that is where its options have to be live.
  it('offers no option no item answers to', () => {
    const dead: string[] = []
    for (const { filter, where } of independent) {
      for (const option of filter.definition.options(filter.scope)) {
        const answering = filter.scope.items.some(item =>
          filter.definition.matches(item, [option.key])
        )
        if (!answering) dead.push(`${where}.${option.key}`)
      }
    }
    expect(dead).toEqual([])
  })

  // The other half: narrowing to one option must not leave an item behind answering to nothing,
  // which is what a field that can be empty needs its None option for.
  it('gives every item an option to answer to', () => {
    const orphaned: string[] = []
    for (const { filter, section, where } of independent) {
      const values = filter.definition.options(filter.scope).map(option => option.key)
      for (const item of section.items) {
        if (!values.some(value => filter.definition.matches(item as never, [value]))) {
          orphaned.push(`${where}: ${nameOf(item)}`)
        }
      }
    }
    expect(orphaned).toEqual([])
  })

  // What `combine: 'any'` claims, checked rather than trusted: enabling several options keeps
  // exactly what enabling each of them separately would.
  it('holds each option independently of the rest', () => {
    const coupled: string[] = []
    for (const { filter, section, where } of independent) {
      const values = filter.definition.options(filter.scope).map(option => option.key)
      for (const item of section.items) {
        const together = filter.definition.matches(item as never, values)
        const apart = values.some(value => filter.definition.matches(item as never, [value]))
        if (together !== apart) coupled.push(`${where}: ${nameOf(item)}`)
      }
    }
    expect(coupled).toEqual([])
  })
})

describe('a filter whose options combine', () => {
  it('is declared somewhere', () => {
    expect(combined.length).toBeGreaterThan(0)
  })

  // A weather alone matches nothing, so what has to be reachable is a weather alongside every
  // option outside its own group.
  it('leaves no option unreachable beside the other groups', () => {
    const dead: string[] = []
    for (const { filter, section, where } of combined) {
      const options = filter.definition.options(filter.scope)
      for (const option of options) {
        const enabled = options
          .filter(other => other.key === option.key || other.group !== option.group)
          .map(other => other.key)
        if (!section.items.some(item => filter.definition.matches(item as never, enabled))) {
          dead.push(`${where}.${option.key}`)
        }
      }
    }
    expect(dead).toEqual([])
  })

  // Emptying one group leaves nothing that has a condition at all, which is the difference from
  // a filter over one field. What stays is what never changes, and that answers to no group.
  it('keeps only what changes under nothing when a whole group is disabled', () => {
    for (const { filter, section, where } of combined) {
      const options = filter.definition.options(filter.scope)
      const groups = new Set(options.map(option => option.group).filter(Boolean))
      const unchanging = section.items.filter(item => filter.definition.matches(item as never, [NONE_KEY]))
      for (const group of groups) {
        const enabled = options.filter(o => o.group !== group).map(o => o.key)
        const kept = section.items.filter(item => filter.definition.matches(item as never, enabled))
        expect(kept, `${where} without ${String(group)}`).toEqual(unchanging)
      }
    }
  })
})

describe('a zone whose filters are untouched', () => {
  it('draws every item every section holds', () => {
    for (const zone of loaded) {
      const state = initialState(zone)
      for (const section of zone.sections) {
        const kept = visibleItems(section, state.values)
        expect(kept.length, `${zone.definition.slug}.${section.key}`).toBe(section.items.length)
      }
    }
  })

  it('starts with every drawable section enabled', () => {
    for (const zone of loaded) {
      expect(initialState(zone).sections, zone.definition.slug).toEqual(zone.drawable.map(s => s.key))
    }
  })
})

describe('narrowing one filter', () => {
  it('keeps exactly the items that option names', () => {
    const wrong: string[] = []
    for (const { filter, section, where } of cases) {
      if (filter.definition.control === 'range') continue
      for (const option of filter.definition.options(filter.scope)) {
        const values = { [filter.stateKey]: [option.key] }
        const kept = applyFilters<never>([filter], section.items as never[], values)
        const expected = section.items.filter(item =>
          filter.definition.matches(item as never, [option.key])
        )
        if (kept.length !== expected.length) wrong.push(`${where}.${option.key}`)
      }
    }
    expect(wrong).toEqual([])
  })
})

describe('the zones as declared', () => {
  it('gives every filter of a section its own state key', () => {
    for (const zone of loaded) {
      for (const section of zone.sections) {
        const keys = section.constraints.map(filter => filter.stateKey)
        expect(new Set(keys).size, `${zone.definition.slug}.${section.key}`).toBe(keys.length)
      }
    }
  })

  it('declares a level range wherever an item carries a level', () => {
    for (const zone of loaded) {
      const leveled = zone.sections.some(section =>
        section.items.some(item => item !== null && typeof item === 'object' && 'level' in item)
      )
      expect(Boolean(zones[zone.definition.slug as ZoneSlug].level), zone.definition.slug).toBe(leveled)
    }
  })

  // Bozja and Zadnor grade an enemy by rank, so a rank key stands where a level would and no
  // level is declared at all.
  it('leaves Bozja and Zadnor without one', () => {
    expect(zones.bozjansouthernfront.level).toBeUndefined()
    expect(zones.zadnor.level).toBeUndefined()
  })

  it('labels the level control with the word its operation uses', () => {
    for (const zone of loaded) {
      const level = zone.scopedFilters.find(filter => filter.definition.key === 'level')
      if (!zones[zone.definition.slug as ZoneSlug].level) {
        expect(level, zone.definition.slug).toBeUndefined()
        continue
      }
      const word = operations[zones[zone.definition.slug as ZoneSlug].operation].levelLabel
      expect(level?.definition.label, zone.definition.slug).toBe(word)
    }
    expect(loaded.find(zone => zone.definition.slug === 'north_horn')?.scopedFilters
      .find(filter => filter.definition.key === 'level')?.definition.label).toBe('Knowledge Level')
  })

  it('offers the None option only where an item leaves the field empty', () => {
    const empty: string[] = []
    for (const { filter, where } of cases) {
      const options = filter.definition.options(filter.scope)
      if (!options.some(option => option.key === NONE_KEY)) continue
      const answering = filter.scope.items.filter(item =>
        filter.definition.matches(item, [NONE_KEY])
      )
      if (answering.length === 0) empty.push(where)
    }
    expect(empty).toEqual([])
  })
})

function nameOf(item: unknown): string {
  const named = item as { id?: unknown; name?: unknown }
  return `${String(named?.name ?? '')} ${String(named?.id ?? '')}`.trim()
}

describe('several filters at once', () => {
  it('keeps only what every one of them keeps', () => {
    let checked = 0
    for (const zone of loaded) {
      for (const section of zone.drawable) {
        const pair = section.constraints
          .filter(filter => filter.definition.control === 'toggles')
          .slice(0, 2)
        if (pair.length < 2) continue

        const state = initialState(zone)
        for (const filter of pair) {
          const [first] = filter.definition.options(filter.scope)
          if (first) setKeys(state, filter.stateKey, [first.key])
        }

        const both = visibleItems(section, state.values)
        const separately = pair.reduce<readonly typeof section.items[number][]>((kept, filter) => {
          const alone = initialState(zone)
          const [first] = filter.definition.options(filter.scope)
          if (first) setKeys(alone, filter.stateKey, [first.key])
          const passing = new Set(visibleItems(section, alone.values))
          return kept.filter(item => passing.has(item))
        }, section.items)

        expect(both, `${zone.definition.slug}.${section.key}`).toEqual(separately)
        checked++
      }
    }
    expect(checked, 'sections with two filters to combine').toBeGreaterThan(0)
  })
})

// The field each yes-or-no filter reads, named here so a filter rewired to a neighbouring field
// fails instead of agreeing with itself.
const FLAG_FIELDS: Record<string, (item: Record<string, unknown>) => boolean> = {
  spawnsFate: item => item.spawnsFate !== '' && item.spawnsFate !== undefined,
  mutates: item => item.mutation !== undefined,
  adapts: item => item.adaptation !== undefined,
  prerequisite: item => item.requires !== '' && item.requires !== undefined,
}

describe('a yes or no filter', () => {
  it('splits the section on the field it is named for', () => {
    const seen = new Set<string>()
    for (const zone of loaded) {
      for (const section of zone.drawable) {
        for (const filter of section.constraints) {
          if (filter.definition.control !== 'segmented') continue
          const reads = FLAG_FIELDS[filter.definition.key]
          expect(reads, `no field declared for ${filter.definition.key}`).toBeDefined()
          seen.add(filter.definition.key)

          const holds = section.items.filter(item => reads!(item as Record<string, unknown>))
          const lacks = section.items.filter(item => !reads!(item as Record<string, unknown>))
          const where = `${zone.definition.slug}.${section.key}.${filter.definition.key}`

          const yes = initialState(zone)
          setKeys(yes, filter.stateKey, [YES_KEY])
          expect(visibleItems(section, yes.values), `${where} yes`).toEqual(holds)

          const no = initialState(zone)
          setKeys(no, filter.stateKey, [NO_KEY])
          expect(visibleItems(section, no.values), `${where} no`).toEqual(lacks)
        }
      }
    }
    expect([...seen].sort()).toEqual(Object.keys(FLAG_FIELDS).sort())
  })
})
