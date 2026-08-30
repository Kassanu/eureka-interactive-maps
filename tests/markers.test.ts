import { describe, expect, it } from 'vitest'
import {
  initialState,
  onlySection,
  toggleSection,
  visibleItems,
  zoneMarkers,
  type ZoneSlug,
} from '../zones'
import { iconKeys, iconPath } from '../model/icons'
import { formatLevel } from '../model/primitives'
import { hydratedZones } from './helpers/zoneFiles'

// What the viewer draws. `nuxt generate` only proves the shell rendered, because zone data loads
// in the browser, so the marker list is checked here instead.

const loaded = hydratedZones()

describe.each(loaded.map(zone => [zone.definition.slug as ZoneSlug, zone] as const))('%s', (slug, zone) => {
  const state = initialState(zone)
  const markers = zoneMarkers(zone, state)

  it('draws a marker per position of every item', () => {
    const points = zone.sections.reduce(
      (total, section) => total + section.items.reduce((n, item) => n + item.positions.length, 0),
      0
    )
    expect(markers.length).toBe(points)
  })

  it('gives every marker its own id', () => {
    expect(new Set(markers.map(marker => marker.id)).size).toBe(markers.length)
  })

  it('points every marker at an item that exists, in a section that holds it', () => {
    for (const marker of markers) {
      expect(zone.byId.has(marker.itemId), marker.itemId).toBe(true)
      const section = zone.sectionOf.get(marker.itemId)
      expect(section?.items.some(item => item.id === marker.itemId), marker.itemId).toBe(true)
    }
  })

  it('draws sections in order, so a higher order sits on top', () => {
    const firstDrawn = new Map<string, number>()
    markers.forEach((marker, index) => {
      const key = zone.sectionOf.get(marker.itemId)?.key ?? ''
      if (!firstDrawn.has(key)) firstDrawn.set(key, index)
    })
    const orders = [...firstDrawn.keys()].map(
      key => zone.sections.find(section => section.key === key)?.definition.order ?? 0
    )
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('resolves every icon to a file the registry names', () => {
    const known = new Set(iconKeys.map(iconPath))
    for (const marker of markers) {
      expect(marker.icons.length).toBeGreaterThan(0)
      for (const path of marker.icons) {
        expect(known.has(path), `${slug} ${marker.itemId} ${path}`).toBe(true)
      }
    }
  })

  it('labels a marker with its name, and its level where it has one', () => {
    for (const marker of markers) {
      const item = zone.byId.get(marker.itemId)
      if (!item?.name) {
        expect(marker.label).toBe('')
        continue
      }
      const level = 'level' in item ? ` (${formatLevel(item.level)})` : ''
      expect(marker.label, marker.itemId).toBe(`${item.name}${level}`)
    }
  })

  it('draws nothing for a section the reader turned off', () => {
    for (const section of zone.drawable) {
      const without = { ...state, sections: state.sections.filter(key => key !== section.key) }
      const drawn = zoneMarkers(zone, without)
      const keys = drawn.map(marker => zone.sectionOf.get(marker.itemId)?.key)
      expect(keys.includes(section.key), section.key).toBe(false)
      expect(drawn.length).toBeLessThan(markers.length)
    }
  })

  it('draws one section alone when it is soloed', () => {
    const first = zone.drawable[0]
    if (!first) return
    const soloed = { ...state, sections: [...state.sections] }
    onlySection(zone, soloed, first.key)
    const drawn = zoneMarkers(zone, soloed).map(m => zone.sectionOf.get(m.itemId)?.key)
    expect(new Set(drawn)).toEqual(new Set([first.key]))

    onlySection(zone, soloed, first.key)
    expect(soloed.sections).toEqual(zone.drawable.map(section => section.key))
  })
})

describe('turning a section off and on', () => {
  it('puts back exactly what it removed', () => {
    const zone = loaded[0]!
    const state = initialState(zone)
    const before = zoneMarkers(zone, state).length
    const key = zone.drawable[0]!.key

    toggleSection(state, key)
    expect(zoneMarkers(zone, state).length).toBeLessThan(before)

    toggleSection(state, key)
    expect(zoneMarkers(zone, state).length).toBe(before)
  })
})

describe('an item with several positions', () => {
  it('is one entry in its section and a marker at each point', () => {
    const zone = loaded.find(candidate =>
      candidate.sections.some(section => section.items.some(item => item.positions.length > 1))
    )
    expect(zone, 'no zone places an item twice').toBeDefined()
    if (!zone) return

    const state = initialState(zone)
    const markers = zoneMarkers(zone, state)
    for (const section of zone.sections) {
      for (const item of visibleItems(section, state.values)) {
        const drawn = markers.filter(marker => marker.itemId === item.id)
        expect(drawn.length, item.id).toBe(item.positions.length)
        expect(drawn.map(marker => marker.coordinates)).toEqual(item.positions)
      }
    }
  })
})
