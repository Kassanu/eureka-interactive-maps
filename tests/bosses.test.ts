import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { BOSSES_GROUP, zoneSlugs, zones } from '../zones'
import { english } from './helpers/messages'
import { hydrateZone, loadZoneFile } from './helpers/zoneFiles'

interface ShippedEvent {
  id: string
  entity: string
  bosses?: { entity: string; weakness?: string[] }[]
}

const MINDERTAUR = '2f0c6a1e-9b4d-4f3a-8e7c-5d1b2a3c4e6f'
const ELDERTAUR = '8a3e5c7d-1f2b-4a6c-9d0e-7b4c3a2f1e5d'

const eventSections = zoneSlugs.flatMap(slug =>
  Object.entries(zones[slug].sections)
    .filter(([, section]) => section.type === 'event')
    .map(([key, section]) => ({
      slug,
      label: `${slug}.${key}`,
      occult: zones[slug].operation === 'occult',
      schema: section.schema as z.ZodType,
      events: (loadZoneFile(slug).sections[key]?.items ?? []) as ShippedEvent[],
    }))
)

describe.each(eventSections.map(section => [section.label, section] as const))('%s', (_, section) => {
  const sample = section.events[0]!
  const parses = (bosses: unknown) => section.schema.safeParse({ ...sample, bosses }).success
  const boss = (entity: string) => (section.occult ? { entity, weakness: [] } : { entity })

  it('holds its bosses as a list that is never absent', () => {
    expect(parses(undefined)).toBe(false)
    expect(parses([])).toBe(true)
    expect(parses([boss(MINDERTAUR), boss(ELDERTAUR)])).toBe(true)
    expect(parses(boss(MINDERTAUR))).toBe(false)
  })

  it('takes a boss in its own operation\'s shape', () => {
    expect(parses([{ entity: MINDERTAUR, weakness: [] }])).toBe(section.occult)
    expect(parses([{ entity: MINDERTAUR }])).toBe(!section.occult)
  })

  it('takes a boss by its entity and never by a name', () => {
    expect(parses([{ ...boss(MINDERTAUR), name: 'Mindertaur' }])).toBe(false)
    expect(parses([section.occult ? { name: 'Mindertaur', weakness: [] } : { name: 'Mindertaur' }]))
      .toBe(false)
    expect(parses([boss('Mindertaur')])).toBe(false)
  })

  it('ships a bosses list on every event', () => {
    expect(section.events.filter(event => !Array.isArray(event.bosses)).map(event => event.id))
      .toEqual([])
  })
})

describe('the shipped bosses', () => {
  const named = eventSections.flatMap(section => {
    const bosses = hydrateZone(section.slug).entities.get(BOSSES_GROUP)
    return section.events.flatMap(event =>
      (event.bosses ?? []).map(boss => bosses?.label(boss.entity, english) ?? ''))
  })

  it('name one boss each', () => {
    expect(named.filter(name => name === '' || name.includes('/'))).toEqual([])
  })

  it('give the Pagos Brothers FATE both of its bosses, in order', () => {
    const bosses = hydrateZone('pagos').entities.get(BOSSES_GROUP)!
    const pagos = loadZoneFile('pagos').sections.fates!.items as ShippedEvent[]
    const brothers = pagos.filter(event => (event.bosses?.length ?? 0) > 1)
    expect(brothers.map(event => event.bosses!.map(boss => bosses.label(boss.entity, english))))
      .toEqual([['Mindertaur', 'Eldertaur']])
  })
})
