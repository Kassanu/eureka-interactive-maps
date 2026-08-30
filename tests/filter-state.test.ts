import { describe, expect, it } from 'vitest'
import {
  activeCount,
  everyFilter,
  initialState,
  onlyKey,
  onlySection,
  resetFilter,
  setBound,
  setKeys,
  toggleKey,
  visibleItems,
} from '../zones'
import { hydratedZones } from './helpers/zoneFiles'

// What a control does when a reader touches it. These are the operations the filter panel calls,
// and they are ordinary functions over the state object, so none of this needs a component.

const loaded = hydratedZones()

describe('a fresh state', () => {
  it('counts nothing as changed', () => {
    for (const zone of loaded) {
      expect(activeCount(zone, initialState(zone)), zone.definition.slug).toBe(0)
    }
  })
})

describe('toggling one option', () => {
  it('removes it, puts it back, and counts the filter while it is off', () => {
    for (const zone of loaded) {
      for (const filter of everyFilter(zone)) {
        if (filter.definition.control === 'range') continue
        const state = initialState(zone)
        const [first] = filter.definition.options(filter.scope)
        if (!first) continue

        toggleKey(state, filter.stateKey, first.key)
        expect(state.values[filter.stateKey], filter.stateKey).not.toContain(first.key)
        expect(activeCount(zone, state), filter.stateKey).toBe(1)

        toggleKey(state, filter.stateKey, first.key)
        expect(activeCount(zone, state), filter.stateKey).toBe(0)
      }
    }
  })
})

describe('only', () => {
  it('narrows to one option and restores the rest when used again', () => {
    for (const zone of loaded) {
      for (const filter of everyFilter(zone)) {
        if (filter.definition.control === 'range') continue
        const options = filter.definition.options(filter.scope)
        for (const option of options) {
          const state = initialState(zone)
          const where = `${filter.stateKey}/${option.key}`

          onlyKey(filter, state, option.key)
          const enabled = state.values[filter.stateKey] as string[]

          // Where groups are conditions holding at once, the other groups stay whole so that
          // something can still match. Everywhere else one option means one option.
          const conjoined = filter.definition.combine === 'every' && option.group !== undefined
          const elsewhere = options.filter(
            other => other.group !== undefined && other.group !== option.group
          )
          expect(enabled, where).toEqual(
            conjoined ? [option.key, ...elsewhere.map(o => o.key)] : [option.key]
          )

          onlyKey(filter, state, option.key)
          expect(state.values[filter.stateKey], where).toEqual(options.map(o => o.key))
          expect(activeCount(zone, state), where).toBe(0)
        }
      }
    }
  })

  it('leaves something on the map for every option it can isolate', () => {
    for (const zone of loaded) {
      for (const section of zone.drawable) {
        for (const filter of section.constraints) {
          if (filter.definition.control === 'range') continue
          for (const option of filter.definition.options(filter.scope)) {
            const state = initialState(zone)
            onlyKey(filter, state, option.key)
            const drawn = zone.drawable.reduce(
              (total, other) => total + visibleItems(other, state.values).length,
              0
            )
            expect(drawn, `${section.key}/${filter.stateKey}/${option.key}`).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('narrows the map to the section it names', () => {
    for (const zone of loaded) {
      const state = initialState(zone)
      const [first] = zone.drawable
      if (!first) continue

      onlySection(zone, state, first.key)
      expect(state.sections).toEqual([first.key])
      for (const section of zone.sections) {
        const drawn = state.sections.includes(section.key) ? section.items.length : 0
        expect(drawn, section.key).toBe(section === first ? section.items.length : 0)
      }
      expect(activeCount(zone, state)).toBe(1)
    }
  })
})

describe('reset', () => {
  it('puts one filter back without touching the others', () => {
    const zone = loaded[0]!
    const filters = everyFilter(zone).filter(f => f.definition.control !== 'range')
    const [one, other] = filters
    if (!one || !other) return

    const state = initialState(zone)
    setKeys(state, one.stateKey, [])
    setKeys(state, other.stateKey, [])
    expect(activeCount(zone, state)).toBe(2)

    resetFilter(one, state)
    expect(activeCount(zone, state)).toBe(1)
    expect(state.values[other.stateKey]).toEqual([])
  })
})

describe('a range', () => {
  it('narrows one end at a time and reads as untouched at its bounds', () => {
    const zone = loaded.find(candidate =>
      candidate.scopedFilters.some(filter => filter.definition.control === 'range')
    )!
    const filter = zone.scopedFilters.find(f => f.definition.control === 'range')!
    const state = initialState(zone)
    const bounds = filter.definition.initial(filter.scope) as { from: number; to: number }

    expect(activeCount(zone, state)).toBe(0)

    setBound(state, filter.stateKey, 'from', bounds.from + 10)
    expect(state.values[filter.stateKey]).toEqual({ from: bounds.from + 10, to: bounds.to })
    expect(activeCount(zone, state)).toBe(1)

    const section = zone.sections.find(candidate =>
      candidate.constraints.some(other => other.stateKey === filter.stateKey)
    )!
    expect(visibleItems(section, state.values).length).toBeLessThan(section.items.length)

    resetFilter(filter, state)
    expect(activeCount(zone, state)).toBe(0)
  })

  it('leaves a key set alone when handed a bound', () => {
    const zone = loaded[0]!
    const filter = everyFilter(zone).find(f => f.definition.control !== 'range')!
    const state = initialState(zone)
    const before = state.values[filter.stateKey]

    setBound(state, filter.stateKey, 'from', 5)
    expect(state.values[filter.stateKey]).toBe(before)
  })
})
