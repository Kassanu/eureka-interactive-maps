import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { initialState, zoneMarkers, zones } from '../zones'
import { english } from './helpers/messages'
import { hydrateZone, loadZoneFile } from './helpers/zoneFiles'

const points = zones.north_horn.sections.survey_points!
const schema = points.schema as z.ZodType
const placed = {
  id: '3e1c9a7b-5d2f-4c8e-a1b6-9f0d2e4c6a8b',
  entity: '7c2d4e6f-1a3b-4c5d-8e9f-0a1b2c3d4e5f',
  positions: [{ x: 10, y: 10 }],
}

const parses = (point: object) => schema.safeParse({ ...placed, ...point }).success
const label = (point: object, name: string) =>
  points.label!(schema.parse({ ...placed, ...point }) as never, () => name)(english)

describe('a survey point', () => {
  it('may be placed before its record number is known', () => {
    expect(parses({})).toBe(true)
    expect(parses({ recordNumber: 31 })).toBe(true)
  })

  it('holds its record number as a positive integer', () => {
    expect(parses({ recordNumber: 0 })).toBe(false)
    expect(parses({ recordNumber: 1.5 })).toBe(false)
    expect(parses({ recordNumber: '31' })).toBe(false)
  })
})

describe('a survey point label', () => {
  it('reads as the record number and then its entity\'s name', () => {
    expect(label({ recordNumber: 31 }, 'North Horn Base Camp')).toBe('#31: North Horn Base Camp')
  })

  it('is the name alone without a record number', () => {
    expect(label({}, 'North Horn Base Camp')).toBe('North Horn Base Camp')
  })

  it('is empty without a name', () => {
    expect(label({ recordNumber: 31 }, '')).toBe('')
  })
})

interface ShippedPoint {
  id: string
  entity: string
  recordNumber?: number
}

const COUNTS = { north_horn: 14, south_horn: 12 } as const

describe.each(Object.entries(COUNTS))('%s', (slug, count) => {
  const shipped = loadZoneFile(slug as keyof typeof COUNTS).sections.survey_points!
    .items as ShippedPoint[]

  it(`places ${count} survey points`, () => {
    expect(shipped).toHaveLength(count)
  })

  it('gives every survey point a record number no other in the zone holds', () => {
    const numbers = shipped.map(point => point.recordNumber)
    expect(numbers.every(number => number !== undefined)).toBe(true)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('names every survey point by its place alone', () => {
    const entries = hydrateZone(slug as keyof typeof COUNTS).entities.get('survey_points')!
    const names = shipped.map(point => entries.label(point.entity, english))
    expect(names.filter(name => name === '' || name.startsWith('#'))).toEqual([])
  })
})

describe('a survey point marker', () => {
  function markerLabel(slug: 'north_horn' | 'south_horn', number: number) {
    const zone = hydrateZone(slug)
    const point = (loadZoneFile(slug).sections.survey_points!.items as ShippedPoint[])
      .find(candidate => candidate.recordNumber === number)!
    return zoneMarkers(zone, initialState(zone), english)
      .find(marker => marker.itemId === point.id)?.label
  }

  it('reads as the record number and then the name', () => {
    expect(markerLabel('north_horn', 31)).toBe('#31: North Horn Base Camp')
    expect(markerLabel('south_horn', 5)).toBe('#5: Expedition Base Camp')
  })
})
