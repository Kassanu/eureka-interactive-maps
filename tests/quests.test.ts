import { describe, expect, it } from 'vitest'
import type { z } from 'zod'
import { initialState, zoneMarkers, zones } from '../zones'
import type { ZoneItem } from '../zones'
import { english } from './helpers/messages'
import { hydrateZone, loadZoneFile } from './helpers/zoneFiles'

const quests = zones.anemos.sections.quests!
const schema = quests.schema as z.ZodType
const placed = { id: '0f6b5f5e-3c1a-4b8e-9d2a-7e4c1b2a3d4f', positions: [{ x: 10, y: 10 }] }

const parses = (quest: object) => schema.safeParse({ ...placed, ...quest }).success
const label = (quest: object) =>
  quests.label!(schema.parse({ ...placed, ...quest }) as never, () => 'unread')(english)

describe('a quest', () => {
  it('carries a level and no name', () => {
    expect(parses({ level: 17 })).toBe(true)
    expect(parses({ name: '17a', level: 17 })).toBe(false)
    expect(parses({ entity: '4b1d7c2e-8a3f-4e6b-9c0d-1f2a3b4c5d6e', level: 17 })).toBe(false)
  })

  it('is at one level', () => {
    expect(parses({ level: { from: 17, to: 18 } })).toBe(false)
  })

  it('numbers its part from 1 to 26', () => {
    expect(parses({ level: 17, part: 1 })).toBe(true)
    expect(parses({ level: 17, part: 26 })).toBe(true)
    expect(parses({ level: 17, part: 0 })).toBe(false)
    expect(parses({ level: 17, part: 27 })).toBe(false)
    expect(parses({ level: 17, part: 1.5 })).toBe(false)
    expect(parses({ level: 17, part: 'a' })).toBe(false)
  })
})

describe('a quest label', () => {
  it('is the level alone when the quest has no part', () => {
    expect(label({ level: 17 })).toBe('17')
  })

  it('follows the level with the part as a letter, 1 being a', () => {
    expect(label({ level: 17, part: 1 })).toBe('17a')
    expect(label({ level: 54, part: 3 })).toBe('54c')
    expect(label({ level: 60, part: 26 })).toBe('60z')
  })
})

describe('an item label', () => {
  const hydatos = hydrateZone('hydatos')
  const section = (key: string) => hydatos.sections.find(candidate => candidate.key === key)!

  it('is the entity\'s name where the section declares no label', () => {
    const enemy = section('enemies').items[0] as { entity: string } & ZoneItem
    const name = hydatos.entities.get('enemies')!.label(enemy.entity, english)
    expect(name).not.toBe('')
    expect(hydatos.labelOf(enemy)(english)).toBe(name)
  })

  it('is empty for an item with neither', () => {
    const lockbox = section('lockboxes').items[0]!
    expect(hydatos.labelOf(lockbox)(english)).toBe('')
  })
})

interface ShippedQuest {
  id: string
  level: number
  part?: number
}

const COUNTS = { anemos: 5, pagos: 6, pyros: 7, hydatos: 10 } as const

describe.each(Object.entries(COUNTS))('%s', (slug, count) => {
  const shipped = loadZoneFile(slug as keyof typeof COUNTS).sections.quests!.items as ShippedQuest[]

  it(`places ${count} quests`, () => {
    expect(shipped).toHaveLength(count)
  })

  it('numbers the quests sharing a level from 1, and gives a lone quest no part', () => {
    const byLevel = new Map<number, (number | undefined)[]>()
    for (const quest of shipped) {
      byLevel.set(quest.level, [...(byLevel.get(quest.level) ?? []), quest.part])
    }
    for (const [level, parts] of byLevel) {
      const expected = parts.length === 1 ? [undefined] : parts.map((_, index) => index + 1)
      expect([...parts].sort((a, b) => (a ?? 0) - (b ?? 0)), `level ${level}`).toEqual(expected)
    }
  })
})

describe('the shipped quests', () => {
  it('put the pagos quest that was filed at 26 at level 29', () => {
    const pagos = loadZoneFile('pagos').sections.quests!.items as ShippedQuest[]
    expect(pagos.find(quest => quest.id === '75c96554-8adf-431c-862c-9e017c5f4117')?.level).toBe(29)
  })
})

describe('a quest marker', () => {
  function markerLabel(slug: 'anemos' | 'pagos' | 'hydatos', level: number, part?: number) {
    const zone = hydrateZone(slug)
    const loaded = zone.sections.find(section => section.key === 'quests')!.items as unknown as {
      id: string
      level: { from: number }
      part?: number
    }[]
    const quest = loaded.find(candidate => candidate.level.from === level && candidate.part === part)!
    return zoneMarkers(zone, initialState(zone), english)
      .find(marker => marker.itemId === quest.id)?.label
  }

  it('reads as the level and part, then the level', () => {
    expect(markerLabel('anemos', 17, 2)).toBe('17b (17)')
    expect(markerLabel('hydatos', 54, 3)).toBe('54c (54)')
    expect(markerLabel('pagos', 29)).toBe('29 (29)')
  })
})
