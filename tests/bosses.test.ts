import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { zoneSlugs, zones } from '../zones'
import { loadZoneFile } from './helpers/zoneFiles'

interface ShippedEvent {
  id: string
  name: string
  bosses?: { name: string; weakness?: string[] }[]
}

const eventSections = zoneSlugs.flatMap(slug =>
  Object.entries(zones[slug].sections)
    .filter(([, section]) => section.type === 'event')
    .map(([key, section]) => ({
      label: `${slug}.${key}`,
      occult: zones[slug].operation === 'occult',
      schema: section.schema as z.ZodType,
      events: (loadZoneFile(slug).sections[key]?.items ?? []) as ShippedEvent[],
    }))
)

describe.each(eventSections.map(section => [section.label, section] as const))('%s', (_, section) => {
  const sample = section.events[0]!
  const parses = (bosses: unknown) => section.schema.safeParse({ ...sample, bosses }).success
  const boss = (name: string) => (section.occult ? { name, weakness: [] } : { name })

  it('holds its bosses as a list that is never absent', () => {
    expect(parses(undefined)).toBe(false)
    expect(parses([])).toBe(true)
    expect(parses([boss('Mindertaur'), boss('Eldertaur')])).toBe(true)
    expect(parses(boss('Mindertaur'))).toBe(false)
  })

  it('takes a boss in its own operation\'s shape', () => {
    expect(parses([{ name: 'Mindertaur', weakness: [] }])).toBe(section.occult)
    expect(parses([{ name: 'Mindertaur' }])).toBe(!section.occult)
  })

  it('ships a bosses list on every event', () => {
    expect(section.events.filter(event => !Array.isArray(event.bosses)).map(event => event.id))
      .toEqual([])
  })
})

describe('the shipped bosses', () => {
  const all = eventSections.flatMap(section => section.events.flatMap(event => event.bosses ?? []))

  it('name one boss each', () => {
    expect(all.filter(boss => boss.name.includes('/')).map(boss => boss.name)).toEqual([])
  })

  it('give the Pagos Brothers FATE both of its bosses, in order', () => {
    const pagos = loadZoneFile('pagos').sections.fates!.items as ShippedEvent[]
    const brothers = pagos.filter(event => (event.bosses?.length ?? 0) > 1)
    expect(brothers.map(event => event.bosses!.map(boss => boss.name)))
      .toEqual([['Mindertaur', 'Eldertaur']])
  })
})
